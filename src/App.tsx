import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { KOKORO_WORDS, shuffleWords, type KokoroWord } from './words'
import './App.css'

type Phase = 'idle' | 'impact' | 'show' | 'done'

function App() {
  const [deck, setDeck] = useState<KokoroWord[]>(() => shuffleWords(KOKORO_WORDS))
  const [index, setIndex] = useState(-1)
  const [phase, setPhase] = useState<Phase>('idle')
  const [animKey, setAnimKey] = useState(0)
  const timers = useRef<number[]>([])

  const current = index >= 0 ? deck[index] : null
  const remaining = deck.length - Math.max(0, index + 1)

  useEffect(() => {
    return () => {
      for (const id of timers.current) window.clearTimeout(id)
    }
  }, [])

  function clearTimers() {
    for (const id of timers.current) window.clearTimeout(id)
    timers.current = []
  }

  function schedule(fn: () => void, ms: number) {
    const id = window.setTimeout(fn, ms)
    timers.current.push(id)
  }

  function revealNext() {
    if (phase === 'impact') return

    if (phase === 'done' || (phase === 'show' && remaining <= 0)) {
      clearTimers()
      setDeck(shuffleWords(KOKORO_WORDS))
      setIndex(-1)
      setPhase('idle')
      setAnimKey((k) => k + 1)
      return
    }

    const nextIndex = index + 1
    if (nextIndex >= deck.length) return

    clearTimers()
    setIndex(nextIndex)
    setPhase('impact')
    setAnimKey((k) => k + 1)

    schedule(() => {
      setPhase('show')
      if (nextIndex >= deck.length - 1) {
        schedule(() => setPhase('done'), 900)
      }
    }, 420)
  }

  function handleActivate() {
    revealNext()
  }

  function handleKeyDown(e: KeyboardEvent<HTMLElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      revealNext()
    }
  }

  const hint =
    phase === 'idle'
      ? '画面をタップして、こころの言葉を受け取る'
      : phase === 'done'
        ? 'もう一度タップで、はじめから'
        : remaining > 0
          ? 'タップで次の言葉'
          : '余韻を味わって…'

  return (
    <div
      className={`shrine phase-${phase}`}
      role="button"
      tabIndex={0}
      aria-label={hint}
      onClick={handleActivate}
      onKeyDown={handleKeyDown}
    >
      <div className="atmosphere" aria-hidden="true">
        <div className="sky" />
        <div className="mist mist-a" />
        <div className="mist mist-b" />
        <div className="forest" />
        <div className="glow" />
        <svg className="torii" viewBox="0 0 400 220" preserveAspectRatio="xMidYMax meet">
          <path
            className="torii-fill"
            d="M48 72h304v14H48zm28 0V200h22V86h204v114h22V72zm-42-28h332v18H34zm16 10h300v12H50z"
          />
          <path
            className="torii-stroke"
            d="M34 44h332M50 54h300M48 72h304M76 72v128M302 72v128"
            fill="none"
          />
        </svg>
        <div className="ground" />
      </div>

      <header className="brand">
        <p className="brand-mark">心の社</p>
        <p className="brand-sub">七日のこころ</p>
      </header>

      <main className="stage" aria-live="polite">
        {phase === 'idle' && (
          <div key={`idle-${animKey}`} className="idle-panel">
            <div className="shimenawa" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <p className="idle-lead">今日の清らかな言葉を、ひとつずつ。</p>
            <p className="tap-cue">
              <span className="tap-ring" aria-hidden="true" />
              タップ
            </p>
          </div>
        )}

        {phase === 'impact' && (
          <div key={`impact-${animKey}`} className="impact" aria-hidden="true">
            <span className="impact-flash" />
            <span className="impact-word">ドン！</span>
            <span className="impact-ring" />
          </div>
        )}

        {(phase === 'show' || phase === 'done') && current && (
          <article key={`word-${animKey}`} className="word-card">
            <p className="word-reading">{current.reading}</p>
            <h1 className="word-title">{current.title}</h1>
            <p className="word-body">{current.body}</p>
          </article>
        )}
      </main>

      <footer className="chrome">
        <div className="progress" aria-hidden="true">
          {deck.map((word, i) => (
            <span
              key={word.id}
              className={`bead${i <= index && phase !== 'idle' ? ' is-lit' : ''}${
                i === index && (phase === 'show' || phase === 'done') ? ' is-now' : ''
              }`}
            />
          ))}
        </div>
        <p className="hint">{hint}</p>
        {phase !== 'idle' && (
          <p className="count">
            {Math.min(index + 1, deck.length)} / {deck.length}
          </p>
        )}
      </footer>
    </div>
  )
}

export default App
