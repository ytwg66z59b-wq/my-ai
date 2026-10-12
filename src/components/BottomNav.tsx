import type { ScreenId } from '../types/models'
import { useGame } from '../state/GameContext'
import './BottomNav.css'

const ITEMS: { id: ScreenId; label: string; glyph: string }[] = [
  { id: 'home', label: 'ホーム', glyph: '⌂' },
  { id: 'nursery', label: '育成', glyph: '◎' },
  { id: 'encyclopedia', label: '図鑑', glyph: '▤' },
  { id: 'calendar', label: '記録', glyph: '▦' },
  { id: 'backup', label: '設定', glyph: '⚙' },
]

export function BottomNav() {
  const { screen, setScreen } = useGame()
  const active = screen === 'detail' ? 'nursery' : screen

  return (
    <nav className="bottom-nav" aria-label="メインナビ">
      {ITEMS.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`nav-item${active === item.id ? ' is-active' : ''}`}
          onClick={() => setScreen(item.id)}
          aria-current={active === item.id ? 'page' : undefined}
        >
          <span className="nav-icon" aria-hidden="true">
            {item.glyph}
          </span>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  )
}
