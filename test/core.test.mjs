import test from 'node:test';
import assert from 'node:assert/strict';
import stateModule from '../src/state.cjs';
import contentModule from '../src/content.cjs';
import validator from '../scripts/validate-content.cjs';

const { initialState, validState, isCorrect, reviewFor, backupFor, validBackup } = stateModule;
const { cards, questions, examSpec, budgets } = contentModule;

test('发布内容关系完整，并保留原五题兼容入口', () => {
  validator.validateContent(contentModule);
  assert.ok(cards.length >= 18);
  assert.equal(questions.filter(q => q.id.startsWith('Q-ORIGINAL-')).length, 5);
  assert.ok(questions.some((q) => q.type === 'single'));
  assert.ok(questions.some((q) => q.type === 'multiple'));
  assert.equal(examSpec.questions, 50);
  assert.equal(examSpec.minutes, 60);
  assert.deepEqual(Object.keys(budgets), ['20', '45', '60']);
});

test('构建拒绝悬空来源、答案错配、过期考点索引和重复网页ID', () => {
  for (const breakContent of [
    p => { p.cards[0].sourceIds.push('MISSING'); },
    p => { p.questions[0].answer = ['missing-option']; },
    p => { p.coverage[0].cardIds = []; },
    p => { p.cards[1].webId = p.cards[0].webId; }
  ]) {
    const copy = structuredClone(contentModule);
    breakContent(copy);
    assert.throws(() => validator.validateContent(copy));
  }
});

test('多选题只在选项集合完全匹配时判对', () => {
  const multi = questions.find((q) => q.type === 'multiple');
  assert.equal(isCorrect(multi, multi.answer), true);
  assert.equal(isCorrect(multi, [multi.answer[0]]), false);
  assert.equal(isCorrect(multi, [...multi.answer, 'not-an-option']), false);
});

test('初始状态可保存，篡改版本或答题 ID 被拒绝', () => {
  const state = initialState();
  assert.equal(validState(state), true);
  assert.equal(validState({ ...state, schemaVersion: 9 }), false);
  assert.equal(validState({ ...state, attempts: [{ questionId: 'not-real', selected: [], correct: false }] }), false);
});

test('答错、猜对和不确定会进入复习，单纯正确不会自动入队', () => {
  assert.equal(reviewFor('Q-ORIGINAL-001', null, { correct: true, guessed: false, uncertain: false }), null);
  const review = reviewFor('Q-ORIGINAL-001', null, { correct: false, guessed: false, uncertain: false });
  assert.equal(review.active, true);
  assert.equal(review.reason, '答错');
  assert.equal(reviewFor('Q-ORIGINAL-001', null, { correct: true, guessed: true, uncertain: false }).reason, '猜对');
});

test('备份可验证版本和状态，伪造内容会被拒绝', () => {
  const backup = backupFor(initialState());
  assert.equal(validBackup(backup), true);
  assert.equal(validBackup({ ...backup, format: 'anything-else' }), false);
  assert.equal(validBackup({ ...backup, state: { ...backup.state, schemaVersion: 99 } }), false);
});
