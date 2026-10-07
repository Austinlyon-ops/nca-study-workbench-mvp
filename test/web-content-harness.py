import json, re, hashlib, sys
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1];out=root/'test-results';out.mkdir(exist_ok=True)
bundle=json.loads((root/'content/nca-content-v0.2.json').read_text());key='nca-study-desk-html-v1';results=[]
def ok(s):results.append(s);print('PASS',s,flush=True)
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 ctx=browser.new_context(viewport={'width':1440,'height':1000},offline=True,accept_downloads=True)
 page=ctx.new_page();errors=[];remote=[]
 page.on('pageerror',lambda e:errors.append(str(e)));page.on('request',lambda r:remote.append(r.url) if r.url.startswith('http') and not r.url.startswith('http://127.0.0.1:8765/') else None)
 # Runtime blocks navigation; DOM is tested via set_content. Storage adapter is an explicit test double.
 page.evaluate("""() => {window.__testStore={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>window.__testStore[k]??null,setItem:(k,v)=>window.__testStore[k]=String(v),removeItem:k=>delete window.__testStore[k]}})}""")
 def reload_page():page.set_content((root/'web/index.html').read_text());page.locator('#start, #goQuiz, #submit, #next, #newQuiz, #search').first.wait_for()
 reload_page()
 assert page.locator('.hero-copy h1').count()==1
 for i in [1,2,3,4]:
  page.locator(f'[data-day="{i}"]').first.click()
  assert page.locator('[data-knowledge-id]').count()==len([c for c in bundle['cards'] if c['day']==i])
 ok('Day1–4 opened with correct knowledge-card counts; original website homepage retained')
 page.locator('[data-day="3"]').first.click();page.locator('#goQuiz').click()
 assert '6' in page.locator('#view .lead').inner_text()
 assert page.locator('.answer').count()==0
 page.locator('#submit').click();assert '请先' in page.locator('#notice').inner_text()
 # Day3 first question B; intentionally wrong A -> review.
 page.locator('input[value="a"]').check();page.locator('#submit').click()
 assert '这题暂时答错了' in page.locator('.answer').inner_text()
 assert '驱动' in page.locator('.answer').inner_text()
 ok('Empty submit prevented; answers hidden before submit; wrong answer explained')
 page.locator('[data-view="review"]').click()
 qid='Q-D03-001';page.locator(f'[data-card="card-stack-driver"]').first.click()
 assert page.locator('[data-knowledge-id]').count()==1
 assert page.locator('[data-knowledge-id="card-stack-driver"]').count()==1
 ok('Wrong Day3 question returns to exactly its associated card')
 page.locator('[data-view="review"]').click();page.locator(f'[data-redo="{qid}"]').click();page.locator('input[value="b"]').check();page.locator('#submit').click()
 stored=page.evaluate('(k)=>JSON.parse(localStorage.getItem(k))',key)
 ats=[a for a in stored['attempts'] if a['question']==qid]
 assert len(ats)==2 and ats[0]['first'] and not ats[0]['correct'] and not ats[1]['first'] and ats[1]['correct']
 reload_page();after=page.evaluate('(k)=>JSON.parse(localStorage.getItem(k))',key);assert after['attempts']==stored['attempts']
 ok('Retry appends; original incorrect first attempt retained; DOM reload preserves serialized history via explicit storage test double')
 # Multiple-choice: use search on sources; Q-D03-006 has A,C.
 page.locator('[data-view="sources"]').click();page.locator('#search').fill('哪两组对应正确')
 page.locator('[data-found-q="Q-D03-006"]').click()
 page.locator('input[value="a"]').check();page.locator('input[value="c"]').check();assert page.locator('.answer').count()==0
 page.locator('#submit').click();assert page.locator('.answer').inner_text().startswith('答对了')
 ok('Multi-select A/C graded only after submission; question search opens matching exercise')
 # Budget day4 20 ->3; all lesson cards are accessible.
 page.locator('[data-view="today"]').click();page.locator('[data-budget="20"]').click();page.locator('[data-day="4"]').first.click()
 assert page.locator('[data-knowledge-id]').count()==4;page.locator('#goQuiz').click();assert '3' in page.locator('#view .lead').inner_text()
 ok('20-minute budget selects 3 current-day questions without hiding unrelated-day linked cards')
 # coverage rows
 page.locator('[data-view="sources"]').click();assert page.locator('#view table tbody tr').count()==22
 ok('22-objective coverage displayed; browser download not end-to-end tested in restricted runtime')
 # Mobile views
 for width in [360,390,430]:
  page.set_viewport_size({'width':width,'height':900})
  for v in ['today','learn','quiz','review','sources']:
   page.locator(f'[data-view="{v}"]').click()
   assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'),(width,v,'overflow')
 page.locator('[data-view="today"]').click();page.locator('[data-day="3"]').first.click()
 page.screenshot(path=str(out/'mobile-day3.png'),full_page=False)
 page.locator('#goQuiz').click();page.screenshot(path=str(out/'mobile-quiz.png'),full_page=False)
 ok('360/390/430px all five workbench panels fit without page-wide horizontal overflow')
 page.set_viewport_size({'width':1440,'height':1000});page.locator('[data-view="today"]').click();page.locator('[data-day="3"]').first.click();page.screenshot(path=str(out/'desktop-day3.png'))
 assert not errors,errors;assert not remote,remote
 ok('No JavaScript errors or remote requests while using core features offline')
 # Replace isolated test-profile state with real-shape old-version fixture, not user data.
 fixture={'version':1,'view':'today','activeCard':'cpu-gpu','cardStatus':{'cpu-gpu':'explain'},'quiz':{'ids':['q1','q2','q3','q4','q5'],'index':0,'selected':[],'submitted':False,'runIds':[]},'attempts':[{'id':'old-1','question':'q1','selected':['a'],'correct':False,'guessed':False,'doubt':False,'first':True,'at':'2026-09-19T00:00:00Z'},{'id':'old-2','question':'q1','selected':['b'],'correct':True,'guessed':False,'doubt':False,'first':False,'at':'2026-09-19T00:01:00Z'}],'reviews':{'q-q1':{'key':'q-q1','kind':'question','id':'q1','active':True,'reason':'答错'}}}
 page.evaluate('([k,s])=>localStorage.setItem(k,JSON.stringify(s))',[key,fixture]);reload_page();page.locator('#start').wait_for();page.locator('[data-view="review"]').click()
 s=page.evaluate('(k)=>JSON.parse(localStorage.getItem(k))',key);assert s['attempts']==fixture['attempts']
 page.locator('[data-card="ai"]').first.click();assert page.locator('[data-knowledge-id="ai"]').count()==1
 page.locator('[data-day="4"]').first.click();s=page.evaluate('(k)=>JSON.parse(localStorage.getItem(k))',key);assert s['attempts']==fixture['attempts']
 ok('Old-version web aliases, scores and review links survive upgrade and day switching unchanged')
 ctx.close();browser.close()
report={'testedAt':'2026-09-24','environment':'Linux Chromium headless set_content; explicit in-memory localStorage test double; navigation blocked by runtime policy; no real user storage accessed','webSHA256':hashlib.sha256((root/'web/index.html').read_bytes()).hexdigest(),'passes':results,'notTested':['Direct file:// opening (runtime policy blocks it)','Native browser localStorage persistence and download','Real phone','Windows Electron installed EXE','Windows installer rebuild','Cloud/public deployment']}
(out/'web-content-acceptance.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
