import { requireForm } from '../data/species'
import { CreatureSprite } from '../components/CreatureSprite'
import { useGame } from '../state/GameContext'
import { ELEMENT_LABELS, STAGE_LABELS } from '../types/models'
import './HomeScreen.css'

export function HomeScreen() {
  const { state, todayCount, effortTap, reactionKey, lastEvents, openDetail } = useGame()
  const active = state.creatures.find((c) => c.id === state.settings.activeCreatureId)
  const form = active ? requireForm(active.formId) : null
  const progressMax = form?.evolveForceAt ?? 100
  const progress = active ? Math.min(active.growthPoints, progressMax) : 0
  const reaction =
    lastEvents.find((e) => e.kind === 'reaction')?.message ??
    (active?.stage === 'egg' ? '卵が待っている…' : 'タップして記録')

  return (
    <section className="home-screen">
      <header className="home-brand">
        <p className="brand-mark">DRAGON DAYS</p>
        <h1 className="visually-hidden">DRAGON DAYS — ホーム</h1>
      </header>

      <div className="home-hero-plane" aria-hidden="true">
        <div className="sky-layer" />
        <div className="hill-layer" />
      </div>

      <div className="home-panel">
        <p className="stat-label">今日の頑張り</p>
        <p className="stat-today" key={todayCount}>
          <span className="stat-num">{todayCount}</span>
          <span className="stat-unit">回</span>
        </p>
        <p className="stat-total">累計 {state.statistics.totalCount} 回</p>
      </div>

      {active && form ? (
        <button
          type="button"
          className="creature-stage"
          onClick={() => openDetail(active.id)}
          aria-label={`${active.name}の詳細`}
        >
          <CreatureSprite
            key={reactionKey}
            formId={active.formId}
            colorId={active.colorId}
            size="xl"
            reacting={reactionKey > 0}
          />
          <div className="creature-meta">
            <p className="creature-name">{active.name}</p>
            <p className="creature-sub">
              {STAGE_LABELS[active.stage]} · {ELEMENT_LABELS[active.element]}
            </p>
            {active.stage !== 'apex' ? (
              <div className="growth-bar" aria-label="成長ポイント">
                <div
                  className="growth-fill"
                  style={{ width: `${(progress / progressMax) * 100}%` }}
                />
                <span className="growth-text">
                  成長 {active.growthPoints} / {progressMax}
                </span>
              </div>
            ) : (
              <p className="growth-done">上位種到達</p>
            )}
          </div>
        </button>
      ) : (
        <p className="empty-active">育成中の個体がありません</p>
      )}

      <p className="reaction-line" key={`r-${reactionKey}`} aria-live="polite">
        {reaction}
      </p>

      <button type="button" className="effort-btn" onClick={effortTap}>
        <span className="effort-plus">＋</span>
        頑張った！
      </button>
      <p className="effort-hint">タップして記録</p>
    </section>
  )
}
