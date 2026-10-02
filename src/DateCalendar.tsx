import { useMemo, useState } from 'react'
import {
  WEEKDAY_LABELS,
  addDays,
  formatDateLabel,
  parseDateKey,
  resolveDayPlan,
  toDateKey,
  type DayPlan,
  type Member,
} from './availability'

type DateCalendarProps = {
  dateKey: string
  member: Member
  onChangeDate: (dateKey: string) => void
}

function monthLabel(year: number, monthIndex: number): string {
  return `${year}年${monthIndex + 1}月`
}

function buildMonthCells(year: number, monthIndex: number): Array<string | null> {
  const first = new Date(year, monthIndex, 1)
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const startPad = first.getDay()
  const cells: Array<string | null> = []
  for (let i = 0; i < startPad; i += 1) cells.push(null)
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(toDateKey(new Date(year, monthIndex, day)))
  }
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

function dayMark(plan: DayPlan): 'off' | 'all-day' | 'timed' | 'empty' {
  if (plan.mode === 'off') return 'off'
  if (plan.mode === 'all-day') return 'all-day'
  if (plan.blocks.length > 0) return 'timed'
  return 'empty'
}

export function DateCalendar({
  dateKey,
  member,
  onChangeDate,
}: DateCalendarProps) {
  const selected = parseDateKey(dateKey)
  const todayKey = toDateKey(new Date())
  const [viewYear, setViewYear] = useState(selected.getFullYear())
  const [viewMonth, setViewMonth] = useState(selected.getMonth())

  const cells = useMemo(
    () => buildMonthCells(viewYear, viewMonth),
    [viewYear, viewMonth],
  )

  function showMonthFor(key: string) {
    const next = parseDateKey(key)
    setViewYear(next.getFullYear())
    setViewMonth(next.getMonth())
  }

  function selectDate(key: string) {
    showMonthFor(key)
    onChangeDate(key)
  }

  function shiftMonth(delta: number) {
    const next = new Date(viewYear, viewMonth + delta, 1)
    setViewYear(next.getFullYear())
    setViewMonth(next.getMonth())
  }

  function goToday() {
    selectDate(toDateKey(new Date()))
  }

  return (
    <section className="date-calendar" aria-label="日付カレンダー">
      <div className="date-calendar-selected">
        <div>
          <span className="date-calendar-caption">編集する日</span>
          <strong>{formatDateLabel(dateKey)}</strong>
        </div>
        <div className="date-calendar-quick">
          <button
            type="button"
            className="ghost-btn"
            onClick={() => selectDate(addDays(dateKey, -1))}
          >
            前日
          </button>
          <button type="button" className="ghost-btn" onClick={goToday}>
            今日
          </button>
          <button
            type="button"
            className="ghost-btn"
            onClick={() => selectDate(addDays(dateKey, 1))}
          >
            翌日
          </button>
        </div>
      </div>

      <div className="date-calendar-nav">
        <button
          type="button"
          className="ghost-btn"
          onClick={() => shiftMonth(-1)}
          aria-label="前の月"
        >
          ‹
        </button>
        <strong>{monthLabel(viewYear, viewMonth)}</strong>
        <button
          type="button"
          className="ghost-btn"
          onClick={() => shiftMonth(1)}
          aria-label="次の月"
        >
          ›
        </button>
      </div>

      <div className="date-calendar-weekdays" aria-hidden>
        {WEEKDAY_LABELS.map((label) => (
          <span
            key={label}
            className={label === '日' ? 'sun' : label === '土' ? 'sat' : ''}
          >
            {label}
          </span>
        ))}
      </div>

      <div
        className="date-calendar-grid"
        role="grid"
        aria-label={`${viewYear}年${viewMonth + 1}月`}
      >
        {cells.map((key, index) => {
          if (!key) {
            return <span key={`empty-${index}`} className="cal-cell empty" />
          }
          const date = parseDateKey(key)
          const plan = resolveDayPlan(member, key)
          const mark = dayMark(plan)
          const isSelected = key === dateKey
          const isToday = key === todayKey
          const dow = date.getDay()
          return (
            <button
              key={key}
              type="button"
              role="gridcell"
              aria-selected={isSelected}
              className={[
                'cal-cell',
                isSelected ? 'selected' : '',
                isToday ? 'today' : '',
                dow === 0 ? 'sun' : '',
                dow === 6 ? 'sat' : '',
                `mark-${mark}`,
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => selectDate(key)}
            >
              <span className="cal-day">{date.getDate()}</span>
              {mark !== 'empty' && <span className="cal-dot" aria-hidden />}
            </button>
          )
        })}
      </div>

      <p className="date-calendar-legend">
        <span>
          <i className="dot timed" /> 時間指定あり
        </span>
        <span>
          <i className="dot all" /> 終日OK
        </span>
        <span>
          <i className="dot off" /> 休日
        </span>
      </p>
    </section>
  )
}
