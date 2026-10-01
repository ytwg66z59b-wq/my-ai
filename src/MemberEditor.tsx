import { useMemo, useRef, useState } from 'react'
import {
  DAY_MINUTES,
  SLOT_MINUTES,
  STATUS_META,
  WEEKDAY_LABELS,
  addDays,
  allDayBlocks,
  cloneBlocks,
  createId,
  effectiveBlocks,
  formatClock,
  formatDateLabel,
  resolveDayPlan,
  type DayMode,
  type DayPlan,
  type Member,
  type ReplyStatus,
  type ScheduleBlock,
  type WeekdayTemplate,
} from './availability'
import { ScheduleTimeline } from './ScheduleTimeline'

type Clipboard =
  | { kind: 'block'; block: ScheduleBlock }
  | { kind: 'day'; plan: DayPlan }

type MemberEditorProps = {
  member: Member
  dateKey: string
  nowMin: number
  onChangeDate: (dateKey: string) => void
  onUpdateDay: (memberId: string, plan: DayPlan) => void
  onSaveTemplate: (memberId: string, weekday: number, template: WeekdayTemplate) => void
}

function nudgeTime(
  block: ScheduleBlock,
  edge: 'start' | 'end',
  delta: number,
): ScheduleBlock {
  if (edge === 'start') {
    const startMin = Math.max(
      0,
      Math.min(block.startMin + delta, block.endMin - SLOT_MINUTES),
    )
    return { ...block, startMin }
  }
  const endMin = Math.min(
    DAY_MINUTES,
    Math.max(block.endMin + delta, block.startMin + SLOT_MINUTES),
  )
  return { ...block, endMin }
}

export function MemberEditor({
  member,
  dateKey,
  nowMin,
  onChangeDate,
  onUpdateDay,
  onSaveTemplate,
}: MemberEditorProps) {
  const plan = useMemo(
    () => resolveDayPlan(member, dateKey),
    [member, dateKey],
  )
  const [clipboard, setClipboard] = useState<Clipboard | null>(null)
  const [savedFlash, setSavedFlash] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [guideOpen, setGuideOpen] = useState(true)
  const touchStartX = useRef<number | null>(null)

  function flashSaved() {
    setSavedFlash(true)
    window.setTimeout(() => setSavedFlash(false), 900)
  }

  function commit(next: DayPlan) {
    onUpdateDay(member.id, { ...next, dateKey })
    flashSaved()
  }

  function updateBlocks(blocks: ScheduleBlock[]) {
    commit({ dateKey, mode: 'timed', blocks })
  }

  function updateOne(
    blockId: string,
    updater: (block: ScheduleBlock) => ScheduleBlock | null,
  ) {
    const next: ScheduleBlock[] = []
    for (const block of plan.blocks) {
      if (block.id !== blockId) {
        next.push(block)
        continue
      }
      const result = updater(block)
      if (result) next.push(result)
    }
    updateBlocks(next)
  }

  function setMode(mode: DayMode) {
    if (mode === 'off') {
      commit({ dateKey, mode, blocks: [] })
      setSelectedId(null)
      return
    }
    if (mode === 'all-day') {
      commit({ dateKey, mode, blocks: allDayBlocks() })
      setSelectedId(null)
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
    setSelectedId(blocks[0]?.id ?? null)
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

  function addBlock() {
    const last = [...plan.blocks].sort((a, b) => a.endMin - b.endMin).at(-1)
    const startMin = Math.min(
      DAY_MINUTES - 60,
      last ? last.endMin + SLOT_MINUTES : 9 * 60,
    )
    const created: ScheduleBlock = {
      id: createId('block'),
      startMin,
      endMin: Math.min(DAY_MINUTES, startMin + 60),
      status: 'immediate',
    }
    updateBlocks([...plan.blocks, created])
    setSelectedId(created.id)
  }

  const weekday = new Date(
    Number(dateKey.slice(0, 4)),
    Number(dateKey.slice(5, 7)) - 1,
    Number(dateKey.slice(8, 10)),
  ).getDay()

  const sortedBlocks = plan.blocks
    .slice()
    .sort((a, b) => a.startMin - b.startMin)

  return (
    <section className="member-editor-screen">
      <div className="section-head">
        <h2>{member.name} の空き時間</h2>
        <p>自分の予定だけ編集できます。変更は自動保存されます。</p>
      </div>

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
          <div className="howto-card">
            <button
              type="button"
              className="howto-toggle"
              onClick={() => setGuideOpen((v) => !v)}
              aria-expanded={guideOpen}
            >
              <span>初めての方向け：編集のしかた</span>
              <span>{guideOpen ? '閉じる' : '見る'}</span>
            </button>
            {guideOpen && (
              <ol className="howto-steps">
                <li>
                  <strong>① 追加</strong>
                  <span>下の「＋ 対応可能時間を追加」を押すか、タイムラインの空きをタップ</span>
                </li>
                <li>
                  <strong>② 時間を直す</strong>
                  <span>カードの − / ＋ か、バーの左右の端を指で伸ばす</span>
                </li>
                <li>
                  <strong>③ ずらす</strong>
                  <span>バーの中央を左右にドラッグすると、まとめて移動</span>
                </li>
                <li>
                  <strong>④ 状態を変える</strong>
                  <span>カードの 🟢🟡🔴 を押すか、バーを長押ししてメニュー</span>
                </li>
              </ol>
            )}
          </div>

          <div className="block-cards">
            {sortedBlocks.length === 0 && (
              <p className="mode-note">
                まだ時間がありません。「＋ 対応可能時間を追加」から始めましょう。
              </p>
            )}
            {sortedBlocks.map((block, index) => {
              const meta = STATUS_META[block.status]
              const selected = selectedId === block.id
              const hours =
                Math.round(((block.endMin - block.startMin) / 60) * 10) / 10
              return (
                <article
                  key={block.id}
                  className={`block-card status-${block.status} ${selected ? 'selected' : ''}`}
                >
                  <button
                    type="button"
                    className="block-card-main"
                    onClick={() =>
                      setSelectedId((prev) =>
                        prev === block.id ? null : block.id,
                      )
                    }
                  >
                    <span className="block-index">{index + 1}</span>
                    <span className="block-times">
                      <strong>{formatClock(block.startMin)}</strong>
                      <span className="block-tilde">〜</span>
                      <strong>{formatClock(block.endMin)}</strong>
                    </span>
                    <span className="block-meta">
                      {meta.emoji} {meta.short} · {hours}時間
                    </span>
                  </button>

                  {selected && (
                    <div className="block-card-editor">
                      <p className="block-edit-guide">
                        ここでも時間を直せます（15分単位）。バーを触っても同じです。
                      </p>
                      <div className="time-steppers">
                        <div className="stepper">
                          <span>開始</span>
                          <div className="stepper-controls">
                            <button
                              type="button"
                              onClick={() =>
                                updateOne(block.id, (b) =>
                                  nudgeTime(b, 'start', -SLOT_MINUTES),
                                )
                              }
                            >
                              −15
                            </button>
                            <strong>{formatClock(block.startMin)}</strong>
                            <button
                              type="button"
                              onClick={() =>
                                updateOne(block.id, (b) =>
                                  nudgeTime(b, 'start', SLOT_MINUTES),
                                )
                              }
                            >
                              ＋15
                            </button>
                          </div>
                        </div>
                        <div className="stepper">
                          <span>終了</span>
                          <div className="stepper-controls">
                            <button
                              type="button"
                              onClick={() =>
                                updateOne(block.id, (b) =>
                                  nudgeTime(b, 'end', -SLOT_MINUTES),
                                )
                              }
                            >
                              −15
                            </button>
                            <strong>{formatClock(block.endMin)}</strong>
                            <button
                              type="button"
                              onClick={() =>
                                updateOne(block.id, (b) =>
                                  nudgeTime(b, 'end', SLOT_MINUTES),
                                )
                              }
                            >
                              ＋15
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="status-picks" role="group" aria-label="状態">
                        {(
                          ['immediate', 'soon', 'unavailable'] as ReplyStatus[]
                        ).map((status) => (
                          <button
                            key={status}
                            type="button"
                            className={`status-pick ${block.status === status ? 'active' : ''}`}
                            onClick={() =>
                              updateOne(block.id, (b) => ({ ...b, status }))
                            }
                          >
                            {STATUS_META[status].emoji}
                            <span>{STATUS_META[status].short}</span>
                          </button>
                        ))}
                      </div>

                      <div className="block-card-actions">
                        <button
                          type="button"
                          className="ghost-btn"
                          onClick={() =>
                            setClipboard({ kind: 'block', block: { ...block } })
                          }
                        >
                          📋 コピー
                        </button>
                        <button
                          type="button"
                          className="ghost-btn danger"
                          onClick={() => {
                            updateOne(block.id, () => null)
                            setSelectedId(null)
                          }}
                        >
                          🗑 削除
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              )
            })}
          </div>

          <button type="button" className="primary-btn full" onClick={addBlock}>
            ＋ 対応可能時間を追加
          </button>

          <div className="timeline-panel">
            <div className="timeline-panel-head">
              <h3>タイムラインで調整</h3>
              <p>バーの端を伸ばす・中央を動かすと、上の時間も連動します</p>
            </div>
            <ScheduleTimeline
              blocks={plan.blocks}
              nowMin={nowMin}
              editable
              selectedId={selectedId}
              onSelect={setSelectedId}
              onChange={updateBlocks}
              onCopyBlock={(block) =>
                setClipboard({ kind: 'block', block: { ...block } })
              }
            />
          </div>
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
