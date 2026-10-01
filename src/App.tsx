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
import './App.css'

const STORAGE_KEY = 'ima-furu-board-v3'
const LEGACY_KEYS = ['ima-furu-board-v2', 'ima-furu-members-v1']

type Tab = 'admin' | 'member'
type Store = {
  members: Member[]
  currentUserId: string | null
}

function isMemberArray(value: unknown): value is Member[] {
  return (
    Array.isArray(value) &&
    value.every((m) => m && typeof m === 'object' && 'days' in m && 'name' in m)
  )
}

function normalizeMember(m: Member): Member {
  return {
    ...m,
    templates: m.templates?.length === 7 ? m.templates : emptyTemplates(),
    days: m.days ?? {},
  }
}

function loadStore(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Store>
      const members = isMemberArray(parsed.members)
        ? parsed.members.map(normalizeMember)
        : []
      const currentUserId =
        typeof parsed.currentUserId === 'string' &&
        members.some((m) => m.id === parsed.currentUserId)
          ? parsed.currentUserId
          : null
      return { members, currentUserId }
    }
  } catch {
    // ignore
  }

  // Drop legacy demo data so users start clean
  for (const key of LEGACY_KEYS) {
    localStorage.removeItem(key)
  }
  return { members: [], currentUserId: null }
}

function App() {
  const [now, setNow] = useState(() => new Date())
  const [store, setStore] = useState<Store>(() => loadStore())
  const [tab, setTab] = useState<Tab>('member')
  const [dateKey, setDateKey] = useState(() => toDateKey(new Date()))
  const [range, setRange] = useState<RangeMode>('day')
  const [draftName, setDraftName] = useState('')
  const [nameError, setNameError] = useState('')

  const { members, currentUserId } = store
  const me = members.find((m) => m.id === currentUserId) ?? null

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 15_000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  }, [store])

  const nowMin = minutesFromDate(now)

  function createAccount(nameRaw: string) {
    const name = nameRaw.trim()
    if (!name) {
      setNameError('名前を入力してください')
      return
    }
    if (members.some((m) => m.name === name)) {
      setNameError('同じ名前のアカウントが既にあります。下から選んで入ってください')
      return
    }
    const id = createId('member')
    const member: Member = {
      id,
      name,
      days: {},
      templates: emptyTemplates(),
    }
    setStore({
      members: [...members, member],
      currentUserId: id,
    })
    setDraftName('')
    setNameError('')
    setTab('member')
  }

  function loginAs(id: string) {
    if (!members.some((m) => m.id === id)) return
    setStore((prev) => ({ ...prev, currentUserId: id }))
    setTab('member')
  }

  function logout() {
    setStore((prev) => ({ ...prev, currentUserId: null }))
    setDraftName('')
    setNameError('')
  }

  function updateDay(memberId: string, plan: DayPlan) {
    if (!currentUserId || memberId !== currentUserId) return
    setStore((prev) => ({
      ...prev,
      members: prev.members.map((m) =>
        m.id === memberId
          ? { ...m, days: { ...m.days, [plan.dateKey]: plan } }
          : m,
      ),
    }))
  }

  function saveTemplate(
    memberId: string,
    weekday: number,
    template: WeekdayTemplate,
  ) {
    if (!currentUserId || memberId !== currentUserId) return
    setStore((prev) => ({
      ...prev,
      members: prev.members.map((m) => {
        if (m.id !== memberId) return m
        const templates = [...m.templates]
        templates[weekday] = template
        return { ...m, templates }
      }),
    }))
  }

  // Not logged in → account gate
  if (!me) {
    return (
      <div className="app">
        <div className="atmosphere" aria-hidden />
        <section className="auth-gate">
          <p className="brand">いま振る</p>
          <h1 className="tagline">自分の名前で始める</h1>
          <p className="lede">
            名前を登録すると、自分の空き時間だけを入力できます。他人のシフトは触れません。
          </p>

          <form
            className="auth-form"
            onSubmit={(e) => {
              e.preventDefault()
              createAccount(draftName)
            }}
          >
            <label htmlFor="account-name">あなたの名前</label>
            <input
              id="account-name"
              value={draftName}
              onChange={(e) => {
                setDraftName(e.target.value)
                setNameError('')
              }}
              placeholder="例: 山田"
              autoComplete="nickname"
              autoFocus
            />
            {nameError && <p className="field-error">{nameError}</p>}
            <button type="submit" className="primary-btn full">
              アカウントを作って始める
            </button>
          </form>

          {members.length > 0 && (
            <div className="existing-accounts">
              <h2>登録済みアカウントで入る</h2>
              <p>自分の名前だけ選んでください。他人のアカウントでは編集しないでください。</p>
              <ul>
                {members.map((m) => (
                  <li key={m.id}>
                    <button type="button" onClick={() => loginAs(m.id)}>
                      {m.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
        <footer className="footer">
          <p>シフト記録ではなく、振り先判断のためのボード</p>
        </footer>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="atmosphere" aria-hidden />

      <div className="session-bar">
        <span>
          <strong>{me.name}</strong> として入力中
        </span>
        <button type="button" className="ghost-btn" onClick={logout}>
          アカウント切替
        </button>
      </div>

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
          自分のシフト
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
          member={me}
          dateKey={dateKey}
          nowMin={nowMin}
          onChangeDate={setDateKey}
          onUpdateDay={updateDay}
          onSaveTemplate={saveTemplate}
        />
      )}

      <footer className="footer">
        <p>自分の空き時間だけ編集できます。他人のシフトは変更できません。</p>
      </footer>
    </div>
  )
}

export default App
