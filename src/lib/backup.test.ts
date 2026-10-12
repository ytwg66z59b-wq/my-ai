import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { exportState, importState } from './backup'
import { createInitialState } from './initialState'

describe('backup', () => {
  it('round-trips app state', () => {
    const state = createInitialState(new Date('2026-03-10T03:00:00+09:00'))
    state.dailyRecords['2026-03-09'] = 4
    state.statistics.totalCount = 4
    const json = exportState(state)
    const restored = importState(json)
    assert.equal(restored.dailyRecords['2026-03-09'], 4)
    assert.equal(restored.creatures.length, state.creatures.length)
    assert.equal(restored.settings.timezone, 'Asia/Tokyo')
  })

  it('rejects invalid payload', () => {
    assert.throws(() => importState('{}'), /形式/)
  })
})
