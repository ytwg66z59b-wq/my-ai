import type { AppState, EffortEvent, EffortResult } from '../types/models'
import { getJstDateString } from './date'
import { grantEggsForMilestones } from './eggs'
import { registerCreatureDiscovery } from './encyclopedia'
import { applyGrowthPoint } from './evolution'
import { createId } from './id'
import { defaultRng, type Rng } from './rng'

/**
 * Single atomic "頑張った！" processing unit.
 * Idempotency: callers should ignore duplicate actionIds if needed.
 */
export function processEffortTap(
  state: AppState,
  now: Date = new Date(),
  rng: Rng = defaultRng,
): EffortResult {
  const actionId = createId('action')
  const today = getJstDateString(now)
  const nowIso = now.toISOString()
  const events: EffortEvent[] = []

  const daily = (state.dailyRecords[today] ?? 0) + 1
  const totalCount = state.statistics.totalCount + 1
  const maxDailyCount = Math.max(state.statistics.maxDailyCount, daily)

  let next: AppState = {
    ...state,
    dailyRecords: { ...state.dailyRecords, [today]: daily },
    statistics: { totalCount, maxDailyCount },
    settings: { ...state.settings, lastDisplayedDate: today },
  }

  const activeId = next.settings.activeCreatureId
  const creatureIndex = next.creatures.findIndex((c) => c.id === activeId)

  if (creatureIndex >= 0) {
    const creature = next.creatures[creatureIndex]!
    const result = applyGrowthPoint(creature, nowIso, rng)
    const creatures = [...next.creatures]
    creatures[creatureIndex] = result.creature
    next = { ...next, creatures }

    if (result.evolved && result.event) {
      events.push(result.event)
      next = registerCreatureDiscovery(next, result.creature)
    } else {
      events.push({
        kind: 'reaction',
        creatureId: result.creature.id,
        message: pickReaction(result.creature.stage),
      })
    }
  } else {
    events.push({ kind: 'none', message: '育成中の個体がいません' })
  }

  const eggResult = grantEggsForMilestones(next, nowIso, rng)
  next = eggResult.state
  events.push(...eggResult.events)

  return { state: next, events, actionId }
}

function pickReaction(stage: string): string {
  const map: Record<string, string[]> = {
    egg: ['卵がかすかに揺れた', '内側から光が漏れた', '温もりが増した'],
    juvenile: ['うれしい！', 'もっとがんばろう！', 'なでなでされた気分'],
    growth: ['力がみなぎる！', '形が変わってきた', 'いい調子！'],
    adult: ['堂々としている', '誇り高いまなざし', 'ともに歩む'],
    apex: ['完成の気配', '静かな祝福', '上位の威厳'],
  }
  const list = map[stage] ?? ['…']
  return list[Math.floor(Math.random() * list.length)]!
}

/** Ensure displayed date is current JST day without wiping history */
export function syncDisplayedDate(state: AppState, now: Date = new Date()): AppState {
  const today = getJstDateString(now)
  if (state.settings.lastDisplayedDate === today) return state
  return {
    ...state,
    settings: { ...state.settings, lastDisplayedDate: today },
  }
}

export function getTodayCount(state: AppState, now: Date = new Date()): number {
  const today = getJstDateString(now)
  return state.dailyRecords[today] ?? 0
}

export function setActiveCreature(state: AppState, creatureId: string): AppState {
  if (!state.creatures.some((c) => c.id === creatureId)) return state
  return {
    ...state,
    settings: { ...state.settings, activeCreatureId: creatureId },
  }
}

export function recomputeStatistics(state: AppState): AppState {
  let total = 0
  let max = 0
  for (const count of Object.values(state.dailyRecords)) {
    total += count
    if (count > max) max = count
  }
  return {
    ...state,
    statistics: { totalCount: total, maxDailyCount: max },
  }
}
