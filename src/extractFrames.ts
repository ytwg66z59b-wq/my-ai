import { frameTimestamps } from './frameTimes'

export type FrameCapture = {
  timeSec: number
  dataUrl: string
  width: number
  height: number
}

export type ExtractProgress = {
  done: number
  total: number
  timeSec: number
}

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

    // Some browsers ignore no-op seeks; force a tiny delta then target.
    if (Math.abs(video.currentTime - timeSec) < 1e-4) {
      video.currentTime = Math.min(timeSec + 1e-3, Math.max(0, video.duration - 1e-3))
    }
    video.currentTime = timeSec
  })
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

  // Attach revoke helper for callers.
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

export async function extractFrames(
  video: HTMLVideoElement,
  intervalSec = 0.3,
  onProgress?: (progress: ExtractProgress) => void,
  signal?: AbortSignal,
): Promise<FrameCapture[]> {
  const duration = video.duration
  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error('動画の長さを取得できませんでした')
  }

  const times = frameTimestamps(duration, intervalSec)
  if (times.length === 0) {
    throw new Error('切り出せるフレームがありません')
  }

  const width = video.videoWidth
  const height = video.videoHeight
  if (!width || !height) {
    throw new Error('動画の解像度を取得できませんでした')
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: false })
  if (!ctx) throw new Error('Canvas を初期化できませんでした')

  const frames: FrameCapture[] = []

  for (let i = 0; i < times.length; i += 1) {
    if (signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError')
    }
    const timeSec = times[i]!
    // Keep a tiny epsilon away from the exact end for decoder safety.
    const seekTo = Math.min(timeSec, Math.max(0, duration - 0.001))
    await seekVideo(video, seekTo)
    ctx.drawImage(video, 0, 0, width, height)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
    frames.push({ timeSec, dataUrl, width, height })
    onProgress?.({ done: i + 1, total: times.length, timeSec })
  }

  return frames
}
