import { jsPDF } from 'jspdf'
import type { FrameCapture } from './extractFrames'

const MM_PER_INCH = 25.4

function pxToMm(px: number, dpi = 96): number {
  return (px / dpi) * MM_PER_INCH
}

/** Build a multi-page PDF with one frame image per page, fitted to the page. */
export async function framesToPdf(
  frames: FrameCapture[],
  options?: { title?: string; dpi?: number },
): Promise<Blob> {
  if (frames.length === 0) {
    throw new Error('PDF にする画像がありません')
  }

  const dpi = options?.dpi ?? 96
  const first = frames[0]!
  const pageW = pxToMm(first.width, dpi)
  const pageH = pxToMm(first.height, dpi)

  const doc = new jsPDF({
    orientation: pageW >= pageH ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [pageW, pageH],
    compress: true,
  })

  if (options?.title) {
    doc.setProperties({ title: options.title })
  }

  frames.forEach((frame, index) => {
    if (index > 0) {
      const w = pxToMm(frame.width, dpi)
      const h = pxToMm(frame.height, dpi)
      doc.addPage([w, h], w >= h ? 'landscape' : 'portrait')
    }
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    doc.addImage(frame.dataUrl, 'JPEG', 0, 0, pageWidth, pageHeight, undefined, 'FAST')
  })

  return doc.output('blob')
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Delay revoke so the browser can start the download.
  window.setTimeout(() => URL.revokeObjectURL(url), 2_000)
}

export function defaultPdfName(sourceName: string): string {
  const base = sourceName.replace(/\.[^.]+$/, '') || 'frames'
  return `${base}_0.3s.pdf`
}
