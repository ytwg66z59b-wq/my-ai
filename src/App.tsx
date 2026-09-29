import { useEffect, useId, useRef, useState } from 'react'
import {
  convertVideoToPdf,
  loadVideoFromFile,
  revokeVideo,
  type FrameThumb,
} from './extractFrames'
import { downloadBlob, defaultPdfName } from './framesToPdf'
import { estimateFrameCount, formatDuration } from './frameTimes'
import './App.css'

const INTERVAL_SEC = 0.3
const ACCEPT = 'video/mp4,video/webm,video/quicktime,video/*'

type Status = 'idle' | 'ready' | 'working' | 'done' | 'error'

function App() {
  const inputId = useId()
  const fileRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [thumbs, setThumbs] = useState<FrameThumb[]>([])
  const [frameCount, setFrameCount] = useState(0)
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const estimated = estimateFrameCount(duration, INTERVAL_SEC)

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
      if (videoRef.current) revokeVideo(videoRef.current)
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  async function prepareFile(next: File) {
    abortRef.current?.abort()
    if (videoRef.current) {
      revokeVideo(videoRef.current)
      videoRef.current = null
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl)

    setFile(next)
    setThumbs([])
    setFrameCount(0)
    setPdfBlob(null)
    setProgress({ done: 0, total: 0 })
    setMessage('')
    setStatus('idle')

    const url = URL.createObjectURL(next)
    setPreviewUrl(url)

    try {
      const video = await loadVideoFromFile(next)
      videoRef.current = video
      setDuration(video.duration)
      setStatus('ready')
    } catch (err) {
      setDuration(0)
      setStatus('error')
      setMessage(err instanceof Error ? err.message : '動画を読み込めませんでした')
    }
  }

  function onPick(list: FileList | null) {
    const picked = list?.[0]
    if (!picked) return
    if (!picked.type.startsWith('video/')) {
      setStatus('error')
      setMessage('動画ファイルを選んでください')
      return
    }
    void prepareFile(picked)
  }

  async function handleConvert() {
    if (!file || !videoRef.current || status === 'working') return

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setStatus('working')
    setMessage('')
    setThumbs([])
    setFrameCount(0)
    setPdfBlob(null)
    setProgress({ done: 0, total: estimated })

    try {
      const result = await convertVideoToPdf(videoRef.current, {
        intervalSec: INTERVAL_SEC,
        title: `${file.name} — ${INTERVAL_SEC}s frames`,
        signal: controller.signal,
        onProgress: (p) => setProgress({ done: p.done, total: p.total }),
      })
      setThumbs(result.thumbs)
      setFrameCount(result.frameCount)
      setPdfBlob(result.pdf)
      // Test hook for headless smoke downloads.
      ;(window as unknown as { __komaPdfBlob?: Blob }).__komaPdfBlob = result.pdf
      setStatus('done')
      setMessage(`${result.frameCount} 枚のコマを PDF にまとめました`)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setStatus('ready')
        setMessage('中止しました')
        return
      }
      setStatus('error')
      setMessage(err instanceof Error ? err.message : '変換に失敗しました')
    }
  }

  function handleDownload() {
    if (!pdfBlob || !file) return
    downloadBlob(pdfBlob, defaultPdfName(file.name))
  }

  function handleReset() {
    abortRef.current?.abort()
    if (videoRef.current) {
      revokeVideo(videoRef.current)
      videoRef.current = null
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setFile(null)
    setDuration(0)
    setThumbs([])
    setFrameCount(0)
    setPdfBlob(null)
    setProgress({ done: 0, total: 0 })
    setMessage('')
    setStatus('idle')
    if (fileRef.current) fileRef.current.value = ''
  }

  const pct =
    progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0

  return (
    <div className="page">
      <div className="atmosphere" aria-hidden="true">
        <div className="glow glow-a" />
        <div className="glow glow-b" />
        <div className="perforation" />
      </div>

      <header className="hero">
        <p className="brand">コマPDF</p>
        <h1 className="headline">動画を、0.3秒ごとのコマ送りPDFに。</h1>
        <p className="lede">
          ファイルを渡すだけで、フレームを抜き出して1つのPDFにまとめます。
        </p>
      </header>

      <main className="main">
        <section
          className={`dropzone${dragOver ? ' is-over' : ''}${file ? ' has-file' : ''}`}
          onDragEnter={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={(e) => {
            e.preventDefault()
            setDragOver(false)
          }}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            onPick(e.dataTransfer.files)
          }}
        >
          <input
            ref={fileRef}
            id={inputId}
            className="file-input"
            type="file"
            accept={ACCEPT}
            onChange={(e) => onPick(e.target.files)}
          />

          {!file ? (
            <label htmlFor={inputId} className="drop-label">
              <span className="drop-mark" aria-hidden="true" />
              <span className="drop-title">動画をドロップ、または選択</span>
              <span className="drop-hint">MP4 / WebM / MOV など</span>
            </label>
          ) : (
            <div className="file-panel">
              {previewUrl && (
                <video
                  className="preview"
                  src={previewUrl}
                  muted
                  playsInline
                  controls
                  preload="metadata"
                />
              )}
              <div className="file-meta">
                <p className="file-name">{file.name}</p>
                <dl className="stats">
                  <div>
                    <dt>長さ</dt>
                    <dd>{formatDuration(duration)}</dd>
                  </div>
                  <div>
                    <dt>間隔</dt>
                    <dd>{INTERVAL_SEC}秒</dd>
                  </div>
                  <div>
                    <dt>コマ数</dt>
                    <dd>{estimated || '—'}</dd>
                  </div>
                </dl>
                <div className="actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleConvert}
                    disabled={status === 'working' || status === 'idle' || !duration}
                  >
                    {status === 'working' ? '変換中…' : 'PDFをつくる'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={handleReset}
                    disabled={status === 'working'}
                  >
                    やり直す
                  </button>
                  <label htmlFor={inputId} className="btn btn-ghost as-label">
                    別の動画
                  </label>
                </div>
              </div>
            </div>
          )}
        </section>

        {(status === 'working' || status === 'done' || status === 'error') && (
          <section className="status-card" aria-live="polite">
            {status === 'working' && (
              <>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${pct}%` }} />
                </div>
                <p className="status-text">
                  コマ送り中 {progress.done} / {progress.total}（{pct}%）
                </p>
              </>
            )}
            {status === 'done' && (
              <div className="done-row">
                <p className="status-text">{message}</p>
                <button
                  type="button"
                  className="btn btn-primary btn-download"
                  onClick={handleDownload}
                >
                  PDFをダウンロード
                </button>
              </div>
            )}
            {status === 'error' && <p className="status-text is-error">{message}</p>}
          </section>
        )}

        {thumbs.length > 0 && (
          <section className="strip" aria-label="抽出したコマ">
            <h2 className="strip-title">
              抽出したコマ
              {frameCount > thumbs.length
                ? `（先頭 ${thumbs.length} / ${frameCount}）`
                : `（${frameCount}）`}
            </h2>
            <ul className="strip-list">
              {thumbs.map((frame, index) => (
                <li key={`${frame.timeSec}-${index}`} className="strip-item">
                  <img src={frame.dataUrl} alt={`${frame.timeSec.toFixed(1)}秒のコマ`} />
                  <span>{frame.timeSec.toFixed(1)}s</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      <footer className="footer">
        <p>処理はブラウザ内だけで完結します。動画はサーバーに送られません。</p>
      </footer>
    </div>
  )
}

export default App
