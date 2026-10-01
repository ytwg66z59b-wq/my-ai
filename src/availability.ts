/** Minutes from midnight, snapped to 15-minute grid. */
export type MinuteOfDay = number

export type ReplyStatus = 'immediate' | 'soon' | 'unavailable'

export type ScheduleBlock = {
  id: string
  startMin: MinuteOfDay
  endMin: MinuteOfDay
  status: ReplyStatus
}

export type Member = {
  id: string
  name: string
  blocks: ScheduleBlock[]
}

export type AvailabilityView = {
  status: ReplyStatus
  /** Minutes until the member can take work. 0 = ready now. Infinity = none today. */
  minutesUntilReady: number
  label: string
  sortKey: number
}

export const SLOT_MINUTES = 15
export const DAY_MINUTES = 24 * 60

export const STATUS_ORDER: Record<ReplyStatus, number> = {
  immediate: 0,
  soon: 1,
  unavailable: 2,
}

export const STATUS_META: Record<
  ReplyStatus,
  { emoji: string; short: string; long: string }
> = {
  immediate: {
    emoji: '🟢',
    short: '即レスOK',
    long: '対応可能',
  },
  soon: {
    emoji: '🟡',
    short: '30分以内ならOK',
    long: '少し待って',
  },
  unavailable: {
    emoji: '🔴',
    short: '返信不可',
    long: '対応不可',
  },
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

export function nextStatus(status: ReplyStatus): ReplyStatus {
  if (status === 'immediate') return 'soon'
  if (status === 'soon') return 'unavailable'
  return 'immediate'
}

function blockAt(blocks: ScheduleBlock[], nowMin: MinuteOfDay): ScheduleBlock | null {
  return blocks.find((b) => nowMin >= b.startMin && nowMin < b.endMin) ?? null
}

/** Next block that can take work (immediate or soon), including current. */
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

  for (const block of candidates) {
    if (nowMin < block.endMin) return block
  }
  return null
}

export function getAvailability(
  member: Member,
  nowMin: MinuteOfDay,
): AvailabilityView {
  const next = nextAssignableBlock(member.blocks, nowMin)

  if (!next) {
    return {
      status: 'unavailable',
      minutesUntilReady: Number.POSITIVE_INFINITY,
      label: '本日の空きなし',
      sortKey: STATUS_ORDER.unavailable * 10_000 + 9999,
    }
  }

  const wait = Math.max(0, next.startMin - nowMin)
  const current = blockAt(member.blocks, nowMin)

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

  // Waiting for a future assignable block
  const status: ReplyStatus = wait <= 30 ? 'soon' : 'unavailable'
  return {
    status,
    minutesUntilReady: wait,
    label: `あと${wait}分で対応可能`,
    sortKey: STATUS_ORDER[status] * 10_000 + wait,
  }
}

export function sortMembersByAvailability(
  members: Member[],
  nowMin: MinuteOfDay,
): Array<Member & { availability: AvailabilityView }> {
  return members
    .map((m) => ({ ...m, availability: getAvailability(m, nowMin) }))
    .sort((a, b) => {
      const diff = a.availability.sortKey - b.availability.sortKey
      if (diff !== 0) return diff
      return a.name.localeCompare(b.name, 'ja')
    })
}

export function summarizeAvailability(
  members: Member[],
  nowMin: MinuteOfDay,
): Record<ReplyStatus, number> {
  const counts: Record<ReplyStatus, number> = {
    immediate: 0,
    soon: 0,
    unavailable: 0,
  }
  for (const m of members) {
    counts[getAvailability(m, nowMin).status] += 1
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

export function createId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}
