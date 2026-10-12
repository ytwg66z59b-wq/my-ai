import { BottomNav } from './components/BottomNav'
import { EvolutionOverlay } from './components/EvolutionOverlay'
import { QuoteModal } from './components/QuoteModal'
import { BackupScreen } from './screens/BackupScreen'
import { CalendarScreen } from './screens/CalendarScreen'
import { CreatureDetailScreen } from './screens/CreatureDetailScreen'
import { EncyclopediaScreen } from './screens/EncyclopediaScreen'
import { HomeScreen } from './screens/HomeScreen'
import { NurseryScreen } from './screens/NurseryScreen'
import { GameProvider, useGame } from './state/GameContext'
import './App.css'

function Shell() {
  const { ready, screen, toast, error, clearError } = useGame()

  if (!ready) {
    return (
      <div className="boot-screen">
        <p className="brand-mark">DRAGON DAYS</p>
        <p>読み込み中…</p>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <main className="app-main">
        {screen === 'home' && <HomeScreen />}
        {screen === 'nursery' && <NurseryScreen />}
        {screen === 'encyclopedia' && <EncyclopediaScreen />}
        {screen === 'calendar' && <CalendarScreen />}
        {screen === 'detail' && <CreatureDetailScreen />}
        {screen === 'backup' && <BackupScreen />}
      </main>
      <BottomNav />
      <QuoteModal />
      <EvolutionOverlay />
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
      {error && (
        <div className="error-banner" role="alert">
          <span>{error}</span>
          <button type="button" onClick={clearError}>
            閉じる
          </button>
        </div>
      )}
    </div>
  )
}

export default function App() {
  return (
    <GameProvider>
      <Shell />
    </GameProvider>
  )
}
