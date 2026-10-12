import { getEncyclopediaFormCount, getForm } from '../data/species'
import type { AppState, Creature } from '../types/models'

export function discoveryKey(formId: string, colorId: string): string {
  return `${formId}::${colorId}`
}

export function parseDiscoveryKey(key: string): { formId: string; colorId: string } {
  const [formId, colorId] = key.split('::')
  return { formId: formId ?? '', colorId: colorId ?? '' }
}

export function registerDiscovery(
  state: AppState,
  formId: string,
  colorId: string,
): AppState {
  const form = getForm(formId)
  if (!form || form.stage === 'egg') return state
  const key = discoveryKey(formId, colorId)
  if (state.encyclopedia.discoveredKeys.includes(key)) return state
  return {
    ...state,
    encyclopedia: {
      discoveredKeys: [...state.encyclopedia.discoveredKeys, key],
    },
  }
}

export function registerCreatureDiscovery(
  state: AppState,
  creature: Creature,
): AppState {
  return registerDiscovery(state, creature.formId, creature.colorId)
}

/** Unique non-egg form ids discovered (color variants do not inflate form progress) */
export function getDiscoveredFormIds(state: AppState): string[] {
  const forms = new Set<string>()
  for (const key of state.encyclopedia.discoveredKeys) {
    const { formId } = parseDiscoveryKey(key)
    const form = getForm(formId)
    if (form && form.stage !== 'egg') forms.add(formId)
  }
  return [...forms]
}

export function getCompletionRate(state: AppState): {
  discovered: number
  total: number
  percent: number
} {
  const discovered = getDiscoveredFormIds(state).length
  const total = getEncyclopediaFormCount()
  const percent = total === 0 ? 0 : Math.round((discovered / total) * 100)
  return { discovered, total, percent }
}

export function isFormDiscovered(state: AppState, formId: string): boolean {
  return state.encyclopedia.discoveredKeys.some((k) => k.startsWith(`${formId}::`))
}
