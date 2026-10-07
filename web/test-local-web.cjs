/* Offline file:// regression in isolated Edge; no user profile or web server. */
const { chromium } = require('playwright-core');
const assert = require('node:assert/strict');
const { existsSync, mkdirSync, writeFileSync, readFileSync } = require('node:fs');
const { resolve, join } = require('node:path');
const { pathToFileURL } = require('node:url');
const { createHash } = require('node:crypto');
const edge = ['C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe','C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'].find(existsSync);
if (!edge) throw new Error('Microsoft Edge not found');
const file=resolve(__dirname,'index.html'), output=resolve(__dirname,'../output/playwright');
mkdirSync(output,{recursive:true});
const results=[], pass=name=>{results.push(name);console.log('PASS '+name)};
const saved=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('nca-study-desk-html-v1')));
async function at(page,id){
  await page.waitForFunction(id=>{
    const r=document.getElementById(id).getBoundingClientRect(), h=document.querySelector('.site-header').getBoundingClientRect();
    return r.top>=h.bottom-2&&r.top<h.bottom+15;
  },id);
}
async function layout(page,width){
  await page.setViewportSize({width,height:950});
  const m=await page.evaluate(()=>({
    viewport:innerWidth,scroll:document.documentElement.scrollWidth,
    small:[...document.querySelectorAll('button')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.height&&r.height<43.9}).map(e=>e.textContent.trim())
  }));
  assert.ok(m.scroll<=m.viewport,width+'px overflow: '+m.scroll);
  assert.deepEqual(m.small,[],width+'px small buttons');
}
(async()=>{
  const browser=await chromium.launch({executablePath:edge,headless:true});
  try{
    const context=await browser.newContext({viewport:{width:1440,height:1000},hasTouch:true,offline:true});
    const page=await context.newPage(), errors=[],requests=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
    page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url())});
    await page.goto(pathToFileURL(file).href);await page.locator('#start').waitFor();
    assert.equal(await page.locator('#view .stat').textContent(),'0/3');
    assert.ok((await page.locator('#workbench').boundingBox()).y>1000);
    for(const id of ['home','why','flow','features','roadmap','scope','difference','workbench'])assert.equal(await page.locator('#'+id).count(),1);
    assert.equal(await page.locator('footer').count(),1);
    await layout(page,1440);
    await page.screenshot({path:join(output,'nca-site-desktop-home.png')});
    pass('Offline file opens on website homepage; all requested sections present');
    for(const id of ['why','features','roadmap','scope','home']){
      await page.locator('#site-nav [data-scroll="'+id+'"]').click();await at(page,id);
    }
    await page.locator('.hero-secondary').click();await at(page,'roadmap');
    for(const details of await page.locator('.roadmap details').all()){
      const open=await details.evaluate(e=>e.open);await details.locator('summary').click();
      assert.equal(await details.evaluate(e=>e.open),!open);
      if(open)await details.locator('summary').click();
    }
    assert.equal(await page.locator('.roadmap li').count(),14);
    await page.locator('.cta-band button').click();await at(page,'workbench');await page.locator('#start').waitFor();
    await page.locator('.footer-links [data-workbench]').click();await at(page,'workbench');await page.locator('#search').waitFor();
    await page.locator('#site-nav .header-cta').click();await at(page,'workbench');await page.locator('#start').waitFor();
    await page.locator('.hero-primary').click();await at(page,'workbench');
    await page.locator('.knowledge').first().waitFor();
    await page.locator('.workbench-window').screenshot({path:join(output,'nca-site-desktop-workbench.png')});
    pass('All site navigation, CTA/footer entry targets, four roadmap expand/collapse controls');
    for(const width of [360,390,430]){
      await layout(page,width);
      await page.locator('#menu-toggle').tap();
      assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'true');
      await page.locator('#site-nav [data-scroll="home"]').tap();await at(page,'home');
      assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'false');
      if(width===390)await page.screenshot({path:join(output,'nca-site-mobile-390-home.png')});
      await page.locator('.hero-primary').tap();await at(page,'workbench');
      for(const panel of ['today','learn','quiz','review','sources']){
        await page.locator('#tool-nav [data-view="'+panel+'"]').tap();await layout(page,width);
      }
      assert.ok(Math.abs((await page.locator('.site-header').boundingBox()).y)<1);
    }
    pass('360/390/430px: menus, pinned navigation, all panels, 44px buttons and no horizontal overflow');
    await page.setViewportSize({width:390,height:950});
    await page.locator('#tool-nav [data-view="learn"]').tap();
    await page.locator('[data-status="ai|uncertain"]').tap();
    await page.locator('[data-status="cpu-gpu|explain"]').tap();
    await page.locator('.knowledge details summary').first().tap();
    assert.equal(await page.locator('.knowledge details').first().evaluate(e=>e.open),true);
    await page.locator('#goQuiz').tap();assert.equal(await page.locator('.answer').count(),0);
    await page.locator('#submit').tap();await page.getByText('请先选择至少一个选项。',{exact:true}).waitFor();
    assert.equal((await saved(page)).attempts.length,0);
    await page.locator('.question').evaluate(e=>e.scrollIntoView({block:'start',behavior:'instant'}));
    assert.ok((await page.locator('.question').boundingBox()).y >= (await page.locator('.site-header').boundingBox()).height);
    await page.screenshot({path:join(output,'nca-site-mobile-390-quiz.png')});
    await page.locator('.choice').nth(1).tap();await page.locator('.choice').nth(0).tap();
    assert.deepEqual((await saved(page)).quiz.selected,['a']);
    await page.reload();assert.deepEqual((await saved(page)).quiz.selected,['a']);
    await page.locator('#submit').tap();await page.getByText('这题暂时答错了',{exact:true}).waitFor();await page.locator('#next').tap();
    await page.locator('.choice').nth(0).tap();await page.locator('#guess').check();
    await page.locator('#submit').tap();await page.getByText('答对了',{exact:true}).waitFor();await page.locator('#next').tap();
    for(const i of [0,1,2,2])await page.locator('.choice').nth(i).tap();
    assert.deepEqual((await saved(page)).quiz.selected,['a','b']);
    await page.locator('#submit').tap();await page.getByText('答对了',{exact:true}).waitFor();await page.locator('#next').tap();
    for(const i of [0,1,2])await page.locator('.choice').nth(i).tap();
    await page.locator('#doubt').check();await page.locator('#submit').tap();
    await page.getByText('答对了',{exact:true}).waitFor();await page.locator('#next').tap();
    await page.locator('.choice').nth(1).tap();await page.locator('#submit').tap();await page.locator('#next').tap();
    await page.getByText('待复习（3）',{exact:true}).waitFor();
    const first=await saved(page);
    assert.equal(first.attempts.filter(a=>a.first).length,5);
    assert.equal(first.attempts.filter(a=>a.correct).length,4);
    assert.equal(first.reviews['q-q2'].reason,'猜对');
    assert.equal(first.reviews['card-ai'].active,true);
    assert.equal(first.reviews['doubt-q4'].active,false);
    await page.reload();assert.deepEqual((await saved(page)).attempts,first.attempts);
    await page.locator('[data-card="ai"]').first().tap();assert.equal((await saved(page)).activeCard,'ai');
    await page.locator('#tool-nav [data-view="review"]').tap();
    await page.locator('[data-redo="q1"]').tap();await page.locator('.choice').nth(1).tap();await page.locator('#submit').tap();
    assert.equal((await saved(page)).attempts.at(-1).first,false);await page.locator('#next').tap();
    await page.getByText('80%',{exact:true}).waitFor();
    assert.deepEqual((await saved(page)).attempts.slice(0,5),first.attempts);
    assert.equal((await saved(page)).attempts.length,6);
    pass('Learning, whole-row touch, empty submit, scoring, guess flag, review, first-score retention, draft/reload persistence');
    assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
    pass('No console/page errors or remote requests during offline flow');
    writeFileSync(join(output,'nca-site-acceptance.json'),JSON.stringify({
      testedAt:new Date().toISOString(),browser:await browser.version(),
      htmlSHA256:createHash('sha256').update(readFileSync(file)).digest('hex'),origin:'file://',network:'offline',
      results,realPhoneTested:false,
      screenshots:['nca-site-desktop-home.png','nca-site-desktop-workbench.png','nca-site-mobile-390-home.png','nca-site-mobile-390-quiz.png']
    },null,2));
  }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
