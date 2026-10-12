import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { getJstDateString, getJstWeekRange, sumRecordsInMonth } from './date'

describe('getJstDateString', () => {
  it('uses Japan calendar date around UTC midnight', () => {
    // 2026-03-10 00:30 JST = 2026-03-09 15:30 UTC
    const jstMorning = new Date('2026-03-09T15:30:00.000Z')
    assert.equal(getJstDateString(jstMorning), '2026-03-10')
  })
})

describe('getJstWeekRange', () => {
  it('returns Monday-Sunday for a Wednesday', () => {
    const range = getJstWeekRange('2026-03-11') // Wednesday
    assert.equal(range.start, '2026-03-09')
    assert.equal(range.end, '2026-03-15')
  })
})

describe('sumRecordsInMonth', () => {
  it('sums matching month keys', () => {
    const sum = sumRecordsInMonth(
      { '2026-03-01': 2, '2026-03-11': 3, '2026-04-01': 9 },
      '2026-03',
    )
    assert.equal(sum, 5)
  })
})
