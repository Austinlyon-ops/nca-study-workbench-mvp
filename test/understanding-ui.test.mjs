import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
const U = require('../src/understanding.cjs');
const UI = require('../src/understanding-ui.js');
const content = JSON.parse(readFileSync(new URL('../content/nca-content-v0.2.json', import.meta.url), 'utf8'));
const lesson = content.lessons.find(l => l.day === 3);
const e = lesson.teachingTrial.exercises[0];
const now = '2026-09-25T12:00:00.000Z';
const options = { contentVersion: content.version, teachingRevision: U.effectiveTeachingRevision(content, lesson) };
function saved(text = '原答', raw = U.empty()) { return U.submitAnswer(raw, e, text, options, now); }
function review(packet) {
  return { format: 'nca-understanding-feedback', version: 1, packetId: packet.packetId,
    source: { name: 'NVIDIA L&E', model: 'test' }, createdAt: now,
    items: packet.items.map(i => ({ attemptId: i.attemptId, answerText: i.answerText,
      assessment: { concept: '概念', reasoning: '理由', terminology: '术语', english: '不适用' },
      strengths: [], gaps: [], misconceptions: [], explanation: '针对实际回答的解释', nextQuestion: '' })) };
}
test('feedback rendering escapes source, answer-derived remarks and list contents', () => {
  const attack = '<img src=x onerror="alert(1)">';
  const f = { source: { name: attack, model: attack }, createdAt: attack };
  const item = { assessment: { concept: attack, reasoning: attack, terminology: attack, english: attack }, strengths: [attack], gaps: [attack], misconceptions: [attack], explanation: attack, nextQuestion: attack };
  const html = UI.feedbackHTML(f, item);
  assert.equal(html.includes('<img'), false);
  assert.ok(html.includes('&lt;img'));
  assert.equal(html.includes('onerror="'), false);
});
test('request helper preserves exact submitted body and strips local delivery metadata without mutation', () => {
  const made = U.makePacket(saved().state, lesson, content, { now });
  const stored = made.state.packets[0];
  stored.delivery = { status: 'submitted', message: 'transport details', updatedAt: now };
  const packet = UI.requestFor(stored);
  assert.deepEqual(packet, made.packet);
  assert.equal(stored.delivery.status, 'submitted');
  assert.deepEqual(stored.attemptIds, [made.packet.items[0].attemptId]);
});

// A small, inert DOM simulation: no browser, page navigation, localStorage or network.
function fakeNode() {
  return { value: '', textContent: '', innerHTML: '', disabled: false, open: false, dataset: {},
    listeners: {}, addEventListener(name, fn) { this.listeners[name] = fn; },
    remove() {}, click() { this.onclick?.({ preventDefault() {} }); }, scrollIntoView() {} };
}
function fakeRoot() {
  const selectors = new Map();
  for (const key of ['data-feedback-tools', 'data-understanding-delivery', 'data-understanding-count', 'data-understanding-export', 'data-understanding-import', 'data-understanding-send', 'data-understanding-check', 'data-understanding-retry']) selectors.set('[' + key + ']', fakeNode());
  for (const ex of lesson.teachingTrial.exercises) {
    const children = new Map();
    for (const key of ['data-understanding-answer', 'data-understanding-confidence', 'data-understanding-prior', 'data-understanding-status', 'data-understanding-submit', 'data-understanding-history', 'data-teaching-feedback', 'data-teaching-translation']) children.set('[' + key + ']', fakeNode());
    if (ex.referenceExplanation) children.set('[data-understanding-assistance]', fakeNode());
    children.get('[data-understanding-confidence]').value = 'unknown';
    children.get('[data-understanding-prior]').value = 'unknown';
    selectors.set(`[data-teaching-exercise="${ex.id}"]`, { querySelector: key => children.get(key) });
  }
  return { querySelector: key => selectors.get(key) || null, querySelectorAll: () => [] };
}
function harness(initial, respond, afterSet = async () => {}) {
  let root = fakeRoot();
  const names = ['NcaUnderstanding', 'NCA_FEEDBACK_BRIDGE', 'document', 'fetch', 'setInterval', 'clearInterval'];
  const previous = new Map(names.map(n => [n, Object.getOwnPropertyDescriptor(globalThis, n)]));
  let record = initial;
  const notifications = [], requests = [];
  globalThis.NcaUnderstanding = U;
  globalThis.NCA_FEEDBACK_BRIDGE = { url: 'http://127.0.0.1:18773', token: 'test-token-'.repeat(5) };
  globalThis.document = { createElement: () => fakeNode(), head: { appendChild(tag) { queueMicrotask(() => tag.onload()); } } };
  globalThis.fetch = async (url, init) => { requests.push({ url, init }); const value=await respond(url,init); return value?.httpStatus ? {ok:false,status:value.httpStatus,json:async()=>value.body} : { ok: true, json: async () => value }; };
  globalThis.setInterval = () => 1;
  globalThis.clearInterval = () => {};
  let writes = 0;
  const mount = () => UI.mount({ root, content, lesson, get: () => record, set: async next => {
    const previous = record; record = next;
    try { await afterSet(++writes); } catch (error) { if (record === next) record = previous; throw error; }
  }, notify: (...args) => notifications.push(args) });
  mount();
  return { get root() { return root; }, requests, notifications, read: () => record,
    remount() { root = fakeRoot(); mount(); },
    async flush() { for (let i = 0; i < 8; i++) await new Promise(resolve => setImmediate(resolve)); },
    close() { UI.unmount(); for (const [name, descriptor] of previous) { if (descriptor) Object.defineProperty(globalThis, name, descriptor); else delete globalThis[name]; } } };
}
test('newly saved revision must not resend the still-outstanding original attempt', async () => {
  const first = saved();
  const made = U.makePacket(first.state, lesson, content, { now });
  made.state.packets[0].delivery = { status: 'submitted', message: 'waiting', updatedAt: now };
  const revised = saved('修改稿', made.state);
  const h = harness(revised.state, url => url.endsWith('/health') ? { status: 'ok' } : { status: 'queued', message: 'waiting' });
  try {
    h.root.querySelector('[data-understanding-send]').click(); await h.flush();
    const sends = h.requests.filter(r => r.url.endsWith('/requests') && r.init.method === 'POST');
    assert.equal(sends.length, 1, 'a new attempt can be sent while the original awaits feedback');
    for (const sent of sends) {
      const ids = JSON.parse(sent.init.body).packet.items.map(i => i.attemptId);
      assert.equal(ids.includes(first.attempt.id), false, 'an attempt already submitted in another packet must not be sent again');
    }
  } finally { h.close(); }
});

test('old Day3 pending answers stay visible but cannot contaminate a new request', async () => {
  const old = U.submitAnswer(U.empty(), lesson.teachingTrial.exercises[1], '旧版原答', { ...options, teachingRevision: content.teachingRevision }, now);
  const current = U.submitAnswer(old.state, e, '新版原答', options, now);
  const h = harness(current.state, url => url.endsWith('/health') ? { status: 'ok' } : { status: 'queued', message: 'waiting' });
  try {
    assert.match(h.root.querySelector('[data-understanding-count]').textContent, /1 次旧版待处理/);
    h.root.querySelector('[data-understanding-send]').click(); await h.flush();
    const sends = h.requests.filter(r => r.url.endsWith('/requests') && r.init.method === 'POST');
    assert.equal(sends.length, 1);
    assert.deepEqual(JSON.parse(sends[0].init.body).packet.items.map(item => item.answerText), ['新版原答']);
    assert.equal(h.read().attempts[0].answerText, '旧版原答');
  } finally { h.close(); }
});

for (const deliveryStatus of ['submitted', 'uncertain']) {
  test(`old ${deliveryStatus} packet does not block new-version answers and remains pollable`, async () => {
    const oldLesson = structuredClone(lesson);
    oldLesson.teachingTrial.teachingRevision = 'old-ui-fixture';
    const old = U.submitAnswer(U.empty(), e, '旧版已发送原答', { ...options, teachingRevision: 'old-ui-fixture' }, now);
    const made = U.makePacket(old.state, oldLesson, content, { now });
    made.state.packets[0].delivery = { status: deliveryStatus, message: 'old request', updatedAt: now };
    const current = saved('本版新答', made.state);
    const h = harness(current.state, url => {
      if (url.endsWith('/health')) return { status: 'ok' };
      if (url.endsWith('/requests/' + made.packet.packetId)) return { packetId: made.packet.packetId, status: 'completed', feedback: review(made.packet) };
      return { status: 'queued' };
    });
    try {
      h.root.querySelector('[data-understanding-send]').click(); await h.flush();
      const sends = h.requests.filter(r => r.url.endsWith('/requests') && r.init.method === 'POST');
      assert.equal(sends.length, 1);
      const newPacket = JSON.parse(sends[0].init.body).packet;
      assert.equal(newPacket.teachingRevision, options.teachingRevision);
      assert.deepEqual(newPacket.items.map(item => item.attemptId), [current.attempt.id]);
      assert.deepEqual(UI.requestFor(h.read().packets[0]), made.packet, 'old snapshot is never rebuilt from the new lesson');
      h.root.querySelector('[data-understanding-check]').click(); await h.flush();
      assert.ok(h.requests.some(r => r.url.endsWith('/requests/' + made.packet.packetId) && r.init.method === 'GET'));
      assert.equal(h.read().attempts[0].status, 'reviewed');
      assert.equal(h.read().attempts[1].status, 'pending');
      assert.deepEqual(UI.requestFor(h.read().packets[0]), made.packet);
      assert.equal(h.requests.filter(r => r.url.endsWith('/requests') && r.init.method === 'POST').length, 1);
    } finally { h.close(); }
  });
}

test('old blocked packet retries its original identity and manual feedback still imports after revision', async () => {
  const oldLesson = structuredClone(lesson);
  oldLesson.teachingTrial.teachingRevision = 'old-retry-fixture';
  const old = U.submitAnswer(U.empty(), e, '旧版待重试原答', { ...options, teachingRevision: 'old-retry-fixture' }, now);
  const made = U.makePacket(old.state, oldLesson, content, { now });
  made.state.packets[0].delivery = { status: 'blocked', retryable: true, message: 'not delivered', updatedAt: now };
  const h = harness(made.state, () => ({ packetId: made.packet.packetId, status: 'submitted' }));
  try {
    const retry = h.root.querySelector('[data-understanding-retry]');
    assert.equal(retry.hidden, false);
    retry.click(); await h.flush();
    assert.equal(h.requests.length, 1);
    assert.ok(h.requests[0].url.endsWith('/requests/' + made.packet.packetId + '/retry'));
    assert.deepEqual(JSON.parse(h.requests[0].init.body), { confirmRetry: true });
    assert.deepEqual(UI.requestFor(h.read().packets[0]), made.packet);
    assert.equal(h.read().packets.length, 1);
    const input = h.root.querySelector('[data-understanding-import]');
    const json = JSON.stringify(review(made.packet));
    input.onchange({ target: { files: [{ size: json.length, text: async () => json }], value: 'fixture.json' } });
    await h.flush();
    assert.equal(h.read().attempts[0].status, 'reviewed');
    assert.equal(h.read().feedback[0].packetId, made.packet.packetId);
    assert.deepEqual(UI.requestFor(h.read().packets[0]), made.packet);
  } finally { h.close(); }
});

test('optional current-help note is saved with only the selected exercise and remains an answer condition', async () => {
  const ex = lesson.teachingTrial.exercises.find(item => item.id === 'P-D03-02');
  const h = harness(U.empty(), () => ({}));
  try {
    const section = h.root.querySelector(`[data-teaching-exercise="${ex.id}"]`);
    const note = section.querySelector('[data-understanding-assistance]');
    const answer = section.querySelector('[data-understanding-answer]');
    note.value = '先看了本节讲解'; note.listeners.input();
    answer.value = '我的解释'; answer.listeners.input(); await h.flush();
    section.querySelector('[data-understanding-submit]').click(); await h.flush();
    assert.equal(h.read().attempts[0].assistanceNote, '先看了本节讲解');
    assert.equal(h.read().attempts[0].answerText, '我的解释');
    assert.equal(h.root.querySelector(`[data-teaching-exercise="${e.id}"]`).querySelector('[data-understanding-assistance]')?.value || '', '');
    assert.deepEqual(h.read().attempts.map(attempt => attempt.exerciseId), [ex.id]);
  } finally { h.close(); }
});
test('a queued old-page draft cannot overwrite newer text after navigating back', async () => {
  let release;
  const held = new Promise(resolve => { release = resolve; });
  const h = harness(U.empty(), () => ({}), count => count === 1 ? held : Promise.resolve());
  const type = text => {
    const input = h.root.querySelector(`[data-teaching-exercise="${e.id}"]`).querySelector('[data-understanding-answer]');
    input.value = text; input.listeners.input();
  };
  try {
    type('原'); await h.flush(); // First async disk write is still pending.
    type('原答'); // Queued in the first page's work queue.
    h.remount();
    type('原答的新补充'); await h.flush();
    release(); await h.flush();
    assert.equal(h.read().drafts[e.id].text, '原答的新补充');
  } finally { release(); await h.flush(); h.close(); }
});
test('polling a packet cannot mark it completed using another known packet feedback', async () => {
  const first = saved();
  const a = U.makePacket(first.state, lesson, content, { now });
  const second = saved('修改稿', a.state);
  const b = U.makePacket(second.state, lesson, content, { now });
  b.state.packets[0].delivery = { status: 'submitted', message: 'waiting', updatedAt: now };
  const h = harness(b.state, () => ({ status: 'completed', message: 'done', feedback: review(b.packet) }));
  try {
    h.root.querySelector('[data-understanding-check]').click(); await h.flush();
    assert.notEqual(h.read().packets[0].delivery.status, 'completed');
    assert.equal(h.read().feedback.length, 0, 'mismatched packet feedback is rejected, not silently imported into another request');
    assert.equal(h.read().attempts[0].status, 'pending');
  } finally { h.close(); }
});
test('dispatch is aborted if its durable reservation cannot be saved', async () => {
  const h = harness(saved().state, url => url.endsWith('/health') ? { status: 'ok' } : { status: 'queued', message: 'waiting' }, count => {
    if (count === 2) throw new Error('simulated disk write failure');
  });
  try {
    h.root.querySelector('[data-understanding-send]').click(); await h.flush();
    assert.equal(h.requests.filter(r => r.url.endsWith('/requests') && r.init.method === 'POST').length, 0);
    assert.equal(h.read().attempts[0].status, 'pending');
    assert.ok(h.notifications.some(row => row[0].includes('simulated disk write failure')));
  } finally { h.close(); }
});
test('navigating back during connection does not send the same packet twice', async () => {
  let release;
  const held = new Promise(resolve => { release = resolve; });
  let healthCalls = 0;
  const h = harness(saved().state, async url => {
    if (url.endsWith('/health')) { if (++healthCalls === 1) await held; return { status: 'ok' }; }
    return { status: 'queued', message: 'waiting' };
  });
  try {
    h.root.querySelector('[data-understanding-send]').click(); await h.flush();
    h.remount(); h.root.querySelector('[data-understanding-send]').click(); await h.flush();
    release(); await h.flush();
    assert.equal(h.requests.filter(r => r.url.endsWith('/requests') && r.init.method === 'POST').length, 1);
  } finally { release(); await h.flush(); h.close(); }
});

test('service credentials changed after health are reloaded before submission without losing answers', async () => {
  const initial = saved().state, fresh = 'new-token-'.repeat(5);
  const h = harness(initial, (url, init) => {
    if(url.endsWith('/health')) { globalThis.NCA_FEEDBACK_BRIDGE.token=fresh; return {ok:true}; }
    assert.equal(init.headers['X-NCA-Bridge'], fresh);
    return {status:'submitted'};
  });
  try {
    h.root.querySelector('[data-understanding-send]').click(); await h.flush();
    assert.equal(h.requests.filter(r=>r.init.method==='POST').length,1);
    assert.equal(h.read().packets[0].delivery.status,'submitted');
    assert.deepEqual(h.read().attempts,initial.attempts);
  } finally { h.close(); }
});

test('explicit pre-acceptance credential expiry refreshes once and preserves the identical packet', async () => {
  let postCount=0;
  const h=harness(saved().state,(url,init)=>{
    if(url.endsWith('/health'))return {ok:true};
    if(++postCount===1){
      globalThis.NCA_FEEDBACK_BRIDGE.token='rotated-token-'.repeat(4);
      return {httpStatus:401,body:{code:'NCA_CONNECTION_EXPIRED',error:'expired'}};
    }
    assert.equal(init.headers['X-NCA-Bridge'],'rotated-token-'.repeat(4));
    return {status:'submitted'};
  });
  try {
    h.root.querySelector('[data-understanding-send]').click();await h.flush();
    const sends=h.requests.filter(r=>r.init.method==='POST');
    assert.equal(sends.length,2);assert.equal(sends[0].init.body,sends[1].init.body);
    assert.equal(h.read().packets[0].delivery.status,'submitted');
  } finally {h.close();}
});

test('repeated credential failure is bounded and prevents submission',async()=>{
  const h=harness(saved().state,()=>({httpStatus:401,body:{code:'NCA_CONNECTION_EXPIRED',error:'expired'}}));
  try {
    h.root.querySelector('[data-understanding-send]').click();await h.flush();
    assert.equal(h.requests.length,2);
    assert.equal(h.requests.filter(r=>r.init.method==='POST').length,0);
    assert.equal(h.read().attempts[0].status,'pending');
  }finally{h.close();}
});

test('lost POST response never causes automatic resend',async()=>{
  const h=harness(saved().state,url=>{if(url.endsWith('/health'))return {ok:true};throw new TypeError('network disconnected');});
  try {
    h.root.querySelector('[data-understanding-send]').click();await h.flush();
    assert.equal(h.requests.filter(r=>r.init.method==='POST').length,1);
    assert.equal(h.read().packets[0].delivery.status,'uncertain');
    assert.equal(h.read().attempts[0].status,'pending');
  }finally{h.close();}
});
