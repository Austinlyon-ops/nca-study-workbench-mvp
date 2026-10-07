'use strict';
const assert = require('node:assert/strict');

// Validate the relationships before either runtime is generated.
function validateContent(p) {
  assert.equal(p.format, 'nca-study-content');
  const unique = (rows, field, label) => {
    const values = rows.map(x => x[field]);
    assert.ok(values.every(x => x !== undefined && x !== ''), label + ' missing ID');
    assert.equal(new Set(values).size, values.length, label + ' duplicate ID');
    return new Set(values);
  };
  const cards = unique(p.cards, 'id', 'cards');
  const questions = unique(p.questions, 'id', 'questions');
  const sources = unique(p.sources, 'id', 'sources');
  const objectives = unique(p.coverage, 'id', 'coverage');
  const days = unique(p.lessons, 'day', 'lessons');
  unique(p.cards, 'webId', 'web cards');
  unique(p.questions, 'webId', 'web questions');
  assert.equal(objectives.size, 22, 'official objective registry');
  const refs = (ids, known, label) => {
    assert.ok(Array.isArray(ids) && ids.length > 0, label + ' empty');
    assert.equal(new Set(ids).size, ids.length, label + ' duplicate');
    for (const id of ids) assert.ok(known.has(id), label + ': ' + id);
  };
  for (const c of p.cards) {
    assert.ok(days.has(c.day), c.id + ' lesson');
    refs(c.sourceIds, sources, c.id + ' source');
    refs(c.objectiveIds, objectives, c.id + ' objective');
    for (const field of ['title','objective','conclusion','explanation','terms','compare','scenario','extra','origin'])
      assert.ok(typeof c[field] === 'string' && c[field].trim(), c.id + ' missing ' + field);
  }
  for (const q of p.questions) {
    assert.ok(p.examSpec.domains.some(d => d.name === q.domain), q.id + ' unknown statistics domain');
    assert.ok(cards.has(q.cardId) && days.has(q.day), q.id + ' card/day');
    assert.equal(p.cards.find(c => c.id === q.cardId).day, q.day, q.id + ' cross-day card');
    refs(q.sourceIds, sources, q.id + ' source');
    refs(q.objectiveIds, objectives, q.id + ' objective');
    const optionIds = new Set(q.options.map(o => o[0]));
    assert.equal(optionIds.size, q.options.length, q.id + ' repeated option');
    refs(q.answer, optionIds, q.id + ' answer');
    assert.ok(['single','multiple'].includes(q.type), q.id + ' type');
    assert.ok(q.type === 'single' ? q.answer.length === 1 : q.answer.length >= 2, q.id + ' answer count');
    assert.ok(q.explanation && q.origin && q.reviewStatus, q.id + ' provenance/explanation');
    for (const [id, text] of q.options) assert.ok(text && q.analysis[id], q.id + ' option analysis ' + id);
  }
  for (const l of p.lessons) {
    refs(l.cardIds, cards, 'Day ' + l.day + ' cards');
    refs(l.questionIds, questions, 'Day ' + l.day + ' questions');
    assert.deepEqual([...l.cardIds].sort(), p.cards.filter(c => c.day === l.day).map(c => c.id).sort());
    assert.deepEqual([...l.questionIds].sort(), p.questions.filter(q => q.day === l.day).map(q => q.id).sort());
    assert.ok(l.questionIds.length >= Math.max(...Object.values(p.budgets).map(b => b.questions)), 'budget exceeds available questions');
  }
  const strings = (rows, label) => assert.ok(Array.isArray(rows) && rows.length && rows.every(s => typeof s === 'string' && s.trim()), label);
  const textFields = (row, fields, label) => fields.forEach(k => assert.ok(typeof row[k] === 'string' && row[k].trim(), label + ': ' + k));
  for (const row of p.coverage) {
    assert.deepEqual([...row.cardIds].sort(), p.cards.filter(c => c.objectiveIds.includes(row.id)).map(c => c.id).sort(), row.id + ' stale card coverage');
    assert.deepEqual([...row.questionIds].sort(), p.questions.filter(q => q.objectiveIds.includes(row.id)).map(q => q.id).sort(), row.id + ' stale question coverage');
    if (row.learningDepth !== undefined || row.assessmentEvidence !== undefined) {
      assert.ok(typeof row.learningDepth === 'string' && row.learningDepth.trim(), row.id + ' learning depth');
      assert.ok(typeof row.assessmentEvidence === 'string' && row.assessmentEvidence.trim(), row.id + ' assessment evidence');
    }
  }
  const cases = unique(p.cases || [], 'id', 'case');
  assert.ok(cases.size >= 6, 'at least six teaching cases');
  const coverageDomains = new Set(p.coverage.map(row => row.domain));
  for (const item of p.cases) {
    textFields(item, ['title', 'domain', 'status', 'background', 'task'], item.id);
    assert.equal(item.status, '虚构教学案例', item.id + ' fictional label');
    assert.ok(coverageDomains.has(item.domain), item.id + ' domain');
    strings(item.knownEvidence, item.id + ' evidence');
    strings(item.unknowns, item.id + ' unknowns');
    strings(item.referenceAnalysis, item.id + ' reference analysis');
    refs(item.objectiveIds, objectives, item.id + ' objectives');
    refs(item.cardIds, cards, item.id + ' cards');
    refs(item.sourceIds, sources, item.id + ' sources');
  }
  for (const domain of coverageDomains) {
    assert.ok(p.cases.filter(item => item.domain === domain).length >= 2, domain + ' needs two cases');
  }
  const steps = (rows, label) => {
    assert.ok(Array.isArray(rows) && rows.length, label);
    rows.forEach(row => textFields(row, ['title', 'text'], label));
  };
  for (const l of p.lessons) {
    const t = l.teachingTrial, b = l.teachingBridge;
    if (l.teachingRevision !== undefined) {
      assert.ok(typeof l.teachingRevision === 'string' && l.teachingRevision.trim() && l.teachingRevision.length <= 200, 'lesson teaching revision');
    }
    if(l.materialGuide){
      const g=l.materialGuide;
      textFields(g,['title','currentUse','originalValue','whenToRead','difference','scope','officialUse','mediaStatus'],'material guide');
      assert.ok(Array.isArray(g.readings)&&g.readings.length,'reading targets');
      for(const r of g.readings){refs([r.sourceId],sources,'reading source');textFields(r,['locator','task','stop','warning'],'reading target');}
    }
    assert.ok(!(t && b), 'one teaching section per lesson');
    if (t) {
      textFields(t, ['id', 'title', 'status', 'approvedOn', 'note'], 'teaching trial');
      assert.ok(p.teachingRevision, 'teaching revision');
      if (t.teachingRevision !== undefined) {
        assert.ok(typeof t.teachingRevision === 'string' && t.teachingRevision.trim() && t.teachingRevision.length <= 200, 'trial teaching revision');
      }
      strings(t.goals, 'teaching goals');
      assert.equal(t.exercises.length, 6, 'six teaching exercises');
      const trialIds = unique(t.exercises, 'id', 'teaching exercise');
      for (const e of t.exercises) {
        assert.ok(!questions.has(e.id), 'trial must not reuse scored question ID');
        textFields(e, ['title', 'stem'], e.id);
        assert.ok(['zh', 'en'].includes(e.language), e.id + ' language');
        refs(e.cardIds, new Set(l.cardIds), e.id + ' cards');
        refs(e.objectiveIds, objectives, e.id + ' objectives');
        refs(e.sourceIds, sources, e.id + ' sources');
        refs(e.relatedQuestionIds, questions, e.id + ' related questions');
        strings(e.rubric, e.id + ' rubric');
        if (e.referenceExplanation !== undefined) {
          strings(e.referenceExplanation, e.id + ' reference explanation');
          assert.ok(e.referenceExplanation.every(point => point.length <= 2000), e.id + ' reference explanation too long');
        }
        if (e.language === 'en') textFields(e, ['translation'], e.id);
        if (e.supportTable) {
          const table = e.supportTable;
          textFields(table, ['caption', 'note'], e.id + ' table');
          strings(table.columns, e.id + ' table columns');
          assert.ok(Array.isArray(table.rows) && table.rows.length, e.id + ' table rows');
          table.rows.forEach(row => { strings(row, e.id + ' table row'); assert.equal(row.length, table.columns.length); });
        }
      }
      assert.deepEqual([...new Set(t.exercises.flatMap(e => e.cardIds))].sort(), [...l.cardIds].sort(), 'teaching exercise card coverage');
      refs(t.diagnostic.promptIds, trialIds, 'diagnostic prompts');
      assert.equal(t.diagnostic.promptIds.length, 3, 'three short diagnostic tasks');
      const english = t.exercises.filter(e => e.language === 'en').map(e => e.id);
      assert.equal(english.length, 2, 'two English prompts');
      assert.equal(t.diagnostic.promptIds.filter(id => english.includes(id)).length, 1, 'only one English task in short diagnostic');
      assert.ok(english.includes(t.diagnostic.alternativeEnglishId) && !t.diagnostic.promptIds.includes(t.diagnostic.alternativeEnglishId), 'alternative English task');
      textFields(t.diagnostic, ['minutes'], 'diagnostic');
      strings(t.diagnostic.instructions, 'diagnostic instructions');
      textFields(t.caseStudy, ['title', 'setup', 'boundary'], 'case');
      steps(t.caseStudy.steps, 'case steps');
      strings(t.feedback.dimensions, 'feedback dimensions');
      strings(t.feedback.instructions, 'feedback instructions');
      textFields(t.feedback, ['exposureNote'], 'feedback');
      textFields(t.bridge, ['title', 'text'], 'bridge');
      strings(t.bridge.steps, 'bridge steps');
      assert.ok(days.has(t.bridge.nextDay), 'next lesson');
      if (t.fullLesson) {
        const f=t.fullLesson;
        textFields(f,['title','intro'],'full lesson');
        strings(f.orientation,'lesson orientation'); strings(f.summary,'lesson summary'); strings(f.timeGuide,'lesson time guide');
        assert.equal(f.sections.length,5,'five teaching sections');
        unique(f.sections,'id','lesson sections');
        for(const s of f.sections){
          assert.match(s.id,/^[A-Za-z][A-Za-z0-9_-]+$/,'safe lesson anchor');
          textFields(s,['title','takeaway'],s.id);
          refs(s.cardIds,new Set(l.cardIds),s.id+' cards'); refs(s.sourceIds,sources,s.id+' sources');
          strings(s.paragraphs,s.id+' explanation'); strings(s.contrast,s.id+' comparisons'); strings(s.readingGuide,s.id+' guided sources');
          textFields(s.example,['title'],s.id+' example'); strings(s.example.paragraphs,s.id+' example');
          if(s.priority!==undefined)assert.ok(['core','optional'].includes(s.priority),'section priority');
          if(s.exerciseIds!==undefined){assert.ok(Array.isArray(s.exerciseIds),'placed exercise list');if(s.exerciseIds.length)refs(s.exerciseIds,trialIds,'placed exercises');}
        }
        if(f.sections.some(s=>s.exerciseIds)){
          const placed=f.sections.flatMap(s=>s.exerciseIds||[]);
          assert.equal(new Set(placed).size,placed.length,'exercise placed once');
          assert.deepEqual([...placed].sort(),[...trialIds].sort(),'all exercises placed');
        }
        assert.deepEqual([...new Set(f.sections.flatMap(s=>s.cardIds))].sort(),[...l.cardIds].sort(),'main lesson card coverage');
      }
    }
    if (b) {
      assert.ok(days.has(b.fromDay), 'bridge previous lesson');
      textFields(b, ['title', 'setup', 'selfCheck'], 'teaching bridge');
      steps(b.steps, 'bridge steps');
      strings(b.rubric, 'bridge rubric');
      refs(b.sourceIds, sources, 'bridge sources');
      refs(b.objectiveIds, objectives, 'bridge objectives');
    }
  }
  unique(p.lessons.flatMap(l=>l.teachingTrial?.exercises||[]),'id','all teaching exercises');
  assert.equal(p.safety.chatScoresImportedAsAppAttempts, false);
  return p;
}
module.exports = { validateContent };
