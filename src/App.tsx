import { useEffect, useId, useRef, useState } from 'react'
import { countChars, splitText } from './splitText'
import './App.css'

const PRESETS = [6, 8, 10, 12] as const
const MIN_CHARS = 1
const MAX_CHARS = 100
const COPY_RESET_MS = 1600

function App() {
  const [text, setText] = useState('')
  const [charsPerLine, setCharsPerLine] = useState(8)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [copiedAll, setCopiedAll] = useState(false)
  const [burstKey, setBurstKey] = useState(0)
  const copyTimer = useRef<number | null>(null)
  const copyAllTimer = useRef<number | null>(null)
  const textareaId = useId()
  const numberId = useId()

  const charCount = countChars(text)
  const lines = splitText(text, charsPerLine)

  useEffect(() => {
    return () => {
      if (copyTimer.current) window.clearTimeout(copyTimer.current)
      if (copyAllTimer.current) window.clearTimeout(copyAllTimer.current)
    }
  }, [])

  function clampChars(value: number) {
    if (Number.isNaN(value)) return charsPerLine
    return Math.min(MAX_CHARS, Math.max(MIN_CHARS, value))
  }

  function handleCharsChange(raw: string) {
    const digits = raw.replace(/[^\d]/g, '')
    if (digits === '') {
      setCharsPerLine(MIN_CHARS)
      return
    }
    setCharsPerLine(clampChars(Number(digits)))
  }

  async function copyText(value: string) {
    try {
      await navigator.clipboard.writeText(value)
      return true
    } catch {
      // Fallback for environments without clipboard permission
      const ta = document.createElement('textarea')
      ta.value = value
      ta.setAttribute('readonly', '')
      ta.style.position = 'fixed'
      ta.style.left = '-9999px'
      document.body.appendChild(ta)
      ta.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(ta)
      return ok
    }
  }

  async function handleCopyLine(line: string, index: number) {
    const ok = await copyText(line)
    if (!ok) return
    setCopiedIndex(index)
    setBurstKey((k) => k + 1)
    if (copyTimer.current) window.clearTimeout(copyTimer.current)
    copyTimer.current = window.setTimeout(() => setCopiedIndex(null), COPY_RESET_MS)
  }

  async function handleCopyAll() {
    if (lines.length === 0) return
    const ok = await copyText(lines.join('\n'))
    if (!ok) return
    setCopiedAll(true)
    setBurstKey((k) => k + 1)
    if (copyAllTimer.current) window.clearTimeout(copyAllTimer.current)
    copyAllTimer.current = window.setTimeout(() => setCopiedAll(false), COPY_RESET_MS)
  }

  function handleClear() {
    setText('')
    setCopiedIndex(null)
    setCopiedAll(false)
  }

  function bumpChars(delta: number) {
    setCharsPerLine((prev) => clampChars(prev + delta))
  }

  return (
    <div className="page">
      <div className="bg-blobs" aria-hidden="true">
        <span className="blob blob-pink" />
        <span className="blob blob-blue" />
        <span className="blob blob-yellow" />
      </div>

      <header className="hero">
        <div className="decor decor-star" aria-hidden="true">
          ✦
        </div>
        <div className="decor decor-pencil" aria-hidden="true">
          ✏️
        </div>
        <div className="decor decor-heart" aria-hidden="true">
          ♡
        </div>
        <div className="decor decor-paper" aria-hidden="true">
          📄
        </div>

        <p className="eyebrow">かわいく分けちゃうよ</p>
        <h1 className="title">
          <span className="title-icon" aria-hidden="true">
            ✂️
          </span>
          ぶんしょう分けメーカー
        </h1>
        <p className="subtitle">長い文章を、好きな文字数で分けよう！</p>
      </header>

      <main className="main">
        <section className="card input-card" aria-labelledby="step1-heading">
          <div className="card-head">
            <h2 id="step1-heading" className="step-title">
              <span className="step-badge">①</span>
              文章を入れてね <span aria-hidden="true">✏️</span>
            </h2>
            <button
              type="button"
              className="btn btn-clear"
              onClick={handleClear}
              disabled={!text}
            >
              🗑️ クリア
            </button>
          </div>

          <label className="sr-only" htmlFor={textareaId}>
            分けたい文章
          </label>
          <textarea
            id={textareaId}
            className="text-input"
            placeholder="ここに長い文章を書いてね…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            inputMode="text"
            autoComplete="off"
            spellCheck={false}
          />
          <p className="char-live" aria-live="polite">
            いま <strong>{charCount}</strong> 文字 入ってるよ！
          </p>
        </section>

        <section className="card setting-card" aria-labelledby="step2-heading">
          <h2 id="step2-heading" className="step-title">
            <span className="step-badge step-badge-blue">②</span>
            1行を何文字にする？ <span aria-hidden="true">🔢</span>
          </h2>

          <div className="number-row">
            <button
              type="button"
              className="btn btn-stepper"
              onClick={() => bumpChars(-1)}
              aria-label="1文字減らす"
            >
              −
            </button>
            <div className="number-box">
              <label className="sr-only" htmlFor={numberId}>
                1行あたりの文字数
              </label>
              <input
                id={numberId}
                className="number-input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={charsPerLine}
                onChange={(e) => handleCharsChange(e.target.value)}
                onBlur={() => setCharsPerLine((v) => clampChars(v))}
              />
              <span className="number-unit">文字</span>
            </div>
            <button
              type="button"
              className="btn btn-stepper"
              onClick={() => bumpChars(1)}
              aria-label="1文字増やす"
            >
              ＋
            </button>
          </div>

          <div className="presets" role="group" aria-label="文字数プリセット">
            {PRESETS.map((n) => (
              <button
                key={n}
                type="button"
                className={`btn btn-preset${charsPerLine === n ? ' is-active' : ''}`}
                onClick={() => setCharsPerLine(n)}
                aria-pressed={charsPerLine === n}
              >
                {n}文字
              </button>
            ))}
          </div>
        </section>

        <section className="card result-card" aria-labelledby="step3-heading">
          <h2 id="step3-heading" className="step-title result-heading">
            <span className="step-badge step-badge-yellow">③</span>
            できあがり！ <span aria-hidden="true">🎉</span>
          </h2>

          {lines.length === 0 ? (
            <div className="empty-state">
              <div className="empty-illus" aria-hidden="true">
                <span>✨</span>
                <span>📝</span>
                <span>✨</span>
              </div>
              <p>
                ここに文章を入れると、
                <br />
                きれいに分けてくれるよ ✨
              </p>
            </div>
          ) : (
            <>
              <button
                type="button"
                className={`btn btn-copy-all${copiedAll ? ' is-success' : ''}`}
                onClick={handleCopyAll}
              >
                {copiedAll ? '🎉 ぜんぶコピーしたよ！' : '📋 ぜんぶコピー！'}
              </button>
              <p className="result-summary" aria-live="polite">
                全部で <strong>{lines.length}</strong> 行になったよ！
              </p>
              <ul className="result-list">
                {lines.map((line, index) => {
                  const isCopied = copiedIndex === index
                  return (
                    <li
                      key={`${index}-${line}`}
                      className="result-item"
                      style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
                    >
                      <p className="result-text">{line}</p>
                      <button
                        type="button"
                        className={`btn btn-copy${isCopied ? ' is-success' : ''}`}
                        onClick={() => handleCopyLine(line, index)}
                      >
                        {isCopied ? '✓ コピーしたよ！' : '📋 コピー'}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </>
          )}
        </section>
      </main>

      {burstKey > 0 && (
        <div key={burstKey} className="sparkle-burst" aria-hidden="true">
          <span>✦</span>
          <span>★</span>
          <span>✦</span>
        </div>
      )}

      <footer className="footer">
        <p>文章を入れて、数字を決めたら、ポンっと分けてくれるよ</p>
      </footer>
    </div>
  )
}

export default App
