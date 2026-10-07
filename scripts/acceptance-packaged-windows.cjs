/* Packaged EXE acceptance only; never invokes the installer or installed app.
 * node scripts/acceptance-packaged-windows.cjs C:\path\win-unpacked\NCA\ Study\ Desk.exe
 */
const { _electron } = require('playwright-core');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const asar = require('@electron/asar');
const root = path.resolve(__dirname, '..');
const exe = path.resolve(process.argv[2] || '');
if (!process.argv[2] || !fs.existsSync(exe) || !exe.toLowerCase().includes('win-unpacked')) throw new Error('Specify a win-unpacked test EXE, never the installed app or installer');
const content = require('../src/content.cjs');
const expectedVersion = require('../package.json').version;
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const out = path.join(root, 'output/playwright', `windows-package-${stamp}`);
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'nca-packaged-acceptance-'));
fs.mkdirSync(out, { recursive: true });
const hash = b => createHash('sha256').update(b).digest('hex');
const fileHash = f => hash(fs.readFileSync(f));
const installed = path.join(process.env.LOCALAPPDATA, 'Programs/NCA Study Desk');
const installedFiles = ['NCA Study Desk.exe', 'resources/app.asar'].filter(f => fs.existsSync(path.join(installed,f)));
const installedBefore = Object.fromEntries(installedFiles.map(f => [f,fileHash(path.join(installed,f))]));
const report = { testedAt:new Date().toISOString(),executable:exe,executableSHA256:fileHash(exe),isolatedUserData:profile,expectedVersion,expectedContentVersion:content.version,checks:[],errors:[],remoteRequests:[],installedBefore,limitations:['Installer not executed; installation/update flow and SmartScreen not accepted.','Existing installed 0.1.0 app not launched or changed.','Automated tests are not real learner effectiveness evidence.'] };
const save = () => fs.writeFileSync(path.join(out,'acceptance.json'),JSON.stringify(report,null,2));
async function check(name,fn){try{const detail=await fn();report.checks.push({name,status:'PASS',detail});console.log('PASS '+name);}catch(e){report.checks.push({name,status:'FAIL',error:e.stack});console.error('FAIL '+name+': '+e.message);}save();}
async function launch(){const env={...process.env,NCA_DESK_USER_DATA:profile};delete env.ELECTRON_RUN_AS_NODE;const app=await _electron.launch({executablePath:exe,args:[],env});const p=await app.firstWindow();p.setDefaultTimeout(10000);p.on('pageerror',e=>report.errors.push(e.message));p.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});p.on('request',r=>{if(/^https?:/.test(r.url()))report.remoteRequests.push(r.url());});await p.locator('#app h1').waitFor();return{app,p};}
const state=async p=>{await p.evaluate(()=>saveChain);return p.evaluate(()=>window.ncaDesk.getState());};
(async()=>{
  await check('ASAR matches frozen source, content and package version',async()=>{const archive=path.join(path.dirname(exe),'resources/app.asar');const pkg=JSON.parse(asar.extractFile(archive,'package.json'));assert.equal(pkg.version,expectedVersion);const digests={};for(const f of ['src/content.cjs','src/renderer/renderer.js','src/state.cjs','src/main.cjs']){const packed=hash(asar.extractFile(archive,path.normalize(f)));assert.equal(packed,fileHash(path.join(root,f)),f);digests[f]=packed;}return{asarSHA256:fileHash(archive),version:pkg.version,digests};});
  let {app,p}=await launch();
  try{
    await check('packaged native startup, version, isolated data path and content',async()=>{const actual=await app.evaluate(({app})=>({appVersion:app.getVersion(),appPath:app.getAppPath(),userData:app.getPath('userData'),isPackaged:app.isPackaged,electron:process.versions.electron}));assert.equal(actual.appVersion,expectedVersion);assert.equal(actual.userData,profile);assert.equal(actual.isPackaged,true);assert.deepEqual(await p.evaluate(()=>window.ncaDesk.getContent()),content);await p.screenshot({path:path.join(out,'packaged-home.png')});return actual;});
    for(const lesson of content.lessons)await check(`packaged Day ${lesson.day} knowledge cards`,async()=>{await p.locator('[data-nav="home"]').click();await p.locator(`[data-lesson="${lesson.day}"]`).first().click();assert.equal(await p.locator('.knowledge-card').count(),lesson.cardIds.length);assert.equal(await p.locator('#app h1').textContent(),lesson.title);});
    await check('packaged new-lesson multiple choice, uncertain review and answer explanation',async()=>{const q=content.questions.find(q=>q.day>=5&&q.type==='multiple');await p.locator('[data-nav="sources"]').click();await p.locator('#search').fill(q.stem);await p.locator(`[data-found-q="${q.id}"]`).click();assert.equal(await p.locator('input[name="answer"][type="checkbox"]').count(),q.options.length);await p.locator('#uncertain').check();for(const id of q.answer)await p.locator(`input[name="answer"][value="${id}"]`).check();await p.locator('#submitAnswer').click();const s=await state(p);assert.equal(s.attempts.at(-1).correct,true);assert.equal(s.attempts.at(-1).uncertain,true);assert.equal(s.reviews[q.id].active,true);assert.ok((await p.locator('.answer').textContent()).includes(q.explanation));});
    await check('packaged search opens exact matching knowledge card',async()=>{await p.locator('[data-nav="sources"]').click();await p.locator('#search').fill('MIG');const button=p.locator('[data-found-card]').first(),id=await button.getAttribute('data-found-card');await button.click();assert.equal(await p.locator('.knowledge-card').count(),1);assert.equal(await p.locator('.knowledge-card').getAttribute('data-knowledge-id'),id);await p.screenshot({path:path.join(out,'packaged-search-card.png')});});
    await check('packaged real disk save and executable close/reopen persistence',async()=>{const before=await state(p);assert.deepEqual(JSON.parse(fs.readFileSync(path.join(profile,'study-state-v1.json'))).attempts,before.attempts);await app.close();({app,p}=await launch());assert.deepEqual((await state(p)).attempts,before.attempts);assert.deepEqual((await state(p)).reviews,before.reviews);assert.equal((await state(p)).session.focusCard,before.session.focusCard);});
  }finally{await app.close();}
  await check('packaged runtime has no console/page errors or external requests',async()=>{assert.deepEqual(report.errors,[]);assert.deepEqual(report.remoteRequests,[]);});
  await check('old installed executable and ASAR unchanged',async()=>{report.installedAfter=Object.fromEntries(installedFiles.map(f=>[f,fileHash(path.join(installed,f))]));assert.deepEqual(report.installedAfter,installedBefore);});
  report.finishedAt=new Date().toISOString();report.summary={pass:report.checks.filter(c=>c.status==='PASS').length,fail:report.checks.filter(c=>c.status==='FAIL').length};save();console.log(JSON.stringify({out,summary:report.summary}));if(report.summary.fail)process.exitCode=1;
})().catch(e=>{report.fatal=e.stack;save();console.error(e);process.exitCode=1;});
