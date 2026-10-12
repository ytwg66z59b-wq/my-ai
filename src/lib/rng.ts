export type Rng = () => number

export const defaultRng: Rng = () => Math.random()

/** Inclusive integer in [min, max] */
export function randomInt(min: number, max: number, rng: Rng = defaultRng): number {
  const lo = Math.ceil(min)
  const hi = Math.floor(max)
  return Math.floor(rng() * (hi - lo + 1)) + lo
}

export function pickWeighted<T extends { weight: number }>(
  items: T[],
  rng: Rng = defaultRng,
): T | undefined {
  if (items.length === 0) return undefined
  const total = items.reduce((s, i) => s + i.weight, 0)
  if (total <= 0) return items[0]
  let roll = rng() * total
  for (const item of items) {
    roll -= item.weight
    if (roll <= 0) return item
  }
  return items[items.length - 1]
}
