import { useCallback, useEffect, useRef, useState } from 'react'
import type { TranscriptLine } from './meetingNotes'

type SpeechRecognitionResultLike = {
  readonly isFinal: boolean
  readonly 0: { readonly transcript: string }
}

type SpeechRecognitionEventLike = {
  readonly resultIndex: number
  readonly results: ArrayLike<SpeechRecognitionResultLike> & { length: number }
}

type SpeechRecognitionLike = {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export type VoiceStudioState = {
  active: boolean
  noiseCancellation: boolean
  listening: boolean
  interim: string
  lines: TranscriptLine[]
  error: string | null
  level: number
  speechSupported: boolean
}

export function useVoiceStudio() {
  const [noiseCancellation, setNoiseCancellation] = useState(true)
  const [active, setActive] = useState(false)
  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')
  const [lines, setLines] = useState<TranscriptLine[]>([])
  const [error, setError] = useState<string | null>(null)
  const [level, setLevel] = useState(0)
  const [speechSupported] = useState(() => Boolean(getSpeechRecognitionCtor()))

  const streamRef = useRef<MediaStream | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const filtersRef = useRef<AudioNode[]>([])
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const rafRef = useRef<number>(0)
  const activeRef = useRef(false)
  const lineIdRef = useRef(0)

  const stopMeter = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = 0
    setLevel(0)
  }, [])

  const teardownAudio = useCallback(() => {
    stopMeter()
    sourceRef.current?.disconnect()
    sourceRef.current = null
    for (const node of filtersRef.current) node.disconnect()
    filtersRef.current = []
    analyserRef.current?.disconnect()
    analyserRef.current = null
    if (audioCtxRef.current) {
      void audioCtxRef.current.close()
      audioCtxRef.current = null
    }
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }, [stopMeter])

  const teardownRecognition = useCallback(() => {
    const rec = recognitionRef.current
    recognitionRef.current = null
    if (rec) {
      rec.onresult = null
      rec.onerror = null
      rec.onend = null
      try {
        rec.stop()
      } catch {
        /* already stopped */
      }
    }
    setListening(false)
    setInterim('')
  }, [])

  const startMeter = useCallback((analyser: AnalyserNode) => {
    const data = new Uint8Array(analyser.fftSize)
    const tick = () => {
      analyser.getByteTimeDomainData(data)
      let sum = 0
      for (let i = 0; i < data.length; i++) {
        const v = (data[i]! - 128) / 128
        sum += v * v
      }
      const rms = Math.sqrt(sum / data.length)
      setLevel(Math.min(1, rms * 4.2))
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  const wireGraph = useCallback(
    (stream: MediaStream, withNc: boolean) => {
      const ctx = new AudioContext()
      audioCtxRef.current = ctx
      const source = ctx.createMediaStreamSource(stream)
      sourceRef.current = source

      const analyser = ctx.createAnalyser()
      analyser.fftSize = 1024
      analyserRef.current = analyser

      if (withNc) {
        const highpass = ctx.createBiquadFilter()
        highpass.type = 'highpass'
        highpass.frequency.value = 85
        highpass.Q.value = 0.7

        const notch = ctx.createBiquadFilter()
        notch.type = 'notch'
        notch.frequency.value = 60
        notch.Q.value = 8

        const compressor = ctx.createDynamicsCompressor()
        compressor.threshold.value = -28
        compressor.knee.value = 18
        compressor.ratio.value = 6
        compressor.attack.value = 0.003
        compressor.release.value = 0.18

        source.connect(highpass)
        highpass.connect(notch)
        notch.connect(compressor)
        compressor.connect(analyser)
        filtersRef.current = [highpass, notch, compressor]
      } else {
        source.connect(analyser)
        filtersRef.current = []
      }

      startMeter(analyser)
    },
    [startMeter],
  )

  const startRecognition = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor()
    if (!Ctor) return

    const rec = new Ctor()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = 'ja-JP'
    recognitionRef.current = rec

    rec.onresult = (event) => {
      let interimText = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (!result) continue
        const text = result[0]?.transcript?.trim()
        if (!text) continue
        if (result.isFinal) {
          lineIdRef.current += 1
          setLines((prev) => [
            ...prev,
            { id: `line-${lineIdRef.current}`, text, at: Date.now() },
          ])
          setInterim('')
        } else {
          interimText += text
        }
      }
      if (interimText) setInterim(interimText)
    }

    rec.onerror = (event) => {
      if (event.error === 'aborted' || event.error === 'no-speech') return
      setError(`音声認識エラー: ${event.error}`)
    }

    rec.onend = () => {
      setListening(false)
      if (activeRef.current && recognitionRef.current === rec) {
        try {
          rec.start()
          setListening(true)
        } catch {
          /* ignore restart races */
        }
      }
    }

    try {
      rec.start()
      setListening(true)
    } catch {
      setError('音声認識を開始できませんでした。')
    }
  }, [])

  const openMic = useCallback(
    async (withNc: boolean) => {
      teardownAudio()
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: withNc,
          noiseSuppression: withNc,
          autoGainControl: withNc,
          channelCount: 1,
        },
        video: false,
      })
      streamRef.current = stream
      wireGraph(stream, withNc)
    },
    [teardownAudio, wireGraph],
  )

  const start = useCallback(async () => {
    setError(null)
    try {
      await openMic(noiseCancellation)
      activeRef.current = true
      setActive(true)
      startRecognition()
    } catch {
      setError('マイクへのアクセスが拒否されました。ブラウザの許可を確認してください。')
      activeRef.current = false
      setActive(false)
      teardownAudio()
    }
  }, [noiseCancellation, openMic, startRecognition, teardownAudio])

  const stop = useCallback(() => {
    activeRef.current = false
    setActive(false)
    teardownRecognition()
    teardownAudio()
  }, [teardownAudio, teardownRecognition])

  const toggleNoiseCancellation = useCallback(async () => {
    const next = !noiseCancellation
    setNoiseCancellation(next)
    if (!activeRef.current) return
    try {
      await openMic(next)
    } catch {
      setError('ノイズキャンセル切替中にマイクを再取得できませんでした。')
    }
  }, [noiseCancellation, openMic])

  const clearTranscript = useCallback(() => {
    setLines([])
    setInterim('')
  }, [])

  const injectDemoLines = useCallback(() => {
    const demo: TranscriptLine[] = [
      {
        id: 'demo-1',
        text: '今日の議題はプロダクトのローンチ準備です。',
        at: Date.now() - 4000,
      },
      {
        id: 'demo-2',
        text: 'ノイズキャンセルのデモを先に確認しましょう。',
        at: Date.now() - 2500,
      },
      {
        id: 'demo-3',
        text: '資料は金曜日までに共有します。デザインは田中さんが担当してください。',
        at: Date.now() - 800,
      },
    ]
    setLines(demo)
    setInterim('')
    setError(null)
  }, [])

  useEffect(() => {
    return () => {
      activeRef.current = false
      teardownRecognition()
      teardownAudio()
    }
  }, [teardownAudio, teardownRecognition])

  const state: VoiceStudioState = {
    active,
    noiseCancellation,
    listening,
    interim,
    lines,
    error,
    level,
    speechSupported,
  }

  return {
    ...state,
    start,
    stop,
    toggleNoiseCancellation,
    clearTranscript,
    injectDemoLines,
  }
}
