import { useMemo, useState } from 'react'
import {
  getJstDateString,
  getJstWeekRange,
  getMonthKey,
  listDatesInMonth,
  sumRecordsInMonth,
  sumRecordsInRange,
} from '../lib/date'
import { useGame } from '../state/GameContext'
import './CalendarScreen.css'

export function CalendarScreen() {
  const { state } = useGame()
  const today = getJstDateString()
  const [cursor, setCursor] = useState(() => {
    const [y, m] = today.split('-').map(Number)
    return { year: y!, month: m! }
  })
  const [selected, setSelected] = useState(today)

  const dates = useMemo(
    () => listDatesInMonth(cursor.year, cursor.month),
    [cursor.year, cursor.month],
  )

  const firstDow = useMemo(() => {
    const [y, m, d] = dates[0]!.split('-').map(Number)
    // JST calendar weekday via UTC noon trick
    return new Date(Date.UTC(y!, m! - 1, d!, 3)).getUTCDay()
  }, [dates])

  const maxInMonth = useMemo(() => {
    let max = 1
    for (const d of dates) {
      max = Math.max(max, state.dailyRecords[d] ?? 0)
    }
    return max
  }, [dates, state.dailyRecords])

  const week = getJstWeekRange(today)
  const weekSum = sumRecordsInRange(state.dailyRecords, week.start, week.end)
  const monthKey = getMonthKey(`${cursor.year}-${String(cursor.month).padStart(2, '0')}-01`)
  const monthSum = sumRecordsInMonth(state.dailyRecords, monthKey)
  const selectedCount = state.dailyRecords[selected] ?? 0

  function shiftMonth(delta: number) {
    setCursor((c) => {
      const dt = new Date(Date.UTC(c.year, c.month - 1 + delta, 1))
      return { year: dt.getUTCFullYear(), month: dt.getUTCMonth() + 1 }
    })
  }

  return (
    <section className="cal-screen">
      <header className="screen-head">
        <h1>カレンダー・記録</h1>
        <p>日本時間の日付で集計</p>
      </header>

      <div className="stats-strip">
        <div>
          <span className="k">累計</span>
          <strong>{state.statistics.totalCount}</strong>
        </div>
        <div>
          <span className="k">今月</span>
          <strong>{monthSum}</strong>
        </div>
        <div>
          <span className="k">今週</span>
          <strong>{weekSum}</strong>
        </div>
        <div>
          <span className="k">最高</span>
          <strong>{state.statistics.maxDailyCount}</strong>
        </div>
      </div>

      <div className="cal-nav">
        <button type="button" className="btn btn-ghost" onClick={() => shiftMonth(-1)}>
          前月
        </button>
        <h2>
          {cursor.year}年{cursor.month}月
        </h2>
        <button type="button" className="btn btn-ghost" onClick={() => shiftMonth(1)}>
          次月
        </button>
      </div>

      <div className="cal-grid" role="grid" aria-label="月間カレンダー">
        {['日', '月', '火', '水', '木', '金', '土'].map((w) => (
          <div key={w} className="cal-dow">
            {w}
          </div>
        ))}
        {Array.from({ length: firstDow }).map((_, i) => (
          <div key={`pad-${i}`} className="cal-cell is-pad" />
        ))}
        {dates.map((date) => {
          const count = state.dailyRecords[date] ?? 0
          const intensity = count === 0 ? 0 : Math.max(0.18, count / maxInMonth)
          return (
            <button
              key={date}
              type="button"
              className={`cal-cell${date === today ? ' is-today' : ''}${date === selected ? ' is-selected' : ''}`}
              style={
                count > 0
                  ? {
                      background: `color-mix(in srgb, var(--accent) ${Math.round(intensity * 100)}%, white)`,
                    }
                  : undefined
              }
              onClick={() => setSelected(date)}
            >
              <span className="day-num">{Number(date.slice(-2))}</span>
              <span className="day-count">{count > 0 ? count : ''}</span>
            </button>
          )
        })}
      </div>

      <div className="cal-detail">
        <p className="cal-detail-date">{selected}</p>
        <p className="cal-detail-count">
          <strong>{selectedCount}</strong> 回がんばった
        </p>
      </div>
    </section>
  )
}
