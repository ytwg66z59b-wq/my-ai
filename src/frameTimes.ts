/** Build seek timestamps from 0 until just before duration, stepping by intervalSec. */
export function frameTimestamps(durationSec: number, intervalSec = 0.3): number[] {
  if (!Number.isFinite(durationSec) || !Number.isFinite(intervalSec)) return []
  if (durationSec <= 0 || intervalSec <= 0) return []

  const times: number[] = []
  // Cap iterations so pathological tiny intervals cannot hang the UI.
  const maxFrames = Math.min(Math.ceil(durationSec / intervalSec) + 1, 20_000)
  for (let i = 0; i < maxFrames; i += 1) {
    // Round to reduce IEEE-754 drift (e.g. 0.3 * 3 → 0.8999…).
    const t = Math.round(i * intervalSec * 1000) / 1000
    if (t >= durationSec) break
    times.push(t)
  }
  return times
}

export function estimateFrameCount(durationSec: number, intervalSec = 0.3): number {
  return frameTimestamps(durationSec, intervalSec).length
}

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds - m * 60
  if (m === 0) return `${s.toFixed(1)}秒`
  return `${m}分${s.toFixed(1)}秒`
}
