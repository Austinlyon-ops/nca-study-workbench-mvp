from pathlib import Path
import json,re
from playwright.sync_api import sync_playwright
r=Path(__file__).resolve().parents[1];p=json.loads((r/'content/nca-content-v0.2.json').read_text())
h=(r/'src/renderer/index.html').read_text();h=re.sub(r'<link[^>]+styles.css[^>]*>',lambda _: '<style>'+(r/'src/renderer/styles.css').read_text()+'</style>',h);h=re.sub(r'<script src="renderer.js"></script>','',h);h=re.sub(r'<img[^>]*>','',h)
s={'schemaVersion':1,'settings':{'budget':45},'learning':{'cardStates':{}},'attempts':[],'reviews':{},'notes':[],'session':{'screen':'home','cardId':'card-ai-ml-dl','questionId':None},'updatedAt':None}
with sync_playwright() as w:
 b=w.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox']);pg=b.new_page(viewport={'width':1440,'height':1000});pg.set_default_timeout(5000);errors=[];pg.on('pageerror',lambda e:(errors.append(str(e)),print('PAGE ERROR',str(e),flush=True)))
 pg.set_content(h);pg.evaluate('([state,content])=>{window.__s=state;crypto.randomUUID=()=>("test-"+Date.now()+"-"+Math.random());window.ncaDesk={getState:async()=>window.__s,getContent:async()=>content,saveState:async v=>(window.__s=structuredClone(v)),openSource:async u=>(window.__opened=u)}}',[s,p]);pg.add_script_tag(content=(r/'src/renderer/renderer.js').read_text());pg.locator('#continue').wait_for();print('home',flush=True)
 for d in [1,2,3,4]:
  print('day',d,flush=True);pg.locator(f'[data-lesson="{d}"]').first.click();assert pg.locator('[data-knowledge-id]').count()==len([c for c in p['cards'] if c['day']==d])
 pg.locator('[data-lesson="3"]').first.click();pg.locator('#toPractice').click();pg.locator('input[value="a"]').check();pg.locator('#submitAnswer').click();assert '暂时答错' in pg.locator('.answer').inner_text()
 pg.locator('[data-nav="review"]').click();pg.locator('[data-card="card-stack-driver"]').first.click();assert pg.locator('[data-knowledge-id]').count()==1
 pg.locator('[data-nav="test"]').click();pg.locator('#startTest').click();assert '1 / 5' in pg.locator('#app .tag').all_text_contents()[0]
 pg.locator('[data-nav="progress"]').click();assert '/18' in pg.locator('#app').inner_text()
 assert not errors,errors
 (r/'test-results/desktop-renderer-acceptance.json').write_text(json.dumps({'mode':'Browser DOM harness with mocked Electron preload bridge; not installed Electron/Windows verification','passed':['Day1–4 routing','Day3 answer/incorrect feedback','precise review-card linking','legacy five-question short test retained','18-card progress denominator','no page errors'],'notTested':['Native Electron window','Native filesystem persistence','Installer','External shell browser launch']},ensure_ascii=False,indent=2));b.close()
print('PASS desktop renderer mock harness (not installed Electron)')
