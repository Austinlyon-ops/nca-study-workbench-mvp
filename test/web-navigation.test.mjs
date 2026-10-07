import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import content from '../src/content.cjs';
import understanding from '../src/understanding.cjs';
import teaching from '../scripts/render-teaching.cjs';

// Execute the shipped page's routing/rendering code with isolated storage and
// minimal DOM adapters. This does not read the user's browser or learning data.
function page() {
  const html = fs.readFileSync(new URL('../web/index.html', import.meta.url), 'utf8');
  const app = html.slice(html.indexOf('    const source={...bundle.source'))
    .split('  })();')[0];
  const nodes = new Map();
  const node = () => ({ innerHTML: '', textContent: '', dataset: {},
    classList: { toggle() {}, remove() {} }, setAttribute() {},
    addEventListener() {}, scrollIntoView() {} });
  const document = {
    querySelector(selector) {
      if (!selector.startsWith('#')) return null;
      if (!nodes.has(selector)) nodes.set(selector, node());
      return nodes.get(selector);
    },
    querySelectorAll(selector) {
      if (!['[data-day]', '[data-course]'].includes(selector)) return [];
      const key = selector === '[data-day]' ? 'day' : 'course';
      const container = document.querySelector(key === 'day' ? '#view' : '#course-map');
      if (!container.buttons || container.buttonsHTML !== container.innerHTML) {
        container.buttonsHTML = container.innerHTML;
        container.buttons = [...container.innerHTML.matchAll(new RegExp(`data-${key}="(\\d+)"`, 'g'))]
          .map(([, day]) => ({ dataset: { [key]: day }, click() { this.onclick(); } }));
      }
      return container.buttons;
    }
  };
  const saved = { version: 1, view: 'learn', lessonDay: 3,
    cardStatus: { ai: 'uncertain' },
    attempts: [{ question: 'fixture', correct: true }],
    reviews: { fixture: { active: true } },
    understanding: understanding.empty() };
  let stored = JSON.stringify(saved);
  const sandbox = {
    bundle: content,
    teachingSections: Object.fromEntries(content.lessons.map(l => [l.day, teaching.renderTeaching(l, content)])),
    document, NcaUnderstanding: understanding,
    NcaUnderstandingUI: { mount() {}, unmount() {} },
    STORAGE_KEY: 'nca-study-desk-html-v1',
    localStorage: {
      getItem(key) { assert.equal(key, 'nca-study-desk-html-v1'); return stored; },
      setItem(key, value) { assert.equal(key, 'nca-study-desk-html-v1'); stored = value; }
    },
    requestAnimationFrame(fn) { fn(); }, setTimeout() {}
  };
  vm.runInNewContext(app, sandbox);
  return { document, saved, state: () => JSON.parse(stored) };
}

test('网页 Day 1–8 按钮可反复切换课程、保存停止点且不改写学习记录', () => {
  const p = page();
  for (const day of [1, 2, 4, 5, 6, 7, 8, 3, 8, 1]) {
    p.document.querySelectorAll('[data-day]').find(b => Number(b.dataset.day) === day).click();
    const state = p.state();
    assert.equal(state.lessonDay, day);
    assert.equal(state.view, 'learn');
    assert.equal(state.activeCard, content.cards.find(c => c.day === day).webId);
    assert.ok(p.document.querySelector('#view').innerHTML.includes(content.lessons.find(l => l.day === day).title));
    for (const key of ['attempts', 'cardStatus', 'reviews', 'understanding'])
      assert.deepEqual(state[key], p.saved[key]);
  }
});

test('课程地图与首页进入学习均可切换到全部八天', () => {
  const p = page();
  for (const day of [1, 2, 3, 4, 5, 6, 7, 8]) {
    p.document.querySelectorAll('[data-course]').find(b => Number(b.dataset.course) === day).click();
    assert.equal(p.state().lessonDay, day);
    p.document.querySelector('#goHome').onclick();
    p.document.querySelectorAll('[data-day]').filter(b => Number(b.dataset.day) === day).at(-1).click();
    assert.equal(p.state().lessonDay, day);
    assert.equal(p.state().view, 'learn');
  }
});
