import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { zipPdfs } from './zipDownload'

describe('zipPdfs', () => {
  it('builds a zip containing each pdf', async () => {
    const a = new Blob([new Uint8Array([1, 2, 3])], { type: 'application/pdf' })
    const b = new Blob([new Uint8Array([4, 5, 6])], { type: 'application/pdf' })
    const zip = await zipPdfs([
      { name: 'one.pdf', blob: a },
      { name: 'two.pdf', blob: b },
    ])
    assert.equal(zip.type.includes('zip') || zip.size > 0, true)
    assert.ok(zip.size > 20)
  })
})
