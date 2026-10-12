import { APP_STATE_VERSION, type AppState } from '../types/models'
import { createCreatureFromEggForm } from './creatureFactory'
import { getJstDateString } from './date'
import { defaultRng } from './rng'

export function createInitialState(now: Date = new Date()): AppState {
  const today = getJstDateString(now)
  const nowIso = now.toISOString()
  const starter = createCreatureFromEggForm('egg_light', nowIso, defaultRng)

  return {
    version: APP_STATE_VERSION,
    dailyRecords: {},
    statistics: {
      totalCount: 0,
      maxDailyCount: 0,
    },
    creatures: [starter],
    encyclopedia: { discoveredKeys: [] },
    quotes: { recentQuoteIds: [] },
    settings: {
      activeCreatureId: starter.id,
      lastDisplayedDate: today,
      timezone: 'Asia/Tokyo',
      eggMilestonesGranted: [0],
    },
  }
}
