import { APP_STATE_VERSION, type AppState } from '../types/models'
import { recomputeStatistics } from './effort'

export function exportState(state: AppState): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      app: 'dragon-days',
      state,
    },
    null,
    2,
  )
}

export function importState(json: string): AppState {
  const parsed = JSON.parse(json) as { state?: AppState } | AppState
  const raw = 'state' in parsed && parsed.state ? parsed.state : (parsed as AppState)

  if (!raw || typeof raw !== 'object') {
    throw new Error('無効なバックアップデータです')
  }
  if (!raw.dailyRecords || !raw.creatures || !raw.settings) {
    throw new Error('バックアップの形式が正しくありません')
  }

  const normalized: AppState = {
    version: APP_STATE_VERSION,
    dailyRecords: raw.dailyRecords,
    statistics: raw.statistics ?? { totalCount: 0, maxDailyCount: 0 },
    creatures: raw.creatures,
    encyclopedia: raw.encyclopedia ?? { discoveredKeys: [] },
    quotes: raw.quotes ?? { recentQuoteIds: [] },
    settings: {
      activeCreatureId: raw.settings.activeCreatureId,
      lastDisplayedDate: raw.settings.lastDisplayedDate,
      timezone: 'Asia/Tokyo',
      eggMilestonesGranted: raw.settings.eggMilestonesGranted ?? [0],
    },
  }

  return recomputeStatistics(normalized)
}
