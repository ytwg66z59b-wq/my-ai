/** Split text into lines of the given character count (Unicode code points). */
export function splitText(text: string, charsPerLine: number): string[] {
  if (charsPerLine < 1) return []

  const normalized = text.replace(/\r\n|\r|\n/g, '')
  if (!normalized) return []

  const chars = Array.from(normalized)
  const lines: string[] = []

  for (let i = 0; i < chars.length; i += charsPerLine) {
    lines.push(chars.slice(i, i + charsPerLine).join(''))
  }

  return lines
}

export function countChars(text: string): number {
  return Array.from(text.replace(/\r\n|\r|\n/g, '')).length
}
