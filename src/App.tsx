import { useEffect, useMemo, useState } from 'react'
import {
  STATUS_META,
  createId,
  formatClock,
  minutesFromDate,
  sortMembersByAvailability,
  summarizeAvailability,
  type Member,
  type ScheduleBlock,
} from './availability'
import { ScheduleBar } from './ScheduleBar'
import { createDemoMembers } from './seed'
import './App.css'

const STORAGE_KEY = 'ima-furu-members-v1'

function loadMembers(): Member[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createDemoMembers()
    const parsed = JSON.parse(raw) as Member[]
    if (!Array.isArray(parsed) || parsed.length === 0) return createDemoMembers()
    return parsed
  } catch {
    return createDemoMembers()
  }
}

function App() {
  const [now, setNow] = useState(() => new Date())
  const [members, setMembers] = useState<Member[]>(() => loadMembers())
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [draftName, setDraftName] = useState('')

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 15_000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(members))
  }, [members])

  const nowMin = minutesFromDate(now)
  const ranked = useMemo(
    () => sortMembersByAvailability(members, nowMin),
    [members, nowMin],
  )
  const summary = useMemo(
    () => summarizeAvailability(members, nowMin),
    [members, nowMin],
  )

  function updateBlocks(memberId: string, blocks: ScheduleBlock[]) {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, blocks } : m)),
    )
  }

  function addMember() {
    const name = draftName.trim()
    if (!name) return
    const id = createId('member')
    setMembers((prev) => [
      ...prev,
      {
        id,
        name,
        blocks: [
          {
            id: createId('block'),
            startMin: Math.max(8 * 60, nowMin),
            endMin: Math.min(24 * 60, Math.max(8 * 60, nowMin) + 60),
            status: 'immediate',
          },
        ],
      },
    ])
    setDraftName('')
    setExpandedId(id)
  }

  function removeMember(id: string) {
    setMembers((prev) => prev.filter((m) => m.id !== id))
    if (expandedId === id) setExpandedId(null)
  }

  function resetDemo() {
    const next = createDemoMembers(new Date())
    setMembers(next)
    setExpandedId(null)
  }

  return (
    <div className="app">
      <div className="atmosphere" aria-hidden />

      <header className="hero">
        <p className="brand">いま振る</p>
        <h1 className="tagline">今、誰に仕事を振る？</h1>
        <p className="lede">
          稼働を一目で見て、振り先を直感で決めるシフトボード。
        </p>
      </header>

      <section className="status-board" aria-live="polite">
        <div className="status-time">
          <span className="status-time-label">現在</span>
          <time dateTime={now.toISOString()}>{formatClock(nowMin)}</time>
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

      <section className="dispatch">
        <div className="section-head">
          <h2>今、誰に振る？</h2>
          <p>対応できる人から上に並びます</p>
        </div>

        <ol className="member-list">
          {ranked.map((member, index) => {
            const meta = STATUS_META[member.availability.status]
            const open = expandedId === member.id
            return (
              <li
                key={member.id}
                className={`member-row status-${member.availability.status} ${open ? 'open' : ''}`}
              >
                <button
                  type="button"
                  className="member-main"
                  onClick={() =>
                    setExpandedId((prev) =>
                      prev === member.id ? null : member.id,
                    )
                  }
                  aria-expanded={open}
                >
                  <span className="rank" aria-hidden>
                    {index + 1}
                  </span>
                  <span className="member-status" aria-hidden>
                    {meta.emoji}
                  </span>
                  <span className="member-body">
                    <span className="member-name">{member.name}</span>
                    <span className="member-ready">
                      {member.availability.label}
                    </span>
                  </span>
                  <span className="member-badge">{meta.short}</span>
                </button>

                {open && (
                  <div className="member-editor">
                    <ScheduleBar
                      blocks={member.blocks}
                      nowMin={nowMin}
                      onChange={(blocks) => updateBlocks(member.id, blocks)}
                    />
                    <div className="member-actions">
                      <button
                        type="button"
                        className="ghost-btn danger"
                        onClick={() => removeMember(member.id)}
                      >
                        メンバーを削除
                      </button>
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ol>
      </section>

      <section className="add-member">
        <h2>メンバー追加</h2>
        <form
          className="add-form"
          onSubmit={(e) => {
            e.preventDefault()
            addMember()
          }}
        >
          <label className="sr-only" htmlFor="member-name">
            名前
          </label>
          <input
            id="member-name"
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            placeholder="名前を入力"
            autoComplete="off"
          />
          <button type="submit" className="primary-btn">
            追加
          </button>
        </form>
        <button type="button" className="ghost-btn" onClick={resetDemo}>
          デモデータを入れ直す
        </button>
      </section>

      <footer className="footer">
        <p>シフト管理ではなく、振り先判断のためのボード</p>
      </footer>
    </div>
  )
}

export default App
