import { useGame } from '../state/GameContext'
import './QuoteModal.css'

export function QuoteModal() {
  const { pendingQuote, dismissQuote } = useGame()
  if (!pendingQuote) return null

  return (
    <div className="quote-overlay" role="dialog" aria-modal="true" aria-labelledby="quote-title">
      <div className="quote-card">
        <p className="quote-kicker" id="quote-title">
          今日の名言
        </p>
        <blockquote className="quote-text">「{pendingQuote.text}」</blockquote>
        <p className="quote-speaker">— {pendingQuote.speaker}</p>
        <button type="button" className="btn btn-primary quote-close" onClick={dismissQuote}>
          はじめる
        </button>
      </div>
    </div>
  )
}
