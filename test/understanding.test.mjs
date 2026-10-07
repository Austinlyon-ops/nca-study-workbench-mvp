import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const require = createRequire(import.meta.url);
const U = require('../src/understanding.cjs');
const content = JSON.parse(readFileSync(new URL('../content/nca-content-v0.2.json', import.meta.url), 'utf8'));
const lesson = content.lessons.find(l => l.day === 3);
const e = lesson.teachingTrial.exercises[0];
const en = lesson.teachingTrial.exercises.find(e => e.language === 'en');
const now = '2026-09-25T12:00:00.000Z';
const later = '2026-09-25T12:05:00.000Z';
const opts = { contentVersion: content.version, teachingRevision: U.effectiveTeachingRevision(content, lesson) };
function submitted(ex = e, text = '这是我的原始理解。') { return U.submitAnswer(U.empty(), ex, text, opts, now); }
function request() { const { state } = submitted(); return U.makePacket(state, lesson, content, { now }); }
function feedback(packet, item = packet.items[0]) {
  return { format: 'nca-understanding-feedback', version: 1, packetId: packet.packetId, source: { name: 'NVIDIA L&E', conversationId: 'test-conversation', model: 'test-model' }, createdAt: later,
    items: [{ attemptId: item.attemptId, answerText: item.answerText, assessment: { concept: '有待说明', reasoning: '需要原因', terminology: '术语可补充', english: '本题不适用' }, strengths: [], gaps: ['补充各层职责'], misconceptions: [], explanation: '请解释驱动与框架的区别。', nextQuestion: '' }] };
}

test('effective teaching revision supports days without a trial and preserves trial precedence and legacy fallback', () => {
  const base = { teachingRevision: 'global-v1' };
  const day = { day: 1, teachingRevision: 'day1-v2' };
  assert.equal(U.effectiveTeachingRevision(base, day), 'day1-v2');
  assert.equal(U.effectiveTeachingRevision(base, { ...day, teachingTrial: { teachingRevision: 'trial-v3' } }), 'trial-v3');
  assert.equal(U.effectiveTeachingRevision(base, { day: 2 }), 'global-v1');
  assert.equal(U.effectiveTeachingRevision(base, { ...day, teachingTrial: {} }), 'day1-v2');
  for (const invalid of ['', ' ', 42, 'x'.repeat(201)]) {
    assert.throws(() => U.effectiveTeachingRevision(base, { ...day, teachingRevision: invalid }));
  }
});

test('lesson revision fallback isolates new answers and keeps earlier packet snapshots importable', () => {
  const oldLesson = structuredClone(lesson);
  delete oldLesson.teachingTrial.teachingRevision;
  oldLesson.teachingRevision = 'lesson-before';
  const old = U.submitAnswer(U.empty(), e, '旧日级版本原答', { ...opts, teachingRevision: 'lesson-before' }, now);
  const made = U.makePacket(old.state, oldLesson, content, { now });
  const currentLesson = structuredClone(oldLesson);
  currentLesson.teachingRevision = 'lesson-after';
  const current = U.submitAnswer(made.state, e, '新日级版本原答', { ...opts, teachingRevision: 'lesson-after' }, later);
  const newer = U.makePacket(current.state, currentLesson, content, { now: later });
  assert.equal(newer.packet.teachingRevision, 'lesson-after');
  assert.deepEqual(newer.packet.items.map(item => item.answerText), ['新日级版本原答']);
  assert.deepEqual(newer.state.packets[0], made.state.packets[0]);
  const returned = U.importFeedback(newer.state, feedback(made.packet), content, later);
  assert.equal(returned.attempts[0].status, 'reviewed');
  assert.equal(returned.attempts[1].status, 'pending');
  assert.deepEqual(returned.packets[0], made.state.packets[0]);
});
test('original answer is preserved; revision creates another record and keeps unrelated data', () => {
  const start = { ...U.empty(), futureField: { retained: ['yes'] } };
  const draft = U.saveDraft(start, e, ' 草稿\n', { confidence: 'uncertain', priorExposure: '昨天读过卡片' }, now);
  const first = U.submitAnswer(draft, e, ' 原答\n', opts, now);
  const revision = U.submitAnswer(first.state, e, '补充后的回答', opts, later);
  assert.equal(first.attempt.answerText, ' 原答\n');
  assert.equal(revision.state.attempts[0].answerText, ' 原答\n');
  assert.equal(revision.attempt.revisionOf, first.attempt.id);
  assert.notEqual(first.attempt.id, revision.attempt.id);
  assert.deepEqual(revision.state.futureField, start.futureField);
  assert.equal(first.attempt.confidence, 'uncertain');
  assert.equal(first.attempt.priorExposure, '昨天读过卡片');
  assert.deepEqual(start.attempts, []);
  assert.equal(first.state.drafts[e.id], undefined);
});
test('exposure keeps earliest known time, captures submission state, and never infers unseen', () => {
  let state = U.recordExposure(U.empty(), en.id, 'translation', now);
  state = U.recordExposure(state, en.id, 'translation', later);
  const { state: submittedState, attempt } = U.submitAnswer(state, en, '我的解释', opts, later);
  assert.equal(attempt.translationSeenAt, now);
  assert.equal(attempt.referenceSeenAt, null);
  assert.equal(attempt.priorExposure, 'unknown');
  const changed = U.recordExposure(submittedState, en.id, 'reference', later, opts.teachingRevision);
  assert.equal(changed.attempts[0].referenceSeenAt, null);
  assert.equal('independent' in attempt, false);
  const declared = U.submitAnswer(U.empty(), en, '看过参考后的解释', { ...opts, referenceSeen: true }, now);
  assert.equal(declared.attempt.referenceSeenAt, now);
});
test('packet exports only selected latest pending understanding answers and records explicit handoff', () => {
  const first = submitted();
  let state = U.submitAnswer(first.state, e, '修订答案', opts, later).state;
  state.privateOtherData = 'must-not-leave';
  const { state: sent, packet } = U.makePacket(state, lesson, content, { now: later });
  assert.equal(packet.items.length, 1);
  assert.equal(packet.items[0].answerText, '修订答案');
  assert.equal(packet.items[0].revisionOf, first.attempt.id);
  assert.equal(JSON.stringify(packet).includes('must-not-leave'), false);
  assert.equal(sent.packets[0].packetId, packet.packetId);
  assert.deepEqual(sent.packets[0].items, packet.items, 'persisted request keeps the exact answer snapshots for redelivery');
  const deliveryState = structuredClone(sent);
  deliveryState.packets[0].delivery = { status: 'sent', message: '等待点评', updatedAt: later, transportId: 'transport-1' };
  assert.equal(U.normalize(deliveryState).packets[0].delivery.transportId, 'transport-1');
  deliveryState.packets[0].items[0].answerText = 'tampered';
  assert.throws(() => U.normalize(deliveryState), 'persisted packet must still match the saved original');
  assert.equal(state.packets.length, 0);
  assert.equal(packet.items[0].rubric.length, e.rubric.length);
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(packet)));
});
test('feedback requires packet, attempt and exact original text; cannot alter MCQ or mastery', () => {
  const { state, packet } = request();
  for (const change of [p => p.packetId = 'wrong', p => p.items[0].attemptId = 'wrong', p => p.items[0].answerText += '改写', p => p.items[0].correct = true, p => p.items[0].assessment.mastery = 'passed']) {
    const p = feedback(packet); change(p);
    assert.throws(() => U.importFeedback(state, p, content, later));
    assert.equal(state.feedback.length, 0);
    assert.equal(state.attempts[0].status, 'pending');
  }
  const result = U.importFeedback(state, feedback(packet), content, later);
  assert.equal(result.attempts[0].status, 'reviewed');
  assert.equal(result.attempts[0].answerText, state.attempts[0].answerText);
  assert.equal(result.feedback[0].source.name, 'NVIDIA L&E');
  assert.equal(result.feedback[0].items[0].explanation, '请解释驱动与框架的区别。');
  assert.equal(U.importFeedback(result, feedback(packet), content, later).feedback.length, 1);
  const reordered = feedback(packet); reordered.source = { model: 'test-model', name: 'NVIDIA L&E', conversationId: 'test-conversation' };
  assert.equal(U.importFeedback(result, reordered, content, later).feedback.length, 1, 'JSON key order does not create a new review');
  assert.throws(() => U.makePacket(result, lesson, content));
  const revised = U.submitAnswer(result, e, '根据反馈补充的新回答', opts, later);
  assert.equal(revised.attempt.status, 'pending');
  assert.equal(revised.state.attempts[0].status, 'reviewed');
});
test('malformed or oversized records are rejected without silently discarding originals', () => {
  const { state } = submitted();
  const malformed = structuredClone(state); malformed.attempts[0].answerText = 42;
  assert.throws(() => U.normalize(malformed, content));
  assert.equal(malformed.attempts[0].answerText, 42);
  assert.throws(() => U.submitAnswer(state, e, 'x'.repeat(12001), opts, now));
  assert.throws(() => U.submitAnswer(state, e, '   ', opts, now));
  assert.throws(() => U.submitAnswer(state, { ...e, id: 'Q-D03-001' }, 'text', opts, now));
  assert.throws(() => U.normalize(JSON.parse('{"__proto__":{"polluted":true}}')));
  assert.throws(() => U.normalize({ ...state, version: 2 }));
  assert.throws(() => U.recordExposure(state, e.id, 'answer', now));
  assert.throws(() => U.submitAnswer(state, e, 'text', { ...opts, referenceSeen: 'false' }, now));
  assert.equal(U.normalize(state, { ...content, lessons: [] }).attempts.length, 1, 'old records survive content removal');
});
test('changed curriculum cannot silently evaluate a stored answer using a new prompt or rubric', () => {
  const { state } = submitted();
  const changedRevision = structuredClone(lesson); changedRevision.teachingTrial.teachingRevision = 'future';
  assert.throws(() => U.makePacket(state, changedRevision, content, { attemptIds: [state.attempts[0].id] }));
  const changedLesson = structuredClone(lesson); changedLesson.teachingTrial.exercises[0].stem += 'changed';
  assert.throws(() => U.makePacket(state, changedLesson, content));
  const { state: sent, packet } = U.makePacket(state, lesson, content, { now });
  assert.equal(U.importFeedback(sent, feedback(packet), { ...content, lessons: [] }, later).feedback.length, 1);
});

test('Day3 local revision excludes old pending answers while keeping exact old requests returnable', () => {
  const oldOptions = { ...opts, teachingRevision: content.teachingRevision };
  const old = U.submitAnswer(U.empty(), lesson.teachingTrial.exercises[1], '旧版原答', oldOptions, now);
  const current = U.submitAnswer(old.state, e, '新版原答', opts, later);
  const { state, packet } = U.makePacket(current.state, lesson, content, { now: later });
  assert.equal(packet.teachingRevision, opts.teachingRevision);
  assert.deepEqual(packet.items.map(item => item.answerText), ['新版原答']);
  assert.equal(state.attempts[0].answerText, '旧版原答');
  assert.throws(() => U.makePacket(current.state, lesson, content, { attemptIds: [old.attempt.id] }));
  const oldLesson = structuredClone(lesson); delete oldLesson.teachingTrial.teachingRevision;
  const oldRequest = U.makePacket(old.state, oldLesson, content, { now });
  assert.equal(oldRequest.packet.items[0].answerText, '旧版原答');
  assert.equal(U.importFeedback(oldRequest.state, feedback(oldRequest.packet), content, later).attempts[0].status, 'reviewed');
});

test('old reference opening is not attributed to the new teaching revision', () => {
  const oldExposure = U.recordExposure(U.empty(), en.id, 'reference', now, content.teachingRevision);
  const current = U.submitAnswer(oldExposure, en, '先答一次', opts, later);
  assert.equal(current.attempt.referenceSeenAt, null);
  assert.equal(current.state.exposures[en.id].referenceSeenAt, now);
  const newExposure = U.recordExposure(current.state, en.id, 'reference', later, opts.teachingRevision);
  const newAnswer = U.submitAnswer(newExposure, en, '回看本版后修订', opts, later);
  assert.equal(newAnswer.attempt.referenceSeenAt, later);
  assert.equal(newAnswer.state.exposures[en.id].referenceSeenAt, now);
});

test('unchanged teaching days retain a legacy reference opening', () => {
  const day4 = content.lessons.find(item => item.day === 4);
  const exercise = day4.teachingTrial.exercises[0];
  const oldExposure = U.recordExposure(U.empty(), exercise.id, 'reference', now);
  const answer = U.submitAnswer(oldExposure, exercise, '说明', { contentVersion: content.version, teachingRevision: content.teachingRevision, baseTeachingRevision: content.teachingRevision }, later);
  assert.equal(answer.attempt.referenceSeenAt, now);
});

test('optional help context and new explanation accompany the answer without changing the rubric', () => {
  const exercise = lesson.teachingTrial.exercises.find(item => item.id === 'P-D03-02');
  const result = U.submitAnswer(U.empty(), exercise, '我的原答', { ...opts, assistanceNote: '看过中文题意' }, now);
  const packet = U.makePacket(result.state, lesson, content, { now }).packet;
  assert.equal(packet.items[0].assistanceNote, '看过中文题意');
  assert.deepEqual(packet.items[0].referenceExplanation, exercise.referenceExplanation);
  assert.deepEqual(packet.items[0].rubric, exercise.rubric);
  assert.equal(result.attempt.answerText, '我的原答');
});
test('feedback batches are all-or-nothing; empty lists are accepted but explanation is required', () => {
  const { state, packet } = request();
  const p = feedback(packet); p.items.push({ ...p.items[0], attemptId: 'missing' });
  assert.throws(() => U.importFeedback(state, p, content, later));
  assert.equal(state.attempts[0].status, 'pending');
  const blank = feedback(packet); blank.items[0].explanation = '';
  assert.throws(() => U.importFeedback(state, blank, content, later));
  const noItems = feedback(packet); noItems.items = [];
  assert.throws(() => U.importFeedback(state, noItems, content, later));
});
test('script exposes the same local API without require, network or node dependencies', () => {
  const context = vm.createContext({});
  vm.runInContext(readFileSync(new URL('../src/understanding.cjs', import.meta.url), 'utf8'), context);
  assert.deepEqual(Object.keys(context.NcaUnderstanding).sort(), Object.keys(U).sort());
  assert.equal(context.NcaUnderstanding.empty().version, 1);
  const outcome = vm.runInContext(`(() => { const e = ${JSON.stringify(e)}, options = ${JSON.stringify(opts)}; const a = NcaUnderstanding.submitAnswer(null, e, 'one', options, '${now}'); const b = NcaUnderstanding.submitAnswer(a.state, e, 'two', options, '${now}'); return [a.attempt.id, b.attempt.id]; })()`, context);
  assert.notEqual(outcome[0], outcome[1], 'fallback IDs differ within the same millisecond');
});
