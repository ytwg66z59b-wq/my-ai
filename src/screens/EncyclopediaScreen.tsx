import { useMemo, useState } from 'react'
import { getAllForms } from '../data/species'
import { CreatureSprite } from '../components/CreatureSprite'
import {
  getCompletionRate,
  isFormDiscovered,
} from '../lib/encyclopedia'
import { useGame } from '../state/GameContext'
import {
  ELEMENT_LABELS,
  RARITY_LABELS,
  STAGE_LABELS,
  type Element,
  type GrowthStage,
  type Rarity,
} from '../types/models'
import './EncyclopediaScreen.css'

type FilterElement = 'all' | Element
type FilterStage = 'all' | GrowthStage
type FilterRarity = 'all' | Rarity

export function EncyclopediaScreen() {
  const { state } = useGame()
  const [element, setElement] = useState<FilterElement>('all')
  const [stage, setStage] = useState<FilterStage>('all')
  const [rarity, setRarity] = useState<FilterRarity>('all')
  const completion = getCompletionRate(state)

  const forms = useMemo(() => {
    return getAllForms()
      .filter((f) => f.stage !== 'egg')
      .filter((f) => (element === 'all' ? true : f.element === element))
      .filter((f) => (stage === 'all' ? true : f.stage === stage))
      .filter((f) => (rarity === 'all' ? true : f.rarity === rarity))
  }, [element, stage, rarity])

  return (
    <section className="ency-screen">
      <header className="screen-head">
        <h1>図鑑</h1>
        <p>
          発見 {completion.discovered} / {completion.total}（{completion.percent}%）
        </p>
      </header>

      <div className="filter-row" role="group" aria-label="属性フィルタ">
        {(['all', 'light', 'star', 'water', 'flame', 'earth', 'nature'] as FilterElement[]).map(
          (el) => (
            <button
              key={el}
              type="button"
              className={`chip${element === el ? ' is-on' : ''}`}
              onClick={() => setElement(el)}
            >
              {el === 'all' ? 'すべて' : ELEMENT_LABELS[el]}
            </button>
          ),
        )}
      </div>
      <div className="filter-row" role="group" aria-label="段階フィルタ">
        {(['all', 'juvenile', 'growth', 'adult', 'apex'] as FilterStage[]).map((st) => (
          <button
            key={st}
            type="button"
            className={`chip${stage === st ? ' is-on' : ''}`}
            onClick={() => setStage(st)}
          >
            {st === 'all' ? '段階' : STAGE_LABELS[st]}
          </button>
        ))}
      </div>
      <div className="filter-row" role="group" aria-label="レアリティフィルタ">
        {(['all', 'normal', 'rare', 'epic', 'legend', 'mythic'] as FilterRarity[]).map((r) => (
          <button
            key={r}
            type="button"
            className={`chip${rarity === r ? ' is-on' : ''}`}
            onClick={() => setRarity(r)}
          >
            {r === 'all' ? 'レア度' : RARITY_LABELS[r]}
          </button>
        ))}
      </div>

      <ul className="ency-grid">
        {forms.map((form) => {
          const found = isFormDiscovered(state, form.id)
          return (
            <li key={form.id} className={`ency-card${found ? '' : ' is-locked'}`}>
              <CreatureSprite
                formId={form.id}
                colorId={form.defaultColorId}
                size="md"
                silhouette={!found}
              />
              <p className="ency-name">{found ? form.name : '？？？'}</p>
              <p className="ency-sub">
                {found
                  ? `${STAGE_LABELS[form.stage]} · ${RARITY_LABELS[form.rarity]}`
                  : '未発見'}
              </p>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
