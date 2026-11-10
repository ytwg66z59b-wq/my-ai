export type KokoroWord = {
  id: string
  title: string
  reading: string
  body: string
}

export const KOKORO_WORDS: readonly KokoroWord[] = [
  {
    id: 'seimeishin',
    title: '清明心',
    reading: 'せいめいしん',
    body: '心を清らかに保ち、明るく正直に生きることを大切にする考え方。',
  },
  {
    id: 'kansha',
    title: '感謝の心',
    reading: 'かんしゃのこころ',
    body: '当たり前だと思っている日常や、自然の恵み、人との出会いに感謝する。',
  },
  {
    id: 'shizen',
    title: '自然への敬意',
    reading: 'しぜんへのけいい',
    body: '山や海、森など、自然の中に神々の働きを感じ、自然を大切にする。',
  },
  {
    id: 'makoto',
    title: '誠',
    reading: 'まこと',
    body: 'うそや偽りを避け、自分の心に正直に、誠実に生きる。',
  },
  {
    id: 'harai',
    title: '祓い',
    reading: 'はらい',
    body: '心身の穢れ（けがれ）を祓い、清らかな状態を取り戻すことを大切にする。',
  },
  {
    id: 'wa',
    title: '和',
    reading: 'わ',
    body: '人との調和を大切にし、互いを尊重しながら生きる。',
  },
  {
    id: 'nakaima',
    title: '中今',
    reading: 'なかいま',
    body: '過去にとらわれすぎず、未来を心配しすぎず、今この瞬間を大切にするという考え方。',
  },
] as const

/** Fisher–Yates shuffle. Returns a new array; does not mutate input. */
export function shuffleWords(words: readonly KokoroWord[]): KokoroWord[] {
  const next = [...words]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}
