import './style.css';
import {
  clearSave,
  computeLifeScore,
  createNewGame,
  formatMoney,
  generateSummary,
  loadGame,
  saveGame,
  STAT_META,
} from './game/state.js';
import {
  advanceYear,
  afterEventResolved,
  resolveChoice,
  startYear,
} from './game/events.js';

const app = document.getElementById('app');
const floatLayer = document.getElementById('float-layer');

/** @type {import('./game/state.js').GameState | null} */
let state = null;
let showLog = false;
let createForm = {
  name: '',
  gender: /** @type {'male'|'female'|'other'|''} */ (''),
  personality: /** @type {import('./game/state.js').Personality|''} */ (''),
};

function init() {
  const params = new URLSearchParams(location.search);
  if (params.get('demo') === 'play') {
    clearSave();
    state = createNewGame({
      name: params.get('name') || 'デモ太郎',
      gender: 'other',
      personality: '社交的',
    });
    state = startYear(state);
    persist();
    // clean URL without reload
    history.replaceState({}, '', location.pathname);
    render();
    return;
  }

  const saved = loadGame();
  if (saved && saved.screen === 'playing') {
    state = saved;
    // ensure events exist
    if (!state.currentEvent && !state.awaitingAdvance) {
      state = startYear(state);
      persist();
    }
    render();
    return;
  }
  if (saved && saved.screen === 'result') {
    state = saved;
    render();
    return;
  }
  state = null;
  render();
}

function persist() {
  if (state) saveGame(state);
}

function render() {
  if (!state || state.screen === 'create') {
    app.innerHTML = renderCreate();
    bindCreate();
    return;
  }
  if (state.screen === 'result') {
    app.innerHTML = renderResult();
    bindResult();
    return;
  }
  app.innerHTML = renderPlay();
  bindPlay();
  // animate bars after paint
  requestAnimationFrame(() => {
    document.querySelectorAll('.bar > i').forEach((el) => {
      const v = el.getAttribute('data-v');
      el.style.width = `${v}%`;
    });
  });
}

function renderCreate() {
  const personalities = ['真面目', '行動派', '内向的', '社交的', '自由人'];
  const genders = [
    { id: 'male', label: '男性' },
    { id: 'female', label: '女性' },
    { id: 'other', label: 'その他' },
  ];
  const saved = loadGame();
  const resume =
    saved && saved.screen === 'playing'
      ? `<div class="resume-bar"><span>続きから：<strong>${escapeHtml(saved.name)}</strong> ${saved.age}歳</span>
           <button class="btn-ghost" type="button" id="btn-resume">再開</button></div>`
      : '';

  return `
  <div class="screen" id="create-screen">
    <div class="hero-brand">
      <div class="logo">LIFE SIMULATOR</div>
      <h1>人生シミュレーター</h1>
      <p>18歳から30歳まで。<br/>選択が、あなたの物語を変える。</p>
    </div>
    ${resume}
    <div class="card">
      <label class="field-label" for="name">名前</label>
      <input class="input" id="name" maxlength="12" placeholder="例：山田 太郎" value="${escapeHtml(createForm.name)}" />
    </div>
    <div class="card">
      <span class="field-label">性別</span>
      <div class="choice-grid cols-2" id="gender-grid">
        ${genders
          .map(
            (g) =>
              `<button type="button" class="chip ${createForm.gender === g.id ? 'selected' : ''}" data-gender="${g.id}">${g.label}</button>`
          )
          .join('')}
      </div>
    </div>
    <div class="card">
      <span class="field-label">性格</span>
      <div class="choice-grid" id="personality-grid">
        ${personalities
          .map(
            (p) =>
              `<button type="button" class="chip ${createForm.personality === p ? 'selected' : ''}" data-personality="${p}">${p}</button>`
          )
          .join('')}
      </div>
    </div>
    <button class="btn-primary" id="btn-start" ${canStart() ? '' : 'disabled'}>人生をはじめる</button>
  </div>`;
}

function canStart() {
  return createForm.name.trim() && createForm.gender && createForm.personality;
}

function syncCreateFormFromDom() {
  const nameInput = document.getElementById('name');
  if (nameInput) createForm.name = nameInput.value;
}

function updateCreateSelectionUi() {
  document.querySelectorAll('[data-gender]').forEach((btn) => {
    btn.classList.toggle('selected', btn.getAttribute('data-gender') === createForm.gender);
  });
  document.querySelectorAll('[data-personality]').forEach((btn) => {
    btn.classList.toggle(
      'selected',
      btn.getAttribute('data-personality') === createForm.personality
    );
  });
  const startBtn = document.getElementById('btn-start');
  if (startBtn) startBtn.disabled = !canStart();
}

function bindCreate() {
  const nameInput = document.getElementById('name');
  const onNameChange = () => {
    syncCreateFormFromDom();
    updateCreateSelectionUi();
  };
  nameInput?.addEventListener('input', onNameChange);
  nameInput?.addEventListener('change', onNameChange);
  nameInput?.addEventListener('compositionend', onNameChange);

  document.querySelectorAll('[data-gender]').forEach((btn) => {
    btn.addEventListener('click', () => {
      syncCreateFormFromDom();
      createForm.gender = btn.getAttribute('data-gender');
      updateCreateSelectionUi();
    });
  });

  document.querySelectorAll('[data-personality]').forEach((btn) => {
    btn.addEventListener('click', () => {
      syncCreateFormFromDom();
      createForm.personality = btn.getAttribute('data-personality');
      updateCreateSelectionUi();
    });
  });

  document.getElementById('btn-start')?.addEventListener('click', () => {
    syncCreateFormFromDom();
    if (!canStart()) return;
    clearSave();
    state = createNewGame({
      name: createForm.name,
      gender: createForm.gender,
      personality: createForm.personality,
    });
    state = startYear(state);
    persist();
    render();
  });

  document.getElementById('btn-resume')?.addEventListener('click', () => {
    const saved = loadGame();
    if (saved) {
      state = saved;
      if (!state.currentEvent && !state.awaitingAdvance) {
        state = startYear(state);
      }
      persist();
      render();
    }
  });
}

function renderPlay() {
  const s = state;
  const romanceLabel =
    s.romance === '恋人あり' && s.flags.partnerName
      ? `恋人：${s.flags.partnerName}`
      : s.romance === '婚約' && s.flags.partnerName
        ? `婚約：${s.flags.partnerName}`
        : s.romance === '結婚' && s.flags.partnerName
          ? `配偶者：${s.flags.partnerName}`
          : s.romance;

  const statsHtml = STAT_META.map(
    (m) => `
    <div class="stat-card" data-key="${m.key}">
      <div class="label">${m.icon} ${m.label}</div>
      <div class="value">${s.stats[m.key]}</div>
      <div class="bar"><i data-v="${s.stats[m.key]}"></i></div>
    </div>`
  ).join('');

  let center = '';
  if (s.currentEvent) {
    const ev = s.currentEvent;
    center = `
      <div class="event-card" id="event-card">
        <div class="eyebrow">${ev.story ? 'STORY EVENT' : 'EVENT'} · ${s.age}歳</div>
        <h2>${escapeHtml(ev.title)}</h2>
        <p>${escapeHtml(ev.description)}</p>
      </div>
      <div class="choices" id="choices">
        ${ev.choices
          .map(
            (c, i) =>
              `<button type="button" class="choice-btn" data-choice="${c.id}">
                <span class="key">${String.fromCharCode(65 + i)}</span>${escapeHtml(c.label)}
              </button>`
          )
          .join('')}
      </div>`;
  } else if (s.awaitingAdvance) {
    center = `
      <div class="advance-panel">
        <p>${s.age}歳の出来事はひと通り終わった。<br/>次の一年へ進もう。</p>
        <button class="btn-primary" id="btn-advance" style="margin-top:0">1年進む →</button>
      </div>`;
  }

  return `
  <div class="screen" id="play-screen">
    <div class="top-bar">
      <div class="age-badge" id="age-badge">${s.age}<span>歳</span></div>
      <div class="top-meta">
        <div class="job-pill">${escapeHtml(s.job)}</div>
        <div class="money-line">${formatMoney(s.stats.money)}</div>
        <div class="romance-line">❤️ ${escapeHtml(romanceLabel)}</div>
      </div>
    </div>
    <div class="stats-grid">${statsHtml}</div>
    ${center}
    <div class="toolbar">
      <button class="btn-secondary" type="button" id="btn-log">人生ログ</button>
      <button class="btn-secondary" type="button" id="btn-restart-soft">最初から</button>
    </div>
  </div>
  ${showLog ? renderLogModal() : ''}`;
}

function renderLogModal() {
  const items = [...state.lifeLog]
    .reverse()
    .map(
      (e) =>
        `<li><span class="age">${e.age}歳</span><span class="${e.important ? 'important' : ''}">${escapeHtml(e.text)}</span></li>`
    )
    .join('');
  return `
  <div class="modal-backdrop" id="log-backdrop">
    <div class="modal">
      <h3>人生ログ</h3>
      <ul class="log-list">${items || '<li><span></span><span>まだ記録がありません</span></li>'}</ul>
      <button class="btn-primary" type="button" id="btn-close-log" style="margin-top:14px">閉じる</button>
    </div>
  </div>`;
}

function bindPlay() {
  document.querySelectorAll('[data-choice]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-choice');
      const choice = state.currentEvent?.choices.find((c) => c.id === id);
      if (!choice) return;
      // disable all
      document.querySelectorAll('.choice-btn').forEach((b) => (b.disabled = true));

      const { state: next, changes } = resolveChoice(state, choice);
      state = next;
      await showFloatChanges(changes);
      state = afterEventResolved(state);
      persist();
      render();
    });
  });

  document.getElementById('btn-advance')?.addEventListener('click', () => {
    const btn = document.getElementById('btn-advance');
    if (btn) {
      if (btn.dataset.busy === '1') return;
      btn.dataset.busy = '1';
      btn.disabled = true;
      btn.textContent = '進んでいます…';
    }

    state = advanceYear(state);
    const incomeChanges = state._incomeChanges || [];
    delete state._incomeChanges;
    const ageTransition = state._ageTransition;
    delete state._ageTransition;

    persist();
    render();

    if (ageTransition) {
      requestAnimationFrame(() => {
        document.getElementById('age-badge')?.classList.add('age-transition');
      });
    }

    const floats = incomeChanges.filter((c) => c.key === 'money' || Math.abs(c.value) >= 2);
    if (floats.length) showFloatChanges(floats);
  });

  document.getElementById('btn-log')?.addEventListener('click', () => {
    showLog = true;
    render();
  });
  document.getElementById('btn-close-log')?.addEventListener('click', () => {
    showLog = false;
    render();
  });
  document.getElementById('log-backdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'log-backdrop') {
      showLog = false;
      render();
    }
  });
  document.getElementById('btn-restart-soft')?.addEventListener('click', () => {
    if (!confirm('進行中の人生を破棄して最初から始めますか？')) return;
    clearSave();
    state = null;
    createForm = { name: '', gender: '', personality: '' };
    showLog = false;
    render();
  });
}

function renderResult() {
  const score = computeLifeScore(state);
  const summary = generateSummary(state, score);
  const s = state.stats;

  const rows = [
    ['最終資産', formatMoney(s.money)],
    ['仕事', `${state.job}（${s.work}）`],
    ['恋愛', `${state.romance}${state.flags.partnerName ? ` · ${state.flags.partnerName}` : ''}（${s.love}）`],
    ['幸福度', String(s.happiness)],
    ['健康', String(s.health)],
    ['能力', String(s.ability)],
    ['人間関係', String(s.relationships)],
  ]
    .map(([k, v]) => `<div class="result-row"><span class="k">${k}</span><span class="v">${escapeHtml(v)}</span></div>`)
    .join('');

  const important = state.importantChoices.length
    ? state.importantChoices.map((t) => `<li><span class="age">★</span><span class="important">${escapeHtml(t)}</span></li>`).join('')
    : '<li><span></span><span>特記事項なし</span></li>';

  const logs = state.lifeLog
    .map(
      (e) =>
        `<li><span class="age">${e.age}</span><span class="${e.important ? 'important' : ''}">${escapeHtml(e.text)}</span></li>`
    )
    .join('');

  return `
  <div class="screen" id="result-screen">
    <div class="result-hero">
      <div class="logo" style="color:var(--accent);letter-spacing:.18em;font-size:.8rem;font-weight:800;margin-bottom:8px">LIFE REPORT</div>
      <h1>あなたの30年間</h1>
      <p style="color:var(--muted);margin:8px 0 0">${escapeHtml(state.name)}さん（${escapeHtml(state.personality)}）</p>
      <div class="score-ring" style="--score:${score}">
        <div>
          <div class="num">${score}</div>
          <div class="sub">人生スコア</div>
        </div>
      </div>
      <p style="margin:0;font-weight:800">あなたの人生スコア：${score}点</p>
    </div>

    <div class="card">
      <span class="field-label">あなたはこんな人生を歩みました。</span>
      <p class="summary-text">${escapeHtml(summary)}</p>
    </div>

    <div class="card">
      <span class="field-label">最終ステータス</span>
      <div class="result-stats">${rows}</div>
    </div>

    <div class="card">
      <span class="field-label">重要な選択</span>
      <ul class="log-list">${important}</ul>
    </div>

    <div class="card">
      <span class="field-label">人生ログ</span>
      <ul class="log-list">${logs}</ul>
    </div>

    <div class="continue-banner">
      <button class="btn-primary" id="btn-replay" type="button">もう一度プレイする</button>
    </div>
  </div>`;
}

function bindResult() {
  document.getElementById('btn-replay')?.addEventListener('click', () => {
    clearSave();
    state = null;
    createForm = { name: '', gender: '', personality: '' };
    showLog = false;
    render();
  });
}

function showFloatChanges(changes) {
  return new Promise((resolve) => {
    if (!changes.length) {
      resolve();
      return;
    }
    changes.forEach((c, i) => {
      setTimeout(() => {
        const el = document.createElement('div');
        el.className = `float-change ${c.value >= 0 ? 'pos' : 'neg'}`;
        el.style.top = `${38 + i * 7}%`;
        if (c.key === 'money') {
          const sign = c.value >= 0 ? '+' : '';
          el.textContent = `${c.icon} ${sign}${formatMoney(c.value).replace('¥', '')}円`;
        } else {
          const sign = c.value >= 0 ? '+' : '';
          el.textContent = `${c.icon} ${sign}${c.value}`;
        }
        floatLayer.appendChild(el);
        setTimeout(() => el.remove(), 1400);
      }, i * 160);
    });
    setTimeout(resolve, 400 + changes.length * 160);
  });
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

init();
