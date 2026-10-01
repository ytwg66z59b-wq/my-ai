import { useEffect, useRef, useState } from 'react'
import {
  DAY_MINUTES,
  SLOT_MINUTES,
  STATUS_META,
  VIEW_END,
  VIEW_START,
  createId,
  formatClock,
  moveBlock,
  punchGap,
  resizeBlock,
  type ReplyStatus,
  type ScheduleBlock,
} from './availability'

const VIEW_SPAN = VIEW_END - VIEW_START

type MenuState = {
  blockId: string
  x: number
  y: number
} | null

type ScheduleTimelineProps = {
  blocks: ScheduleBlock[]
  nowMin: number
  editable?: boolean
  showNowLine?: boolean
  compact?: boolean
  onChange?: (blocks: ScheduleBlock[]) => void
  onCopyBlock?: (block: ScheduleBlock) => void
}

function pct(minute: number): number {
  return ((minute - VIEW_START) / VIEW_SPAN) * 100
}

function minuteFromClientX(clientX: number, rect: DOMRect): number {
  const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
  return VIEW_START + ratio * VIEW_SPAN
}

export function ScheduleTimeline({
  blocks,
  nowMin,
  editable = false,
  showNowLine = true,
  compact = false,
  onChange,
  onCopyBlock,
}: ScheduleTimelineProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const blocksRef = useRef(blocks)
  const onChangeRef = useRef(onChange)
  const dragRef = useRef<{
    blockId: string
    mode: 'start' | 'end' | 'move'
    originX: number
    originStart: number
    originEnd: number
  } | null>(null)
  const longPressRef = useRef<number | null>(null)
  const [menu, setMenu] = useState<MenuState>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    blocksRef.current = blocks
    onChangeRef.current = onChange
  }, [blocks, onChange])

  useEffect(() => {
    function onMove(event: PointerEvent) {
      const drag = dragRef.current
      const track = trackRef.current
      if (!drag || !track || !onChangeRef.current) return
      event.preventDefault()
      const rect = track.getBoundingClientRect()
      const nextMin = minuteFromClientX(event.clientX, rect)

      onChangeRef.current(
        blocksRef.current.map((block) => {
          if (block.id !== drag.blockId) return block
          if (drag.mode === 'start') return resizeBlock(block, 'start', nextMin)
          if (drag.mode === 'end') return resizeBlock(block, 'end', nextMin)
          const originMin = minuteFromClientX(drag.originX, rect)
          const delta = nextMin - originMin
          return moveBlock(
            {
              ...block,
              startMin: drag.originStart,
              endMin: drag.originEnd,
            },
            delta,
          )
        }),
      )
    }

    function onUp() {
      dragRef.current = null
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [])

  useEffect(() => {
    if (!menu) return
    function close(event: PointerEvent) {
      const target = event.target as HTMLElement
      if (target.closest('.block-menu')) return
      setMenu(null)
    }
    window.addEventListener('pointerdown', close)
    return () => window.removeEventListener('pointerdown', close)
  }, [menu])

  function clearLongPress() {
    if (longPressRef.current) {
      window.clearTimeout(longPressRef.current)
      longPressRef.current = null
    }
  }

  function startDrag(
    event: React.PointerEvent,
    blockId: string,
    mode: 'start' | 'end' | 'move',
  ) {
    if (!editable) return
    event.preventDefault()
    event.stopPropagation()
    clearLongPress()
    const block = blocks.find((b) => b.id === blockId)
    if (!block) return
    setSelectedId(blockId)
    dragRef.current = {
      blockId,
      mode,
      originX: event.clientX,
      originStart: block.startMin,
      originEnd: block.endMin,
    }
  }

  function openMenu(blockId: string, clientX: number, clientY: number) {
    setSelectedId(blockId)
    setMenu({ blockId, x: clientX, y: clientY })
  }

  function updateBlock(
    blockId: string,
    updater: (block: ScheduleBlock) => ScheduleBlock | ScheduleBlock[] | null,
  ) {
    if (!onChange) return
    const next: ScheduleBlock[] = []
    for (const block of blocks) {
      if (block.id !== blockId) {
        next.push(block)
        continue
      }
      const result = updater(block)
      if (result === null) continue
      if (Array.isArray(result)) next.push(...result)
      else next.push(result)
    }
    onChange(next)
  }

  function addBlockAt(event: React.PointerEvent<HTMLDivElement>) {
    if (!editable || !onChange) return
    if ((event.target as HTMLElement).closest('[data-block]')) return
    setMenu(null)
    const track = trackRef.current
    if (!track) return
    const rect = track.getBoundingClientRect()
    const tapped = minuteFromClientX(event.clientX, rect)
    const startMin = Math.min(
      VIEW_END - SLOT_MINUTES * 4,
      Math.max(VIEW_START, Math.round(tapped / SLOT_MINUTES) * SLOT_MINUTES),
    )
    const endMin = Math.min(VIEW_END, startMin + SLOT_MINUTES * 4)
    const created: ScheduleBlock = {
      id: createId('block'),
      startMin,
      endMin,
      status: 'immediate',
    }
    onChange([...blocks, created])
    setSelectedId(created.id)
  }

  const hours: number[] = []
  for (let h = VIEW_START / 60; h <= VIEW_END / 60; h += compact ? 4 : 2) {
    hours.push(h)
  }
  const nowVisible = nowMin >= VIEW_START && nowMin <= VIEW_END
  const menuBlock = menu ? blocks.find((b) => b.id === menu.blockId) : null

  return (
    <div className={`timeline ${compact ? 'compact' : ''} ${editable ? 'editable' : ''}`}>
      {!compact && editable && (
        <div className="timeline-legend">
          <span>8:00</span>
          <span>端＝時間変更 · 中央＝移動 · 長押し＝メニュー · 空きタップ＝追加</span>
          <span>24:00</span>
        </div>
      )}
      <div
        className="timeline-track"
        ref={trackRef}
        onPointerDown={editable ? addBlockAt : undefined}
        role="presentation"
      >
        <div className="timeline-grid">
          {hours.map((h) => (
            <span
              key={h}
              className="timeline-tick"
              style={{ left: `${pct(h * 60)}%` }}
            >
              {String(h).padStart(2, '0')}
            </span>
          ))}
        </div>

        {showNowLine && nowVisible && (
          <div
            className="timeline-now"
            style={{ left: `${pct(nowMin)}%` }}
            title={`現在 ${formatClock(nowMin)}`}
          >
            {!compact && (
              <span className="timeline-now-label">{formatClock(nowMin)}</span>
            )}
          </div>
        )}

        {blocks
          .filter((b) => b.endMin > VIEW_START && b.startMin < VIEW_END)
          .map((block) => {
            const left = Math.max(0, pct(block.startMin))
            const right = Math.min(100, pct(block.endMin))
            const width = Math.max(right - left, compact ? 0.8 : 1.2)
            const meta = STATUS_META[block.status]
            const selected = selectedId === block.id
            return (
              <div
                key={block.id}
                data-block
                className={`timeline-block status-${block.status} ${selected ? 'selected' : ''}`}
                style={{ left: `${left}%`, width: `${width}%` }}
                onPointerDown={(e) => {
                  if (!editable) return
                  e.stopPropagation()
                  setSelectedId(block.id)
                  longPressRef.current = window.setTimeout(() => {
                    openMenu(block.id, e.clientX, e.clientY)
                  }, 480)
                }}
                onPointerUp={clearLongPress}
                onPointerLeave={clearLongPress}
                onPointerMove={(e) => {
                  if (Math.abs(e.movementX) + Math.abs(e.movementY) > 6) {
                    clearLongPress()
                  }
                }}
                onDoubleClick={(e) => {
                  if (!editable) return
                  e.stopPropagation()
                  openMenu(block.id, e.clientX, e.clientY)
                }}
                role="button"
                tabIndex={0}
                aria-label={`${meta.emoji} ${formatClock(block.startMin)}–${formatClock(block.endMin)} ${meta.short}`}
              >
                {editable && (
                  <span
                    className="timeline-handle start"
                    onPointerDown={(e) => startDrag(e, block.id, 'start')}
                  />
                )}
                <span
                  className="timeline-block-body"
                  onPointerDown={(e) => {
                    if (!editable) return
                    startDrag(e, block.id, 'move')
                  }}
                >
                  {!compact && (
                    <span className="timeline-block-label">
                      {meta.emoji} {formatClock(block.startMin)}–
                      {formatClock(block.endMin)}
                    </span>
                  )}
                </span>
                {editable && (
                  <span
                    className="timeline-handle end"
                    onPointerDown={(e) => startDrag(e, block.id, 'end')}
                  />
                )}
              </div>
            )
          })}
      </div>

      {menu && menuBlock && editable && (
        <div
          className="block-menu"
          style={{
            left: Math.min(menu.x, window.innerWidth - 220),
            top: menu.y,
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <p className="block-menu-title">
            {formatClock(menuBlock.startMin)}–{formatClock(menuBlock.endMin)}
          </p>
          <button
            type="button"
            onClick={() => {
              const start = window.prompt(
                '開始時間（例 10:00）',
                formatClock(menuBlock.startMin),
              )
              const end = window.prompt(
                '終了時間（例 12:00）',
                formatClock(menuBlock.endMin),
              )
              if (!start || !end) return
              const parse = (v: string) => {
                const [hh, mm] = v.split(':').map(Number)
                if (Number.isNaN(hh) || Number.isNaN(mm)) return null
                return hh * 60 + mm
              }
              const s = parse(start)
              const e = parse(end)
              if (s === null || e === null || e <= s) return
              updateBlock(menuBlock.id, (b) => ({
                ...b,
                startMin: s,
                endMin: e,
              }))
              setMenu(null)
            }}
          >
            ✏️ 時間を変更
          </button>
          {(['immediate', 'soon', 'unavailable'] as ReplyStatus[]).map(
            (status) => (
              <button
                key={status}
                type="button"
                onClick={() => {
                  updateBlock(menuBlock.id, (b) => ({ ...b, status }))
                  setMenu(null)
                }}
              >
                {STATUS_META[status].emoji} {STATUS_META[status].verb}
              </button>
            ),
          )}
          <button
            type="button"
            onClick={() => {
              updateBlock(menuBlock.id, (b) => {
                if (b.endMin - b.startMin >= 4 * 60) {
                  const mid =
                    Math.round((b.startMin + b.endMin) / 2 / SLOT_MINUTES) *
                    SLOT_MINUTES
                  return punchGap(b, mid - 60, mid + 60)
                }
                const cut =
                  Math.round((b.startMin + b.endMin) / 2 / SLOT_MINUTES) *
                  SLOT_MINUTES
                return [
                  { ...b, id: createId('block'), endMin: cut },
                  { ...b, id: createId('block'), startMin: cut },
                ]
              })
              setMenu(null)
            }}
          >
            ✂ 予定を分割
          </button>
          <button
            type="button"
            onClick={() => {
              onCopyBlock?.(menuBlock)
              setMenu(null)
            }}
          >
            📋 コピー
          </button>
          <button
            type="button"
            className="danger"
            onClick={() => {
              updateBlock(menuBlock.id, () => null)
              setMenu(null)
            }}
          >
            🗑 削除
          </button>
        </div>
      )}

      {!compact && editable && (
        <p className="timeline-hint">
          1マス = {SLOT_MINUTES}分 · 表示 {formatClock(VIEW_START)}–
          {formatClock(VIEW_END)} · 全{DAY_MINUTES / SLOT_MINUTES}スロット
        </p>
      )}
    </div>
  )
}
