import { getForm, requireForm } from '../data/species'
import { CreatureSprite } from '../components/CreatureSprite'
import { useGame } from '../state/GameContext'
import {
  ELEMENT_LABELS,
  RARITY_LABELS,
  STAGE_LABELS,
} from '../types/models'
import './CreatureDetailScreen.css'

export function CreatureDetailScreen() {
  const { state, detailCreatureId, setScreen, selectCreature } = useGame()
  const creature = state.creatures.find((c) => c.id === detailCreatureId)

  if (!creature) {
    return (
      <section className="detail-screen">
        <p>個体が見つかりません</p>
        <button type="button" className="btn btn-primary" onClick={() => setScreen('nursery')}>
          一覧へ戻る
        </button>
      </section>
    )
  }

  const form = requireForm(creature.formId)
  const candidates = form.evolveTo
    .map((c) => getForm(c.formId))
    .filter(Boolean)
  const line = form.lines[0] ?? '……'

  return (
    <section className="detail-screen">
      <button type="button" className="back-link" onClick={() => setScreen('nursery')}>
        ← 一覧へ
      </button>

      <div className="detail-hero">
        <CreatureSprite formId={creature.formId} colorId={creature.colorId} size="xl" />
        <h1>{creature.name}</h1>
        <p className="detail-sub">
          {STAGE_LABELS[creature.stage]} · {ELEMENT_LABELS[creature.element]} ·{' '}
          {RARITY_LABELS[creature.rarity]}
        </p>
        <p className="detail-line">「{line}」</p>
      </div>

      <dl className="detail-dl">
        <div>
          <dt>種族系統</dt>
          <dd>{creature.speciesLineId}</dd>
        </div>
        <div>
          <dt>成長ポイント</dt>
          <dd>
            {creature.growthPoints}
            {creature.stage !== 'apex' ? `（判定開始 ${creature.evolutionThreshold}）` : ''}
          </dd>
        </div>
        <div>
          <dt>発見日時</dt>
          <dd>{new Date(creature.discoveredAt).toLocaleString('ja-JP')}</dd>
        </div>
      </dl>

      <h2>進化の履歴</h2>
      {creature.evolutionHistory.length === 0 ? (
        <p className="muted">まだ進化していません</p>
      ) : (
        <ol className="evo-history">
          {creature.evolutionHistory.map((ev, i) => (
            <li key={`${ev.at}-${i}`}>
              <span>{ev.fromName}</span>
              <span aria-hidden="true"> → </span>
              <span>{ev.toName}</span>
              <time dateTime={ev.at}>{new Date(ev.at).toLocaleString('ja-JP')}</time>
            </li>
          ))}
        </ol>
      )}

      <h2>進化先候補</h2>
      {candidates.length === 0 ? (
        <p className="muted">これ以上の進化はありません</p>
      ) : (
        <ul className="candidate-list">
          {candidates.map((f) =>
            f ? (
              <li key={f.id}>
                {f.name}（{STAGE_LABELS[f.stage]}）
              </li>
            ) : null,
          )}
        </ul>
      )}

      <button
        type="button"
        className="btn btn-primary detail-select"
        onClick={() => selectCreature(creature.id)}
        disabled={creature.id === state.settings.activeCreatureId}
      >
        {creature.id === state.settings.activeCreatureId
          ? 'いま育成中'
          : 'この個体を育成する'}
      </button>
    </section>
  )
}
