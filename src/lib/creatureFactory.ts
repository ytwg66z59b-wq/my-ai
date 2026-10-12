import { requireForm } from '../data/species'
import type { Creature } from '../types/models'
import { createId } from './id'
import { randomInt, type Rng } from './rng'

export function createCreatureFromEggForm(
  eggFormId: string,
  nowIso: string,
  rng: Rng,
): Creature {
  const form = requireForm(eggFormId)
  return {
    id: createId('creature'),
    formId: form.id,
    name: form.name,
    stage: form.stage,
    element: form.element,
    colorId: form.defaultColorId,
    rarity: form.rarity,
    speciesLineId: form.speciesLineId,
    growthPoints: 0,
    evolutionThreshold: randomInt(form.evolveStartMin, form.evolveStartMax, rng),
    failCount: 0,
    evolutionHistory: [],
    discoveredAt: nowIso,
  }
}
