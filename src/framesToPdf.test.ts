import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { defaultPdfName } from './framesToPdf'

describe('defaultPdfName', () => {
  it('replaces extension with interval suffix', () => {
    assert.equal(defaultPdfName('clip.mp4'), 'clip_0.3s.pdf')
    assert.equal(defaultPdfName('my.movie.webm'), 'my.movie_0.3s.pdf')
    assert.equal(defaultPdfName('noext'), 'noext_0.3s.pdf')
  })
})
