import { get, set, del, keys } from 'idb-keyval'
import { defaultPdfName } from './framesToPdf'

export type JobStatus = 'queued' | 'processing' | 'done' | 'error'

export type StoredJob = {
  id: string
  name: string
  status: JobStatus
  createdAt: number
  updatedAt: number
  frameCount?: number
  error?: string
  /** PDF bytes when done */
  pdf?: ArrayBuffer
}

const JOB_PREFIX = 'job:'
const FILE_PREFIX = 'file:'

function jobKey(id: string) {
  return `${JOB_PREFIX}${id}`
}
function fileKey(id: string) {
  return `${FILE_PREFIX}${id}`
}

export function newJobId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export async function saveJobMeta(job: StoredJob): Promise<void> {
  const { pdf: _pdf, ...meta } = job
  // Keep pdf in a separate key when present to avoid rewriting large blobs on meta updates.
  await set(jobKey(job.id), { ...meta, hasPdf: Boolean(job.pdf) || meta.status === 'done' })
  if (job.pdf) {
    await set(`${jobKey(job.id)}:pdf`, job.pdf)
  }
}

export async function saveJobFile(id: string, file: File): Promise<void> {
  await set(fileKey(id), file)
}

export async function loadJobFile(id: string): Promise<File | undefined> {
  return get<File>(fileKey(id))
}

export async function saveJobPdf(id: string, pdf: Blob, frameCount: number): Promise<void> {
  const buf = await pdf.arrayBuffer()
  const existing = await getJob(id)
  const next: StoredJob = {
    id,
    name: existing?.name ?? 'video',
    status: 'done',
    createdAt: existing?.createdAt ?? Date.now(),
    updatedAt: Date.now(),
    frameCount,
    pdf: buf,
  }
  await saveJobMeta(next)
  await set(`${jobKey(id)}:pdf`, buf)
  await del(fileKey(id))
}

export async function markJob(id: string, patch: Partial<StoredJob>): Promise<void> {
  const existing = (await getJob(id)) ?? {
    id,
    name: 'video',
    status: 'queued' as const,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  const next = { ...existing, ...patch, updatedAt: Date.now() }
  await saveJobMeta(next)
}

export async function getJob(id: string): Promise<StoredJob | undefined> {
  const meta = await get<StoredJob & { hasPdf?: boolean }>(jobKey(id))
  if (!meta) return undefined
  const pdf = await get<ArrayBuffer>(`${jobKey(id)}:pdf`)
  return { ...meta, pdf }
}

export async function listJobs(): Promise<StoredJob[]> {
  const allKeys = await keys()
  const ids = allKeys
    .map(String)
    .filter((k) => k.startsWith(JOB_PREFIX) && !k.endsWith(':pdf'))
    .map((k) => k.slice(JOB_PREFIX.length))
  const jobs = await Promise.all(ids.map((id) => getJob(id)))
  return jobs
    .filter((j): j is StoredJob => Boolean(j))
    .sort((a, b) => b.createdAt - a.createdAt)
}

export async function deleteJob(id: string): Promise<void> {
  await del(jobKey(id))
  await del(`${jobKey(id)}:pdf`)
  await del(fileKey(id))
}

export async function clearFinishedJobs(): Promise<void> {
  const jobs = await listJobs()
  await Promise.all(
    jobs.filter((j) => j.status === 'done' || j.status === 'error').map((j) => deleteJob(j.id)),
  )
}

export function pdfBlobFromJob(job: StoredJob): Blob | null {
  if (!job.pdf) return null
  return new Blob([job.pdf], { type: 'application/pdf' })
}

export function downloadNameForJob(job: StoredJob): string {
  return defaultPdfName(job.name)
}
