import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import { buildPdfSession } from './framesToPdf'
import { MAX_LONG_EDGE, THUMB_WIDTH, MAX_THUMBS, type ConvertResult, type ExtractProgress, type FrameThumb } from './extractFrames'

let ffmpegSingleton: FFmpeg | null = null
let loadPromise: Promise<FFmpeg> | null = null

async function getFfmpeg(onLog?: (msg: string) => void): Promise<FFmpeg> {
  if (ffmpegSingleton?.loaded) return ffmpegSingleton
  if (loadPromise) return loadPromise

  loadPromise = (async () => {
    const ffmpeg = new FFmpeg()
    ffmpeg.on('log', ({ message }) => onLog?.(message))
    // Single-thread core: works on GitHub Pages without COOP headers.
    const base = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm'
    await ffmpeg.load({
      coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, 'application/wasm'),
    })
    ffmpegSingleton = ffmpeg
    return ffmpeg
  })()

  try {
    return await loadPromise
  } catch (err) {
    loadPromise = null
    throw err
  }
}

function asBlobPart(bytes: Uint8Array): BlobPart {
  const copy = new Uint8Array(bytes.byteLength)
  copy.set(bytes)
  return copy
}

function padFrameName(index: number): string {
  return `frame_${String(index).padStart(4, '0')}.jpg`
}

/**
 * Fast path: decode with ffmpeg.wasm at fps=1/interval, scale, JPEG, pack PDF.
 */
export async function convertVideoToPdfFfmpeg(
  file: File,
  options: {
    intervalSec?: number
    maxLongEdge?: number
    title?: string
    onProgress?: (progress: ExtractProgress) => void
    signal?: AbortSignal
  } = {},
): Promise<ConvertResult> {
  const intervalSec = options.intervalSec ?? 0.3
  const maxLongEdge = options.maxLongEdge ?? MAX_LONG_EDGE
  const { onProgress, signal, title } = options

  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')

  const ffmpeg = await getFfmpeg()
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')

  const inputName = 'input_video'
  await ffmpeg.writeFile(inputName, await fetchFile(file))

  const fps = 1 / intervalSec
  // scale long edge, keep aspect; -2 makes height divisible by 2
  const vf = `fps=${fps},scale='min(${maxLongEdge},iw)':-2`
  const onProg = ({ progress }: { progress: number }) => {
    if (progress >= 0 && progress <= 1) {
      onProgress?.({
        done: Math.max(1, Math.round(progress * 100)),
        total: 100,
        timeSec: progress,
      })
    }
  }
  ffmpeg.on('progress', onProg)

  try {
    await ffmpeg.exec([
      '-i',
      inputName,
      '-vf',
      vf,
      '-q:v',
      '5',
      '-f',
      'image2',
      'frame_%04d.jpg',
    ])
  } finally {
    ffmpeg.off('progress', onProg)
  }

  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')

  // Discover frames until missing.
  const frames: Uint8Array[] = []
  for (let i = 1; i <= 20_000; i += 1) {
    try {
      const data = await ffmpeg.readFile(padFrameName(i))
      if (typeof data === 'string') break
      frames.push(data as Uint8Array)
    } catch {
      break
    }
  }

  // Cleanup ffmpeg FS
  try {
    await ffmpeg.deleteFile(inputName)
  } catch {
    /* ignore */
  }
  for (let i = 1; i <= frames.length; i += 1) {
    try {
      await ffmpeg.deleteFile(padFrameName(i))
    } catch {
      /* ignore */
    }
  }

  if (frames.length === 0) {
    throw new Error('フレームを抽出できませんでした')
  }

  // Probe dimensions from first JPEG via createImageBitmap
  const firstBlob = new Blob([asBlobPart(frames[0]!)], { type: 'image/jpeg' })
  const bmp = await createImageBitmap(firstBlob)
  const width = bmp.width
  const height = bmp.height
  bmp.close()

  const session = buildPdfSession(width, height, title)
  const thumbs: FrameThumb[] = []
  const thumbCanvas = document.createElement('canvas')
  const thumbW = Math.min(THUMB_WIDTH, width)
  const thumbH = Math.max(1, Math.round((height / width) * thumbW))
  thumbCanvas.width = thumbW
  thumbCanvas.height = thumbH
  const thumbCtx = thumbCanvas.getContext('2d', { alpha: false })

  for (let i = 0; i < frames.length; i += 1) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
    const jpeg = frames[i]!
    session.addFrame(jpeg)
    const timeSec = Math.round(i * intervalSec * 1000) / 1000

    if (thumbCtx && thumbs.length < MAX_THUMBS) {
      const blob = new Blob([asBlobPart(jpeg)], { type: 'image/jpeg' })
      const bit = await createImageBitmap(blob)
      thumbCtx.drawImage(bit, 0, 0, thumbW, thumbH)
      bit.close()
      thumbs.push({
        timeSec,
        dataUrl: thumbCanvas.toDataURL('image/jpeg', 0.55),
      })
    }

    if (i === frames.length - 1 || i % 4 === 0) {
      onProgress?.({ done: i + 1, total: frames.length, timeSec })
    }
  }

  return {
    pdf: session.toBlob(),
    thumbs,
    frameCount: frames.length,
    width,
    height,
  }
}

export async function warmFfmpeg(): Promise<boolean> {
  try {
    await getFfmpeg()
    return true
  } catch {
    return false
  }
}
