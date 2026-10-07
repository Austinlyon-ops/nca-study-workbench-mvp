const { _electron } = require('playwright-core');
const { mkdtemp, writeFile, readFile, mkdir } = require('node:fs/promises');
const { join, resolve } = require('node:path');
const { tmpdir } = require('node:os');
const assert = require('node:assert/strict');
const content = require('../src/content.cjs');
const understanding = require('../src/understanding.cjs');

(async () => {
const root = resolve(__dirname, '..');
const output = resolve(root, 'output/playwright/v03-electron');
const userData = await mkdtemp(join(tmpdir(), 'nca-study-hub-v03-'));
await mkdir(output, { recursive:true });

const question = content.questions[0];
const v1 = {
  schemaVersion:1,
  settings:{ budget:45, lessonDay:1 },
  learning:{ cardStates:{ [question.cardId]:'uncertain' } },
  attempts:[{ id:'acceptance-v1-attempt', questionId:question.id, selected:['a'], correct:false, guessed:true, uncertain:true, questionable:false, answeredAt:'2026-10-06T00:00:00.000Z', firstAttempt:true, mode:'practice' }],
  reviews:{ [question.id]:{ questionId:question.id, createdAt:'2026-10-06T00:00:00.000Z', reviewCount:0, active:true, dueAt:'2026-10-06T00:01:00.000Z', reason:'还不确定' } },
  notes:[{ id:'acceptance-note', text:'合成隔离验收备注', createdAt:'2026-10-06T00:00:00.000Z', updatedAt:'2026-10-06T00:00:00.000Z' }],
  understanding:understanding.empty(),
  session:{ screen:'home', cardId:question.cardId, questionId:null },
  updatedAt:null
};
await writeFile(join(userData, 'study-state-v1.json'), JSON.stringify(v1, null, 2), 'utf8');

const env = { ...process.env, NCA_DESK_USER_DATA:userData };
delete env.ELECTRON_RUN_AS_NODE;
const errors = [];
const results = [];

async function launch() {
  const electronApp = await _electron.launch({ executablePath:require('electron'), args:[root], env });
  const page = await electronApp.firstWindow();
  page.setDefaultTimeout(15000);
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.locator('#app h1').waitFor();
  return { electronApp, page };
}

async function check(name, action) {
  try { const detail = await action(); results.push({ name, status:'PASS', detail }); console.log(`PASS ${name}`); }
  catch (error) { results.push({ name, status:'FAIL', error:error.stack }); console.error(`FAIL ${name}: ${error.message}`); }
}

async function noPageOverflow(page, screen) {
  const measurement = await page.evaluate(() => ({
    viewport:document.documentElement.clientWidth,
    document:document.documentElement.scrollWidth,
    bodyClient:document.body.clientWidth,
    bodyScroll:document.body.scrollWidth,
    offenders:[...document.querySelectorAll('body *')].map(element => {
      const box=element.getBoundingClientRect();
      return { tag:element.tagName, id:element.id, className:String(element.className||'').slice(0,100), left:Math.round(box.left), right:Math.round(box.right), width:Math.round(box.width), scrollWidth:element.scrollWidth };
    }).filter(item => item.right > document.documentElement.clientWidth + 1 || item.left < -1).slice(0,12)
  }));
  assert.ok(measurement.document <= measurement.viewport + 1, `${screen}: ${JSON.stringify(measurement)}`);
  assert.ok(measurement.bodyScroll <= measurement.bodyClient + 1, `${screen}: ${JSON.stringify(measurement)}`);
  return measurement;
}

let runtime = await launch();
try {
  await check('v1 fixture migrates in actual Electron without losing evidence', async () => {
    const state = await runtime.page.evaluate(() => window.ncaDesk.getState());
    assert.equal(state.schemaVersion, 2);
    assert.deepEqual(state.attempts, v1.attempts);
    assert.deepEqual(state.notes, v1.notes);
    assert.equal(state.reviewSchedule.cards[question.cardId].migratedFromV1, true);
    return { schemaVersion:state.schemaVersion, attempts:state.attempts.length, notes:state.notes.length };
  });

  await check('window minimum and security settings are active', async () => {
    const info = await runtime.electronApp.evaluate(({ app, BrowserWindow }) => {
      const win = BrowserWindow.getAllWindows()[0];
      win.setSize(1024, 768);
      const preferences = win.webContents.getLastWebPreferences();
      return { version:app.getVersion(), userData:app.getPath('userData'), bounds:win.getBounds(), contextIsolation:preferences.contextIsolation, sandbox:preferences.sandbox, nodeIntegration:preferences.nodeIntegration };
    });
    assert.equal(info.version, '0.3.0');
    assert.equal(info.userData, userData);
    assert.ok(info.bounds.width >= 1024 && info.bounds.height >= 768);
    assert.equal(info.contextIsolation, true);
    assert.equal(info.sandbox, true);
    assert.equal(info.nodeIntegration, false);
    return info;
  });

  for (const zoom of [1, 1.25, 1.5]) {
    await check(`1024×768、${Math.round(zoom * 100)}% 缩放下全部导航无整页横向溢出`, async () => {
      await runtime.electronApp.evaluate(({ BrowserWindow }, factor) => BrowserWindow.getAllWindows()[0].webContents.setZoomFactor(factor), zoom);
      const measurements = {};
      for (const screen of ['home','map','learn','cases','practice','review','test','progress','sources']) {
        await runtime.page.locator(`[data-nav="${screen}"]`).click();
        await runtime.page.locator('#app h1').waitFor();
        measurements[screen] = await noPageOverflow(runtime.page, screen);
      }
      await runtime.page.screenshot({ path:join(output, `navigation-${String(zoom).replace('.', '-')}.png`) });
      return measurements;
    });
  }

  await check('考点地图显示 22 项且关联跳转存在', async () => {
    await runtime.page.locator('[data-nav="map"]').click();
    assert.equal(await runtime.page.locator('.objective-row').count(), 22);
    assert.ok(await runtime.page.locator('[data-map-card]').count() > 0);
    assert.ok(await runtime.page.locator('[data-map-question]').count() > 0);
    assert.ok(await runtime.page.locator('[data-map-case]').count() > 0);
  });

  await check('六个虚构案例保存原答与提示暴露，且不改变题目或 FSRS 数量', async () => {
    await runtime.page.locator('[data-nav="cases"]').click();
    assert.equal(await runtime.page.locator('.case-card').count(), 6);
    const before = await runtime.page.evaluate(() => window.ncaDesk.getState());
    const first = runtime.page.locator('.case-card').first();
    const reference = first.locator('[data-case-reference]');
    await reference.evaluate(element => { element.open = true; element.dispatchEvent(new Event('toggle')); });
    await first.locator('[data-case-answer]').fill('隔离验收案例原答：先区分已知证据、未知项与下一步核查。');
    await first.locator('[data-case-confidence]').selectOption('medium');
    await first.locator('[data-case-assistance]').fill('展开了统一参考分析');
    await first.locator('[data-save-case]').click();
    await runtime.page.getByText('案例原答已保存；未计入正确率或复习算法', { exact:true }).waitFor();
    const after = await runtime.page.evaluate(() => window.ncaDesk.getState());
    assert.equal(after.caseAttempts.length, before.caseAttempts.length + 1);
    assert.equal(after.caseAttempts.at(-1).referenceSeen, true);
    assert.deepEqual(after.attempts, before.attempts);
    assert.equal(Object.keys(after.reviewSchedule.cards).length, Object.keys(before.reviewSchedule.cards).length);
  });

  await check('v2 state persists to isolated disk and survives restart', async () => {
    const before = await runtime.page.evaluate(() => window.ncaDesk.getState());
    const disk = JSON.parse(await readFile(join(userData, 'study-state-v1.json'), 'utf8'));
    assert.equal(disk.schemaVersion, 2);
    assert.deepEqual(disk.caseAttempts, before.caseAttempts);
    await runtime.electronApp.close();
    runtime = await launch();
    const reopened = await runtime.page.evaluate(() => window.ncaDesk.getState());
    assert.deepEqual(reopened.caseAttempts, before.caseAttempts);
    assert.deepEqual(reopened.attempts, before.attempts);
    return { caseAttempts:reopened.caseAttempts.length, attempts:reopened.attempts.length };
  });
} finally {
  await runtime.electronApp.close().catch(() => {});
}

assert.deepEqual(errors, [], `页面错误：${errors.join(' | ')}`);
const failed = results.filter(item => item.status === 'FAIL');
await writeFile(join(output, 'acceptance.json'), JSON.stringify({ testedAt:new Date().toISOString(), isolatedUserData:userData, results, errors, summary:{ pass:results.length-failed.length, fail:failed.length }, note:'自动化通过仅证明软件行为，不表示学习效果或知识掌握。' }, null, 2), 'utf8');
if (failed.length) process.exitCode = 1;
else console.log(`NCA Study Hub v0.3 Electron acceptance passed: ${results.length} checks.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
