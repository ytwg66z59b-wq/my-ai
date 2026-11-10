import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { KOKORO_WORDS, shuffleWords } from './words.ts'

describe('KOKORO_WORDS', () => {
  it('has seven shrine words', () => {
    assert.equal(KOKORO_WORDS.length, 7)
  })

  it('each word has title, reading, and body', () => {
    for (const word of KOKORO_WORDS) {
      assert.ok(word.title.length > 0)
      assert.ok(word.reading.length > 0)
      assert.ok(word.body.length > 0)
    }
  })
})

describe('shuffleWords', () => {
  it('returns a new array of the same length', () => {
    const shuffled = shuffleWords(KOKORO_WORDS)
    assert.notEqual(shuffled, KOKORO_WORDS)
    assert.equal(shuffled.length, KOKORO_WORDS.length)
  })

  it('keeps the same set of ids', () => {
    const original = new Set(KOKORO_WORDS.map((w) => w.id))
    const shuffled = new Set(shuffleWords(KOKORO_WORDS).map((w) => w.id))
    assert.deepEqual(shuffled, original)
  })

  it('does not mutate the source array', () => {
    const before = KOKORO_WORDS.map((w) => w.id)
    shuffleWords(KOKORO_WORDS)
    assert.deepEqual(
      KOKORO_WORDS.map((w) => w.id),
      before,
    )
  })
})
