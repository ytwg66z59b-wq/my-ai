import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { scaledSize } from './extractFrames'

describe('scaledSize', () => {
  it('keeps size when under the cap', () => {
    assert.deepEqual(scaledSize(1280, 720, 1280), { width: 1280, height: 720 })
  })

  it('scales 4K down to long-edge cap', () => {
    assert.deepEqual(scaledSize(3840, 2160, 1280), { width: 1280, height: 720 })
  })
})
