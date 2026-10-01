import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  formatClock,
  getAvailability,
  resizeBlock,
  snapToSlot,
  sortMembersByAvailability,
  summarizeAvailability,
  type Member,
  type ScheduleBlock,
} from './availability.ts'

function block(
  partial: Partial<ScheduleBlock> & Pick<ScheduleBlock, 'startMin' | 'endMin' | 'status'>,
): ScheduleBlock {
  return {
    id: partial.id ?? `b-${partial.startMin}-${partial.endMin}`,
    startMin: partial.startMin,
    endMin: partial.endMin,
    status: partial.status,
  }
}

function member(name: string, blocks: ScheduleBlock[]): Member {
  return { id: `m-${name}`, name, blocks }
}

describe('snapToSlot', () => {
  it('rounds to nearest 15 minutes', () => {
    assert.equal(snapToSlot(7), 0)
    assert.equal(snapToSlot(8), 15)
    assert.equal(snapToSlot(22), 15)
    assert.equal(snapToSlot(23), 30)
  })
})

describe('formatClock', () => {
  it('formats hours and minutes', () => {
    assert.equal(formatClock(0), '00:00')
    assert.equal(formatClock(21 * 60 + 30), '21:30')
    assert.equal(formatClock(9 * 60 + 15), '09:15')
  })
})

describe('getAvailability', () => {
  const now = 21 * 60 + 30 // 21:30

  it('reports immediate when in an immediate block', () => {
    const m = member('A', [block({ startMin: 21 * 60, endMin: 23 * 60, status: 'immediate' })])
    const view = getAvailability(m, now)
    assert.equal(view.status, 'immediate')
    assert.equal(view.minutesUntilReady, 0)
    assert.equal(view.label, '今すぐOK')
  })

  it('reports soon when in a soon block', () => {
    const m = member('B', [block({ startMin: 21 * 60, endMin: 23 * 60, status: 'soon' })])
    const view = getAvailability(m, now)
    assert.equal(view.status, 'soon')
    assert.equal(view.label, '少し待てば対応可能')
  })

  it('shows countdown when free soon', () => {
    const m = member('C', [
      block({ startMin: 20 * 60, endMin: 21 * 60 + 40, status: 'unavailable' }),
      block({ startMin: 21 * 60 + 55, endMin: 23 * 60, status: 'immediate' }),
    ])
    const view = getAvailability(m, now)
    assert.equal(view.status, 'soon')
    assert.equal(view.minutesUntilReady, 25)
    assert.equal(view.label, 'あと25分で対応可能')
  })

  it('marks unavailable when wait exceeds 30 minutes', () => {
    const m = member('D', [
      block({ startMin: 22 * 60 + 30, endMin: 23 * 60, status: 'immediate' }),
    ])
    const view = getAvailability(m, now)
    assert.equal(view.status, 'unavailable')
    assert.equal(view.minutesUntilReady, 60)
    assert.equal(view.label, 'あと1時間で対応可能')
  })

  it('marks unavailable when no remaining blocks', () => {
    const m = member('E', [
      block({ startMin: 10 * 60, endMin: 12 * 60, status: 'immediate' }),
    ])
    const view = getAvailability(m, now)
    assert.equal(view.status, 'unavailable')
    assert.equal(view.label, '本日の空きなし')
  })
})

describe('sortMembersByAvailability', () => {
  it('puts immediate first, then soon, then unavailable', () => {
    const now = 12 * 60
    const members = [
      member('遠い', [block({ startMin: 14 * 60, endMin: 16 * 60, status: 'immediate' })]),
      member('すぐ', [block({ startMin: 11 * 60, endMin: 13 * 60, status: 'immediate' })]),
      member('ちょい待ち', [block({ startMin: 12 * 60 + 20, endMin: 14 * 60, status: 'immediate' })]),
    ]
    const sorted = sortMembersByAvailability(members, now)
    assert.deepEqual(
      sorted.map((m) => m.name),
      ['すぐ', 'ちょい待ち', '遠い'],
    )
  })
})

describe('summarizeAvailability', () => {
  it('counts each status', () => {
    const now = 12 * 60
    const members = [
      member('A', [block({ startMin: 11 * 60, endMin: 13 * 60, status: 'immediate' })]),
      member('B', [block({ startMin: 12 * 60 + 15, endMin: 14 * 60, status: 'immediate' })]),
      member('C', [block({ startMin: 15 * 60, endMin: 16 * 60, status: 'immediate' })]),
      member('D', []),
    ]
    assert.deepEqual(summarizeAvailability(members, now), {
      immediate: 1,
      soon: 1,
      unavailable: 2,
    })
  })
})

describe('resizeBlock', () => {
  it('snaps edges to 15 minutes and keeps minimum length', () => {
    const base = block({ startMin: 60, endMin: 120, status: 'immediate' })
    assert.equal(resizeBlock(base, 'end', 127).endMin, 120)
    assert.equal(resizeBlock(base, 'end', 133).endMin, 135)
    assert.equal(resizeBlock(base, 'start', 110).startMin, 105)
    assert.equal(resizeBlock(base, 'start', 200).startMin, 105)
  })
})
