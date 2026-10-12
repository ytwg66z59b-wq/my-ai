import { QUOTES } from '../data/quotes'
import type { Quote } from '../types/models'
import { defaultRng, type Rng } from './rng'

const RECENT_LIMIT = 5

export function pickQuote(
  recentIds: string[],
  rng: Rng = defaultRng,
): { quote: Quote; nextRecentIds: string[] } {
  const avoid = new Set(recentIds.slice(0, RECENT_LIMIT))
  let pool = QUOTES.filter((q) => !avoid.has(q.id))
  if (pool.length === 0) pool = [...QUOTES]

  const quote = pool[Math.floor(rng() * pool.length)]!
  const nextRecentIds = [quote.id, ...recentIds.filter((id) => id !== quote.id)].slice(
    0,
    RECENT_LIMIT,
  )
  return { quote, nextRecentIds }
}
