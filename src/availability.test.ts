import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  formatClock,
  getAvailabilityForBlocks,
  moveBlock,
  punchGap,
  resizeBlock,
  snapToSlot,
  splitBlock,
  type ScheduleBlock,
} from './availability.ts'

function b(
  startMin: number,
  endMin: number,
  status: ScheduleBlock['status'] = 'immediate',
): ScheduleBlock {
  return { id: `b-${startMin}`, startMin, endMin, status }
}

describe('snapToSlot', () => {
  it('rounds to nearest 15 minutes', () => {
    assert.equal(snapToSlot(7), 0)
    assert.equal(snapToSlot(8), 15)
    assert.equal(snapToSlot(23), 30)
  })
})

describe('formatClock', () => {
  it('formats hours and minutes', () => {
    assert.equal(formatClock(21 * 60 + 30), '21:30')
  })
})

describe('getAvailabilityForBlocks', () => {
  const now = 21 * 60 + 30

  it('reports immediate in an immediate block', () => {
    const view = getAvailabilityForBlocks(
      [b(21 * 60, 23 * 60, 'immediate')],
      now,
    )
    assert.equal(view.status, 'immediate')
    assert.equal(view.label, '今すぐOK')
  })

  it('shows countdown when free soon', () => {
    const view = getAvailabilityForBlocks(
      [
        b(20 * 60, 21 * 60 + 40, 'unavailable'),
        b(21 * 60 + 55, 23 * 60, 'immediate'),
      ],
      now,
    )
    assert.equal(view.status, 'soon')
    assert.equal(view.minutesUntilReady, 25)
  })
})

describe('moveBlock', () => {
  it('keeps duration while shifting', () => {
    const moved = moveBlock(b(14 * 60, 16 * 60), 60)
    assert.equal(moved.startMin, 15 * 60)
    assert.equal(moved.endMin, 17 * 60)
  })
})

describe('splitBlock', () => {
  it('splits into two blocks', () => {
    const parts = splitBlock(b(10 * 60, 18 * 60), 12 * 60)
    assert.ok(parts)
    assert.equal(parts![0].endMin, 12 * 60)
    assert.equal(parts![1].startMin, 12 * 60)
  })
})

describe('punchGap', () => {
  it('cuts a busy middle out of a long block', () => {
    const parts = punchGap(b(10 * 60, 18 * 60), 12 * 60, 14 * 60)
    assert.equal(parts.length, 2)
    assert.equal(parts[0].startMin, 10 * 60)
    assert.equal(parts[0].endMin, 12 * 60)
    assert.equal(parts[1].startMin, 14 * 60)
    assert.equal(parts[1].endMin, 18 * 60)
  })
})

describe('resizeBlock', () => {
  it('snaps edges to 15 minutes', () => {
    const base = b(60, 120)
    assert.equal(resizeBlock(base, 'end', 133).endMin, 135)
  })
})
