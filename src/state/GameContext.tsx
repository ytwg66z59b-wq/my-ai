import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { AppState, EffortEvent, Quote, ScreenId } from '../types/models'
import { createInitialState } from '../lib/initialState'
import {
  getTodayCount,
  processEffortTap,
  setActiveCreature,
  syncDisplayedDate,
} from '../lib/effort'
import { pickQuote } from '../lib/quotes'
import { exportState, importState } from '../lib/backup'
import { loadAppState, saveAppState } from '../storage/db'

interface GameContextValue {
  ready: boolean
  state: AppState
  screen: ScreenId
  setScreen: (s: ScreenId) => void
  detailCreatureId: string | null
  openDetail: (id: string) => void
  todayCount: number
  lastEvents: EffortEvent[]
  reactionKey: number
  pendingQuote: Quote | null
  dismissQuote: () => void
  evolutionEvent: EffortEvent | null
  dismissEvolution: () => void
  toast: string | null
  effortTap: () => void
  selectCreature: (id: string) => void
  exportBackup: () => string
  importBackup: (json: string) => void
  resetAll: () => Promise<void>
  error: string | null
  clearError: () => void
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [state, setState] = useState<AppState>(() => createInitialState())
  const [screen, setScreen] = useState<ScreenId>('home')
  const [detailCreatureId, setDetailCreatureId] = useState<string | null>(null)
  const [lastEvents, setLastEvents] = useState<EffortEvent[]>([])
  const [reactionKey, setReactionKey] = useState(0)
  const [pendingQuote, setPendingQuote] = useState<Quote | null>(null)
  const [evolutionEvent, setEvolutionEvent] = useState<EffortEvent | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const processingRef = useRef(false)
  const lastActionIdRef = useRef<string | null>(null)
  const quoteShownRef = useRef(false)
  const persistTimer = useRef<number | null>(null)
  const stateRef = useRef(state)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const loaded = await loadAppState()
        if (cancelled) return
        const base = loaded ?? createInitialState()
        const synced = syncDisplayedDate(base)

        if (!quoteShownRef.current) {
          const { quote, nextRecentIds } = pickQuote(synced.quotes.recentQuoteIds)
          quoteShownRef.current = true
          setPendingQuote(quote)
          setState({
            ...synced,
            quotes: { recentQuoteIds: nextRecentIds },
          })
        } else {
          setState(synced)
        }
      } catch (e) {
        console.error(e)
        if (!cancelled) {
          setError('データの読み込みに失敗しました。初期状態で開始します。')
          setState(createInitialState())
        }
      } finally {
        if (!cancelled) setReady(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!ready) return
    if (persistTimer.current) window.clearTimeout(persistTimer.current)
    persistTimer.current = window.setTimeout(() => {
      saveAppState(state).catch((e) => {
        console.error(e)
        setError('保存に失敗しました')
      })
    }, 200)
    return () => {
      if (persistTimer.current) window.clearTimeout(persistTimer.current)
    }
  }, [state, ready])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 2200)
    return () => window.clearTimeout(t)
  }, [toast])

  const effortTap = useCallback(() => {
    if (processingRef.current) return
    processingRef.current = true
    try {
      const result = processEffortTap(stateRef.current)
      if (lastActionIdRef.current === result.actionId) return
      lastActionIdRef.current = result.actionId
      stateRef.current = result.state
      setState(result.state)
      setLastEvents(result.events)
      setReactionKey((k) => k + 1)

      const evo = result.events.find((e) => e.kind === 'hatch' || e.kind === 'evolve')
      if (evo) setEvolutionEvent(evo)
      const egg = result.events.find((e) => e.kind === 'egg_granted')
      if (egg?.message) setToast(egg.message)
    } finally {
      // Allow next tap on next frame (prevents double-fire from same event)
      requestAnimationFrame(() => {
        processingRef.current = false
      })
    }
  }, [])

  const dismissQuote = useCallback(() => setPendingQuote(null), [])
  const dismissEvolution = useCallback(() => setEvolutionEvent(null), [])

  const selectCreature = useCallback((id: string) => {
    setState((s) => setActiveCreature(s, id))
    setScreen('home')
  }, [])

  const openDetail = useCallback((id: string) => {
    setDetailCreatureId(id)
    setScreen('detail')
  }, [])

  const exportBackup = useCallback(() => exportState(state), [state])

  const importBackup = useCallback((json: string) => {
    try {
      const imported = importState(json)
      setState(syncDisplayedDate(imported))
      setToast('バックアップを復元しました')
      setScreen('home')
    } catch (e) {
      setError(e instanceof Error ? e.message : '復元に失敗しました')
    }
  }, [])

  const resetAll = useCallback(async () => {
    const fresh = createInitialState()
    setState(fresh)
    await saveAppState(fresh)
    setToast('データを初期化しました')
    setScreen('home')
  }, [])

  const value = useMemo<GameContextValue>(
    () => ({
      ready,
      state,
      screen,
      setScreen,
      detailCreatureId,
      openDetail,
      todayCount: getTodayCount(state),
      lastEvents,
      reactionKey,
      pendingQuote,
      dismissQuote,
      evolutionEvent,
      dismissEvolution,
      toast,
      effortTap,
      selectCreature,
      exportBackup,
      importBackup,
      resetAll,
      error,
      clearError: () => setError(null),
    }),
    [
      ready,
      state,
      screen,
      detailCreatureId,
      openDetail,
      lastEvents,
      reactionKey,
      pendingQuote,
      dismissQuote,
      evolutionEvent,
      dismissEvolution,
      toast,
      effortTap,
      selectCreature,
      exportBackup,
      importBackup,
      resetAll,
      error,
    ],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}
