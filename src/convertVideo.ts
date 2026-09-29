import {
  convertVideoToPdf,
  loadVideoFromFile,
  revokeVideo,
  MAX_LONG_EDGE,
  type ConvertResult,
  type ExtractProgress,
} from './extractFrames'
import { convertVideoToPdfFfmpeg } from './convertFfmpeg'

export type ConvertFileOptions = {
  intervalSec?: number
  maxLongEdge?: number
  title?: string
  onProgress?: (progress: ExtractProgress) => void
  signal?: AbortSignal
  /** Prefer ffmpeg.wasm when available (much faster on long clips). */
  preferFfmpeg?: boolean
}

/**
 * Convert a File to PDF. Tries ffmpeg.wasm first, falls back to canvas seeking.
 */
export async function convertFileToPdf(
  file: File,
  options: ConvertFileOptions = {},
): Promise<ConvertResult & { engine: 'ffmpeg' | 'canvas' }> {
  const preferFfmpeg = options.preferFfmpeg !== false
  const intervalSec = options.intervalSec ?? 0.3
  const maxLongEdge = options.maxLongEdge ?? MAX_LONG_EDGE

  if (preferFfmpeg) {
    try {
      const result = await convertVideoToPdfFfmpeg(file, {
        intervalSec,
        maxLongEdge,
        title: options.title,
        onProgress: options.onProgress,
        signal: options.signal,
      })
      return { ...result, engine: 'ffmpeg' }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') throw err
      // fall through to canvas
      console.warn('[koma-pdf] ffmpeg path failed, falling back to canvas', err)
    }
  }

  const video = await loadVideoFromFile(file)
  try {
    const result = await convertVideoToPdf(video, {
      intervalSec,
      maxLongEdge,
      title: options.title,
      onProgress: options.onProgress,
      signal: options.signal,
    })
    return { ...result, engine: 'canvas' }
  } finally {
    revokeVideo(video)
  }
}
