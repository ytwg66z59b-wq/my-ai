import { useEffect, useState } from 'react'
import { AdminBoard, type RangeMode } from './AdminBoard'
import { MemberEditor } from './MemberEditor'
import {
  createId,
  emptyTemplates,
  minutesFromDate,
  toDateKey,
  type DayPlan,
  type Member,
  type WeekdayTemplate,
} from './availability'
import { createDemoMembers } from './seed'
import './App.css'

const STORAGE_KEY = 'ima-furu-board-v2'
type Tab = 'admin' | 'member'

function isMemberArray(value: unknown): value is Member[] {
  return Array.isArray(value) && value.every((m) => m && typeof m === 'object' && 'days' in m)
}

function loadMembers(): Member[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createDemoMembers()
    const parsed = JSON.parse(raw) as unknown
    if (!isMemberArray(parsed) || parsed.length === 0) return createDemoMembers()
    return parsed.map((m) => ({
      ...m,
      templates: m.templates?.length === 7 ? m.templates : emptyTemplates(),
      days: m.days ?? {},
    }))
  } catch {
    return createDemoMembers()
  }
}

function App() {
  const [now, setNow] = useState(() => new Date())
  const [members, setMembers] = useState<Member[]>(() => loadMembers())
  const [tab, setTab] = useState<Tab>('admin')
  const [dateKey, setDateKey] = useState(() => toDateKey(new Date()))
  const [range, setRange] = useState<RangeMode>('day')
  const [activeMemberId, setActiveMemberId] = useState(() => {
    const initial = loadMembers()
    return initial[0]?.id ?? ''
  })
  const [draftName, setDraftName] = useState('')

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 15_000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(members))
  }, [members])

  const resolvedMemberId = members.some((m) => m.id === activeMemberId)
    ? activeMemberId
    : (members[0]?.id ?? '')

  const nowMin = minutesFromDate(now)

  function updateDay(memberId: string, plan: DayPlan) {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === memberId
          ? { ...m, days: { ...m.days, [plan.dateKey]: plan } }
          : m,
      ),
    )
  }

  function saveTemplate(
    memberId: string,
    weekday: number,
    template: WeekdayTemplate,
  ) {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== memberId) return m
        const templates = [...m.templates]
        templates[weekday] = template
        return { ...m, templates }
      }),
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
        days: {},
        templates: emptyTemplates(),
      },
    ])
    setActiveMemberId(id)
    setDraftName('')
    setTab('member')
  }

  function resetDemo() {
    const next = createDemoMembers(new Date())
    setMembers(next)
    setActiveMemberId(next[0]?.id ?? '')
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <div className="app">
      <div className="atmosphere" aria-hidden />

      <nav className="app-tabs" aria-label="画面切替">
        <button
          type="button"
          className={tab === 'admin' ? 'active' : ''}
          onClick={() => setTab('admin')}
        >
          管理画面
        </button>
        <button
          type="button"
          className={tab === 'member' ? 'active' : ''}
          onClick={() => setTab('member')}
        >
          シフト入力
        </button>
      </nav>

      {tab === 'admin' ? (
        <AdminBoard
          members={members}
          dateKey={dateKey}
          nowMin={nowMin}
          range={range}
          onChangeDate={setDateKey}
          onChangeRange={setRange}
        />
      ) : (
        <MemberEditor
          members={members}
          activeMemberId={resolvedMemberId}
          dateKey={dateKey}
          nowMin={nowMin}
          onSelectMember={setActiveMemberId}
          onChangeDate={setDateKey}
          onUpdateDay={updateDay}
          onSaveTemplate={saveTemplate}
        />
      )}

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
        <p>シフト記録ではなく、振り先判断のためのボード</p>
      </footer>
    </div>
  )
}

export default App
