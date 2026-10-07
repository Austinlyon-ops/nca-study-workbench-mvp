const { _electron } = require('playwright-core');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const content = require('../src/content.cjs');
const understanding = require('../src/understanding.cjs');

(async () => {
  const executablePath = path.resolve(process.argv[2] || '');
  if (!fs.existsSync(executablePath)) throw new Error('未找到已安装的 NCA Study Hub EXE。');
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'nca-study-hub-installed-'));
  const out = path.resolve(__dirname, '../output/playwright/installed-v03');
  fs.mkdirSync(out, { recursive:true });
  const q = content.questions[0];
  const fixture = {
    schemaVersion:1, settings:{ budget:20, lessonDay:1 }, learning:{ cardStates:{} },
    attempts:[{ id:'installed-v1-answer', questionId:q.id, selected:['a'], correct:false, guessed:false, uncertain:true, questionable:false, answeredAt:'2026-10-06T00:00:00.000Z', firstAttempt:true, mode:'practice' }],
    reviews:{ [q.id]:{ questionId:q.id, createdAt:'2026-10-06T00:00:00.000Z', reviewCount:0, active:true, dueAt:'2026-10-06T00:01:00.000Z', reason:'还不确定' } },
    notes:[], understanding:understanding.empty(), session:{ screen:'home', cardId:q.cardId, questionId:null }, updatedAt:null
  };
  fs.writeFileSync(path.join(profile, 'study-state-v1.json'), JSON.stringify(fixture, null, 2));
  const errors = [];
  const launch = async () => {
    const env={...process.env,NCA_DESK_USER_DATA:profile};delete env.ELECTRON_RUN_AS_NODE;
    const electronApp=await _electron.launch({executablePath,env});
    const page=await electronApp.firstWindow();page.setDefaultTimeout(15000);
    page.on('pageerror',e=>errors.push(e.message));
    await page.locator('#app h1').waitFor();
    return {electronApp,page};
  };
  let runtime=await launch();
  const first=await runtime.page.evaluate(()=>window.ncaDesk.getState());
  assert.equal(first.schemaVersion,2);assert.deepEqual(first.attempts,fixture.attempts);
  const identity=await runtime.electronApp.evaluate(({app,BrowserWindow})=>({version:app.getVersion(),name:app.getName(),title:BrowserWindow.getAllWindows()[0].getTitle(),userData:app.getPath('userData'),isPackaged:app.isPackaged}));
  assert.equal(identity.version,'0.3.0');assert.equal(identity.title,'NCA Study Hub');assert.equal(identity.userData,profile);assert.equal(identity.isPackaged,true);
  for(const screen of ['home','map','cases','review','sources']){await runtime.page.locator(`[data-nav="${screen}"]`).click();await runtime.page.locator('#app h1').waitFor();}
  await runtime.page.screenshot({path:path.join(out,'installed-app.png')});
  await runtime.electronApp.close();
  const disk=JSON.parse(fs.readFileSync(path.join(profile,'study-state-v1.json')));assert.equal(disk.schemaVersion,2);assert.deepEqual(disk.attempts,fixture.attempts);
  runtime=await launch();const reopened=await runtime.page.evaluate(()=>window.ncaDesk.getState());assert.deepEqual(reopened.attempts,fixture.attempts);await runtime.electronApp.close();
  assert.deepEqual(errors,[]);
  const report={testedAt:new Date().toISOString(),executablePath,isolatedUserData:profile,identity,checks:['v1 fixture migrated','isolated user data','navigation','close and reopen persistence','no page errors'],status:'PASS',note:'此验收只证明安装后软件行为，不表示学习效果或掌握程度。'};
  fs.writeFileSync(path.join(out,'acceptance.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify(report));
})().catch(error=>{console.error(error);process.exitCode=1;});
