import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { estimateFrameCount, formatDuration, frameTimestamps } from './frameTimes'

describe('frameTimestamps', () => {
  it('steps every 0.3s until duration', () => {
    assert.deepEqual(frameTimestamps(1.2, 0.3), [0, 0.3, 0.6, 0.9])
    assert.deepEqual(frameTimestamps(0.9, 0.3), [0, 0.3, 0.6])
    assert.deepEqual(frameTimestamps(0.3, 0.3), [0])
  })

  it('returns empty for invalid inputs', () => {
    assert.deepEqual(frameTimestamps(0, 0.3), [])
    assert.deepEqual(frameTimestamps(-1, 0.3), [])
    assert.deepEqual(frameTimestamps(1, 0), [])
    assert.deepEqual(frameTimestamps(Number.NaN, 0.3), [])
  })

  it('estimates frame count', () => {
    assert.equal(estimateFrameCount(1.2, 0.3), 4)
    assert.equal(estimateFrameCount(3.0, 0.3), 10)
  })

  it('formats duration', () => {
    assert.equal(formatDuration(1.2), '1.2秒')
    assert.equal(formatDuration(65.5), '1分5.5秒')
  })
})
