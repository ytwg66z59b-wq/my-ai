import { convertFileToPdf } from './convertVideo'
import {
  deleteJob,
  listJobs,
  loadJobFile,
  markJob,
  newJobId,
  saveJobFile,
  saveJobMeta,
  saveJobPdf,
  type StoredJob,
} from './jobStore'

export type QueueProgress = {
  jobId: string
  jobName: string
  jobIndex: number
  jobTotal: number
  frameDone: number
  frameTotal: number
}

type RunnerCallbacks = {
  onProgress?: (p: QueueProgress) => void
  onJobDone?: (job: StoredJob) => void
  onJobError?: (job: StoredJob, error: Error) => void
  onAllDone?: (jobs: StoredJob[]) => void
}

let running = false
let abort: AbortController | null = null

export function isQueueRunning(): boolean {
  return running
}

export function abortQueue(): void {
  abort?.abort()
}

export async function enqueueFiles(files: File[]): Promise<StoredJob[]> {
  const created: StoredJob[] = []
  for (const file of files) {
    if (!file.type.startsWith('video/')) continue
    const id = newJobId()
    const job: StoredJob = {
      id,
      name: file.name,
      status: 'queued',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    await saveJobFile(id, file)
    await saveJobMeta(job)
    created.push(job)
  }
  return created
}

async function notifyDone(count: number): Promise<void> {
  try {
    if (!('Notification' in window)) return
    if (Notification.permission === 'default') {
      await Notification.requestPermission()
    }
    if (Notification.permission === 'granted') {
      new Notification('コマPDF', {
        body:
          count === 1
            ? 'PDF の変換が完了しました。ページを開いてダウンロードできます。'
            : `${count} 件の PDF 変換が完了しました。まとめてダウンロードできます。`,
      })
    }
  } catch {
    /* ignore notification failures */
  }
}

/**
 * Process queued / interrupted jobs. Safe to call on page load (resumes).
 * Continues while the tab is in the background; if the tab is closed, unfinished
 * jobs stay in IndexedDB and resume the next time this page is opened.
 */
export async function runJobQueue(callbacks: RunnerCallbacks = {}): Promise<StoredJob[]> {
  if (running) return listJobs()
  running = true
  abort = new AbortController()
  const signal = abort.signal

  try {
    const all = await listJobs()
    const pending = all.filter((j) => j.status === 'queued' || j.status === 'processing')
    // Reset stuck "processing" from a previous closed session back to work.
    for (const job of pending.filter((j) => j.status === 'processing')) {
      await markJob(job.id, { status: 'queued', error: undefined })
    }

    const queue = (await listJobs()).filter((j) => j.status === 'queued')
    let completedNow = 0

    for (let i = 0; i < queue.length; i += 1) {
      if (signal.aborted) break
      const job = queue[i]!
      await markJob(job.id, { status: 'processing', error: undefined })

      const file = await loadJobFile(job.id)
      if (!file) {
        await markJob(job.id, { status: 'error', error: '元動画が見つかりません（再選択してください）' })
        const erred = { ...job, status: 'error' as const, error: '元動画が見つかりません' }
        callbacks.onJobError?.(erred, new Error(erred.error!))
        continue
      }

      try {
        const result = await convertFileToPdf(file, {
          intervalSec: 0.3,
          title: `${job.name} — 0.3s frames`,
          signal,
          onProgress: (p) =>
            callbacks.onProgress?.({
              jobId: job.id,
              jobName: job.name,
              jobIndex: i + 1,
              jobTotal: queue.length,
              frameDone: p.done,
              frameTotal: p.total,
            }),
        })
        await saveJobPdf(job.id, result.pdf, result.frameCount)
        const doneJob: StoredJob = {
          ...job,
          status: 'done',
          frameCount: result.frameCount,
          updatedAt: Date.now(),
          pdf: await result.pdf.arrayBuffer(),
        }
        completedNow += 1
        callbacks.onJobDone?.(doneJob)
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          await markJob(job.id, { status: 'queued' })
          break
        }
        const message = err instanceof Error ? err.message : '変換に失敗しました'
        await markJob(job.id, { status: 'error', error: message })
        callbacks.onJobError?.({ ...job, status: 'error', error: message }, err as Error)
      }
    }

    const finalJobs = await listJobs()
    if (completedNow > 0) {
      await notifyDone(completedNow)
    }
    callbacks.onAllDone?.(finalJobs)
    return finalJobs
  } finally {
    running = false
    abort = null
  }
}

export async function removeJob(id: string): Promise<void> {
  await deleteJob(id)
}
