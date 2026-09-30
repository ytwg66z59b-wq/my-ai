import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { countChars, splitText } from '../src/splitText.ts'

describe('splitText', () => {
  it('hard-splits when there is no natural break', () => {
    assert.deepEqual(splitText('あいうえおかきくけこ', 5), [
      'あいうえお',
      'かきくけこ',
    ])
  })

  it('cuts early at 。 within the limit (user example)', () => {
    // 8文字設定でも「よろしく。」は区切りが良いので5文字で切る
    assert.deepEqual(splitText('よろしく。ありがとう。', 8), [
      'よろしく。',
      'ありがとう。',
    ])
  })

  it('prefers 。 over filling to the max length', () => {
    assert.deepEqual(splitText('これはテストです。つぎの文です。', 10), [
      'これはテストです。',
      'つぎの文です。',
    ])
  })

  it('falls back to 、 when there is no 。 in range', () => {
    assert.deepEqual(splitText('こんにちは、ありがとうね', 8), [
      'こんにちは、',
      'ありがとうね',
    ])
  })

  it('prefers strong break over earlier medium break in the same window', () => {
    // window of 8: 「はい、よろ。」 — ends with 。 at 6? はい、よろしく。 = はいい、よろしく。 
    // は+い+、+よ+ろ+し+く+。 = 8, ends with 。
    assert.deepEqual(splitText('はい、よろしく。つづき', 8), [
      'はい、よろしく。',
      'つづき',
    ])
  })

  it('removes newlines before splitting', () => {
    assert.deepEqual(splitText('あい\nうえお', 2), ['あい', 'うえ', 'お'])
  })

  it('returns empty for blank or newline-only input', () => {
    assert.deepEqual(splitText('', 4), [])
    assert.deepEqual(splitText('\n\r\n', 4), [])
  })

  it('preserves spaces and can break on them within the limit', () => {
    // window "ab cd" → soft break after the space → "ab "
    assert.deepEqual(splitText('ab cd ef', 5), ['ab ', 'cd ef'])
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
