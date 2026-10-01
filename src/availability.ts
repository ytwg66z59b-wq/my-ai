/** Minutes from midnight, snapped to 15-minute grid. */
export type MinuteOfDay = number

export type ReplyStatus = 'immediate' | 'soon' | 'unavailable'

/** 終日OK / 休日 / 時間指定 */
export type DayMode = 'all-day' | 'off' | 'timed'

export type ScheduleBlock = {
  id: string
  startMin: MinuteOfDay
  endMin: MinuteOfDay
  status: ReplyStatus
}

export type DayPlan = {
  dateKey: string
  mode: DayMode
  blocks: ScheduleBlock[]
}

/** 曜日テンプレート（0=日 … 6=土） */
export type WeekdayTemplate = {
  mode: DayMode
  blocks: Array<Omit<ScheduleBlock, 'id'>>
}

export type Member = {
  id: string
  name: string
  /** YYYY-MM-DD → その日の予定 */
  days: Record<string, DayPlan>
  /** 曜日ごとの定型（未設定は null） */
  templates: Array<WeekdayTemplate | null>
}

export type AvailabilityView = {
  status: ReplyStatus
  minutesUntilReady: number
  label: string
  sortKey: number
}

export const SLOT_MINUTES = 15
export const DAY_MINUTES = 24 * 60
export const VIEW_START = 8 * 60
export const VIEW_END = 24 * 60

export const STATUS_ORDER: Record<ReplyStatus, number> = {
  immediate: 0,
  soon: 1,
  unavailable: 2,
}

export const STATUS_META: Record<
  ReplyStatus,
  { emoji: string; short: string; long: string; verb: string }
> = {
  immediate: {
    emoji: '🟢',
    short: '即レスOK',
    long: '対応可能',
    verb: '対応可能に変更',
  },
  soon: {
    emoji: '🟡',
    short: '返信遅延',
    long: '少し待って',
    verb: '返信遅延に変更',
  },
  unavailable: {
    emoji: '🔴',
    short: '返信不可',
    long: '対応不可',
    verb: '返信不可に変更',
  },
}

export const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'] as const

export function createId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

export function snapToSlot(minutes: number): MinuteOfDay {
  return Math.round(minutes / SLOT_MINUTES) * SLOT_MINUTES
}

export function clampMinute(minutes: number): MinuteOfDay {
  return Math.min(DAY_MINUTES, Math.max(0, minutes))
}

export function formatClock(totalMinutes: number): string {
  const wrapped = ((totalMinutes % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES
  const h = Math.floor(wrapped / 60)
  const m = wrapped % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function minutesFromDate(date: Date): MinuteOfDay {
  return date.getHours() * 60 + date.getMinutes()
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseDateKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function formatDateLabel(dateKey: string): string {
  const date = parseDateKey(dateKey)
  const w = WEEKDAY_LABELS[date.getDay()]
  return `${date.getMonth() + 1}/${date.getDate()}（${w}）`
}

export function addDays(dateKey: string, delta: number): string {
  const date = parseDateKey(dateKey)
  date.setDate(date.getDate() + delta)
  return toDateKey(date)
}

export function startOfWeek(dateKey: string): string {
  const date = parseDateKey(dateKey)
  const day = date.getDay()
  // Monday-start week for ops feel
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  return toDateKey(date)
}

export function emptyTemplates(): Array<WeekdayTemplate | null> {
  return Array.from({ length: 7 }, () => null)
}

export function emptyDayPlan(dateKey: string, mode: DayMode = 'timed'): DayPlan {
  return { dateKey, mode, blocks: [] }
}

export function allDayBlocks(): ScheduleBlock[] {
  return [
    {
      id: createId('block'),
      startMin: VIEW_START,
      endMin: VIEW_END,
      status: 'immediate',
    },
  ]
}

export function resolveDayPlan(member: Member, dateKey: string): DayPlan {
  const existing = member.days[dateKey]
  if (existing) return existing

  const weekday = parseDateKey(dateKey).getDay()
  const template = member.templates[weekday]
  if (template) {
    return {
      dateKey,
      mode: template.mode,
      blocks: template.blocks.map((b) => ({ ...b, id: createId('block') })),
    }
  }

  return emptyDayPlan(dateKey, 'timed')
}

export function effectiveBlocks(plan: DayPlan): ScheduleBlock[] {
  if (plan.mode === 'off') return []
  if (plan.mode === 'all-day') {
    if (plan.blocks.length > 0) return plan.blocks
    return [
      {
        id: 'all-day',
        startMin: VIEW_START,
        endMin: VIEW_END,
        status: 'immediate',
      },
    ]
  }
  return plan.blocks
}

export function nextStatus(status: ReplyStatus): ReplyStatus {
  if (status === 'immediate') return 'soon'
  if (status === 'soon') return 'unavailable'
  return 'immediate'
}

function blockAt(blocks: ScheduleBlock[], nowMin: MinuteOfDay): ScheduleBlock | null {
  return blocks.find((b) => nowMin >= b.startMin && nowMin < b.endMin) ?? null
}

function nextAssignableBlock(
  blocks: ScheduleBlock[],
  nowMin: MinuteOfDay,
): ScheduleBlock | null {
  const candidates = blocks
    .filter(
      (b) =>
        (b.status === 'immediate' || b.status === 'soon') && b.endMin > nowMin,
    )
    .sort((a, b) => a.startMin - b.startMin)
  return candidates[0] ?? null
}

export function getAvailabilityForBlocks(
  blocks: ScheduleBlock[],
  nowMin: MinuteOfDay,
): AvailabilityView {
  const next = nextAssignableBlock(blocks, nowMin)

  if (!next) {
    return {
      status: 'unavailable',
      minutesUntilReady: Number.POSITIVE_INFINITY,
      label: '本日の空きなし',
      sortKey: STATUS_ORDER.unavailable * 10_000 + 9999,
    }
  }

  const wait = Math.max(0, next.startMin - nowMin)
  const current = blockAt(blocks, nowMin)

  if (wait === 0 && current?.status === 'immediate') {
    return {
      status: 'immediate',
      minutesUntilReady: 0,
      label: '今すぐOK',
      sortKey: 0,
    }
  }

  if (wait === 0 && current?.status === 'soon') {
    return {
      status: 'soon',
      minutesUntilReady: 0,
      label: '少し待てば対応可能',
      sortKey: 1000,
    }
  }

  const status: ReplyStatus = wait <= 30 ? 'soon' : 'unavailable'
  return {
    status,
    minutesUntilReady: wait,
    label: formatReadyLabel(wait),
    sortKey: STATUS_ORDER[status] * 10_000 + wait,
  }
}

function formatReadyLabel(wait: number): string {
  if (wait <= 0) return '今すぐOK'
  if (wait < 60) return `あと${wait}分で対応可能`
  const hours = Math.floor(wait / 60)
  const mins = wait % 60
  if (mins === 0) return `あと${hours}時間で対応可能`
  return `あと${hours}時間${mins}分で対応可能`
}

export function getMemberAvailability(
  member: Member,
  dateKey: string,
  nowMin: MinuteOfDay,
): AvailabilityView {
  const plan = resolveDayPlan(member, dateKey)
  if (plan.mode === 'off') {
    return {
      status: 'unavailable',
      minutesUntilReady: Number.POSITIVE_INFINITY,
      label: '休日',
      sortKey: STATUS_ORDER.unavailable * 10_000 + 9999,
    }
  }
  return getAvailabilityForBlocks(effectiveBlocks(plan), nowMin)
}

export function sortMembersByAvailability(
  members: Member[],
  dateKey: string,
  nowMin: MinuteOfDay,
): Array<Member & { availability: AvailabilityView }> {
  return members
    .map((m) => ({
      ...m,
      availability: getMemberAvailability(m, dateKey, nowMin),
    }))
    .sort((a, b) => {
      const diff = a.availability.sortKey - b.availability.sortKey
      if (diff !== 0) return diff
      return a.name.localeCompare(b.name, 'ja')
    })
}

export function summarizeAvailability(
  members: Member[],
  dateKey: string,
  nowMin: MinuteOfDay,
): Record<ReplyStatus, number> {
  const counts: Record<ReplyStatus, number> = {
    immediate: 0,
    soon: 0,
    unavailable: 0,
  }
  for (const m of members) {
    counts[getMemberAvailability(m, dateKey, nowMin).status] += 1
  }
  return counts
}

export function resizeBlock(
  block: ScheduleBlock,
  edge: 'start' | 'end',
  nextMinute: number,
): ScheduleBlock {
  const snapped = clampMinute(snapToSlot(nextMinute))
  if (edge === 'start') {
    const startMin = Math.min(snapped, block.endMin - SLOT_MINUTES)
    return { ...block, startMin: Math.max(0, startMin) }
  }
  const endMin = Math.max(snapped, block.startMin + SLOT_MINUTES)
  return { ...block, endMin: Math.min(DAY_MINUTES, endMin) }
}

export function moveBlock(
  block: ScheduleBlock,
  deltaMinutes: number,
): ScheduleBlock {
  const duration = block.endMin - block.startMin
  let startMin = snapToSlot(block.startMin + deltaMinutes)
  startMin = Math.max(0, Math.min(startMin, DAY_MINUTES - duration))
  return {
    ...block,
    startMin,
    endMin: startMin + duration,
  }
}

/** Split a block at a point; returns [left, right] or null if invalid. */
export function splitBlock(
  block: ScheduleBlock,
  atMinute: number,
): [ScheduleBlock, ScheduleBlock] | null {
  const cut = clampMinute(snapToSlot(atMinute))
  if (cut <= block.startMin + SLOT_MINUTES || cut >= block.endMin - SLOT_MINUTES) {
    return null
  }
  return [
    { ...block, id: createId('block'), endMin: cut },
    { ...block, id: createId('block'), startMin: cut },
  ]
}

/** Punch a gap into a block (busy middle) → left + right pieces. */
export function punchGap(
  block: ScheduleBlock,
  gapStart: number,
  gapEnd: number,
): ScheduleBlock[] {
  const start = clampMinute(snapToSlot(gapStart))
  const end = clampMinute(snapToSlot(gapEnd))
  if (end <= start) return [block]
  if (end <= block.startMin || start >= block.endMin) return [block]

  const pieces: ScheduleBlock[] = []
  if (start > block.startMin + 0) {
    const leftEnd = Math.max(block.startMin + SLOT_MINUTES, start)
    if (leftEnd - block.startMin >= SLOT_MINUTES) {
      pieces.push({
        ...block,
        id: createId('block'),
        endMin: Math.min(leftEnd, block.endMin),
      })
    }
  }
  if (end < block.endMin) {
    const rightStart = Math.min(block.endMin - SLOT_MINUTES, end)
    if (block.endMin - rightStart >= SLOT_MINUTES) {
      pieces.push({
        ...block,
        id: createId('block'),
        startMin: Math.max(rightStart, block.startMin),
      })
    }
  }
  return pieces.length > 0 ? pieces : []
}

export function cloneBlocks(blocks: ScheduleBlock[]): ScheduleBlock[] {
  return blocks.map((b) => ({ ...b, id: createId('block') }))
}

export function countAvailableMinutes(plan: DayPlan): number {
  return effectiveBlocks(plan)
    .filter((b) => b.status === 'immediate' || b.status === 'soon')
    .reduce((sum, b) => sum + (b.endMin - b.startMin), 0)
}
