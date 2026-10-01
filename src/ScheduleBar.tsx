import { useEffect, useRef } from 'react'
import {
  DAY_MINUTES,
  SLOT_MINUTES,
  STATUS_META,
  formatClock,
  nextStatus,
  resizeBlock,
  type ReplyStatus,
  type ScheduleBlock,
} from './availability'

const VIEW_START = 8 * 60
const VIEW_END = 24 * 60
const VIEW_SPAN = VIEW_END - VIEW_START

type ScheduleBarProps = {
  blocks: ScheduleBlock[]
  nowMin: number
  onChange: (blocks: ScheduleBlock[]) => void
}

function pct(minute: number): number {
  return ((minute - VIEW_START) / VIEW_SPAN) * 100
}

function minuteFromClientX(clientX: number, rect: DOMRect): number {
  const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
  return VIEW_START + ratio * VIEW_SPAN
}

export function ScheduleBar({ blocks, nowMin, onChange }: ScheduleBarProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const blocksRef = useRef(blocks)
  const onChangeRef = useRef(onChange)
  const dragRef = useRef<{
    blockId: string
    edge: 'start' | 'end'
  } | null>(null)

  useEffect(() => {
    blocksRef.current = blocks
    onChangeRef.current = onChange
  }, [blocks, onChange])

  useEffect(() => {
    function onMove(event: PointerEvent) {
      const drag = dragRef.current
      const track = trackRef.current
      if (!drag || !track) return
      event.preventDefault()
      const rect = track.getBoundingClientRect()
      const nextMin = minuteFromClientX(event.clientX, rect)
      onChangeRef.current(
        blocksRef.current.map((block) =>
          block.id === drag.blockId
            ? resizeBlock(block, drag.edge, nextMin)
            : block,
        ),
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

  function startDrag(
    event: React.PointerEvent,
    blockId: string,
    edge: 'start' | 'end',
  ) {
    event.preventDefault()
    event.stopPropagation()
    dragRef.current = { blockId, edge }
  }

  function cycleStatus(blockId: string) {
    onChange(
      blocks.map((block) =>
        block.id === blockId
          ? { ...block, status: nextStatus(block.status) }
          : block,
      ),
    )
  }

  function addBlockAt(event: React.PointerEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest('[data-block]')) return
    const track = trackRef.current
    if (!track) return
    const rect = track.getBoundingClientRect()
    const tapped = minuteFromClientX(event.clientX, rect)
    const startMin = Math.min(
      VIEW_END - SLOT_MINUTES * 4,
      Math.max(VIEW_START, Math.round(tapped / SLOT_MINUTES) * SLOT_MINUTES),
    )
    const endMin = Math.min(VIEW_END, startMin + SLOT_MINUTES * 4)
    const status: ReplyStatus = 'immediate'
    onChange([
      ...blocks,
      {
        id: `block-${crypto.randomUUID()}`,
        startMin,
        endMin,
        status,
      },
    ])
  }

  const hours: number[] = []
  for (let h = VIEW_START / 60; h <= VIEW_END / 60; h += 2) {
    hours.push(h)
  }

  const nowVisible = nowMin >= VIEW_START && nowMin <= VIEW_END

  return (
    <div className="schedule">
      <div className="schedule-legend">
        <span>8:00</span>
        <span>指で端を伸ばす · バーをタップで状態変更 · 空きをタップで追加</span>
        <span>24:00</span>
      </div>
      <div
        className="schedule-track"
        ref={trackRef}
        onPointerDown={addBlockAt}
        role="presentation"
      >
        <div className="schedule-grid">
          {hours.map((h) => (
            <span
              key={h}
              className="schedule-tick"
              style={{ left: `${pct(h * 60)}%` }}
            >
              {String(h).padStart(2, '0')}
            </span>
          ))}
        </div>

        {nowVisible && (
          <div
            className="schedule-now"
            style={{ left: `${pct(nowMin)}%` }}
            aria-hidden
          />
        )}

        {blocks
          .filter((b) => b.endMin > VIEW_START && b.startMin < VIEW_END)
          .map((block) => {
            const left = Math.max(0, pct(block.startMin))
            const right = Math.min(100, pct(block.endMin))
            const width = Math.max(right - left, 1.2)
            const meta = STATUS_META[block.status]
            return (
              <button
                key={block.id}
                type="button"
                data-block
                className={`schedule-block status-${block.status}`}
                style={{ left: `${left}%`, width: `${width}%` }}
                onClick={(e) => {
                  e.stopPropagation()
                  cycleStatus(block.id)
                }}
                aria-label={`${meta.emoji} ${formatClock(block.startMin)}–${formatClock(block.endMin)} ${meta.short}`}
              >
                <span
                  className="schedule-handle start"
                  onPointerDown={(e) => startDrag(e, block.id, 'start')}
                />
                <span className="schedule-block-label">
                  {meta.emoji} {formatClock(block.startMin)}
                </span>
                <span
                  className="schedule-handle end"
                  onPointerDown={(e) => startDrag(e, block.id, 'end')}
                />
              </button>
            )
          })}
      </div>
      <p className="schedule-hint">
        1マス = {SLOT_MINUTES}分 / 全{DAY_MINUTES / SLOT_MINUTES}スロット中、表示は8:00–24:00
      </p>
    </div>
  )
}
