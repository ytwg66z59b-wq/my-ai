import { useEffect, useRef } from 'react'
import { buildMeetingNotes } from './meetingNotes'
import { useVoiceStudio } from './useVoiceStudio'
import './App.css'

const INTEGRATIONS = ['Zoom', 'Meet', 'Teams', 'Slack', 'Calendar', 'Notion'] as const

function Waveform({ level, active }: { level: number; active: boolean }) {
  const bars = 32
  return (
    <div className="wave" aria-hidden="true" data-active={active}>
      {Array.from({ length: bars }, (_, i) => {
        const center = Math.abs(i - (bars - 1) / 2) / ((bars - 1) / 2)
        const pulse = active ? 0.18 + level * (1 - center * 0.65) + Math.sin(i * 0.55) * 0.08 : 0.12
        return (
          <span
            key={i}
            className="wave-bar"
            style={{
              height: `${Math.max(8, Math.min(100, pulse * 100))}%`,
              animationDelay: `${i * 40}ms`,
            }}
          />
        )
      })}
    </div>
  )
}

function App() {
  const studio = useVoiceStudio()
  const notes = buildMeetingNotes(studio.lines)
  const transcriptEnd = useRef<HTMLDivElement>(null)

  useEffect(() => {
    transcriptEnd.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [studio.lines, studio.interim])

  return (
    <div className="page">
      <div className="atmosphere" aria-hidden="true">
        <div className="glow glow-a" />
        <div className="glow glow-b" />
        <div className="grid-fade" />
      </div>

      <header className="topbar">
        <a className="brand-mark" href="#top">
          <span className="brand-orb" aria-hidden="true" />
          Halo
        </a>
        <nav className="top-nav" aria-label="ページ内ナビ">
          <a href="#powers">機能</a>
          <a href="#studio">Studio</a>
          <a href="#workflow">ワークフロー</a>
        </nav>
        <a className="btn btn-ghost" href="#studio">
          試す
        </a>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-brand">
          <div className="hero-field" aria-hidden="true">
            <Waveform level={0.42} active />
          </div>
          <div className="hero-copy">
            <h1 id="hero-brand" className="brand-hero">
              Halo
            </h1>
            <p className="hero-line">会議のノイズを消し、ノートを自動で残す Voice AI</p>
            <p className="hero-sub">
              ノイズキャンセル、リアルタイム文字起こし、AI ミーティングノートをブラウザだけで。
            </p>
            <div className="hero-cta">
              <a className="btn btn-primary" href="#studio">
                Studio を開く
              </a>
              <a className="btn btn-secondary" href="#powers">
                できることを見る
              </a>
            </div>
          </div>
        </section>

        <section id="powers" className="section powers" aria-labelledby="powers-title">
          <h2 id="powers-title">会議中のスーパーパワー</h2>
          <p className="section-lead">雑音のない通話、その場の文字起こし、次のアクションまで。</p>
          <ul className="power-list">
            <li>
              <h3>Noise Cancellation</h3>
              <p>キーボード音や環境ノイズを抑え、声だけを前に出します。</p>
            </li>
            <li>
              <h3>Live Transcription</h3>
              <p>話した内容をリアルタイムでテキスト化。あとから検索できます。</p>
            </li>
            <li>
              <h3>AI Note Taker</h3>
              <p>要点とアクションアイテムを自動抽出。会議後の整理を短縮します。</p>
            </li>
          </ul>
        </section>

        <section id="studio" className="section studio" aria-labelledby="studio-title">
          <div className="studio-head">
            <h2 id="studio-title">Halo Studio</h2>
            <p className="section-lead">マイクを許可して、ノイズキャンセルと文字起こしを試せます。</p>
          </div>

          <div className="studio-shell">
            <div className="studio-stage">
              <Waveform level={studio.level} active={studio.active} />

              <div className="studio-controls">
                {!studio.active ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    data-testid="start-meeting"
                    onClick={() => void studio.start()}
                  >
                    会議を開始
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-danger"
                    data-testid="stop-meeting"
                    onClick={studio.stop}
                  >
                    終了
                  </button>
                )}

                <button
                  type="button"
                  className={`btn btn-toggle${studio.noiseCancellation ? ' is-on' : ''}`}
                  data-testid="toggle-nc"
                  onClick={() => void studio.toggleNoiseCancellation()}
                  aria-pressed={studio.noiseCancellation}
                >
                  NC {studio.noiseCancellation ? 'ON' : 'OFF'}
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  data-testid="clear-transcript"
                  onClick={studio.clearTranscript}
                >
                  クリア
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-testid="inject-demo"
                  onClick={studio.injectDemoLines}
                >
                  デモ文言
                </button>
              </div>

              <p className="studio-status" aria-live="polite">
                {studio.active
                  ? studio.listening
                    ? '聞き取り中…'
                    : studio.speechSupported
                      ? 'マイク稼働中（音声認識の再接続待ち）'
                      : 'マイク稼働中（このブラウザは音声認識非対応のため、デモ文言を利用できます）'
                  : '待機中 — 会議を開始するとマイクと文字起こしが動きます'}
              </p>

              {studio.error ? (
                <p className="studio-error" role="alert">
                  {studio.error}
                </p>
              ) : null}
            </div>

            <div className="studio-panels">
              <section className="panel" aria-labelledby="transcript-heading">
                <h3 id="transcript-heading">Transcript</h3>
                <div className="transcript" data-testid="transcript">
                  {studio.lines.length === 0 && !studio.interim ? (
                    <p className="panel-empty">ここにリアルタイム文字起こしが表示されます。</p>
                  ) : (
                    <ul>
                      {studio.lines.map((line) => (
                        <li key={line.id}>{line.text}</li>
                      ))}
                      {studio.interim ? (
                        <li className="is-interim" data-testid="interim">
                          {studio.interim}
                        </li>
                      ) : null}
                    </ul>
                  )}
                  <div ref={transcriptEnd} />
                </div>
              </section>

              <section className="panel" aria-labelledby="notes-heading">
                <h3 id="notes-heading">AI Notes</h3>
                <p className="notes-summary" data-testid="notes-summary">
                  {notes.summary}
                </p>
                {notes.keyPoints.length > 0 ? (
                  <div className="notes-block">
                    <h4>Key points</h4>
                    <ul data-testid="key-points">
                      {notes.keyPoints.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {notes.actionItems.length > 0 ? (
                  <div className="notes-block">
                    <h4>Action items</h4>
                    <ul data-testid="action-items">
                      {notes.actionItems.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </section>
            </div>
          </div>
        </section>

        <section id="workflow" className="section workflow" aria-labelledby="workflow-title">
          <h2 id="workflow-title">会議の前後も自動化</h2>
          <p className="section-lead">準備・本番・フォローをひとつの流れに。</p>
          <ol className="flow-list">
            <li>
              <span>Before</span>
              <strong>アジェンダ提案</strong>
              <p>前回の会話から議題候補を用意します。</p>
            </li>
            <li>
              <span>During</span>
              <strong>クリアな通話</strong>
              <p>NC と文字起こしで内容に集中できます。</p>
            </li>
            <li>
              <span>After</span>
              <strong>ノートとタスク</strong>
              <p>要約とアクションをそのまま共有できます。</p>
            </li>
          </ol>
        </section>

        <section className="section integrations" aria-labelledby="integrations-title">
          <h2 id="integrations-title">いつも使う通話ツールと一緒に</h2>
          <p className="section-lead">音声レイヤーで動くので、既存の会議アプリをそのまま使えます。</p>
          <ul className="logo-row">
            {INTEGRATIONS.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="footer">
        <p>
          <span className="brand-orb brand-orb-sm" aria-hidden="true" />
          Halo — Voice AI for quieter meetings
        </p>
      </footer>
    </div>
  )
}

export default App
