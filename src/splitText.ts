/** Characters that are strong phrase/sentence endings. */
const STRONG_BREAKS = new Set([
  '。',
  '！',
  '？',
  '!',
  '?',
  '．',
  '…',
  '‥',
  '♪',
])

/** Softer phrase breaks — used when no strong break is in range. */
const MEDIUM_BREAKS = new Set([
  '、',
  '，',
  ',',
  '；',
  ';',
  '：',
  ':',
  '」',
  '』',
  '）',
  ')',
  '】',
  '〉',
  '》',
  '〕',
  '］',
  '}',
  '〜',
  '～',
  '・',
])

const SOFT_BREAKS = new Set([' ', '　', '\t'])

function breakRank(ch: string): number {
  if (STRONG_BREAKS.has(ch)) return 3
  if (MEDIUM_BREAKS.has(ch)) return 2
  if (SOFT_BREAKS.has(ch)) return 1
  return 0
}

/**
 * Within a window of at most `maxLen` chars starting at `start`,
 * pick a cut length that ends on the best linguistic boundary.
 * Falls back to a hard cut at `maxLen` when none is found.
 */
function chooseCutLength(chars: string[], start: number, maxLen: number): number {
  const remaining = chars.length - start
  if (remaining <= maxLen) return remaining

  let bestLen = maxLen
  let bestRank = 0

  for (let len = 1; len <= maxLen; len++) {
    const rank = breakRank(chars[start + len - 1]!)
    if (rank > bestRank) {
      bestRank = rank
      bestLen = len
    } else if (rank > 0 && rank === bestRank) {
      // Same priority: prefer the later (closer to the limit) break.
      bestLen = len
    }
  }

  return bestLen
}

/** Split text into lines of at most `charsPerLine`, preferring natural breaks. */
export function splitText(text: string, charsPerLine: number): string[] {
  if (charsPerLine < 1) return []

  const normalized = text.replace(/\r\n|\r|\n/g, '')
  if (!normalized) return []

  const chars = Array.from(normalized)
  const lines: string[] = []
  let i = 0

  while (i < chars.length) {
    const cut = chooseCutLength(chars, i, charsPerLine)
    lines.push(chars.slice(i, i + cut).join(''))
    i += cut
  }

  return lines
}

export function countChars(text: string): number {
  return Array.from(text.replace(/\r\n|\r|\n/g, '')).length
}
