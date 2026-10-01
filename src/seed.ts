import {
  createId,
  type Member,
  type ReplyStatus,
  type ScheduleBlock,
} from './availability'

function b(
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

export function createDemoMembers(now: Date = new Date()): Member[] {
  const h = now.getHours()
  const m = Math.floor(now.getMinutes() / 15) * 15
  const base = h * 60 + m

  const at = (offsetMin: number, lengthMin: number, status: ReplyStatus) => {
    const start = Math.max(0, base + offsetMin)
    const end = Math.min(24 * 60, start + lengthMin)
    return {
      id: createId('block'),
      startMin: start,
      endMin: end,
      status,
    }
  }

  return [
    {
      id: createId('member'),
      name: '佐藤',
      blocks: [at(-60, 180, 'immediate')],
    },
    {
      id: createId('member'),
      name: '鈴木',
      blocks: [at(-30, 120, 'soon')],
    },
    {
      id: createId('member'),
      name: '高橋',
      blocks: [
        at(-90, 100, 'unavailable'),
        at(25, 120, 'immediate'),
      ],
    },
    {
      id: createId('member'),
      name: '田中',
      blocks: [
        at(-120, 150, 'unavailable'),
        at(10, 90, 'immediate'),
      ],
    },
    {
      id: createId('member'),
      name: '伊藤',
      blocks: [at(60, 120, 'immediate')],
    },
    {
      id: createId('member'),
      name: '渡辺',
      blocks: [at(-180, 120, 'immediate'), b(22, 0, 23, 30, 'soon')],
    },
    {
      id: createId('member'),
      name: '山本',
      blocks: [at(-45, 90, 'unavailable')],
    },
    {
      id: createId('member'),
      name: '中村',
      blocks: [at(-15, 150, 'immediate')],
    },
    {
      id: createId('member'),
      name: '小林',
      blocks: [at(20, 100, 'soon')],
    },
  ]
}
