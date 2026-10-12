const JST = 'Asia/Tokyo'

/** Returns YYYY-MM-DD in Japan Standard Time */
export function getJstDateString(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: JST,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

/** Monday-start week key for aggregations (JST) */
export function getJstWeekRange(dateStr: string): { start: string; end: string } {
  const [y, m, d] = dateStr.split('-').map(Number)
  // Interpret as JST noon to avoid DST edge cases (Japan has no DST)
  const utc = Date.UTC(y!, m! - 1, d!, 3, 0, 0) // 12:00 JST = 03:00 UTC
  const day = new Date(utc).getUTCDay() // 0 Sun .. 6 Sat
  const mondayOffset = day === 0 ? -6 : 1 - day
  const monday = new Date(utc)
  monday.setUTCDate(monday.getUTCDate() + mondayOffset)
  const sunday = new Date(monday)
  sunday.setUTCDate(sunday.getUTCDate() + 6)
  return {
    start: formatUtcYmdAsJstCalendar(monday),
    end: formatUtcYmdAsJstCalendar(sunday),
  }
}

function formatUtcYmdAsJstCalendar(d: Date): string {
  // Our Date objects here store calendar days via UTC fields representing JST dates
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function getMonthKey(dateStr: string): string {
  return dateStr.slice(0, 7)
}

export function listDatesInMonth(year: number, month: number): string[] {
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate()
  const out: string[] = []
  for (let d = 1; d <= days; d++) {
    out.push(
      `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
    )
  }
  return out
}

export function sumRecordsInRange(
  records: Record<string, number>,
  start: string,
  end: string,
): number {
  let sum = 0
  for (const [date, count] of Object.entries(records)) {
    if (date >= start && date <= end) sum += count
  }
  return sum
}

export function sumRecordsInMonth(
  records: Record<string, number>,
  monthKey: string,
): number {
  let sum = 0
  for (const [date, count] of Object.entries(records)) {
    if (date.startsWith(monthKey)) sum += count
  }
  return sum
}

export { JST }
