const { questions, cards, cases = [] } = require('./content.cjs');
const understanding = require('./understanding.cjs');
const { fsrs, createEmptyCard, Rating, State } = require('ts-fsrs');

const SCHEDULER_VERSION = '5.4.2';
const questionIds = new Set(questions.map(item => item.id));
const cardIds = new Set(cards.map(item => item.id));
const caseIds = new Set(cases.map(item => item.id));
const questionById = new Map(questions.map(item => [item.id, item]));

function initialState() {
  return {
    schemaVersion: 2,
    settings: { budget: 45, lessonDay: 1 },
    learning: { cardStates: {} },
    attempts: [],
    reviews: {},
    notes: [],
    understanding: understanding.empty(),
    caseAttempts: [],
    reviewSchedule: { algorithm: 'ts-fsrs', version: SCHEDULER_VERSION, cards: {} },
    session: { screen: 'home', cardId: 'card-ai-ml-dl', questionId: null },
    updatedAt: null
  };
}

const plain = value => value && typeof value === 'object' && !Array.isArray(value);
const iso = value => typeof value === 'string' && Number.isFinite(Date.parse(value));
const optionalIso = value => value === undefined || value === null || iso(value);
const strings = value => Array.isArray(value) && value.every(item => typeof item === 'string');
const clone = value => JSON.parse(JSON.stringify(value));

function validAttempt(item) {
  return plain(item) && questionIds.has(item.questionId) && strings(item.selected) && typeof item.correct === 'boolean' && optionalIso(item.answeredAt);
}

function validReview(item) {
  if (!plain(item) || typeof item.active !== 'boolean' || typeof item.reason !== 'string') return false;
  if (item.questionId !== undefined && !questionIds.has(item.questionId)) return false;
  if (item.cardId !== undefined && !cardIds.has(item.cardId)) return false;
  if (item.questionId === undefined && item.cardId === undefined && item.disputed !== true) return false;
  return optionalIso(item.createdAt) && optionalIso(item.dueAt);
}

function validNote(item) {
  return plain(item) && typeof item.id === 'string' && typeof item.text === 'string' && iso(item.createdAt) && iso(item.updatedAt);
}

function validFsrsCard(card) {
  return plain(card) && iso(card.due) && optionalIso(card.last_review) &&
    ['stability','difficulty','elapsed_days','scheduled_days','reps','lapses','learning_steps','state'].every(key => Number.isFinite(card[key]));
}

function validScheduleRecord(cardId, record) {
  return cardIds.has(cardId) && plain(record) && validFsrsCard(record.card) && Array.isArray(record.logs) &&
    record.logs.every(log => plain(log) && [1,2,3,4].includes(log.rating) && iso(log.reviewedAt) && typeof log.reason === 'string');
}

function validCaseAttempt(item) {
  return plain(item) && typeof item.id === 'string' && caseIds.has(item.caseId) && typeof item.answerText === 'string' && item.answerText.trim().length > 0 &&
    ['unknown','low','medium','high'].includes(item.confidence) && typeof item.referenceSeen === 'boolean' && typeof item.assistanceNote === 'string' &&
    iso(item.submittedAt) && (item.revisionOf === undefined || item.revisionOf === null || typeof item.revisionOf === 'string');
}

function validState(value) {
  try {
    if (!plain(value) || value.schemaVersion !== 2 || !plain(value.settings) || ![20,45,60].includes(value.settings.budget)) return false;
    if (!plain(value.learning) || !plain(value.learning.cardStates) || !Array.isArray(value.attempts) || !plain(value.reviews) || !Array.isArray(value.notes)) return false;
    if (!plain(value.session) || typeof value.session.screen !== 'string') return false;
    if (!value.attempts.every(validAttempt) || !Object.values(value.reviews).every(validReview) || !value.notes.every(validNote)) return false;
    if (!Array.isArray(value.caseAttempts) || !value.caseAttempts.every(validCaseAttempt)) return false;
    if (!plain(value.reviewSchedule) || value.reviewSchedule.algorithm !== 'ts-fsrs' || value.reviewSchedule.version !== SCHEDULER_VERSION || !plain(value.reviewSchedule.cards)) return false;
    if (!Object.entries(value.reviewSchedule.cards).every(([id, record]) => validScheduleRecord(id, record))) return false;
    understanding.normalize(value.understanding || understanding.empty());
    return optionalIso(value.updatedAt);
  } catch { return false; }
}

function legacyCardFromReview(item) {
  const due = iso(item.dueAt) ? item.dueAt : (iso(item.createdAt) ? item.createdAt : '1970-01-01T00:00:00.000Z');
  const reviewed = iso(item.createdAt) ? item.createdAt : due;
  const count = Math.max(1, Number(item.reviewCount || 0) + 1);
  return {
    card: { due, stability:1, difficulty:5, elapsed_days:0, scheduled_days:1, reps:count, lapses:item.lastFlags?.correct === false ? 1 : 0, learning_steps:0, state:State.Review, last_review:reviewed },
    logs: [{ rating:item.lastFlags?.correct === false ? Rating.Again : Rating.Hard, reason:`旧版迁移：${item.reason || '待复习'}`, reviewedAt:reviewed, evidenceId:item.questionId || item.cardId || null }],
    updatedAt: reviewed,
    migratedFromV1: true
  };
}

function migrateState(value) {
  if (validState(value)) return clone(value);
  if (!plain(value) || value.schemaVersion !== 1) throw new Error('学习数据版本不受支持。');
  if (!plain(value.settings) || ![20,45,60].includes(value.settings.budget) || !plain(value.learning) || !plain(value.learning.cardStates) || !Array.isArray(value.attempts) || !plain(value.reviews) || !Array.isArray(value.notes) || !plain(value.session)) throw new Error('旧版学习数据结构不完整。');
  if (!value.attempts.every(validAttempt) || !Object.values(value.reviews).every(validReview) || !value.notes.every(validNote)) throw new Error('旧版学习数据包含无效记录。');
  understanding.normalize(value.understanding || understanding.empty());
  const next = { ...clone(value), schemaVersion:2, understanding:clone(value.understanding || understanding.empty()), caseAttempts:[], reviewSchedule:{ algorithm:'ts-fsrs', version:SCHEDULER_VERSION, cards:{} } };
  for (const item of Object.values(next.reviews)) {
    if (!item.active) continue;
    const cardId = item.cardId || questionById.get(item.questionId)?.cardId;
    if (cardId && cardIds.has(cardId) && !next.reviewSchedule.cards[cardId]) next.reviewSchedule.cards[cardId] = legacyCardFromReview(item);
  }
  if (!validState(next)) throw new Error('旧版学习数据无法安全迁移。');
  return next;
}

function isCorrect(question, selected) {
  return question.answer.length === selected.length && question.answer.every(id => selected.includes(id));
}

// 保留旧调用接口，便于验证旧规则与导入数据；v0.3 实际排期使用 scheduleCard。
function reviewFor(questionId, previous, flags, now = new Date()) {
  const needsReview = !flags.correct || flags.guessed || flags.uncertain;
  if (!needsReview) return previous || null;
  const prior = previous || { questionId, createdAt:now.toISOString(), reviewCount:0 };
  const days = prior.reviewCount === 0 ? 1 : prior.reviewCount === 1 ? 3 : 7;
  const due = new Date(now); due.setDate(due.getDate()+days);
  return { ...prior, active:true, dueAt:due.toISOString(), reason:!flags.correct?'答错':flags.guessed?'猜对':'还不确定', lastFlags:flags };
}

function ratingFromFlags(flags) {
  if (!flags.correct) return Rating.Again;
  if (flags.guessed || flags.uncertain) return Rating.Hard;
  return Rating.Good;
}

function restoreCard(card) {
  return { ...card, due:new Date(card.due), last_review:card.last_review ? new Date(card.last_review) : undefined };
}

function serializeCard(card) {
  return { ...card, due:new Date(card.due).toISOString(), last_review:card.last_review ? new Date(card.last_review).toISOString() : null };
}

// FSRS 只负责下一次出现时间；评价来源和原始作答仍分别留在日志与 attempts 中。
function scheduleCard(cardId, current, rating, reason, reviewedAt = new Date().toISOString(), evidenceId = null) {
  if (!cardIds.has(cardId)) throw new Error('关联知识卡不存在，未安排复习。');
  if (![Rating.Again,Rating.Hard,Rating.Good,Rating.Easy].includes(rating)) throw new Error('复习评价无效。');
  if (!iso(reviewedAt)) throw new Error('复习时间无效。');
  const now = new Date(reviewedAt);
  const previous = current?.card ? restoreCard(current.card) : createEmptyCard(now);
  const result = fsrs({ enable_fuzz:false }).next(previous, now, rating);
  const record = { card:serializeCard(result.card), logs:[...(current?.logs || []), { rating, reason:String(reason || ''), reviewedAt:now.toISOString(), evidenceId }], updatedAt:now.toISOString() };
  if (!validScheduleRecord(cardId, record)) throw new Error('复习安排生成失败。');
  return record;
}

function dueCardIds(state, now = new Date().toISOString()) {
  const point = Date.parse(now);
  if (!Number.isFinite(point)) throw new Error('当前时间无效。');
  return Object.entries(state.reviewSchedule.cards).filter(([,record]) => Date.parse(record.card.due) <= point).sort((a,b) => Date.parse(a[1].card.due)-Date.parse(b[1].card.due)).map(([id]) => id);
}

function backupFor(state) {
  return { format:'nca-study-desk-backup', version:2, exportedAt:new Date().toISOString(), state:migrateState(state) };
}

function parseBackup(value) {
  if (!plain(value) || value.format !== 'nca-study-desk-backup' || ![1,2].includes(value.version) || !plain(value.state)) throw new Error('不是有效的 NCA Study Hub v1/v2 备份。');
  if (value.version === 1 && value.state.schemaVersion !== 1) throw new Error('备份版本与学习数据版本不一致。');
  if (value.version === 2 && value.state.schemaVersion !== 2) throw new Error('备份版本与学习数据版本不一致。');
  return migrateState(value.state);
}

function validBackup(value) { try { parseBackup(value); return true; } catch { return false; } }

module.exports = { SCHEDULER_VERSION, initialState, validState, migrateState, isCorrect, reviewFor, ratingFromFlags, scheduleCard, dueCardIds, backupFor, parseBackup, validBackup, Rating };
