import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const stateApi = require('../src/state.cjs');
const content = require('../src/content.cjs');
const understanding = require('../src/understanding.cjs');

const firstQuestion = content.questions[0];
const firstCard = content.cards.find(card => card.id === firstQuestion.cardId);
const iso = '2026-10-07T00:00:00.000Z';

function understandingFixture() {
  const lesson = content.lessons.find(item => item.teachingTrial?.exercises?.length);
  const exercise = lesson.teachingTrial.exercises[0];
  const options = {
    contentVersion:content.version,
    teachingRevision:understanding.effectiveTeachingRevision(content, lesson),
    confidence:'uncertain',
    priorExposure:'自述未见',
    referenceSeen:true
  };
  const answered = understanding.submitAnswer(understanding.empty(), exercise, '合成的旧版原答', options, iso);
  const made = understanding.makePacket(answered.state, lesson, content, { now:'2026-10-07T00:01:00.000Z' });
  const item = made.packet.items[0];
  return understanding.importFeedback(made.state, {
    format:'nca-understanding-feedback', version:1, packetId:made.packet.packetId,
    source:{ name:'合成测试点评', conversationId:'fixture-only', model:'fixture-model' },
    createdAt:'2026-10-07T00:02:00.000Z',
    items:[{ attemptId:item.attemptId, answerText:item.answerText,
      assessment:{ concept:'需补充', reasoning:'保留条件', terminology:'无', english:'不适用' },
      strengths:['保留未知'], gaps:['补充验证步骤'], misconceptions:[], explanation:'这是合成点评。', nextQuestion:'' }]
  }, content, '2026-10-07T00:02:00.000Z');
}

function v1Fixture() {
  return {
    schemaVersion:1,
    settings:{ budget:45, lessonDay:3 },
    learning:{ cardStates:{ [firstCard.id]:'uncertain' } },
    attempts:[{
      id:'fixture-first-answer', questionId:firstQuestion.id, selected:['a'], correct:false,
      guessed:true, uncertain:true, questionable:false, answeredAt:iso, firstAttempt:true, mode:'practice'
    }],
    reviews:{
      [firstQuestion.id]:{ questionId:firstQuestion.id, createdAt:iso, reviewCount:1, active:true,
        dueAt:'2026-10-08T00:00:00.000Z', reason:'还不确定',
        lastFlags:{ correct:false, guessed:true, uncertain:true } }
    },
    notes:[{ id:'fixture-note', text:'合成旧版备注', createdAt:iso, updatedAt:iso }],
    understanding:understandingFixture(),
    session:{ screen:'review', cardId:firstCard.id, questionId:firstQuestion.id },
    updatedAt:null
  };
}

test('v1→v2 迁移确定且保留旧答题、标记、复习、备注、原答和点评', () => {
  const fixture = v1Fixture();
  const before = structuredClone(fixture);
  const first = stateApi.migrateState(fixture);
  const second = stateApi.migrateState(structuredClone(fixture));
  assert.deepEqual(fixture, before, '迁移不能改写输入对象');
  assert.deepEqual(first, second, '同一份 v1 输入应产生相同 v2 状态');
  assert.equal(first.schemaVersion, 2);
  assert.deepEqual(first.attempts, fixture.attempts);
  assert.deepEqual(first.reviews, fixture.reviews);
  assert.deepEqual(first.notes, fixture.notes);
  assert.deepEqual(first.learning, fixture.learning);
  assert.deepEqual(first.understanding, fixture.understanding);
  assert.equal(first.understanding.attempts[0].answerText, '合成的旧版原答');
  assert.equal(first.understanding.feedback.length, 1);
  assert.equal(first.reviewSchedule.cards[firstCard.id].migratedFromV1, true);
  assert.equal(stateApi.validState(first), true);
});

test('v1/v2 备份均可导入，失败验证不改变当前状态字节', () => {
  const current = stateApi.initialState();
  const currentBytes = JSON.stringify(current);
  const migrated = stateApi.parseBackup({ format:'nca-study-desk-backup', version:1, exportedAt:iso, state:v1Fixture() });
  assert.equal(migrated.schemaVersion, 2);
  const v2 = stateApi.backupFor(migrated);
  assert.deepEqual(stateApi.parseBackup(v2), migrated);
  const invalid = structuredClone(v2);
  invalid.state.caseAttempts.push({ caseId:'MISSING' });
  assert.throws(() => stateApi.parseBackup(invalid), /无法安全迁移|有效|版本/);
  assert.equal(JSON.stringify(current), currentBytes);
});

test('默认评分映射为 Again/Hard/Good，Easy 只接受显式评分', () => {
  assert.equal(stateApi.ratingFromFlags({ correct:false, guessed:false, uncertain:false }), stateApi.Rating.Again);
  assert.equal(stateApi.ratingFromFlags({ correct:true, guessed:true, uncertain:false }), stateApi.Rating.Hard);
  assert.equal(stateApi.ratingFromFlags({ correct:true, guessed:false, uncertain:true }), stateApi.Rating.Hard);
  assert.equal(stateApi.ratingFromFlags({ correct:true, guessed:false, uncertain:false }), stateApi.Rating.Good);
  assert.notEqual(stateApi.ratingFromFlags({ correct:true, guessed:false, uncertain:false }), stateApi.Rating.Easy);
});

test('FSRS 用稳定 cardId 排期，日期为 UTC ISO，重复评价保留逐条日志', () => {
  const again = stateApi.scheduleCard(firstCard.id, null, stateApi.Rating.Again, '答错', iso, 'attempt-1');
  assert.match(again.card.due, /Z$/);
  assert.match(again.card.last_review, /Z$/);
  assert.equal(again.logs.length, 1);
  const later = '2026-10-07T00:01:00.000Z';
  const hard = stateApi.scheduleCard(firstCard.id, again, stateApi.Rating.Hard, '仍不确定', later, 'attempt-2');
  assert.equal(hard.logs.length, 2);
  assert.deepEqual(hard.logs.map(item => item.evidenceId), ['attempt-1','attempt-2']);
  assert.ok(Date.parse(hard.card.due) > Date.parse(later));
});

test('到期计算按绝对时间排序，跨日与带时区字符串结果一致', () => {
  const state = stateApi.initialState();
  const a = stateApi.scheduleCard(content.cards[0].id, null, stateApi.Rating.Good, '独立答对', iso, 'a');
  const b = stateApi.scheduleCard(content.cards[1].id, null, stateApi.Rating.Good, '独立答对', iso, 'b');
  a.card.due = '2026-10-08T00:00:00.000Z';
  b.card.due = '2026-10-08T08:30:00+08:00';
  state.reviewSchedule.cards[content.cards[0].id] = a;
  state.reviewSchedule.cards[content.cards[1].id] = b;
  assert.deepEqual(stateApi.dueCardIds(state, '2026-10-08T00:15:00.000Z'), [content.cards[0].id]);
  assert.deepEqual(stateApi.dueCardIds(state, '2026-10-08T00:31:00.000Z'), [content.cards[0].id, content.cards[1].id]);
});

test('案例原答、提示暴露与修改稿随 v2 备份保留且不进入答题或 FSRS', () => {
  const state = stateApi.initialState();
  const item = content.cases[0];
  state.caseAttempts.push({ id:'case-answer-1', caseId:item.id, answerText:'合成案例原答', confidence:'low', referenceSeen:true, assistanceNote:'查看过提示', submittedAt:iso, revisionOf:null });
  state.caseAttempts.push({ id:'case-answer-2', caseId:item.id, answerText:'合成案例修改稿', confidence:'medium', referenceSeen:true, assistanceNote:'补充未知项', submittedAt:'2026-10-07T00:03:00.000Z', revisionOf:'case-answer-1' });
  const restored = stateApi.parseBackup(stateApi.backupFor(state));
  assert.deepEqual(restored.caseAttempts, state.caseAttempts);
  assert.deepEqual(restored.attempts, []);
  assert.deepEqual(restored.reviewSchedule.cards, {});
});
