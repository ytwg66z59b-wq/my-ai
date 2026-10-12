import type { Quote } from '../types/models'

export const QUOTES: Quote[] = [
  {
    id: 'quote_001',
    text: '小さな一歩も、未来を変える力になる。',
    speaker: 'ルミナ',
    type: 'character',
    characterFormId: 'lumina_juvenile',
  },
  {
    id: 'quote_002',
    text: '一歩ずつでも、進んだことに変わりはない。',
    speaker: 'ナレーター',
    type: 'original',
  },
  {
    id: 'quote_003',
    text: '卵の中でも、光は育っている。',
    speaker: '光の卵',
    type: 'character',
    characterFormId: 'egg_light',
  },
  {
    id: 'quote_004',
    text: 'がんばった日は、星がひとつ増える。',
    speaker: '星空の龍',
    type: 'character',
    characterFormId: 'dragon_star',
  },
  {
    id: 'quote_005',
    text: '流れに逆らわず、でも流されすぎない。',
    speaker: 'リプル',
    type: 'character',
    characterFormId: 'ripple_juvenile',
  },
  {
    id: 'quote_006',
    text: '今日の回数は、明日の自分への手紙。',
    speaker: 'ナレーター',
    type: 'original',
  },
  {
    id: 'quote_007',
    text: '進化は突然やってくる。積み重ねたあとに。',
    speaker: '光の龍',
    type: 'character',
    characterFormId: 'dragon_light',
  },
  {
    id: 'quote_008',
    text: '守れない日があっても、また育て直せる。',
    speaker: '守護の龍',
    type: 'character',
    characterFormId: 'dragon_guardian',
  },
  {
    id: 'quote_009',
    text: '潮が引いても、海は消えない。',
    speaker: '潮の龍',
    type: 'character',
    characterFormId: 'dragon_tide',
  },
  {
    id: 'quote_010',
    text: 'ゼロから始まる朝も、累計は続いている。',
    speaker: 'ナレーター',
    type: 'original',
  },
  {
    id: 'quote_011',
    text: 'きみが押したその一回が、誰かの励みになる。',
    speaker: 'ナレーター',
    type: 'original',
  },
  {
    id: 'quote_012',
    text: '聖なる光は、毎日の誠実さから生まれる。',
    speaker: '聖光の上位龍',
    type: 'character',
    characterFormId: 'apex_holy_light',
  },
]

export function getQuote(id: string): Quote | undefined {
  return QUOTES.find((q) => q.id === id)
}
