import type { ColorVariant } from '../types/models'

export const COLOR_VARIANTS: ColorVariant[] = [
  {
    id: 'pearl_gold',
    name: 'パールゴールド',
    primary: '#F5E6B8',
    secondary: '#E8C547',
    accent: '#FFF8E7',
  },
  {
    id: 'sky_aqua',
    name: 'スカイアクア',
    primary: '#A8E6E1',
    secondary: '#4DB6AC',
    accent: '#E0F7F5',
  },
  {
    id: 'rose_bloom',
    name: 'ローズブルーム',
    primary: '#F5C6D0',
    secondary: '#E88A9A',
    accent: '#FFF0F3',
  },
  {
    id: 'mint_leaf',
    name: 'ミントリーフ',
    primary: '#B8E6C8',
    secondary: '#5CB87A',
    accent: '#E8F8EE',
  },
  {
    id: 'ember_coral',
    name: 'エンバーコーラル',
    primary: '#F5B89A',
    secondary: '#E07A4A',
    accent: '#FFF0E8',
  },
  {
    id: 'moon_silver',
    name: 'ムーンシルバー',
    primary: '#D4D8E8',
    secondary: '#8A94B8',
    accent: '#F0F2F8',
  },
  {
    id: 'deep_indigo',
    name: 'ディープインディゴ',
    primary: '#9AA8D4',
    secondary: '#4A5A9A',
    accent: '#E8ECF8',
  },
]

export function getColor(id: string): ColorVariant {
  return COLOR_VARIANTS.find((c) => c.id === id) ?? COLOR_VARIANTS[0]!
}
