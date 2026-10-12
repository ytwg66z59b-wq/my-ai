import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  discoveryKey,
  getCompletionRate,
  getDiscoveredFormIds,
  registerDiscovery,
} from './encyclopedia'
import { createInitialState } from './initialState'

describe('encyclopedia', () => {
  it('does not register eggs', () => {
    const state = createInitialState()
    const next = registerDiscovery(state, 'egg_light', 'pearl_gold')
    assert.equal(next.encyclopedia.discoveredKeys.length, 0)
  })

  it('dedupes same form+color', () => {
    let state = createInitialState()
    state = registerDiscovery(state, 'lumina_juvenile', 'pearl_gold')
    state = registerDiscovery(state, 'lumina_juvenile', 'pearl_gold')
    assert.equal(state.encyclopedia.discoveredKeys.length, 1)
    assert.equal(
      state.encyclopedia.discoveredKeys[0],
      discoveryKey('lumina_juvenile', 'pearl_gold'),
    )
  })

  it('counts unique forms for completion, not color variants', () => {
    let state = createInitialState()
    state = registerDiscovery(state, 'lumina_juvenile', 'pearl_gold')
    state = registerDiscovery(state, 'lumina_juvenile', 'sky_aqua')
    assert.equal(getDiscoveredFormIds(state).length, 1)
    const rate = getCompletionRate(state)
    assert.equal(rate.discovered, 1)
    assert.ok(rate.total > 1)
  })
})
