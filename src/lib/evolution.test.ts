import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { applyGrowthPoint, computeEvolveChance } from './evolution'
import type { Creature } from '../types/models'

function eggCreature(overrides: Partial<Creature> = {}): Creature {
  return {
    id: 'c1',
    formId: 'egg_light',
    name: '光の卵',
    stage: 'egg',
    element: 'light',
    colorId: 'pearl_gold',
    rarity: 'normal',
    speciesLineId: 'line_light',
    growthPoints: 0,
    evolutionThreshold: 10,
    failCount: 0,
    evolutionHistory: [],
    discoveredAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('computeEvolveChance', () => {
  it('is 0 before threshold', () => {
    assert.equal(computeEvolveChance(9, 10, 25, 0), 0)
  })

  it('is 1 at force point', () => {
    assert.equal(computeEvolveChance(25, 10, 25, 0), 1)
  })

  it('rises with fail count', () => {
    const low = computeEvolveChance(12, 10, 25, 0)
    const high = computeEvolveChance(12, 10, 25, 5)
    assert.ok(high > low)
  })
})

describe('applyGrowthPoint', () => {
  it('increments points without evolving when rng fails', () => {
    const result = applyGrowthPoint(eggCreature({ growthPoints: 10 }), 't', () => 0.99)
    assert.equal(result.evolved, false)
    assert.equal(result.creature.growthPoints, 11)
    assert.equal(result.creature.failCount, 1)
  })

  it('force-evolves at evolveForceAt even with high rng', () => {
    // egg_light forceAt = 25; threshold 10; points become 25
    const result = applyGrowthPoint(
      eggCreature({ growthPoints: 24, evolutionThreshold: 10 }),
      't',
      () => 0.999,
    )
    assert.equal(result.evolved, true)
    assert.equal(result.event?.kind, 'hatch')
    assert.equal(result.creature.formId, 'lumina_juvenile')
    assert.equal(result.creature.growthPoints, 0)
    assert.equal(result.creature.failCount, 0)
  })

  it('picks from evolveTo candidates', () => {
    const juvenile: Creature = {
      ...eggCreature(),
      formId: 'lumina_juvenile',
      name: 'ルミナ',
      stage: 'juvenile',
      growthPoints: 59,
      evolutionThreshold: 20,
    }
    const result = applyGrowthPoint(juvenile, 't', () => 0)
    assert.equal(result.evolved, true)
    assert.ok(
      result.creature.formId === 'lumina_growth_radiant' ||
        result.creature.formId === 'lumina_growth_star',
    )
  })
})
