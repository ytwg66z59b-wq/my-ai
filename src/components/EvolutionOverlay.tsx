import { getForm } from '../data/species'
import { useGame } from '../state/GameContext'
import { CreatureSprite } from './CreatureSprite'
import { RARITY_LABELS, STAGE_LABELS } from '../types/models'
import './EvolutionOverlay.css'

export function EvolutionOverlay() {
  const { evolutionEvent, dismissEvolution, state } = useGame()
  if (!evolutionEvent || !evolutionEvent.toFormId) return null

  const toForm = getForm(evolutionEvent.toFormId)
  const creature = state.creatures.find((c) => c.id === evolutionEvent.creatureId)
  const colorId = creature?.colorId ?? toForm?.defaultColorId ?? 'pearl_gold'
  const isHatch = evolutionEvent.kind === 'hatch'

  return (
    <div className="evo-overlay" role="dialog" aria-modal="true" aria-label="進化演出">
      <div className="evo-stage">
        <div className="evo-flash" />
        <div className="evo-silhouette-wrap">
          <CreatureSprite formId={evolutionEvent.toFormId} colorId={colorId} size="xl" />
        </div>
        <p className="evo-label">{isHatch ? '孵化！' : '進化！'}</p>
        <h2 className="evo-name">{toForm?.name ?? '？？？'}</h2>
        {toForm && (
          <p className="evo-meta">
            {STAGE_LABELS[toForm.stage]} · {RARITY_LABELS[toForm.rarity]}
          </p>
        )}
        <p className="evo-message">{evolutionEvent.message}</p>
        <button type="button" className="btn btn-primary" onClick={dismissEvolution}>
          つづける
        </button>
      </div>
    </div>
  )
}
