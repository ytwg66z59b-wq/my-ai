import { useMemo, useRef, useState } from 'react'
import {
  STATUS_META,
  WEEKDAY_LABELS,
  addDays,
  allDayBlocks,
  cloneBlocks,
  createId,
  effectiveBlocks,
  emptyDayPlan,
  formatClock,
  formatDateLabel,
  resolveDayPlan,
  type DayMode,
  type DayPlan,
  type Member,
  type ScheduleBlock,
  type WeekdayTemplate,
} from './availability'
import { ScheduleTimeline } from './ScheduleTimeline'

type Clipboard =
  | { kind: 'block'; block: ScheduleBlock }
  | { kind: 'day'; plan: DayPlan }

type MemberEditorProps = {
  members: Member[]
  activeMemberId: string
  dateKey: string
  nowMin: number
  onSelectMember: (id: string) => void
  onChangeDate: (dateKey: string) => void
  onUpdateDay: (memberId: string, plan: DayPlan) => void
  onSaveTemplate: (memberId: string, weekday: number, template: WeekdayTemplate) => void
}

export function MemberEditor({
  members,
  activeMemberId,
  dateKey,
  nowMin,
  onSelectMember,
  onChangeDate,
  onUpdateDay,
  onSaveTemplate,
}: MemberEditorProps) {
  const member = members.find((m) => m.id === activeMemberId) ?? members[0]
  const plan = useMemo(
    () => (member ? resolveDayPlan(member, dateKey) : emptyDayPlan(dateKey)),
    [member, dateKey],
  )
  const [clipboard, setClipboard] = useState<Clipboard | null>(null)
  const [savedFlash, setSavedFlash] = useState(false)
  const touchStartX = useRef<number | null>(null)

  if (!member) {
    return <p className="empty-note">メンバーを追加してください。</p>
  }

  function flashSaved() {
    setSavedFlash(true)
    window.setTimeout(() => setSavedFlash(false), 900)
  }

  function commit(next: DayPlan) {
    onUpdateDay(member.id, { ...next, dateKey })
    flashSaved()
  }

  function setMode(mode: DayMode) {
    if (mode === 'off') {
      commit({ dateKey, mode, blocks: [] })
      return
    }
    if (mode === 'all-day') {
      commit({ dateKey, mode, blocks: allDayBlocks() })
      return
    }
    const blocks =
      plan.blocks.length > 0
        ? plan.blocks
        : [
            {
              id: createId('block'),
              startMin: 10 * 60,
              endMin: 12 * 60,
              status: 'immediate' as const,
            },
          ]
    commit({ dateKey, mode: 'timed', blocks })
  }

  function pasteToDate(targetKey: string) {
    if (!clipboard) return
    if (clipboard.kind === 'block') {
      const current = resolveDayPlan(member, targetKey)
      const blocks = [
        ...effectiveBlocks(current).filter((b) => b.id !== 'all-day'),
        { ...clipboard.block, id: createId('block') },
      ]
      onUpdateDay(member.id, { dateKey: targetKey, mode: 'timed', blocks })
    } else {
      onUpdateDay(member.id, {
        dateKey: targetKey,
        mode: clipboard.plan.mode,
        blocks: cloneBlocks(clipboard.plan.blocks),
      })
    }
    flashSaved()
  }

  function copyDayToWeek() {
    const source = resolveDayPlan(member, dateKey)
    for (let i = 0; i < 7; i += 1) {
      const target = addDays(dateKey, i)
      if (target === dateKey) continue
      onUpdateDay(member.id, {
        dateKey: target,
        mode: source.mode,
        blocks: cloneBlocks(source.blocks),
      })
    }
    flashSaved()
  }

  const weekday = new Date(
    Number(dateKey.slice(0, 4)),
    Number(dateKey.slice(5, 7)) - 1,
    Number(dateKey.slice(8, 10)),
  ).getDay()

  return (
    <section className="member-editor-screen">
      <div className="section-head">
        <h2>自分の空き時間</h2>
        <p>タップ・ドラッグ・長押しで直感的に編集。変更は自動保存されます。</p>
      </div>

      <label className="field">
        <span>メンバー</span>
        <select
          value={member.id}
          onChange={(e) => onSelectMember(e.target.value)}
        >
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </label>

      <div
        className="date-swiper"
        onTouchStart={(e) => {
          touchStartX.current = e.changedTouches[0]?.clientX ?? null
        }}
        onTouchEnd={(e) => {
          const start = touchStartX.current
          const end = e.changedTouches[0]?.clientX
          touchStartX.current = null
          if (start == null || end == null) return
          const delta = end - start
          if (Math.abs(delta) < 48) return
          onChangeDate(addDays(dateKey, delta < 0 ? 1 : -1))
        }}
      >
        <button
          type="button"
          className="ghost-btn"
          onClick={() => onChangeDate(addDays(dateKey, -1))}
          aria-label="前日"
        >
          ‹
        </button>
        <div className="date-label">
          <strong>{formatDateLabel(dateKey)}</strong>
          <span>スワイプで日付変更</span>
        </div>
        <button
          type="button"
          className="ghost-btn"
          onClick={() => onChangeDate(addDays(dateKey, 1))}
          aria-label="翌日"
        >
          ›
        </button>
      </div>

      <div className="mode-grid" role="group" aria-label="今日の対応可能状況">
        <button
          type="button"
          className={`mode-btn all ${plan.mode === 'all-day' ? 'active' : ''}`}
          onClick={() => setMode('all-day')}
        >
          <span>🟢</span>
          終日OK
        </button>
        <button
          type="button"
          className={`mode-btn off ${plan.mode === 'off' ? 'active' : ''}`}
          onClick={() => setMode('off')}
        >
          <span>⚪</span>
          休日
        </button>
        <button
          type="button"
          className={`mode-btn timed ${plan.mode === 'timed' ? 'active' : ''}`}
          onClick={() => setMode('timed')}
        >
          <span>🕐</span>
          時間指定
        </button>
      </div>

      {plan.mode === 'off' && (
        <p className="mode-note">この日は対応不可として共有されます。</p>
      )}

      {plan.mode === 'all-day' && (
        <p className="mode-note">
          終日 {STATUS_META.immediate.emoji} 即レスOK で共有中。時間指定に切り替えると細かく編集できます。
        </p>
      )}

      {plan.mode === 'timed' && (
        <>
          <div className="block-list">
            {plan.blocks.length === 0 && (
              <p className="mode-note">下のタイムラインをタップして空き時間を追加してください。</p>
            )}
            {plan.blocks
              .slice()
              .sort((a, b) => a.startMin - b.startMin)
              .map((b) => (
                <div key={b.id} className={`chip status-${b.status}`}>
                  {STATUS_META[b.status].emoji} {formatClock(b.startMin)}–
                  {formatClock(b.endMin)}
                </div>
              ))}
          </div>

          <ScheduleTimeline
            blocks={plan.blocks}
            nowMin={nowMin}
            editable
            onChange={(blocks) => commit({ dateKey, mode: 'timed', blocks })}
            onCopyBlock={(block) =>
              setClipboard({ kind: 'block', block: { ...block } })
            }
          />

          <button
            type="button"
            className="primary-btn full"
            onClick={() => {
              const start = 9 * 60
              const blocks = [
                ...plan.blocks,
                {
                  id: createId('block'),
                  startMin: start,
                  endMin: start + 60,
                  status: 'immediate' as const,
                },
              ]
              commit({ dateKey, mode: 'timed', blocks })
            }}
          >
            ＋ 対応可能時間を追加
          </button>
        </>
      )}

      <div className="copy-tools">
        <button
          type="button"
          className="ghost-btn"
          onClick={() => setClipboard({ kind: 'day', plan: { ...plan } })}
        >
          📋 今日の予定をコピー
        </button>
        <button
          type="button"
          className="ghost-btn"
          disabled={!clipboard}
          onClick={() => pasteToDate(addDays(dateKey, 1))}
        >
          明日に貼り付け
        </button>
        <button type="button" className="ghost-btn" onClick={copyDayToWeek}>
          今週の他の日にもコピー
        </button>
        <button
          type="button"
          className="ghost-btn"
          onClick={() => {
            onSaveTemplate(member.id, weekday, {
              mode: plan.mode,
              blocks: plan.blocks.map(({ startMin, endMin, status }) => ({
                startMin,
                endMin,
                status,
              })),
            })
            flashSaved()
          }}
        >
          {WEEKDAY_LABELS[weekday]}曜テンプレに保存
        </button>
      </div>

      <p className={`autosave ${savedFlash ? 'flash' : ''}`}>
        {savedFlash ? '✓ 自動保存しました' : '変更は自動保存されます'}
      </p>
    </section>
  )
}
