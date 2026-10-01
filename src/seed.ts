import {
  SLOT_MINUTES,
  VIEW_END,
  VIEW_START,
  createId,
  type DayPlan,
  type Member,
  type ReplyStatus,
  type ScheduleBlock,
  emptyTemplates,
  toDateKey,
} from './availability'

function block(
  startH: number,
  startM: number,
  endH: number,
  endM: number,
  status: ReplyStatus,
): ScheduleBlock {
  return {
    id: createId('block'),
    startMin: startH * 60 + startM,
    endMin: endH * 60 + endM,
    status,
  }
}

function day(
  dateKey: string,
  mode: DayPlan['mode'],
  blocks: ScheduleBlock[] = [],
): DayPlan {
  return { dateKey, mode, blocks }
}

export function createDemoMembers(now: Date = new Date()): Member[] {
  const today = toDateKey(now)
  const h = now.getHours()
  const m = Math.floor(now.getMinutes() / 15) * 15
  const base = h * 60 + m

  const at = (offsetMin: number, lengthMin: number, status: ReplyStatus) => {
    const start = Math.max(VIEW_START, Math.min(VIEW_END - SLOT_MINUTES, base + offsetMin))
    const end = Math.min(VIEW_END, start + lengthMin)
    return {
      id: createId('block'),
      startMin: start,
      endMin: Math.max(start + SLOT_MINUTES, end),
      status,
    }
  }

  const tomorrow = (() => {
    const d = new Date(now)
    d.setDate(d.getDate() + 1)
    return toDateKey(d)
  })()

  return [
    {
      id: createId('member'),
      name: '田中',
      templates: emptyTemplates(),
      days: {
        [today]: day(today, 'timed', [
          at(-90, 120, 'immediate'),
          at(60, 90, 'unavailable'),
          at(160, 120, 'immediate'),
        ]),
        [tomorrow]: day(tomorrow, 'timed', [
          block(10, 0, 12, 0, 'immediate'),
          block(14, 0, 18, 0, 'immediate'),
        ]),
      },
    },
    {
      id: createId('member'),
      name: '佐藤',
      templates: emptyTemplates(),
      days: {
        [today]: day(today, 'timed', [
          at(-30, 180, 'immediate'),
          at(200, 90, 'soon'),
        ]),
      },
    },
    {
      id: createId('member'),
      name: '山田',
      templates: emptyTemplates(),
      days: {
        [today]: day(today, 'timed', [
          at(-120, 100, 'unavailable'),
          at(15, 120, 'immediate'),
        ]),
      },
    },
    {
      id: createId('member'),
      name: '鈴木',
      templates: emptyTemplates(),
      days: {
        [today]: day(today, 'off', []),
      },
    },
    {
      id: createId('member'),
      name: '伊藤',
      templates: emptyTemplates(),
      days: {
        [today]: day(today, 'all-day', [
          {
            id: createId('block'),
            startMin: VIEW_START,
            endMin: VIEW_END,
            status: 'immediate',
          },
        ]),
      },
    },
    {
      id: createId('member'),
      name: '渡辺',
      templates: (() => {
        const t = emptyTemplates()
        // Monday template example
        t[1] = {
          mode: 'timed',
          blocks: [
            { startMin: 10 * 60, endMin: 12 * 60, status: 'immediate' },
            { startMin: 14 * 60, endMin: 18 * 60, status: 'immediate' },
          ],
        }
        return t
      })(),
      days: {
        [today]: day(today, 'timed', [
          at(-45, 60, 'unavailable'),
          at(90, 150, 'soon'),
        ]),
      },
    },
  ].map((m) => ({
    ...m,
    days: Object.fromEntries(
      Object.entries(m.days).map(([k, v]) => [k, { ...v, dateKey: k }]),
    ),
  }))
}
