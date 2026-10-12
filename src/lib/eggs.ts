import { getEggForms } from '../data/species'
import type { AppState, EffortEvent } from '../types/models'
import { createCreatureFromEggForm } from './creatureFactory'
import { type Rng } from './rng'

/** Cumulative effort milestones that grant a new egg */
export const EGG_MILESTONES = [0, 40, 120, 250, 450] as const

export function grantEggsForMilestones(
  state: AppState,
  nowIso: string,
  rng: Rng,
): { state: AppState; events: EffortEvent[] } {
  const eggForms = getEggForms()
  const events: EffortEvent[] = []
  let next = state
  const granted = new Set(next.settings.eggMilestonesGranted)
  const total = next.statistics.totalCount

  for (const milestone of EGG_MILESTONES) {
    if (milestone === 0) continue // starter handled in createInitialState
    if (granted.has(milestone)) continue
    if (total < milestone) continue

    const form = eggForms[rng() < 0.5 ? 0 : 1] ?? eggForms[0]!
    const creature = createCreatureFromEggForm(form.id, nowIso, rng)
    next = {
      ...next,
      creatures: [...next.creatures, creature],
      settings: {
        ...next.settings,
        eggMilestonesGranted: [...next.settings.eggMilestonesGranted, milestone],
      },
    }
    events.push({
      kind: 'egg_granted',
      newCreatureId: creature.id,
      message: `新しい卵「${creature.name}」を手に入れた！（累計 ${milestone} 回）`,
    })
  }

  return { state: next, events }
}
