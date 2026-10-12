import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { getTodayCount, processEffortTap, recomputeStatistics } from './effort'
import { createInitialState } from './initialState'
import { getJstDateString } from './date'

describe('processEffortTap', () => {
  it('increments daily and total by 1', () => {
    const state = createInitialState(new Date('2026-03-10T03:00:00+09:00'))
    const result = processEffortTap(state, new Date('2026-03-10T03:00:00+09:00'), () => 0.9)
    const today = getJstDateString(new Date('2026-03-10T03:00:00+09:00'))
    assert.equal(result.state.dailyRecords[today], 1)
    assert.equal(result.state.statistics.totalCount, 1)
    assert.equal(getTodayCount(result.state, new Date('2026-03-10T03:00:00+09:00')), 1)
    assert.ok(result.actionId)
  })

  it('does not wipe past daily records on new day', () => {
    let state = createInitialState(new Date('2026-03-10T03:00:00+09:00'))
    state = processEffortTap(state, new Date('2026-03-10T03:00:00+09:00'), () => 0.9).state
    state = processEffortTap(state, new Date('2026-03-10T03:00:00+09:00'), () => 0.9).state
    const nextDay = processEffortTap(
      state,
      new Date('2026-03-11T03:00:00+09:00'),
      () => 0.9,
    ).state
    assert.equal(nextDay.dailyRecords['2026-03-10'], 2)
    assert.equal(nextDay.dailyRecords['2026-03-11'], 1)
    assert.equal(nextDay.statistics.totalCount, 3)
    const active = nextDay.creatures.find((c) => c.id === nextDay.settings.activeCreatureId)!
    assert.ok(active.growthPoints >= 1)
  })

  it('updates max daily count', () => {
    let state = createInitialState(new Date('2026-03-10T03:00:00+09:00'))
    for (let i = 0; i < 3; i++) {
      state = processEffortTap(state, new Date('2026-03-10T03:00:00+09:00'), () => 0.9).state
    }
    assert.equal(state.statistics.maxDailyCount, 3)
  })
})

describe('recomputeStatistics', () => {
  it('rebuilds totals from daily records', () => {
    const state = createInitialState()
    const fixed = recomputeStatistics({
      ...state,
      dailyRecords: { '2026-01-01': 5, '2026-01-02': 7 },
      statistics: { totalCount: 0, maxDailyCount: 0 },
    })
    assert.equal(fixed.statistics.totalCount, 12)
    assert.equal(fixed.statistics.maxDailyCount, 7)
  })
})
