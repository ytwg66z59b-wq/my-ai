import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { pickQuote } from './quotes'

describe('pickQuote', () => {
  it('avoids recent quote ids when pool remains', () => {
    const recent = ['quote_001', 'quote_002', 'quote_003', 'quote_004', 'quote_005']
    // Always pick first available after filter — use rng that returns 0
    const { quote, nextRecentIds } = pickQuote(recent, () => 0)
    assert.ok(!recent.includes(quote.id))
    assert.equal(nextRecentIds[0], quote.id)
  })

  it('falls back when all quotes are recent', () => {
    const allRecent = Array.from({ length: 20 }, (_, i) => `quote_${String(i + 1).padStart(3, '0')}`)
    const { quote } = pickQuote(allRecent, () => 0)
    assert.ok(quote.id)
  })
})
