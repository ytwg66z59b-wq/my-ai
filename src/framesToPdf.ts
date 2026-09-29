import { jsPDF } from 'jspdf'

const MM_PER_INCH = 25.4

function pxToMm(px: number, dpi = 96): number {
  return (px / dpi) * MM_PER_INCH
}

export type PdfSession = {
  addFrame: (jpeg: Uint8Array) => void
  toBlob: () => Blob
}

/** Incremental PDF writer: JPEG bytes are embedded without re-encoding. */
export function buildPdfSession(
  widthPx: number,
  heightPx: number,
  title?: string,
  dpi = 96,
): PdfSession {
  const pageW = pxToMm(widthPx, dpi)
  const pageH = pxToMm(heightPx, dpi)
  const landscape = pageW >= pageH

  const doc = new jsPDF({
    orientation: landscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [pageW, pageH],
    compress: true,
  })

  if (title) {
    doc.setProperties({ title })
  }

  let index = 0

  return {
    addFrame(jpeg: Uint8Array) {
      if (index > 0) {
        doc.addPage([pageW, pageH], landscape ? 'landscape' : 'portrait')
      }
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      // NONE: already JPEG — skip jsPDF's expensive recompress path.
      doc.addImage(jpeg, 'JPEG', 0, 0, pageWidth, pageHeight, `f${index}`, 'NONE')
      index += 1
    },
    toBlob() {
      if (index === 0) {
        throw new Error('PDF にする画像がありません')
      }
      return doc.output('blob')
    },
  }
}

/** @deprecated Prefer convertVideoToPdf one-pass; kept for unit-testable naming helpers. */
export async function framesToPdf(
  frames: Array<{ dataUrl: string; width: number; height: number }>,
  options?: { title?: string; dpi?: number },
): Promise<Blob> {
  if (frames.length === 0) {
    throw new Error('PDF にする画像がありません')
  }
  const first = frames[0]!
  const session = buildPdfSession(first.width, first.height, options?.title, options?.dpi)
  for (const frame of frames) {
    const res = await fetch(frame.dataUrl)
    const buf = new Uint8Array(await res.arrayBuffer())
    session.addFrame(buf)
  }
  return session.toBlob()
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
  window.setTimeout(() => URL.revokeObjectURL(url), 2_000)
}

export function defaultPdfName(sourceName: string): string {
  const base = sourceName.replace(/\.[^.]+$/, '') || 'frames'
  return `${base}_0.3s.pdf`
}
