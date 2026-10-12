import { CreatureSprite } from '../components/CreatureSprite'
import { useGame } from '../state/GameContext'
import { ELEMENT_LABELS, STAGE_LABELS } from '../types/models'
import './NurseryScreen.css'

export function NurseryScreen() {
  const { state, selectCreature, openDetail } = useGame()
  const eggs = state.creatures.filter((c) => c.stage === 'egg')
  const raised = state.creatures.filter((c) => c.stage !== 'egg')

  return (
    <section className="nursery-screen">
      <header className="screen-head">
        <h1>卵・育成一覧</h1>
        <p>タップで詳細、長押しなしで育成切替</p>
      </header>

      <h2 className="section-title">卵（{eggs.length}）</h2>
      <ul className="creature-list">
        {eggs.map((c) => {
          const active = c.id === state.settings.activeCreatureId
          return (
            <li key={c.id} className={`creature-row${active ? ' is-active' : ''}`}>
              <button type="button" className="row-main" onClick={() => openDetail(c.id)}>
                <CreatureSprite formId={c.formId} colorId={c.colorId} size="sm" />
                <div>
                  <p className="row-name">{c.name}</p>
                  <p className="row-sub">
                    {STAGE_LABELS[c.stage]} · 成長 {c.growthPoints}
                  </p>
                </div>
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => selectCreature(c.id)}
                disabled={active}
              >
                {active ? '育成中' : '育成する'}
              </button>
            </li>
          )
        })}
        {eggs.length === 0 && <li className="empty-row">卵はまだありません</li>}
      </ul>

      <h2 className="section-title">キャラクター（{raised.length}）</h2>
      <ul className="creature-list">
        {raised.map((c) => {
          const active = c.id === state.settings.activeCreatureId
          return (
            <li key={c.id} className={`creature-row${active ? ' is-active' : ''}`}>
              <button type="button" className="row-main" onClick={() => openDetail(c.id)}>
                <CreatureSprite formId={c.formId} colorId={c.colorId} size="sm" />
                <div>
                  <p className="row-name">{c.name}</p>
                  <p className="row-sub">
                    {STAGE_LABELS[c.stage]} · {ELEMENT_LABELS[c.element]}
                  </p>
                </div>
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => selectCreature(c.id)}
                disabled={active}
              >
                {active ? '育成中' : '育成する'}
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
