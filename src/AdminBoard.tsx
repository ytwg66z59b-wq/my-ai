import { useMemo } from 'react'
import {
  STATUS_META,
  WEEKDAY_LABELS,
  addDays,
  countAvailableMinutes,
  effectiveBlocks,
  formatClock,
  formatDateLabel,
  resolveDayPlan,
  sortMembersByAvailability,
  startOfWeek,
  summarizeAvailability,
  type Member,
} from './availability'
import { ScheduleTimeline } from './ScheduleTimeline'

export type RangeMode = 'day' | 'week' | 'month'

type AdminBoardProps = {
  members: Member[]
  dateKey: string
  nowMin: number
  range: RangeMode
  onChangeDate: (dateKey: string) => void
  onChangeRange: (range: RangeMode) => void
}

export function AdminBoard({
  members,
  dateKey,
  nowMin,
  range,
  onChangeDate,
  onChangeRange,
}: AdminBoardProps) {
  const ranked = useMemo(
    () => sortMembersByAvailability(members, dateKey, nowMin),
    [members, dateKey, nowMin],
  )
  const summary = useMemo(
    () => summarizeAvailability(members, dateKey, nowMin),
    [members, dateKey, nowMin],
  )

  const weekKeys = useMemo(() => {
    const start = startOfWeek(dateKey)
    return Array.from({ length: 7 }, (_, i) => addDays(start, i))
  }, [dateKey])

  const monthKeys = useMemo(() => {
    const [y, m] = dateKey.split('-').map(Number)
    const first = new Date(y, m - 1, 1)
    const days = new Date(y, m, 0).getDate()
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(first)
      d.setDate(i + 1)
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      return `${d.getFullYear()}-${mm}-${dd}`
    })
  }, [dateKey])

  return (
    <section className="admin-board">
      <header className="hero compact-hero">
        <p className="brand">いま振る</p>
        <h1 className="tagline">今、誰に仕事を振る？</h1>
        <p className="lede">
          業務委託メンバーの対応可能時間を共有し、振り先を一瞬で判断するボード。
        </p>
      </header>

      <section className="status-board" aria-live="polite">
        <div className="status-time">
          <span className="status-time-label">現在</span>
          <time>{formatClock(nowMin)}</time>
          <span className="status-date">{formatDateLabel(dateKey)}</span>
        </div>
        <ul className="status-counts">
          <li className="count immediate">
            <span>{STATUS_META.immediate.emoji}</span>
            <span>
              {STATUS_META.immediate.long}
              <strong>{summary.immediate}人</strong>
            </span>
          </li>
          <li className="count soon">
            <span>{STATUS_META.soon.emoji}</span>
            <span>
              {STATUS_META.soon.long}
              <strong>{summary.soon}人</strong>
            </span>
          </li>
          <li className="count unavailable">
            <span>{STATUS_META.unavailable.emoji}</span>
            <span>
              {STATUS_META.unavailable.long}
              <strong>{summary.unavailable}人</strong>
            </span>
          </li>
        </ul>
      </section>

      <div className="range-tabs" role="tablist">
        {(
          [
            ['day', '日'],
            ['week', '週'],
            ['month', '月'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={range === key}
            className={range === key ? 'active' : ''}
            onClick={() => onChangeRange(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="date-nav">
        <button
          type="button"
          className="ghost-btn"
          onClick={() =>
            onChangeDate(
              addDays(dateKey, range === 'month' ? -30 : range === 'week' ? -7 : -1),
            )
          }
        >
          ‹
        </button>
        <strong>
          {range === 'day' && formatDateLabel(dateKey)}
          {range === 'week' &&
            `${formatDateLabel(weekKeys[0])} – ${formatDateLabel(weekKeys[6])}`}
          {range === 'month' &&
            `${dateKey.slice(0, 7).replace('-', '/')} の稼働`}
        </strong>
        <button
          type="button"
          className="ghost-btn"
          onClick={() =>
            onChangeDate(
              addDays(dateKey, range === 'month' ? 30 : range === 'week' ? 7 : 1),
            )
          }
        >
          ›
        </button>
      </div>

      {range === 'day' && (
        <>
          <div className="section-head">
            <h2>今、対応できる人</h2>
            <p>現在時刻を基準に並べています</p>
          </div>
          {ranked.length === 0 && (
            <p className="empty-board">
              まだメンバーがいません。「自分のシフト」から名前を登録して始めてください。
            </p>
          )}
          <ol className="member-list">
            {ranked.map((m, index) => {
              const meta = STATUS_META[m.availability.status]
              const plan = resolveDayPlan(m, dateKey)
              return (
                <li
                  key={m.id}
                  className={`member-row status-${m.availability.status}`}
                >
                  <div className="member-main static">
                    <span className="rank">{index + 1}</span>
                    <span className="member-status">{meta.emoji}</span>
                    <span className="member-body">
                      <span className="member-name">{m.name}</span>
                      <span className="member-ready">{m.availability.label}</span>
                    </span>
                    <span className="member-badge">{meta.short}</span>
                  </div>
                  <div className="member-timeline">
                    {plan.mode === 'off' ? (
                      <p className="mode-note">休日</p>
                    ) : (
                      <ScheduleTimeline
                        blocks={effectiveBlocks(plan)}
                        nowMin={nowMin}
                        compact
                        showNowLine
                      />
                    )}
                  </div>
                </li>
              )
            })}
          </ol>
        </>
      )}

      {range === 'week' && (
        <div className="week-grid">
          {ranked.length === 0 && (
            <p className="empty-board">まだメンバーがいません。</p>
          )}
          {ranked.map((m) => (
            <article key={m.id} className="week-card">
              <h3>{m.name}</h3>
              <div className="week-days">
                {weekKeys.map((key) => {
                  const plan = resolveDayPlan(m, key)
                  const mins = countAvailableMinutes(plan)
                  const date = new Date(
                    Number(key.slice(0, 4)),
                    Number(key.slice(5, 7)) - 1,
                    Number(key.slice(8, 10)),
                  )
                  return (
                    <button
                      key={key}
                      type="button"
                      className={`week-cell mode-${plan.mode}`}
                      onClick={() => onChangeDate(key)}
                    >
                      <span>
                        {date.getDate()}
                        {WEEKDAY_LABELS[date.getDay()]}
                      </span>
                      <strong>
                        {plan.mode === 'off'
                          ? '休'
                          : plan.mode === 'all-day'
                            ? '終日'
                            : `${Math.round(mins / 60)}h`}
                      </strong>
                    </button>
                  )
                })}
              </div>
              <ScheduleTimeline
                blocks={effectiveBlocks(resolveDayPlan(m, dateKey))}
                nowMin={nowMin}
                compact
              />
            </article>
          ))}
        </div>
      )}

      {range === 'month' && (
        <div className="month-list">
          {ranked.length === 0 && (
            <p className="empty-board">まだメンバーがいません。</p>
          )}
          {ranked.map((m) => {
            const total = monthKeys.reduce(
              (sum, key) => sum + countAvailableMinutes(resolveDayPlan(m, key)),
              0,
            )
            const workDays = monthKeys.filter((key) => {
              const plan = resolveDayPlan(m, key)
              return plan.mode !== 'off' && countAvailableMinutes(plan) > 0
            }).length
            return (
              <article key={m.id} className="month-card">
                <div>
                  <h3>{m.name}</h3>
                  <p>
                    対応可能 約{Math.round(total / 60)}時間 / {workDays}日
                  </p>
                </div>
                <div className="month-dots">
                  {monthKeys.map((key) => {
                    const plan = resolveDayPlan(m, key)
                    const mins = countAvailableMinutes(plan)
                    const level =
                      plan.mode === 'off' || mins === 0
                        ? 0
                        : mins >= 6 * 60
                          ? 3
                          : mins >= 3 * 60
                            ? 2
                            : 1
                    return (
                      <button
                        key={key}
                        type="button"
                        className={`month-dot level-${level}`}
                        title={`${formatDateLabel(key)}`}
                        onClick={() => onChangeDate(key)}
                      />
                    )
                  })}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
