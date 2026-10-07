'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const p=require('../src/content.cjs'),state=require('../src/state.cjs');
const old=require('./legacy-answers-v0.1.json');
require('../scripts/validate-content.cjs').validateContent(p);
assert.deepEqual(p,JSON.parse(fs.readFileSync(path.join(__dirname,'../content/nca-content-v0.2.json'),'utf8')));
for(const q of old){const n=p.questions.find(n=>n.id===q.id);for(const k of ['id','type','stem','options','answer'])assert.deepEqual(n[k],q[k],q.id+':'+k)}
for(const l of p.lessons){assert.equal(l.questionIds.length,10);assert.ok(l.cardIds.length>=3)}
for(const q of p.questions){assert.ok(state.isCorrect(q,q.answer));assert.ok(!state.isCorrect(q,[]));for(const id of q.sourceIds)assert.ok(p.sources.some(s=>s.id===id));assert.ok(p.cards.some(c=>c.id===q.cardId))}
for(const c of p.cards)for(const id of c.objectiveIds)assert.ok(p.coverage.some(r=>r.id===id));
const s=state.initialState();s.attempts=[{id:'fixture-old',questionId:'Q-ORIGINAL-001',selected:['a'],correct:false,firstAttempt:true}];s.settings.lessonDay=4;assert.ok(state.validState(s));
const saved=JSON.parse(JSON.stringify(s));assert.deepEqual(saved.attempts,s.attempts);assert.ok(state.validBackup(state.backupFor(saved)));
const html=fs.readFileSync(path.join(__dirname,'../web/index.html'),'utf8');
const m=html.match(/\/\* NCA_CONTENT_START \*\/\s*const bundle = ([\s\S]*?);\s*\/\* NCA_CONTENT_END \*\//);assert.ok(m);assert.deepEqual(JSON.parse(m[1]),p);
assert.ok(!p.safety.chatScoresImportedAsAppAttempts);
console.log(`PASS: ${p.coverage.length} objective rows, ${p.cards.length} cards, ${p.questions.length} questions, shared source/desktop/web payload, legacy five question bodies/options/answers, old-state compatibility and answer mappings.`);
