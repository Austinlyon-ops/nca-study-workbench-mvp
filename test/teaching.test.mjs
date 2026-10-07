import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import validator from '../scripts/validate-content.cjs';
import teaching from '../scripts/render-teaching.cjs';

const root = new URL('../', import.meta.url);
const read = file => fs.readFileSync(new URL(file, root), 'utf8');
const content = JSON.parse(read('content/nca-content-v0.2.json'));
const trial = content.lessons.find(l => l.day === 3).teachingTrial;

test('理解检查拒绝悬空关联、缺失主题和重复英文诊断，不进入旧计分题库', () => {
  assert.equal(content.questions.length, 80);
  assert.ok(trial.exercises.every(e => !content.questions.some(q => q.id === e.id)));
  for (const breakTrial of [
    t => { t.exercises[0].sourceIds = ['missing']; },
    t => { t.exercises[0].relatedQuestionIds = ['missing']; },
    t => { t.exercises[4].supportTable.rows[0] = ['missing column']; },
    t => { t.diagnostic.promptIds = ['P-D03-02', 'P-D03-04', 'P-D03-06']; },
    t => { t.exercises.forEach(e => { e.cardIds = ['card-stack-driver']; }); }
  ]) {
    const copy = structuredClone(content);
    breakTrial(copy.lessons.find(l => l.day === 3).teachingTrial);
    assert.throws(() => validator.validateContent(copy));
  }
});

test('完整教学先于作答；参考解释与译文默认折叠，原答输入独立于选择题', () => {
  const lesson = content.lessons.find(l => l.day === 3);
  const html = teaching.renderTeaching(lesson, content);
  assert.equal((html.match(/data-teaching-exercise=/g) || []).length, 6);
  assert.equal((html.match(/<textarea\b/g)||[]).length,6);
  assert.equal((html.match(/data-full-lesson/g)||[]).length,5);
  assert.doesNotMatch(html, /<script\b|\son\w+=/i);
  assert.doesNotMatch(html, /<details\b[^>]*data-teaching-(feedback|translation)[^>]*\bopen(?:\s|=|>)/);
  for(const section of trial.fullLesson.sections) {
    assert.ok(html.includes(section.paragraphs[0]));
    assert.ok(html.includes(section.readingGuide[0]));
  }
  for (const e of trial.exercises) {
    const section = html.split(`data-teaching-exercise="${e.id}"`)[1].split('</section>')[0];
    const [prompt, feedback] = section.split('<details data-teaching-feedback>');
    assert.ok(feedback);
    for (const point of e.rubric) assert.ok(feedback.includes(point));
    if (e.referenceExplanation) for (const point of e.referenceExplanation) assert.ok(feedback.includes(point));
    if (e.translation) { assert.ok(prompt.includes('<details data-teaching-translation>')); assert.ok(prompt.includes(e.translation)); }
  }
  const copy = structuredClone(lesson);
  copy.teachingTrial.title = '<script>alert(1)</script>';
  assert.ok(teaching.renderTeaching(copy, content).includes('&lt;script&gt;'));
});

test('new explanations and trial revisions are validated without requiring every day to have a trial', () => {
  const day3 = content.lessons.find(l => l.day === 3);
  assert.ok(day3.teachingTrial.teachingRevision);
  for (const mutate of [
    t => { t.teachingRevision = ''; },
    t => { t.exercises.find(e => e.id === 'P-D03-02').referenceExplanation = []; },
    t => { t.exercises.find(e => e.id === 'P-D03-04').referenceExplanation = [42]; }
  ]) {
    const copy = structuredClone(content); mutate(copy.lessons.find(l => l.day === 3).teachingTrial);
    assert.throws(() => validator.validateContent(copy));
  }
  const html = teaching.renderTeaching(day3, content);
  assert.match(html, /为什么这样理解/);
  assert.match(html, /核对要点（原评价标准）/);
  assert.equal((html.match(/data-understanding-assistance/g) || []).length, day3.teachingTrial.exercises.filter(e => e.referenceExplanation).length);
  const md = teaching.lessonMarkdown(day3, content);
  assert.match(md, /为什么这样理解/);
  assert.match(md, /核对要点（原评价标准）/);
});

test('lesson revisions validate and appear in HTML and Markdown for days without teaching trials', () => {
  const copy = structuredClone(content);
  for (const day of [1, 2]) {
    const lesson = copy.lessons.find(l => l.day === day);
    assert.equal(lesson.teachingTrial, undefined);
    lesson.teachingRevision = `day${day}-fixture`;
    assert.doesNotThrow(() => validator.validateContent(copy));
    const html = teaching.renderTeaching(lesson, copy);
    assert.match(html, new RegExp(`data-teaching-revision="day${day}-fixture"`));
    assert.match(teaching.lessonMarkdown(lesson, copy), new RegExp(`NCA teaching revision: day${day}-fixture`));
    assert.doesNotMatch(html, /data-understanding-answer/);
    for (const invalid of ['', ' ', 42, 'x'.repeat(201)]) {
      const broken = structuredClone(copy);
      broken.lessons.find(l => l.day === day).teachingRevision = invalid;
      assert.throws(() => validator.validateContent(broken));
    }
  }
  const trialLesson = copy.lessons.find(l => l.day === 3);
  trialLesson.teachingRevision = 'day-fallback';
  trialLesson.teachingTrial.teachingRevision = 'trial-preferred';
  assert.match(teaching.renderTeaching(trialLesson, copy), /data-teaching-revision="trial-preferred"/);
  assert.match(teaching.lessonMarkdown(trialLesson, copy), /NCA teaching revision: trial-preferred/);
});

test('完整主课关系缺失会阻止生成，不把来源链接当正文',()=>{
  for(const breakLesson of [f=>{f.sections[0].paragraphs=[]},f=>{f.sections[1].readingGuide=[]},f=>{f.sections[0].cardIds=['missing']},f=>{f.sections[0].id='bad\"anchor'}]){
    const copy=structuredClone(content);breakLesson(copy.lessons.find(l=>l.day===3).teachingTrial.fullLesson);assert.throws(()=>validator.validateContent(copy));
  }
});

test('网页、桌面与可读课程使用同一教学补充，脚本语法有效', () => {
  const expected = Object.fromEntries(content.lessons.filter(l => l.teachingTrial || l.teachingBridge || l.materialGuide).map(l => [l.day, teaching.renderTeaching(l, content)]));
  const web = read('web/index.html'), desktop = read('src/renderer/renderer.js');
  for (const text of [web, desktop]) {
    const match = text.match(/\/\* NCA_TEACHING_START \*\/\s*const teachingSections = ([\s\S]*?);\s*\/\* NCA_TEACHING_END \*\//);
    assert.ok(match);
    assert.deepEqual(JSON.parse(match[1]), expected);
  }
  for (const l of content.lessons.filter(l => l.teachingTrial || l.teachingBridge || l.materialGuide)) {
    const md = read(`docs/day-${String(l.day).padStart(2, '0')}-lesson-v0.2.md`);
    assert.ok(md.includes(teaching.lessonMarkdown(l, content)));
    assert.equal(md.split('<!-- NCA_TEACHING_START -->').length, 2);
  }
  for (const [, script] of web.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)) new vm.Script(script);
  new vm.Script(desktop);
});
