import { frameTimestamps } from './frameTimes'
import { buildPdfSession } from './framesToPdf'

export type FrameThumb = {
  timeSec: number
  dataUrl: string
}

export type ExtractProgress = {
  done: number
  total: number
  timeSec: number
}

export type ConvertResult = {
  pdf: Blob
  thumbs: FrameThumb[]
  frameCount: number
  width: number
  height: number
}

/** Long-edge cap keeps encode/PDF fast even for 4K sources. */
export const MAX_LONG_EDGE = 960
export const JPEG_QUALITY = 0.65
export const THUMB_WIDTH = 120
export const MAX_THUMBS = 24

function waitEvent(target: EventTarget, event: string, errorEvent = 'error'): Promise<void> {
  return new Promise((resolve, reject) => {
    const onOk = () => {
      cleanup()
      resolve()
    }
    const onErr = () => {
      cleanup()
      reject(new Error(`動画の読み込みに失敗しました（${event}）`))
    }
    const cleanup = () => {
      target.removeEventListener(event, onOk)
      target.removeEventListener(errorEvent, onErr)
    }
    target.addEventListener(event, onOk, { once: true })
    target.addEventListener(errorEvent, onErr, { once: true })
  })
}

function seekVideo(video: HTMLVideoElement, timeSec: number): Promise<void> {
  return new Promise((resolve, reject) => {
    if (Math.abs(video.currentTime - timeSec) < 0.0005 && video.readyState >= 2) {
      resolve()
      return
    }

    const onSeeked = () => {
      cleanup()
      resolve()
    }
    const onError = () => {
      cleanup()
      reject(new Error('フレームへのシークに失敗しました'))
    }
    const cleanup = () => {
      video.removeEventListener('seeked', onSeeked)
      video.removeEventListener('error', onError)
    }
    video.addEventListener('seeked', onSeeked, { once: true })
    video.addEventListener('error', onError, { once: true })
    video.currentTime = timeSec
  })
}

function canvasToJpegBytes(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('JPEG 変換に失敗しました'))
          return
        }
        void blob.arrayBuffer().then(
          (buf) => resolve(new Uint8Array(buf)),
          reject,
        )
      },
      'image/jpeg',
      quality,
    )
  })
}

export function scaledSize(
  srcW: number,
  srcH: number,
  maxLongEdge: number,
): { width: number; height: number } {
  const longEdge = Math.max(srcW, srcH)
  if (longEdge <= maxLongEdge) return { width: srcW, height: srcH }
  const scale = maxLongEdge / longEdge
  return {
    width: Math.max(1, Math.round(srcW * scale)),
    height: Math.max(1, Math.round(srcH * scale)),
  }
}

export async function loadVideoFromFile(file: File): Promise<HTMLVideoElement> {
  const url = URL.createObjectURL(file)
  const video = document.createElement('video')
  video.preload = 'auto'
  video.muted = true
  video.playsInline = true
  video.crossOrigin = 'anonymous'
  video.src = url

  try {
    if (video.readyState < 1) {
      await waitEvent(video, 'loadedmetadata')
    }
  } catch (err) {
    URL.revokeObjectURL(url)
    throw err
  }

  ;(video as HTMLVideoElement & { __objectUrl?: string }).__objectUrl = url
  return video
}

export function revokeVideo(video: HTMLVideoElement): void {
  const withUrl = video as HTMLVideoElement & { __objectUrl?: string }
  if (withUrl.__objectUrl) {
    URL.revokeObjectURL(withUrl.__objectUrl)
    withUrl.__objectUrl = undefined
  }
  video.removeAttribute('src')
  video.load()
}

export type ConvertOptions = {
  intervalSec?: number
  maxLongEdge?: number
  jpegQuality?: number
  title?: string
  onProgress?: (progress: ExtractProgress) => void
  signal?: AbortSignal
}

/**
 * Seek → downscale JPEG → append PDF page.
 * Overlaps JPEG encode with the next seek for speed.
 */
export async function convertVideoToPdf(
  video: HTMLVideoElement,
  options: ConvertOptions = {},
): Promise<ConvertResult> {
  const intervalSec = options.intervalSec ?? 0.3
  const maxLongEdge = options.maxLongEdge ?? MAX_LONG_EDGE
  const jpegQuality = options.jpegQuality ?? JPEG_QUALITY
  const { onProgress, signal, title } = options

  const duration = video.duration
  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error('動画の長さを取得できませんでした')
  }

  const srcW = video.videoWidth
  const srcH = video.videoHeight
  if (!srcW || !srcH) {
    throw new Error('動画の解像度を取得できませんでした')
  }

  const times = frameTimestamps(duration, intervalSec)
  if (times.length === 0) {
    throw new Error('切り出せるフレームがありません')
  }

  const { width, height } = scaledSize(srcW, srcH, maxLongEdge)

  const canvasA = document.createElement('canvas')
  canvasA.width = width
  canvasA.height = height
  const ctxA = canvasA.getContext('2d', { alpha: false })
  if (!ctxA) throw new Error('Canvas を初期化できませんでした')

  const thumbW = Math.min(THUMB_WIDTH, width)
  const thumbH = Math.max(1, Math.round((height / width) * thumbW))
  const thumbCanvas = document.createElement('canvas')
  thumbCanvas.width = thumbW
  thumbCanvas.height = thumbH
  const thumbCtx = thumbCanvas.getContext('2d', { alpha: false })
  if (!thumbCtx) throw new Error('サムネイル用 Canvas を初期化できませんでした')

  const session = buildPdfSession(width, height, title)
  const thumbs: FrameThumb[] = []
  let lastProgressAt = 0

  video.pause()

  // Encode canvas (separate from capture) so seek/draw can overlap JPEG encode.
  const encodeCanvas = document.createElement('canvas')
  encodeCanvas.width = width
  encodeCanvas.height = height
  const encodeCtx = encodeCanvas.getContext('2d', { alpha: false })
  if (!encodeCtx) throw new Error('Encode Canvas を初期化できませんでした')

  let encodeChain: Promise<void> = Promise.resolve()

  for (let i = 0; i < times.length; i += 1) {
    if (signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError')
    }

    const timeSec = times[i]!
    await seekVideo(video, Math.min(timeSec, Math.max(0, duration - 0.001)))

    ctxA.drawImage(video, 0, 0, width, height)

    if (thumbs.length < MAX_THUMBS) {
      thumbCtx.drawImage(canvasA, 0, 0, thumbW, thumbH)
      thumbs.push({
        timeSec,
        dataUrl: thumbCanvas.toDataURL('image/jpeg', 0.55),
      })
    }

    const snapshot = await createImageBitmap(canvasA)
    const frameIndex = i
    encodeChain = encodeChain.then(async () => {
      encodeCtx.drawImage(snapshot, 0, 0)
      snapshot.close()
      const jpeg = await canvasToJpegBytes(encodeCanvas, jpegQuality)
      session.addFrame(jpeg)
      const now = performance.now()
      const isLast = frameIndex === times.length - 1
      if (isLast || now - lastProgressAt >= 120) {
        lastProgressAt = now
        onProgress?.({
          done: frameIndex + 1,
          total: times.length,
          timeSec: times[frameIndex]!,
        })
      }
    })
  }

  await encodeChain

  return {
    pdf: session.toBlob(),
    thumbs,
    frameCount: times.length,
    width,
    height,
  }
}
