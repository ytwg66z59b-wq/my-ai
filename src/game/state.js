/** @typedef {'真面目'|'行動派'|'内向的'|'社交的'|'自由人'} Personality */
/** @typedef {'無職'|'学生'|'会社員'|'フリーランス'|'経営者'} JobType */
/** @typedef {'独身'|'恋人あり'|'婚約'|'結婚'} RomanceStatus */
/** @typedef {'male'|'female'|'other'} Gender */

/**
 * @typedef {Object} Stats
 * @property {number} money
 * @property {number} work
 * @property {number} love
 * @property {number} happiness
 * @property {number} health
 * @property {number} ability
 * @property {number} relationships
 */

/**
 * @typedef {Object} LifeLogEntry
 * @property {number} age
 * @property {string} text
 * @property {boolean} [important]
 */

/**
 * @typedef {Object} GameFlags
 * @property {string|null} path18
 * @property {boolean} graduated
 * @property {boolean} hasPartner
 * @property {string|null} partnerName
 * @property {number} businessSuccess
 * @property {boolean} movedOut
 * @property {boolean} hobby
 * @property {number} promotionCount
 * @property {boolean} sideJob
 * @property {Set<string>} usedEvents
 */

/**
 * @typedef {Object} GameState
 * @property {string} name
 * @property {Gender} gender
 * @property {Personality} personality
 * @property {number} age
 * @property {Stats} stats
 * @property {JobType} job
 * @property {RomanceStatus} romance
 * @property {GameFlags} flags
 * @property {LifeLogEntry[]} lifeLog
 * @property {string[]} importantChoices
 * @property {'create'|'playing'|'result'} screen
 * @property {object|null} currentEvent
 * @property {object[]} pendingEvents
 * @property {number} yearIndex
 * @property {boolean} awaitingAdvance
 */

export const STORAGE_KEY = 'life-simulator-v1';

export const STAT_META = [
  { key: 'work', label: '仕事', icon: '💼', max: 100 },
  { key: 'love', label: '恋愛', icon: '❤️', max: 100 },
  { key: 'happiness', label: '幸福度', icon: '😊', max: 100 },
  { key: 'health', label: '健康', icon: '💪', max: 100 },
  { key: 'ability', label: '能力', icon: '🧠', max: 100 },
  { key: 'relationships', label: '人間関係', icon: '👥', max: 100 },
];

/** @type {Record<Personality, Partial<Stats>>} */
export const PERSONALITY_BONUS = {
  真面目: { ability: 10, work: 8, happiness: -5, relationships: 0 },
  行動派: { work: 10, ability: 5, health: 5, ability: 200000 },
  内向的: { ability: 12, relationships: -8, love: -5, happiness: 0 },
  社交的: { relationships: 15, love: 8, happiness: 5, ability: -5 },
  自由人: { happiness: 12, health: 5, work: -5, money: 100000 },
};

export const PARTNER_NAMES = {
  male: ['美咲', '陽菜', '結衣', '桜', '玲奈', 'あかり'],
  female: ['健太', '翔太', '悠真', '蓮', '大輝', '陽介'],
  other: ['ハルト', 'ミオ', 'レン', 'アオイ', 'カイ', 'ユイ'],
};

/**
 * @param {Personality} personality
 * @returns {Stats}
 */
export function createInitialStats(personality) {
  /** @type {Stats} */
  const base = {
    money: 1000000,
    work: 30,
    love: 30,
    happiness: 50,
    health: 80,
    ability: 40,
    relationships: 50,
  };
  const bonus = PERSONALITY_BONUS[personality] || {};
  for (const [k, v] of Object.entries(bonus)) {
    base[k] = (base[k] ?? 0) + v;
  }
  return clampStats(base);
}

/**
 * @param {Partial<Stats>} stats
 * @returns {Stats}
 */
export function clampStats(stats) {
  const clamp100 = (n) => Math.max(0, Math.min(100, Math.round(n)));
  return {
    money: Math.max(0, Math.round(stats.money ?? 0)),
    work: clamp100(stats.work ?? 0),
    love: clamp100(stats.love ?? 0),
    happiness: clamp100(stats.happiness ?? 0),
    health: clamp100(stats.health ?? 0),
    ability: clamp100(stats.ability ?? 0),
    relationships: clamp100(stats.relationships ?? 0),
  };
}

/**
 * @param {object} player
 * @returns {GameState}
 */
export function createNewGame({ name, gender, personality }) {
  return {
    name: name.trim() || 'プレイヤー',
    gender,
    personality,
    age: 18,
    stats: createInitialStats(personality),
    job: '無職',
    romance: '独身',
    flags: {
      path18: null,
      graduated: false,
      hasPartner: false,
      partnerName: null,
      businessSuccess: 50,
      movedOut: false,
      hobby: false,
      promotionCount: 0,
      sideJob: false,
      usedEvents: new Set(),
    },
    lifeLog: [
      {
        age: 18,
        text: `${name.trim() || 'プレイヤー'}としての人生が始まった（性格：${personality}）`,
        important: true,
      },
    ],
    importantChoices: [],
    screen: 'playing',
    currentEvent: null,
    pendingEvents: [],
    yearIndex: 0,
    awaitingAdvance: false,
  };
}

/**
 * Serialize for localStorage (Set -> Array)
 * @param {GameState} state
 */
export function serializeState(state) {
  return {
    ...state,
    flags: {
      ...state.flags,
      usedEvents: [...(state.flags.usedEvents || [])],
    },
  };
}

/**
 * @param {any} data
 * @returns {GameState|null}
 */
export function deserializeState(data) {
  if (!data || !data.name) return null;
  return {
    ...data,
    flags: {
      ...data.flags,
      usedEvents: new Set(data.flags?.usedEvents || []),
    },
  };
}

export function saveGame(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeState(state)));
  } catch {
    /* ignore */
  }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return deserializeState(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function clearSave() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * @param {GameState} state
 * @param {Partial<Stats>} delta
 * @returns {{ state: GameState, changes: {key:string, value:number, label:string, icon:string}[] }}
 */
export function applyDelta(state, delta) {
  const next = { ...state, stats: { ...state.stats } };
  const changes = [];
  const icons = {
    money: '💰',
    work: '💼',
    love: '❤️',
    happiness: '😊',
    health: '💪',
    ability: '🧠',
    relationships: '👥',
  };
  const labels = {
    money: 'お金',
    work: '仕事',
    love: '恋愛',
    happiness: '幸福度',
    health: '健康',
    ability: '能力',
    relationships: '人間関係',
  };

  for (const [key, value] of Object.entries(delta)) {
    if (value === 0 || value == null) continue;
    let actual = value;
    if (key === 'happiness' && typeof value === 'object' && value.random) {
      actual = randInt(value.min, value.max);
    }
    const before = next.stats[key];
    if (key === 'money') {
      next.stats.money = Math.max(0, before + actual);
    } else {
      next.stats[key] = Math.max(0, Math.min(100, before + actual));
    }
    const diff = next.stats[key] - before;
    if (diff !== 0) {
      changes.push({
        key,
        value: diff,
        label: labels[key] || key,
        icon: icons[key] || '',
      });
    }
  }
  return { state: next, changes };
}

export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function chance(p) {
  return Math.random() < p;
}

/**
 * Annual income based on job
 * @param {GameState} state
 */
export function applyAnnualIncome(state) {
  const delta = {};
  switch (state.job) {
    case '学生':
      delta.money = randInt(200000, 500000); // part-time-ish
      break;
    case '会社員': {
      const base = 2800000 + state.stats.work * 8000 + state.flags.promotionCount * 400000;
      delta.money = base;
      break;
    }
    case 'フリーランス': {
      const range = 1000000 + state.stats.ability * 20000 + state.stats.work * 15000;
      delta.money = randInt(Math.floor(range * 0.6), Math.floor(range * 1.2));
      break;
    }
    case '経営者': {
      const success = state.flags.businessSuccess;
      if (success >= 70) delta.money = randInt(4000000, 9000000);
      else if (success >= 40) delta.money = randInt(1000000, 4000000);
      else delta.money = randInt(-800000, 800000);
      break;
    }
    default:
      delta.money = randInt(0, 150000);
  }
  if (state.flags.sideJob) {
    delta.money = (delta.money || 0) + randInt(200000, 600000);
  }
  // Living costs
  delta.money = (delta.money || 0) - (state.flags.movedOut ? randInt(800000, 1200000) : randInt(300000, 500000));
  return delta;
}

/**
 * Life score 0-100
 * @param {GameState} state
 */
export function computeLifeScore(state) {
  const s = state.stats;
  const moneyScore = Math.min(100, (s.money / 15000000) * 100);
  const weighted =
    moneyScore * 0.18 +
    s.work * 0.14 +
    s.love * 0.12 +
    s.happiness * 0.2 +
    s.health * 0.12 +
    s.ability * 0.12 +
    s.relationships * 0.12;

  let bonus = 0;
  if (state.romance === '結婚') bonus += 5;
  else if (state.romance === '婚約') bonus += 3;
  else if (state.romance === '恋人あり') bonus += 1;
  if (state.job === '経営者' && state.flags.businessSuccess >= 70) bonus += 4;
  if (state.job === '会社員' && state.flags.promotionCount >= 2) bonus += 2;

  return Math.max(0, Math.min(100, Math.round(weighted + bonus)));
}

/**
 * @param {GameState} state
 * @param {number} score
 */
export function generateSummary(state, score) {
  const parts = [];
  parts.push(`${state.name}さんは18歳から30歳までを、${state.personality}な性格で歩んできた。`);

  if (state.flags.path18 === 'university') {
    parts.push('大学進学という選択が、後のキャリアの土台になった。');
  } else if (state.flags.path18 === 'job') {
    parts.push('若くして社会に出た経験が、実務力を鍛えた。');
  } else if (state.flags.path18 === 'startup') {
    parts.push('起業の道は起伏に富み、挑戦し続ける日々だった。');
  } else {
    parts.push('自由な進路選択が、独自のリズムを生んだ。');
  }

  if (state.romance === '結婚') {
    parts.push(`${state.flags.partnerName || '大切な人'}との結婚が、人生の大きな支えとなった。`);
  } else if (state.romance === '恋人あり' || state.romance === '婚約') {
    parts.push('恋愛面では、大切な関係を育んできた。');
  } else {
    parts.push('恋愛は控えめだったが、自分のペースを大切にした。');
  }

  if (score >= 80) parts.push('全体として、充実したバランスの良い30歳を迎えた。');
  else if (score >= 60) parts.push('波はありつつも、着実に人生を積み上げてきた。');
  else if (score >= 40) parts.push('うまくいかない時期もあったが、まだこれからが本番だ。');
  else parts.push('厳しい道のりだった。それでも、次の章は自分で書き直せる。');

  return parts.join('');
}

export function formatMoney(n) {
  return `¥${Math.round(n).toLocaleString('ja-JP')}`;
}
