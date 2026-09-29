import { useEffect, useId, useRef, useState } from 'react'
import {
  abortQueue,
  enqueueFiles,
  isQueueRunning,
  removeJob,
  runJobQueue,
} from './jobQueue'
import {
  clearFinishedJobs,
  listJobs,
  markJob,
  type StoredJob,
} from './jobStore'
import { downloadJobsAsOneFile } from './zipDownload'
import { warmFfmpeg } from './convertFfmpeg'
import './App.css'

const ACCEPT = 'video/mp4,video/webm,video/quicktime,video/*'

function statusLabel(status: StoredJob['status']): string {
  switch (status) {
    case 'queued':
      return '待ち'
    case 'processing':
      return '変換中'
    case 'done':
      return '完了'
    case 'error':
      return '失敗'
  }
}

function App() {
  const inputId = useId()
  const fileRef = useRef<HTMLInputElement>(null)
  const [jobs, setJobs] = useState<StoredJob[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState<{
    label: string
    pct: number
  } | null>(null)
  const [engineHint, setEngineHint] = useState('高速エンジンを準備中…')

  async function refreshJobs() {
    setJobs(await listJobs())
  }

  useEffect(() => {
    void (async () => {
      await refreshJobs()
      // Resume unfinished work left from a previous visit.
      const existing = await listJobs()
      const pending = existing.some((j) => j.status === 'queued' || j.status === 'processing')
      if (pending && !isQueueRunning()) {
        setBusy(true)
        setMessage('前回の続きから変換を再開しています…')
        await runJobQueue({
          onProgress: (p) => {
            const framePct =
              p.frameTotal > 0 ? Math.round((p.frameDone / p.frameTotal) * 100) : 0
            setProgress({
              label: `${p.jobIndex}/${p.jobTotal}「${p.jobName}」 ${p.frameDone}/${p.frameTotal}`,
              pct: Math.round(((p.jobIndex - 1) / p.jobTotal) * 100 + framePct / p.jobTotal),
            })
          },
          onAllDone: async () => {
            await refreshJobs()
            setBusy(false)
            setProgress(null)
            setMessage('変換が完了しました。まとめてダウンロードできます。')
          },
        })
      }
      const ok = await warmFfmpeg()
      setEngineHint(ok ? '高速エンジン準備完了' : '標準エンジンで変換します')
    })()

    const onLeave = (e: BeforeUnloadEvent) => {
      if (isQueueRunning()) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', onLeave)
    return () => window.removeEventListener('beforeunload', onLeave)
  }, [])

  async function addFiles(list: FileList | File[] | null) {
    if (!list || list.length === 0) return
    const files = [...list].filter((f) => f.type.startsWith('video/'))
    if (files.length === 0) {
      setMessage('動画ファイルを選んでください')
      return
    }
    await enqueueFiles(files)
    await refreshJobs()
    setMessage(`${files.length} 本をキューに追加しました`)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleStart() {
    const queued = jobs.filter((j) => j.status === 'queued' || j.status === 'error')
    // Re-queue errors only if file still present — runJobQueue picks queued/processing.
    if (busy || isQueueRunning()) return
    const pending = (await listJobs()).filter(
      (j) => j.status === 'queued' || j.status === 'processing',
    )
    if (pending.length === 0 && queued.length === 0) {
      setMessage('先に動画を追加してください')
      return
    }

    // Re-mark errors as queued if user retries (file may still be in IDB).
    for (const job of jobs.filter((j) => j.status === 'error')) {
      await markJob(job.id, { status: 'queued', error: undefined })
    }
    await refreshJobs()

    setBusy(true)
    setMessage('バックグラウンドで変換しています。タブを切り替えても大丈夫です。')
    if ('Notification' in window && Notification.permission === 'default') {
      void Notification.requestPermission()
    }

    await runJobQueue({
      onProgress: (p) => {
        const framePct = p.frameTotal > 0 ? Math.round((p.frameDone / p.frameTotal) * 100) : 0
        setProgress({
          label: `${p.jobIndex}/${p.jobTotal}「${p.jobName}」 ${p.frameDone}/${p.frameTotal}`,
          pct: Math.round(((p.jobIndex - 1) / p.jobTotal) * 100 + framePct / p.jobTotal),
        })
      },
      onAllDone: async (finalJobs) => {
        setJobs(finalJobs)
        setBusy(false)
        setProgress(null)
        const done = finalJobs.filter((j) => j.status === 'done').length
        setMessage(
          done > 0
            ? `${done} 件の PDF ができました。1つのファイルとしてダウンロードできます。`
            : '完了した PDF がありません',
        )
      },
    })
  }

  async function handleDownloadAll() {
    try {
      await downloadJobsAsOneFile(jobs)
      setMessage('ダウンロードを開始しました')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'ダウンロードに失敗しました')
    }
  }

  async function handleClearDone() {
    await clearFinishedJobs()
    await refreshJobs()
    setMessage('完了済みをクリアしました')
  }

  async function handleRemove(id: string) {
    await removeJob(id)
    await refreshJobs()
  }

  function handleAbort() {
    abortQueue()
    setBusy(false)
    setProgress(null)
    setMessage('中止しました。未完了は次回このページを開くと再開できます。')
    void refreshJobs()
  }

  const doneCount = jobs.filter((j) => j.status === 'done').length
  const queuedCount = jobs.filter((j) => j.status === 'queued').length

  // Fix typo in message - I used Chinese 就绪 by mistake
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
          複数の動画をまとめて変換し、PDF を1つのファイルでダウンロードできます。タブを閉じても、次回開いたときに続きから再開します。
        </p>
        <p className="engine-hint">{engineHint}</p>
      </header>

      <main className="main">
        <section
          className={`dropzone${dragOver ? ' is-over' : ''}${jobs.length ? ' has-file' : ''}`}
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
            void addFiles(e.dataTransfer.files)
          }}
        >
          <input
            ref={fileRef}
            id={inputId}
            className="file-input"
            type="file"
            accept={ACCEPT}
            multiple
            onChange={(e) => void addFiles(e.target.files)}
          />
          <label htmlFor={inputId} className="drop-label">
            <span className="drop-mark" aria-hidden="true" />
            <span className="drop-title">動画をドロップ、または選択（複数可）</span>
            <span className="drop-hint">MP4 / WebM / MOV など · まとめて1ファイルで受け取れます</span>
          </label>
        </section>

        <section className="actions-bar">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => void handleStart()}
            disabled={busy || (queuedCount === 0 && jobs.every((j) => j.status !== 'error'))}
          >
            {busy ? '変換中…' : '変換スタート'}
          </button>
          <button
            type="button"
            className="btn btn-primary btn-download"
            onClick={() => void handleDownloadAll()}
            disabled={doneCount === 0 || busy}
          >
            {doneCount <= 1 ? 'PDFをダウンロード' : `まとめてダウンロード（${doneCount}件→1ファイル）`}
          </button>
          {busy ? (
            <button type="button" className="btn btn-ghost" onClick={handleAbort}>
              中止
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => void handleClearDone()}
              disabled={doneCount === 0}
            >
              完了をクリア
            </button>
          )}
        </section>

        {(progress || message) && (
          <section className="status-card" aria-live="polite">
            {progress && (
              <>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${progress.pct}%` }} />
                </div>
                <p className="status-text">{progress.label}</p>
              </>
            )}
            {message && <p className="status-text">{message}</p>}
          </section>
        )}

        {jobs.length > 0 && (
          <section className="job-list" aria-label="変換キュー">
            <h2 className="strip-title">キュー（{jobs.length}）</h2>
            <ul className="jobs">
              {jobs.map((job) => (
                <li key={job.id} className={`job job-${job.status}`}>
                  <div className="job-main">
                    <p className="job-name">{job.name}</p>
                    <p className="job-meta">
                      <span className="job-badge">{statusLabel(job.status)}</span>
                      {job.frameCount != null && <span>{job.frameCount} コマ</span>}
                      {job.error && <span className="job-error">{job.error}</span>}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost btn-tiny"
                    onClick={() => void handleRemove(job.id)}
                    disabled={busy && job.status === 'processing'}
                  >
                    削除
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      <footer className="footer">
        <p>
          変換は端末内で行います。ページを閉じると処理は一時停止し、次回開いたときに自動で再開します。完了時は通知できます。
        </p>
      </footer>
    </div>
  )
}

export default App
