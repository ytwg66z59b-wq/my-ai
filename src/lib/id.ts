let seq = 0

/** Unique-enough id for local creatures / actions */
export function createId(prefix: string): string {
  seq += 1
  const rand = Math.random().toString(36).slice(2, 8)
  return `${prefix}_${Date.now().toString(36)}_${seq}_${rand}`
}
