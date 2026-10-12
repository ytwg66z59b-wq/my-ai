import { COLOR_VARIANTS } from '../data/colors'
import { requireForm } from '../data/species'
import type {
  Creature,
  EffortEvent,
  Element,
  EvolutionCandidate,
  EvolutionEvent,
} from '../types/models'
import { pickWeighted, randomInt, type Rng } from './rng'

export interface EvolveRollResult {
  evolved: boolean
  creature: Creature
  event?: EffortEvent
}

/**
 * Probability rises with progress past threshold and fail streak.
 * Force-evolves at form.evolveForceAt growth points.
 */
export function computeEvolveChance(
  growthPoints: number,
  threshold: number,
  forceAt: number,
  failCount: number,
): number {
  if (growthPoints >= forceAt) return 1
  if (growthPoints < threshold) return 0
  const over = growthPoints - threshold
  const span = Math.max(1, forceAt - threshold)
  const base = 0.08 + (over / span) * 0.55
  const failBonus = Math.min(0.35, failCount * 0.05)
  return Math.min(0.95, base + failBonus)
}

function weightForCandidate(
  candidate: EvolutionCandidate,
  creatureElement: Element,
): number {
  let w = candidate.weight
  if (candidate.preferredElements?.includes(creatureElement)) {
    w *= 2.5
  }
  return w
}

function pickColorId(preferred: string, rng: Rng): string {
  // Mostly keep preferred; occasionally a color variant
  if (rng() < 0.72) return preferred
  const idx = randomInt(0, COLOR_VARIANTS.length - 1, rng)
  return COLOR_VARIANTS[idx]!.id
}

export function applyGrowthPoint(
  creature: Creature,
  nowIso: string,
  rng: Rng,
): EvolveRollResult {
  const form = requireForm(creature.formId)
  const nextPoints = creature.growthPoints + 1
  let updated: Creature = { ...creature, growthPoints: nextPoints }

  if (form.evolveTo.length === 0) {
    return { evolved: false, creature: updated }
  }

  const chance = computeEvolveChance(
    nextPoints,
    updated.evolutionThreshold,
    form.evolveForceAt,
    updated.failCount,
  )

  if (chance <= 0) {
    return { evolved: false, creature: updated }
  }

  const roll = rng()
  if (roll > chance) {
    updated = { ...updated, failCount: updated.failCount + 1 }
    return { evolved: false, creature: updated }
  }

  const weighted = form.evolveTo.map((c) => ({
    ...c,
    weight: weightForCandidate(c, updated.element),
  }))
  const picked = pickWeighted(weighted, rng)
  if (!picked) {
    return { evolved: false, creature: updated }
  }

  const nextForm = requireForm(picked.formId)
  const colorId = pickColorId(nextForm.defaultColorId, rng)
  const historyEntry: EvolutionEvent = {
    at: nowIso,
    fromFormId: form.id,
    toFormId: nextForm.id,
    fromName: form.name,
    toName: nextForm.name,
  }

  const evolvedCreature: Creature = {
    ...updated,
    formId: nextForm.id,
    name: nextForm.name,
    stage: nextForm.stage,
    element: nextForm.element,
    rarity: nextForm.rarity,
    colorId,
    speciesLineId: nextForm.speciesLineId,
    growthPoints: 0,
    evolutionThreshold: randomInt(
      nextForm.evolveStartMin,
      nextForm.evolveStartMax,
      rng,
    ),
    failCount: 0,
    evolutionHistory: [...updated.evolutionHistory, historyEntry],
  }

  const kind = form.stage === 'egg' ? 'hatch' : 'evolve'
  const event: EffortEvent = {
    kind,
    creatureId: evolvedCreature.id,
    fromFormId: form.id,
    toFormId: nextForm.id,
    message:
      kind === 'hatch'
        ? `${nextForm.name} が生まれた！`
        : `${form.name} → ${nextForm.name} に進化！`,
  }

  return { evolved: true, creature: evolvedCreature, event }
}
