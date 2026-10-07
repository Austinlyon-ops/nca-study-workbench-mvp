const { questions } = require('./content.cjs');
const understanding = require('./understanding.cjs');

function initialState() {
  return { schemaVersion: 1, settings: { budget: 45 }, learning: { cardStates: {} }, attempts: [], reviews: {}, notes: [], understanding: understanding.empty(), session: { screen: 'home', cardId: 'card-ai-ml-dl', questionId: null }, updatedAt: null };
}

function validState(value) {
  if (!value || value.schemaVersion !== 1 || !value.settings || ![20, 45, 60].includes(value.settings.budget)) return false;
  if (!value.learning || typeof value.learning.cardStates !== 'object' || !Array.isArray(value.attempts) || typeof value.reviews !== 'object' || !Array.isArray(value.notes)) return false;
  return value.attempts.every((item) => item && questions.some((q) => q.id === item.questionId) && Array.isArray(item.selected) && typeof item.correct === 'boolean');
}

function isCorrect(question, selected) {
  return question.answer.length === selected.length && question.answer.every((id) => selected.includes(id));
}

function dueDate(days) { const date = new Date(); date.setDate(date.getDate() + days); return date.toISOString(); }
function reviewFor(questionId, previous, flags) {
  const needsReview = !flags.correct || flags.guessed || flags.uncertain;
  if (!needsReview) return previous || null;
  const prior = previous || { questionId, createdAt: new Date().toISOString(), reviewCount: 0 };
  return { ...prior, active: true, dueAt: dueDate(prior.reviewCount === 0 ? 1 : prior.reviewCount === 1 ? 3 : 7), reason: !flags.correct ? '答错' : flags.guessed ? '猜对' : '还不确定', lastFlags: flags };
}

function backupFor(state) { return { format: 'nca-study-desk-backup', version: 1, exportedAt: new Date().toISOString(), state }; }
function validBackup(value) { try { if (!value || value.format !== 'nca-study-desk-backup' || value.version !== 1 || !validState(value.state)) return false; understanding.normalize(value.state.understanding); return true; } catch { return false; } }

module.exports = { initialState, validState, isCorrect, reviewFor, backupFor, validBackup };
