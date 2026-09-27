/**
 * Headless full playthrough to verify 18→30 completes without errors.
 */
import { createNewGame, computeLifeScore, generateSummary } from '../src/game/state.js';
import {
  advanceYear,
  afterEventResolved,
  resolveChoice,
  startYear,
} from '../src/game/events.js';

function play(seedLabel, personality, strategy) {
  let state = createNewGame({
    name: `Tester-${seedLabel}`,
    gender: 'other',
    personality,
  });
  state = startYear(state);

  let guard = 0;
  while (state.screen !== 'result') {
    guard += 1;
    if (guard > 500) throw new Error(`[${seedLabel}] infinite loop at age ${state.age}`);

    if (state.currentEvent) {
      const choices = state.currentEvent.choices;
      let choice = choices[0];
      if (strategy === 'first') choice = choices[0];
      else if (strategy === 'last') choice = choices[choices.length - 1];
      else choice = choices[Math.floor(Math.random() * choices.length)];

      const resolved = resolveChoice(state, choice);
      state = resolved.state;
      state = afterEventResolved(state);
      continue;
    }

    if (state.awaitingAdvance) {
      state = advanceYear(state);
      delete state._incomeChanges;
      delete state._ageTransition;
      continue;
    }

    throw new Error(`[${seedLabel}] stuck with no event at age ${state.age}`);
  }

  const score = computeLifeScore(state);
  const summary = generateSummary(state, score);
  if (!summary || score < 0 || score > 100) {
    throw new Error(`[${seedLabel}] bad score/summary`);
  }
  if (state.age < 30) throw new Error(`[${seedLabel}] ended before 30`);
  if (!state.lifeLog.length) throw new Error(`[${seedLabel}] empty log`);

  return {
    label: seedLabel,
    score,
    job: state.job,
    romance: state.romance,
    money: state.stats.money,
    path: state.flags.path18,
    logs: state.lifeLog.length,
    important: state.importantChoices.length,
  };
}

const results = [
  play('A', '真面目', 'first'),
  play('B', '行動派', 'last'),
  play('C', '社交的', 'random'),
  play('D', '内向的', 'random'),
  play('E', '自由人', 'first'),
];

console.log('Playthrough OK:');
for (const r of results) {
  console.log(
    `  ${r.label}: score=${r.score} job=${r.job} romance=${r.romance} path=${r.path} money=${r.money} logs=${r.logs}`
  );
}
