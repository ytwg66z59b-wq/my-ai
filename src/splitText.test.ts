import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { countChars, splitText } from '../src/splitText.ts'

describe('splitText', () => {
  it('splits by character count', () => {
    assert.deepEqual(splitText('あいうえおかきくけこ', 5), [
      'あいうえお',
      'かきくけこ',
    ])
  })

  it('removes newlines before splitting', () => {
    assert.deepEqual(splitText('あい\nうえお', 2), ['あい', 'うえ', 'お'])
  })

  it('returns empty for blank or newline-only input', () => {
    assert.deepEqual(splitText('', 4), [])
    assert.deepEqual(splitText('\n\r\n', 4), [])
  })

  it('preserves spaces as characters', () => {
    assert.deepEqual(splitText('  ab', 2), ['  ', 'ab'])
  })

  it('handles remainder lines', () => {
    assert.deepEqual(splitText('あいうえ', 3), ['あいう', 'え'])
  })
})

describe('countChars', () => {
  it('counts without newlines', () => {
    assert.equal(countChars('あい\nうえ'), 4)
  })
})
