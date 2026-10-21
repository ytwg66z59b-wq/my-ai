import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { buildMeetingNotes } from './meetingNotes'

describe('buildMeetingNotes', () => {
  it('returns empty guidance when there is no transcript', () => {
    const notes = buildMeetingNotes([])
    assert.match(notes.summary, /まだ会話がありません/)
    assert.equal(notes.keyPoints.length, 0)
    assert.equal(notes.actionItems.length, 0)
  })

  it('extracts action-like sentences', () => {
    const notes = buildMeetingNotes([
      { id: '1', text: '今日はローンチ計画を確認しました。', at: 0 },
      { id: '2', text: 'デザインは田中さんが担当してください。', at: 1 },
      { id: '3', text: '来週までに資料を共有します。', at: 2 },
    ])
    assert.ok(notes.actionItems.length >= 1)
    assert.ok(notes.actionItems.some((a) => /担当|共有/.test(a)))
    assert.match(notes.summary, /会議のポイント/)
  })
})
