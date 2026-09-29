import JSZip from 'jszip'
import { downloadBlob } from './framesToPdf'
import type { StoredJob } from './jobStore'
import { downloadNameForJob, pdfBlobFromJob } from './jobStore'

export type PdfItem = {
  name: string
  blob: Blob
}

/** Pack multiple PDFs into one ZIP (single downloadable file). */
export async function zipPdfs(items: PdfItem[]): Promise<Blob> {
  if (items.length === 0) throw new Error('ZIP にする PDF がありません')
  const zip = new JSZip()
  const used = new Map<string, number>()
  for (const item of items) {
    let name = item.name.endsWith('.pdf') ? item.name : `${item.name}.pdf`
    const n = used.get(name) ?? 0
    used.set(name, n + 1)
    if (n > 0) {
      name = name.replace(/\.pdf$/i, `_${n + 1}.pdf`)
    }
    zip.file(name, item.blob)
  }
  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } })
}

export async function downloadJobsAsOneFile(jobs: StoredJob[]): Promise<void> {
  const done = jobs.filter((j) => j.status === 'done' && j.pdf)
  if (done.length === 0) throw new Error('ダウンロードできる PDF がありません')

  if (done.length === 1) {
    const job = done[0]!
    const blob = pdfBlobFromJob(job)
    if (!blob) throw new Error('PDF データがありません')
    downloadBlob(blob, downloadNameForJob(job))
    return
  }

  const items: PdfItem[] = []
  for (const job of done) {
    const blob = pdfBlobFromJob(job)
    if (blob) items.push({ name: downloadNameForJob(job), blob })
  }
  const zip = await zipPdfs(items)
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
  downloadBlob(zip, `koma-pdf_${stamp}.zip`)
}
