/** Growth stages from egg to apex form */
export type GrowthStage = 'egg' | 'juvenile' | 'growth' | 'adult' | 'apex'

export type Element =
  | 'light'
  | 'star'
  | 'nature'
  | 'flame'
  | 'water'
  | 'earth'

export type Rarity = 'normal' | 'rare' | 'epic' | 'legend' | 'mythic'

export type ScreenId =
  | 'home'
  | 'nursery'
  | 'encyclopedia'
  | 'calendar'
  | 'detail'
  | 'backup'

export interface EvolutionCandidate {
  formId: string
  weight: number
  preferredElements?: Element[]
}

export interface SpeciesForm {
  id: string
  speciesLineId: string
  name: string
  stage: GrowthStage
  element: Element
  rarity: Rarity
  defaultColorId: string
  description: string
  lines: string[]
  evolveTo: EvolutionCandidate[]
  /** Points before hatch/evolve checks begin (overridden per individual for eggs/creatures) */
  evolveStartMin: number
  evolveStartMax: number
  evolveForceAt: number
}

export interface ColorVariant {
  id: string
  name: string
  primary: string
  secondary: string
  accent: string
}

export interface Quote {
  id: string
  text: string
  speaker: string
  type: 'original' | 'character'
  characterFormId?: string
}

export interface EvolutionEvent {
  at: string
  fromFormId: string
  toFormId: string
  fromName: string
  toName: string
}

export interface Creature {
  id: string
  formId: string
  name: string
  stage: GrowthStage
  element: Element
  colorId: string
  rarity: Rarity
  speciesLineId: string
  growthPoints: number
  /** Random threshold when evolve checks begin */
  evolutionThreshold: number
  /** Consecutive failed evolve rolls (raises chance) */
  failCount: number
  evolutionHistory: EvolutionEvent[]
  discoveredAt: string
}

export interface DailyRecord {
  date: string
  count: number
}

export interface Statistics {
  totalCount: number
  maxDailyCount: number
}

export interface EncyclopediaState {
  /** Unique keys: `${formId}::${colorId}` */
  discoveredKeys: string[]
}

export interface QuotesState {
  recentQuoteIds: string[]
}

export interface AppSettings {
  activeCreatureId: string | null
  lastDisplayedDate: string
  timezone: 'Asia/Tokyo'
  /** Total-count milestones that already granted an egg */
  eggMilestonesGranted: number[]
}

export interface AppState {
  version: number
  dailyRecords: Record<string, number>
  statistics: Statistics
  creatures: Creature[]
  encyclopedia: EncyclopediaState
  quotes: QuotesState
  settings: AppSettings
}

export type EffortEventKind =
  | 'none'
  | 'reaction'
  | 'hatch'
  | 'evolve'
  | 'egg_granted'

export interface EffortEvent {
  kind: EffortEventKind
  creatureId?: string
  message?: string
  fromFormId?: string
  toFormId?: string
  newCreatureId?: string
}

export interface EffortResult {
  state: AppState
  events: EffortEvent[]
  /** Idempotency token for this tap processing unit */
  actionId: string
}

export const APP_STATE_VERSION = 1

export const STAGE_LABELS: Record<GrowthStage, string> = {
  egg: '卵',
  juvenile: '幼体',
  growth: '成長体',
  adult: '成体',
  apex: '上位種',
}

export const ELEMENT_LABELS: Record<Element, string> = {
  light: '光',
  star: '星',
  nature: '自然',
  flame: '炎',
  water: '水',
  earth: '大地',
}

export const RARITY_LABELS: Record<Rarity, string> = {
  normal: 'ノーマル',
  rare: 'レア',
  epic: 'エピック',
  legend: 'レジェンド',
  mythic: 'ミシック',
}
