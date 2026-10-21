export type TranscriptLine = {
  id: string
  text: string
  at: number
}

export type MeetingNotes = {
  summary: string
  keyPoints: string[]
  actionItems: string[]
}

const ACTION_HINTS =
  /(お願い|します|してください|担当|宿題|フォロー|共有|送る|送って|確認|TODO|todo|action|will |need to|let'?s )/i

function normalize(text: string) {
  return text.replace(/\s+/g, ' ').trim()
}

function sentenceSplit(text: string): string[] {
  return text
    .split(/(?<=[。！？!?])\s*|(?<=[.!?])\s+/)
    .map(normalize)
    .filter((s) => s.length >= 6)
}

/** Build lightweight meeting notes from a live transcript (client-side heuristic). */
export function buildMeetingNotes(lines: TranscriptLine[]): MeetingNotes {
  const joined = normalize(lines.map((l) => l.text).join(' '))
  if (!joined) {
    return {
      summary: 'まだ会話がありません。マイクをオンにして話し始めると、ノートが生成されます。',
      keyPoints: [],
      actionItems: [],
    }
  }

  const sentences = sentenceSplit(joined)
  const actionItems = sentences.filter((s) => ACTION_HINTS.test(s)).slice(0, 5)

  const keyPoints = sentences
    .filter((s) => !actionItems.includes(s))
    .sort((a, b) => b.length - a.length)
    .slice(0, 4)

  const summarySource = keyPoints[0] ?? sentences[0] ?? joined
  const summary =
    summarySource.length > 120 ? `${summarySource.slice(0, 117)}…` : summarySource

  return {
    summary: `会議のポイント: ${summary}`,
    keyPoints: keyPoints.length > 0 ? keyPoints : [joined.slice(0, 100)],
    actionItems,
  }
}
