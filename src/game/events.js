import { applyAnnualIncome, applyDelta, chance, pick, PARTNER_NAMES, randInt } from './state.js';

/**
 * @typedef {Object} Choice
 * @property {string} id
 * @property {string} label
 * @property {(state: any) => { delta?: object, set?: object, log?: string, important?: boolean, flagUpdates?: object }} effect
 */

/**
 * @typedef {Object} GameEvent
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {Choice[]} choices
 * @property {boolean} [story]
 */

function partnerPool(gender) {
  return PARTNER_NAMES[gender] || PARTNER_NAMES.other;
}

/** Story / path events by age and flags */
export function buildYearEvents(state) {
  const events = [];
  const age = state.age;
  const f = state.flags;

  // === Age 18: career path (mandatory first year) ===
  if (age === 18 && !f.path18) {
    events.push({
      id: 'path_18',
      story: true,
      title: '進路の決断',
      description: '高校卒業後の進路を決める時期になった。これからの人生を大きく左右する選択だ。',
      choices: [
        {
          id: 'uni',
          label: '大学へ進学する',
          effect: () => ({
            delta: { money: -300000, ability: 10, relationships: 5, work: 3, happiness: 3 },
            set: { job: '学生' },
            flagUpdates: { path18: 'university' },
            log: '大学進学を選択した',
            important: true,
          }),
        },
        {
          id: 'job',
          label: '就職する',
          effect: () => ({
            delta: { money: 500000, work: 10, ability: 5, happiness: 2 },
            set: { job: '会社員' },
            flagUpdates: { path18: 'job' },
            log: '就職を選択した',
            important: true,
          }),
        },
        {
          id: 'startup',
          label: '起業する',
          effect: () => ({
            delta: {
              money: -500000,
              work: 15,
              ability: 10,
              happiness: chance(0.5) ? 10 : -10,
            },
            set: { job: '経営者' },
            flagUpdates: { path18: 'startup', businessSuccess: 45 },
            log: '起業の道を選んだ',
            important: true,
          }),
        },
        {
          id: 'nothing',
          label: '何もしない',
          effect: () => ({
            delta: { happiness: -5, health: 5, money: -100000 },
            set: { job: '無職' },
            flagUpdates: { path18: 'free' },
            log: '進路を決めず、しばらく自由に過ごすことにした',
            important: true,
          }),
        },
      ],
    });
  }

  // University graduation at 22
  if (age === 22 && f.path18 === 'university' && !f.graduated) {
    events.push({
      id: 'grad_22',
      story: true,
      title: '大学卒業',
      description: '大学生活が終わりを迎えた。次は社会人としての一歩だ。',
      choices: [
        {
          id: 'corp',
          label: '企業に就職する',
          effect: () => ({
            delta: { work: 15, money: 400000, ability: 5, happiness: 5 },
            set: { job: '会社員' },
            flagUpdates: { graduated: true },
            log: '大学を卒業し、企業に就職した',
            important: true,
          }),
        },
        {
          id: 'free',
          label: 'フリーランスになる',
          effect: () => ({
            delta: { work: 8, ability: 12, money: -100000, happiness: 3 },
            set: { job: 'フリーランス' },
            flagUpdates: { graduated: true },
            log: '大学を卒業し、フリーランスとして独立した',
            important: true,
          }),
        },
        {
          id: 'start',
          label: '起業する',
          effect: () => ({
            delta: { work: 12, ability: 8, money: -400000, happiness: chance(0.55) ? 8 : -5 },
            set: { job: '経営者' },
            flagUpdates: { graduated: true, businessSuccess: 50 },
            log: '大学を卒業し、起業した',
            important: true,
          }),
        },
      ],
    });
  }

  // Job path promotions / career
  if (f.path18 === 'job' && state.job === '会社員' && age >= 19 && age <= 29) {
    if (age === 21 || age === 25 || age === 28) {
      events.push(promotionEvent(state));
    }
  }

  // Startup path events
  if ((f.path18 === 'startup' || state.job === '経営者') && age >= 19 && state.job === '経営者') {
    if (age === 19 || age === 23 || age === 27) {
      events.push(businessEvent(state));
    }
  }

  // Free path catch-up
  if (f.path18 === 'free' && age === 20 && state.job === '無職') {
    events.push({
      id: 'free_catchup',
      story: true,
      title: 'そろそろ動くとき',
      description: '周囲が進路を固める中、自分も何か始めなければ、という焦りが湧いてきた。',
      choices: [
        {
          id: 'job',
          label: 'アルバイトから正社員を目指す',
          effect: () => ({
            delta: { work: 12, money: 300000, ability: 5 },
            set: { job: '会社員' },
            log: '働き始め、正社員を目指すことにした',
            important: true,
          }),
        },
        {
          id: 'skill',
          label: 'スキルを磨いてフリーに',
          effect: () => ({
            delta: { ability: 15, work: 5, money: -50000 },
            set: { job: 'フリーランス' },
            log: '独学でスキルを磨き、フリーランスになった',
            important: true,
          }),
        },
        {
          id: 'still',
          label: 'もう少し考える',
          effect: () => ({
            delta: { happiness: -8, health: 3 },
            log: 'まだ決断できず、模索を続けた',
          }),
        },
      ],
    });
  }

  // Romance story beats
  if (age >= 20 && age <= 29 && state.romance === '独身' && chance(age === 20 ? 0.85 : 0.35)) {
    events.push(romanceMeetEvent(state));
  }
  if (state.romance === '恋人あり' && age >= 24 && chance(0.4)) {
    events.push(romanceDeepenEvent(state));
  }
  if (state.romance === '婚約' && age >= 26 && chance(0.55)) {
    events.push(marriageEvent(state));
  }
  if ((state.romance === '恋人あり' || state.romance === '婚約') && chance(0.12)) {
    events.push(romanceTroubleEvent(state));
  }

  // Student life mid events
  if (state.job === '学生' && age >= 19 && age <= 21 && chance(0.55)) {
    events.push(studentEvent(state));
  }

  // Random events (1-2 extra)
  const randomPool = buildRandomPool(state);
  const shuffled = [...randomPool].sort(() => Math.random() - 0.5);
  const need = Math.max(0, randInt(1, 3) - events.length);
  for (let i = 0; i < need && i < shuffled.length; i++) {
    const ev = shuffled[i];
    if (!f.usedEvents.has(ev.id) || ev.repeatable) {
      events.push(ev);
    }
  }

  // Ensure at least one event per year
  if (events.length === 0) {
    events.push(quietYearEvent(state));
  }

  // Cap at 3
  return events.slice(0, 3);
}

function promotionEvent(state) {
  return {
    id: `promo_${state.age}`,
    story: true,
    title: '昇進のチャンス',
    description: '上司から「もっと責任のあるポジションを任せたい」と声をかけられた。',
    choices: [
      {
        id: 'yes',
        label: '引き受けて昇進する',
        effect: (s) => ({
          delta: { work: 12, money: 300000, ability: 5, happiness: 5, health: -5 },
          flagUpdates: { promotionCount: (s.flags.promotionCount || 0) + 1 },
          log: '昇進を受け入れた',
          important: true,
        }),
      },
      {
        id: 'no',
        label: '今のペースを守る',
        effect: () => ({
          delta: { happiness: 3, health: 5, work: -3 },
          log: '昇進を断り、今の働き方を続けた',
        }),
      },
      {
        id: 'switch',
        label: 'この機に転職を考える',
        effect: () => ({
          delta: { work: 5, money: chance(0.5) ? 200000 : -100000, relationships: -5, ability: 5 },
          set: { job: chance(0.3) ? 'フリーランス' : '会社員' },
          log: '転職活動を始めた',
          important: true,
        }),
      },
    ],
  };
}

function businessEvent(state) {
  const success = state.flags.businessSuccess;
  const roll = Math.random();
  if (roll < 0.34) {
    return {
      id: `biz_success_${state.age}`,
      story: true,
      title: '事業が伸びている',
      description: '新しい顧客が増え、売上が好調だ。拡大のチャンスかもしれない。',
      choices: [
        {
          id: 'expand',
          label: '事業を拡大する',
          effect: (s) => ({
            delta: { money: -400000, work: 10, ability: 8, happiness: 8 },
            flagUpdates: { businessSuccess: Math.min(100, s.flags.businessSuccess + 15) },
            log: '事業拡大に踏み切った',
            important: true,
          }),
        },
        {
          id: 'steady',
          label: '堅実に運用する',
          effect: (s) => ({
            delta: { money: 500000, work: 5, happiness: 3 },
            flagUpdates: { businessSuccess: Math.min(100, s.flags.businessSuccess + 5) },
            log: '好調な事業を堅実に守った',
          }),
        },
      ],
    };
  }
  if (roll < 0.67) {
    return {
      id: `biz_money_${state.age}`,
      story: true,
      title: '資金不足',
      description: 'キャッシュフローが厳しくなってきた。どう切り抜ける？',
      choices: [
        {
          id: 'loan',
          label: '融資を受ける',
          effect: (s) => ({
            delta: { money: 800000, work: 3, happiness: -5 },
            flagUpdates: { businessSuccess: Math.max(0, s.flags.businessSuccess - 5) },
            log: '融資を受けて事業を立て直した',
            important: true,
          }),
        },
        {
          id: 'cut',
          label: 'コストを削減する',
          effect: (s) => ({
            delta: { money: 200000, work: -5, health: -5, happiness: -3 },
            flagUpdates: { businessSuccess: Math.max(0, s.flags.businessSuccess - 3) },
            log: '大幅なコスト削減で耐えしのいだ',
          }),
        },
        {
          id: 'pivot',
          label: '事業内容を見直す',
          effect: (s) => ({
            delta: { ability: 10, money: -100000, work: 5 },
            flagUpdates: { businessSuccess: Math.min(100, s.flags.businessSuccess + 8) },
            log: '事業の方向性を見直した',
            important: true,
          }),
        },
      ],
    };
  }
  return {
    id: `biz_partner_${state.age}`,
    story: true,
    title: '共同経営者とのトラブル',
    description: '方針の違いから、共同経営者と対立してしまった。',
    choices: [
      {
        id: 'talk',
        label: '対話で解決を目指す',
        effect: (s) => ({
          delta: {
            relationships: 10,
            happiness: s.stats.relationships >= 50 ? 5 : -5,
            work: 3,
          },
          flagUpdates: {
            businessSuccess: Math.min(
              100,
              s.flags.businessSuccess + (s.stats.relationships >= 50 ? 5 : -5)
            ),
          },
          log: '共同経営者と話し合い、関係修復を試みた',
        }),
      },
      {
        id: 'solo',
        label: '一人で続ける',
        effect: (s) => ({
          delta: { work: 8, relationships: -10, happiness: -5, ability: 5 },
          flagUpdates: { businessSuccess: Math.max(0, s.flags.businessSuccess - 8) },
          log: '共同経営者と別れ、一人で事業を続けた',
          important: true,
        }),
      },
      {
        id: 'quit',
        label: '事業を畳んで就職する',
        effect: () => ({
          delta: { money: -200000, happiness: -8, work: -5, health: 5 },
          set: { job: '会社員' },
          flagUpdates: { businessSuccess: 30 },
          log: '事業を畳み、会社員に転じた',
          important: true,
        }),
      },
    ],
  };
}

function romanceMeetEvent(state) {
  const name = pick(partnerPool(state.gender));
  const social = state.stats.relationships;
  const love = state.stats.love;
  return {
    id: `romance_meet_${state.age}_${randInt(1, 999)}`,
    story: true,
    title: '新しい出会い',
    description: pick([
      `友人から紹介された${name}さんと出会った。`,
      `趣味の場で${name}さんと意気投合した。`,
      `仕事関係で${name}さんと知り合いになった。`,
    ]),
    choices: [
      {
        id: 'active',
        label: '積極的に話す',
        effect: (s) => {
          const success = social >= 40 || love >= 45 || chance(0.45 + social * 0.004);
          if (success) {
            return {
              delta: { love: 15, relationships: 8, happiness: 12 },
              set: { romance: '恋人あり' },
              flagUpdates: { hasPartner: true, partnerName: name },
              log: `${name}さんと恋人になった`,
              important: true,
            };
          }
          return {
            delta: { love: 3, relationships: 2, happiness: -3 },
            log: `${name}さんに積極的に話しかけたが、友人止まりだった`,
          };
        },
      },
      {
        id: 'friend',
        label: '友達として付き合う',
        effect: () => ({
          delta: { relationships: 10, love: 5, happiness: 4 },
          log: `${name}さんと友人として仲良くなった`,
        }),
      },
      {
        id: 'distance',
        label: '距離を置く',
        effect: () => ({
          delta: { love: -2, relationships: -3 },
          log: '新しい出会いから距離を置いた',
        }),
      },
    ],
  };
}

function romanceDeepenEvent(state) {
  const name = state.flags.partnerName || '恋人';
  return {
    id: `romance_deep_${state.age}`,
    story: true,
    title: '関係を深める',
    description: `${name}さんとの関係が、次のステージに進みそうだ。`,
    choices: [
      {
        id: 'engage',
        label: '将来の話をする（婚約へ）',
        effect: (s) => {
          const ok = s.stats.love >= 50 && s.stats.happiness >= 40;
          if (ok || chance(0.4)) {
            return {
              delta: { love: 12, happiness: 15, money: -200000 },
              set: { romance: '婚約' },
              log: `${name}さんと婚約した`,
              important: true,
            };
          }
          return {
            delta: { love: -5, happiness: -8 },
            log: '将来の話は少し早すぎたようだ',
          };
        },
      },
      {
        id: 'trip',
        label: '二人で旅行する',
        effect: () => ({
          delta: { love: 10, happiness: 10, money: -150000, health: 3 },
          log: `${name}さんと旅行を楽しんだ`,
        }),
      },
      {
        id: 'pace',
        label: '今のままを大切にする',
        effect: () => ({
          delta: { love: 3, happiness: 3 },
          log: '恋人との今の関係を大切にした',
        }),
      },
    ],
  };
}

function marriageEvent(state) {
  const name = state.flags.partnerName || 'パートナー';
  return {
    id: `marry_${state.age}`,
    story: true,
    title: '結婚の決断',
    description: `${name}さんとの結婚について、真剣に考える時期が来た。`,
    choices: [
      {
        id: 'yes',
        label: '結婚する',
        effect: () => ({
          delta: { love: 15, happiness: 20, money: -800000, relationships: 10 },
          set: { romance: '結婚' },
          log: `${name}さんと結婚した`,
          important: true,
        }),
      },
      {
        id: 'wait',
        label: 'もう少し待つ',
        effect: () => ({
          delta: { love: -3, happiness: -2 },
          log: '結婚はもう少し先に延ばした',
        }),
      },
    ],
  };
}

function romanceTroubleEvent(state) {
  const name = state.flags.partnerName || '恋人';
  return {
    id: `romance_trouble_${state.age}`,
    title: '関係の危機',
    description: `${name}さんとの間に、すれ違いが生まれている。`,
    choices: [
      {
        id: 'talk',
        label: '素直に話し合う',
        effect: (s) => {
          if (s.stats.relationships >= 45 || chance(0.55)) {
            return {
              delta: { love: 8, relationships: 5, happiness: 5 },
              log: `${name}さんと話し合い、関係を修復した`,
            };
          }
          return {
            delta: { love: -15, happiness: -12, relationships: -5 },
            set: { romance: '独身' },
            flagUpdates: { hasPartner: false, partnerName: null },
            log: `${name}さんと別れた`,
            important: true,
          };
        },
      },
      {
        id: 'space',
        label: '少し距離を置く',
        effect: () => ({
          delta: { love: -5, happiness: -3, health: 2 },
          log: '関係を冷却期間に置いた',
        }),
      },
      {
        id: 'end',
        label: '別れを切り出す',
        effect: () => ({
          delta: { love: -20, happiness: -15, health: -5 },
          set: { romance: '独身' },
          flagUpdates: { hasPartner: false, partnerName: null },
          log: `${name}さんと別れることを選んだ`,
          important: true,
        }),
      },
    ],
  };
}

function studentEvent() {
  return {
    id: `student_${randInt(1, 9999)}`,
    title: 'キャンパスライフ',
    description: pick([
      'ゼミの発表が近づいている。どう過ごす？',
      'サークルの勧誘シーズンだ。',
      '長期休暇の使い方を考えている。',
    ]),
    choices: [
      {
        id: 'study',
        label: '勉強に集中する',
        effect: () => ({
          delta: { ability: 10, relationships: -3, happiness: -2 },
          log: '学業に打ち込んだ',
        }),
      },
      {
        id: 'social',
        label: '友人との時間を大切に',
        effect: () => ({
          delta: { relationships: 10, happiness: 8, love: 3, ability: -3 },
          log: '友人との時間を楽しんだ',
        }),
      },
      {
        id: 'arbeit',
        label: 'アルバイトを増やす',
        effect: () => ({
          delta: { money: 250000, work: 5, health: -5, ability: -2 },
          log: 'アルバイトを頑張って稼いだ',
        }),
      },
    ],
  };
}

function quietYearEvent() {
  return {
    id: `quiet_${randInt(1, 9999)}`,
    title: '穏やかな一年',
    description: '大きな出来事はないが、日常の選択が未来をつくる。',
    choices: [
      {
        id: 'health',
        label: '健康に気を使う',
        effect: () => ({
          delta: { health: 10, happiness: 3, money: -50000 },
          log: '健康管理を意識して過ごした',
        }),
      },
      {
        id: 'skill',
        label: '新しいスキルを学ぶ',
        effect: () => ({
          delta: { ability: 8, money: -80000, work: 3 },
          log: '新しいスキルの学習に時間を使った',
        }),
      },
      {
        id: 'rest',
        label: 'のんびり過ごす',
        effect: () => ({
          delta: { happiness: 8, health: 5, work: -3 },
          log: 'のんびりと一年を過ごした',
        }),
      },
    ],
  };
}

function buildRandomPool(state) {
  /** @type {GameEvent[]} */
  const pool = [
    {
      id: 'windfall',
      repeatable: true,
      title: '臨時収入',
      description: '思わぬところから臨時収入が入ってきた！',
      choices: [
        {
          id: 'save',
          label: '貯金する',
          effect: () => ({
            delta: { money: randInt(100000, 500000), happiness: 5 },
            log: '臨時収入を貯金した',
          }),
        },
        {
          id: 'enjoy',
          label: '自分にご褒美',
          effect: () => ({
            delta: { money: randInt(50000, 200000), happiness: 12, health: 2 },
            log: '臨時収入で自分にご褒美をあげた',
          }),
        },
        {
          id: 'invest',
          label: '自己投資する',
          effect: () => ({
            delta: { money: randInt(0, 150000), ability: 8, work: 3 },
            log: '臨時収入を自己投資に回した',
          }),
        },
      ],
    },
    {
      id: 'travel',
      repeatable: true,
      title: '旅行の誘い',
      description: '友人から旅行に誘われた。行ってみる？',
      choices: [
        {
          id: 'go',
          label: '行く！',
          effect: () => ({
            delta: { money: -200000, happiness: 15, relationships: 8, health: 5 },
            log: '友人と旅行を楽しんだ',
          }),
        },
        {
          id: 'cheap',
          label: '近場で済ませる',
          effect: () => ({
            delta: { money: -50000, happiness: 6, relationships: 3 },
            log: '近場の小旅行を楽しんだ',
          }),
        },
        {
          id: 'no',
          label: '見送る',
          effect: () => ({
            delta: { money: 0, happiness: -3, relationships: -2 },
            log: '旅行の誘いを見送った',
          }),
        },
      ],
    },
    {
      id: 'new_friend',
      repeatable: true,
      title: '新しい友人',
      description: '共通の趣味を持つ人と仲良くなった。',
      choices: [
        {
          id: 'deep',
          label: '積極的に交流する',
          effect: () => ({
            delta: { relationships: 12, happiness: 8, love: 2 },
            log: '新しい友人との交流を深めた',
          }),
        },
        {
          id: 'mild',
          label: 'ほどよい距離感で',
          effect: () => ({
            delta: { relationships: 5, happiness: 3 },
            log: '新しい友人とほどよい関係を築いた',
          }),
        },
      ],
    },
    {
      id: 'illness',
      repeatable: true,
      title: '体調を崩した',
      description: '熱が出て、しばらく安静が必要だ。',
      choices: [
        {
          id: 'rest',
          label: 'しっかり休む',
          effect: () => ({
            delta: { health: 8, money: -30000, work: -3, happiness: -2 },
            log: '体調を崩し、しっかり休んだ',
          }),
        },
        {
          id: 'push',
          label: '無理して働く',
          effect: () => ({
            delta: { health: -15, work: 3, money: 50000, happiness: -8 },
            log: '体調不良でも無理して働いた',
          }),
        },
      ],
    },
    {
      id: 'injury',
      repeatable: true,
      title: 'ちょっとした怪我',
      description: '不運にも軽い怪我をしてしまった。',
      choices: [
        {
          id: 'hospital',
          label: '病院でしっかり診てもらう',
          effect: () => ({
            delta: { health: 5, money: -80000, happiness: -3 },
            log: '怪我の治療に通った',
          }),
        },
        {
          id: 'home',
          label: '自宅で様子を見る',
          effect: () => ({
            delta: { health: -5, money: -10000, happiness: -5 },
            log: '怪我を自宅療養でしのいだ',
          }),
        },
      ],
    },
    {
      id: 'move',
      title: '引っ越し',
      description: '住環境を変えるチャンスだ。引っ越す？',
      choices: [
        {
          id: 'yes',
          label: '良い物件に引っ越す',
          effect: () => ({
            delta: { money: -400000, happiness: 12, health: 5 },
            flagUpdates: { movedOut: true },
            log: '新しい住まいへ引っ越した',
            important: true,
          }),
        },
        {
          id: 'share',
          label: 'シェアハウスにする',
          effect: () => ({
            delta: { money: -150000, relationships: 8, happiness: 5 },
            flagUpdates: { movedOut: true },
            log: 'シェアハウスに引っ越した',
          }),
        },
        {
          id: 'no',
          label: '今のまま',
          effect: () => ({
            delta: { happiness: -1 },
            log: '引っ越しは見送った',
          }),
        },
      ],
    },
    {
      id: 'hobby',
      title: '趣味との出会い',
      description: '新しい趣味にハマりそうだ。',
      choices: [
        {
          id: 'commit',
          label: '本格的に始める',
          effect: () => ({
            delta: { happiness: 12, ability: 5, money: -100000, relationships: 5 },
            flagUpdates: { hobby: true },
            log: '新しい趣味を本格的に始めた',
          }),
        },
        {
          id: 'casual',
          label: '気軽に楽しむ',
          effect: () => ({
            delta: { happiness: 6, money: -30000 },
            flagUpdates: { hobby: true },
            log: '新しい趣味を気軽に楽しんだ',
          }),
        },
      ],
    },
    {
      id: 'big_buy',
      repeatable: true,
      title: '大きな買い物',
      description: '欲しかった高額アイテムが目に入った。',
      choices: [
        {
          id: 'buy',
          label: '思い切って買う',
          effect: () => ({
            delta: { money: -randInt(200000, 600000), happiness: 10 },
            log: '大きな買い物をして気分が上がった',
          }),
        },
        {
          id: 'save',
          label: '我慢して貯金',
          effect: () => ({
            delta: { happiness: -2, ability: 2 },
            log: '大きな買い物を我慢した',
          }),
        },
      ],
    },
    {
      id: 'trouble',
      repeatable: true,
      title: '思わぬトラブル',
      description: pick([
        'スマホを壊してしまった。',
        '詐欺まがいの勧誘に遭った。',
        '大切な予定がドタキャンされた。',
      ]),
      choices: [
        {
          id: 'fix',
          label: '冷静に対処する',
          effect: (s) => ({
            delta: {
              money: -randInt(20000, 100000),
              happiness: -5,
              ability: s.personality === '真面目' ? 3 : 1,
            },
            log: 'トラブルに冷静に対処した',
          }),
        },
        {
          id: 'help',
          label: '友人に助けを求める',
          effect: () => ({
            delta: { relationships: 5, happiness: -3, money: -30000 },
            log: 'トラブルを友人の助けで乗り越えた',
          }),
        },
      ],
    },
  ];

  if (state.job === '会社員' || state.job === 'フリーランス') {
    pool.push({
      id: `career_change_${state.age}`,
      repeatable: true,
      title: 'キャリアの岐路',
      description: '今の働き方を見直すタイミングかもしれない。',
      choices: [
        {
          id: 'stay',
          label: '今の道を極める',
          effect: () => ({
            delta: { work: 8, ability: 5 },
            log: '今のキャリアを深めることにした',
          }),
        },
        {
          id: 'side',
          label: '副業を始める',
          effect: () => ({
            delta: { money: 100000, work: 3, health: -5, ability: 5 },
            flagUpdates: { sideJob: true },
            log: '副業を始めた',
            important: true,
          }),
        },
        {
          id: 'switch',
          label: '働き方を変える',
          effect: (s) => ({
            delta: { work: 5, happiness: 5, money: -50000 },
            set: {
              job: s.job === '会社員' ? 'フリーランス' : '会社員',
            },
            log: s.job === '会社員' ? 'フリーランスに転向した' : '会社員として働き始めた',
            important: true,
          }),
        },
      ],
    });
  }

  if (state.age >= 20 && state.romance === '独身') {
    pool.push({
      id: `dating_app_${state.age}`,
      repeatable: true,
      title: '恋愛のチャンス',
      description: 'マッチングアプリや合コンの誘いがある。',
      choices: [
        {
          id: 'try',
          label: '積極的に挑戦',
          effect: (s) => {
            const name = pick(partnerPool(s.gender));
            if (s.stats.love >= 40 || s.stats.relationships >= 55 || chance(0.35)) {
              return {
                delta: { love: 12, happiness: 10, relationships: 5 },
                set: { romance: '恋人あり' },
                flagUpdates: { hasPartner: true, partnerName: name },
                log: `${name}さんと付き合い始めた`,
                important: true,
              };
            }
            return {
              delta: { love: 4, happiness: -2, money: -20000 },
              log: '恋愛に挑戦したが、今回は実らなかった',
            };
          },
        },
        {
          id: 'skip',
          label: '今は仕事優先',
          effect: () => ({
            delta: { work: 5, love: -3 },
            log: '恋愛より仕事を優先した',
          }),
        },
      ],
    });
  }

  return pool.filter((e) => {
    if (e.id === 'move' && state.flags.movedOut) return false;
    if (e.id === 'hobby' && state.flags.hobby) return false;
    return true;
  });
}

/**
 * Apply a choice effect and return updated state + float changes
 */
export function resolveChoice(state, choice) {
  const result = choice.effect(state);
  let next = { ...state, stats: { ...state.stats }, flags: { ...state.flags } };
  let changes = [];

  if (result.delta) {
    const applied = applyDelta(next, result.delta);
    next = applied.state;
    next.flags = { ...next.flags };
    changes = applied.changes;
  }

  if (result.set) {
    next = { ...next, ...result.set };
  }

  if (result.flagUpdates) {
    next.flags = { ...next.flags, ...result.flagUpdates };
  }

  if (result.log) {
    next.lifeLog = [
      ...next.lifeLog,
      { age: next.age, text: result.log, important: !!result.important },
    ];
  }
  if (result.important && result.log) {
    next.importantChoices = [...next.importantChoices, `${next.age}歳: ${result.log}`];
  }

  return { state: next, changes };
}

/**
 * Start a new year: apply income (except first moment at 18 before path), queue events
 */
export function startYear(state) {
  let next = {
    ...state,
    pendingEvents: [],
    currentEvent: null,
    awaitingAdvance: false,
  };

  // Income for continuing years (after choices of previous year settled)
  // At the beginning of ages 19+, apply previous year's work income
  if (next.age > 18 || next.flags.path18) {
    // For age 18 first load, skip income until path chosen — handled in advanceYear
  }

  const events = buildYearEvents(next);
  next.pendingEvents = events;
  next.currentEvent = events[0] || null;
  next.pendingEvents = events.slice(1);
  return next;
}

/**
 * After finishing all events in a year, advance age
 */
export function advanceYear(state) {
  let next = { ...state, stats: { ...state.stats }, flags: { ...state.flags } };

  // Apply annual income for the year that just completed (having a job)
  if (next.job !== '無職' || next.age >= 19) {
    const incomeDelta = applyAnnualIncome(next);
    const applied = applyDelta(next, incomeDelta);
    next = applied.state;
    next._incomeChanges = applied.changes;
  } else {
    next._incomeChanges = [];
  }

  // Soft yearly drift
  const drift = applyDelta(next, {
    health: chance(0.5) ? -1 : 0,
    happiness: chance(0.3) ? -1 : 1,
  });
  next = drift.state;

  next.age += 1;

  if (next.age >= 30) {
    next.screen = 'result';
    next.currentEvent = null;
    next.pendingEvents = [];
    next.awaitingAdvance = false;
    next.lifeLog = [
      ...next.lifeLog,
      { age: 30, text: '30歳を迎え、ひと区切りの人生結果が出た', important: true },
    ];
    return next;
  }

  next = startYear(next);
  next._ageTransition = true;
  return next;
}

/**
 * Move to next pending event or mark awaiting advance
 */
export function afterEventResolved(state) {
  if (state.pendingEvents.length > 0) {
    const [nextEvent, ...rest] = state.pendingEvents;
    return {
      ...state,
      currentEvent: nextEvent,
      pendingEvents: rest,
      awaitingAdvance: false,
    };
  }
  return {
    ...state,
    currentEvent: null,
    awaitingAdvance: true,
  };
}
