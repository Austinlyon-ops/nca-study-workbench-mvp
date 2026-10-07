/* Shared browser/Electron teaching interactions; no grading or model credentials. */
(function (host) {
  'use strict';
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const bullet = rows => rows.length ? '<ul>' + rows.map(v => '<li>' + escape(v) + '</li>').join('') + '</ul>' : '<p class="muted">未列出</p>';
  const requestFor = saved => { const packet = structuredClone(saved); delete packet.attemptIds; delete packet.delivery; return packet; };
  function feedbackHTML(feedback, item) {
    const labels = {concept:'概念',reasoning:'理由与关系',terminology:'术语',english:'英文读题'};
    return `<article style="border-left:3px solid #76b900;padding:12px;margin:12px 0"><h5>针对这次原答的点评</h5><p class="muted">${escape(feedback.source.name)} · ${escape(feedback.source.model)} · ${escape(feedback.createdAt)}（来源由交接记录标明）</p>${Object.entries(labels).map(([k,v])=>`<p><b>${v}：</b>${escape(item.assessment[k])}</p>`).join('')}<b>已经说清楚的部分</b>${bullet(item.strengths)}<b>还需要说明的部分</b>${bullet(item.gaps)}<b>需要纠正的理解</b>${bullet(item.misconceptions)}<p style="white-space:pre-wrap"><b>补讲：</b>${escape(item.explanation)}</p>${item.nextQuestion?`<p><b>再想一想：</b>${escape(item.nextQuestion)}</p>`:''}<p class="muted">可在本题输入框继续回答并保存为修改稿；原答与本次点评保留。</p></article>`;
  }
  let cleanup = () => {}, serial = Promise.resolve();
  const pendingDrafts = new Map();
  const inFlight = new Set();
  function unmount() { cleanup(); cleanup = () => {}; }
  function mount(options) {
    unmount();
    const {root, content, lesson, get, set, notify, configPath = 'feedback-bridge.local.js'} = options;
    if (!lesson.teachingTrial || !root.querySelector('[data-feedback-tools]')) return;
    const U = host.NcaUnderstanding;
    const exercises = lesson.teachingTrial.exercises;
    const revision = U.effectiveTeachingRevision(content, lesson);
    const exerciseById = new Map(exercises.map(exercise => [exercise.id, exercise]));
    const find = selector => root.querySelector(selector);
    let disposed = false, polling = false, sending = false, connectionLoad;
    const messages = {prepared:'已准备，尚未发送',queued:'已排队',dispatching:'正在投递',submitted:'已投递，等待点评',uncertain:'送达待核实，请勿重发',blocked:'投递暂停，请查看提示',completed:'点评已返回'};
    const deliveryBox = find('[data-understanding-delivery]');
    const say = message => { if (!disposed) deliveryBox.textContent = message; };
    function data() { return U.normalize(get(), content); }
    function write(next) { return set(next); }
    function run(action) { serial = serial.then(action).catch(error => { say(error.message); notify(error.message, false); }); return serial; }
    function lessonAttempts(record) { return record.attempts.filter(a => exerciseById.has(a.exerciseId)); }
    function currentAttempt(attempt) { const exercise = exerciseById.get(attempt.exerciseId); return Boolean(exercise && attempt.promptText === exercise.stem && attempt.contentVersion === content.version && attempt.teachingRevision === revision); }
    function selectedAttempts(record) { return lessonAttempts(record).filter(a => a.status === 'pending' && currentAttempt(a)); }
    function repaint() {
      if (disposed) return;
      const record = data();
      const attemptsForLesson = lessonAttempts(record);
      const oldPending = attemptsForLesson.filter(a => a.status === 'pending' && !currentAttempt(a)).length;
      find('[data-understanding-count]').textContent = `本课已保存 ${attemptsForLesson.length} 次回答，${selectedAttempts(record).length} 次本版待点评${oldPending ? `，${oldPending} 次旧版待处理（原答与已存请求保留，不用新版解释重新组包）` : ''}。`;
      for (const exercise of exercises) {
        const section = find(`[data-teaching-exercise="${exercise.id}"]`);
        const attempts = record.attempts.filter(a => a.exerciseId === exercise.id);
        section.querySelector('[data-understanding-history]').innerHTML = attempts.map((a,i) => {
          const reviews = record.feedback.flatMap(f => f.items.filter(item=>item.attemptId===a.id).map(item=>feedbackHTML(f,item))).join('');
          return `<details ${i===attempts.length-1?'open':''}><summary>第 ${i+1} 次保存${a.revisionOf?' · 修改稿':''} · ${a.status==='reviewed'?'已有点评':currentAttempt(a)?'本版待点评':'旧版待处理'}</summary><p class="muted">${escape(a.submittedAt)} · 教学版 ${escape(a.teachingRevision)} · ${a.referenceSeenAt?'保存前有本次教学版参考展开记录，不等于已理解':'未记录本次教学版参考展开，不等于独立未见'}${a.translationSeenAt?' · 已展开译文':''} · 此前接触情况：${escape({seen:'见过',unseen:'自述未见',unknown:'未说明'}[a.priorExposure]||a.priorExposure)}</p>${a.assistanceNote?`<p class="muted">本次借助（自述）：${escape(a.assistanceNote)}</p>`:''}<blockquote style="white-space:pre-wrap;overflow-wrap:anywhere">${escape(a.answerText)}</blockquote>${reviews}</details>`;
        }).join('');
      }
      const latest = record.packets.filter(p=>p.lessonDay===lesson.day).at(-1);
      if (latest?.delivery) say(`${messages[latest.delivery.status]||latest.delivery.status}：${latest.delivery.message}`);
      const retryButton=find('[data-understanding-retry]');
      if(retryButton)retryButton.hidden=!record.packets.some(p=>p.lessonDay===lesson.day&&p.delivery?.status==='blocked'&&p.delivery.retryable);
    }
    try { data(); } catch (error) {
      say(`理解练习记录无法校验：${error.message}。已有记录未覆盖，请先导出备份。`);
      root.querySelectorAll('[data-understanding-submit],[data-understanding-send],[data-understanding-export]').forEach(b=>b.disabled=true);
      return;
    }
    for (const exercise of exercises) {
      const section = find(`[data-teaching-exercise="${exercise.id}"]`);
      const input = section.querySelector('[data-understanding-answer]');
      const confidence = section.querySelector('[data-understanding-confidence]');
      const prior = section.querySelector('[data-understanding-prior]');
      const assistance = section.querySelector('[data-understanding-assistance]');
      const status = section.querySelector('[data-understanding-status]');
      const draft = pendingDrafts.get(exercise.id) || data().drafts[exercise.id];
      if (draft) { input.value = draft.text; confidence.value = draft.confidence; prior.value = draft.priorExposure; if (assistance) assistance.value = draft.assistanceNote || ''; }
      const capture = () => ({text:input.value,confidence:confidence.value,priorExposure:prior.value,...(assistance ? {assistanceNote:assistance.value} : {})});
      const draftChanged = () => {
        const value = capture();
        pendingDrafts.set(exercise.id,value);
        run(async () => { await write(U.saveDraft(data(),exercise,value.text,value)); if(pendingDrafts.get(exercise.id)===value)pendingDrafts.delete(exercise.id);if (!disposed) status.textContent='草稿已保存；点击“保存这次回答”后才能请求点评。'; });
      };
      input.addEventListener('input',draftChanged); confidence.addEventListener('change',draftChanged); prior.addEventListener('change',draftChanged);
      if (assistance) assistance.addEventListener('input',draftChanged);
      section.querySelector('[data-understanding-submit]').onclick = () => {
        const value = capture();
        run(async () => {
          const result=U.submitAnswer(data(),exercise,value.text,{...value,referenceSeen:section.querySelector('[data-teaching-feedback]').open,translationSeen:Boolean(section.querySelector('[data-teaching-translation]')?.open),contentVersion:content.version,teachingRevision:revision,baseTeachingRevision:content.teachingRevision});
          await write(result.state); status.textContent='这次原答已保存，等待点评；继续编辑后保存会保留为修改稿。'; repaint();
        });
      };
      for (const [selector,kind] of [['[data-teaching-feedback]','reference'],['[data-teaching-translation]','translation']]) {
        const details=section.querySelector(selector);
        if (details) details.addEventListener('toggle',()=> { if (details.open) run(async()=> { await write(U.recordExposure(data(),exercise.id,kind,undefined,kind==='reference'?revision:undefined)); }); });
      }
    }
    root.querySelectorAll('[data-teaching-jump]').forEach(link=>link.onclick=event=>{
      event.preventDefault(); const target=root.querySelector('#'+link.dataset.teachingJump);
      if(target){if(target.tagName==='DETAILS')target.open=true;let parent=target.parentElement;while(parent&&parent!==root){if(parent.tagName==='DETAILS')parent.open=true;parent=parent.parentElement;}target.scrollIntoView({behavior:'smooth',block:'start'});if(typeof target.focus==='function'){target.tabIndex=-1;target.focus({preventScroll:true});}}
    });
    async function packetForPending() {
      const record=data();
      const occupied=new Set(record.packets.filter(p=>p.delivery&&p.delivery.status!=='prepared').flatMap(p=>p.attemptIds));
      const pending=selectedAttempts(record).filter(a=>!occupied.has(a.id));
      if (!pending.length) throw new Error('没有新的待发送回答；已投递的回答请点击“查看点评进展”，或先保存一项新的回答。');
      const ids=pending.map(a=>a.id).sort();
      const existing=record.packets.find(p=>p.lessonDay===lesson.day && JSON.stringify([...p.attemptIds].sort())===JSON.stringify(ids));
      if(existing) return requestFor(existing);
      const result=U.makePacket(record,lesson,content,{attemptIds:ids});
      await write(result.state); return result.packet;
    }
    function download(packet,name) { const url=URL.createObjectURL(new Blob([JSON.stringify(packet,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500); }
    find('[data-understanding-export]').onclick=()=>run(async()=>{const packet=await packetForPending();download(packet,`nca-understanding-${packet.packetId}.json`);say('题目与原答包已导出，尚未发送；导出不会创建点评。');});
    find('[data-understanding-import]').onchange=event=>{const file=event.target.files[0]; if(!file)return;run(async()=>{if(file.size>1024*1024)throw new Error('点评文件超过1MB，未导入。');const packet=JSON.parse(await file.text());await write(U.importFeedback(data(),packet,content));repaint();say('点评已导入并匹配到对应原答。');});event.target.value='';};
    async function connect() {
      // Re-read current credentials; a service restart must not strand an open lesson.
      // Concurrent polls/sends share only the pending load, never a cached token.
      if(connectionLoad)return connectionLoad;
      connectionLoad=new Promise((resolve,reject)=>{
        const tag=document.createElement('script');let settled=false;
        const finish=error=>{if(settled)return;settled=true;clearTimeout(timer);tag.remove();error?reject(error):resolve();};
        const unavailable=()=>new Error('点评服务未就绪，请双击“启动学习工作台.cmd”后再试；已保存的回答仍在。');
        const timer=setTimeout(()=>finish(unavailable()),5000);
        tag.src=configPath+'?v='+Date.now();tag.onload=()=>finish();tag.onerror=()=>finish(unavailable());document.head.appendChild(tag);
      }).then(()=>{
        const value=host.NCA_FEEDBACK_BRIDGE;
        if(!value || value.url!=='http://127.0.0.1:18773' || typeof value.token!=='string' || value.token.length<32)throw new Error('点评连接信息未就绪，请运行“启动学习工作台.cmd”；已保存的回答仍在。');
        return {url:value.url,token:value.token};
      });
      try{return await connectionLoad;}finally{connectionLoad=undefined;}
    }
    async function api(path,body,refreshed=false) {
      const bridge=await connect(); const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),15000);
      try { const response=await fetch(bridge.url+path,{method:body?'POST':'GET',headers:{'X-NCA-Bridge':bridge.token,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,signal:controller.signal});const result=await response.json();
        // This precise response is emitted before any request is accepted. Other
        // failures (including uncertain POST delivery) must never auto-resend.
        if(response.status===401 && result.code==='NCA_CONNECTION_EXPIRED' && !refreshed){clearTimeout(timeout);return api(path,body,true);}
        if(!response.ok)throw new Error(result.message||result.error||`点评服务返回 ${response.status}`);return result; }
      catch(error){if(error.name==='AbortError')throw new Error('点评服务响应超时，发送结果待核实。请先查看进展，不要另建重复请求。');if(error instanceof TypeError)throw new Error('无法连接点评服务，请运行“启动学习工作台.cmd”。如果刚才已点击发送，请先查看进展，勿重复提交。');throw error;}finally{clearTimeout(timeout);}
    }
    async function updateDelivery(packetId,result) {
      let record=data(); const saved=record.packets.find(p=>p.packetId===packetId);if(!saved)throw new Error('未找到本地请求记录，未写入外部结果。');
      if(result.packetId&&result.packetId!==packetId)throw new Error('点评服务返回了不同请求的状态，未写入。');
      if(result.status==='completed'){
        if(!result.feedback||result.feedback.packetId!==packetId)throw new Error('点评包与本次请求不匹配，未标记完成。');
        const returned=(result.feedback.items||[]).map(item=>item.attemptId).sort();
        if(JSON.stringify(returned)!==JSON.stringify([...saved.attemptIds].sort()))throw new Error('点评没有完整覆盖本批原答，未标记完成。');
        record=U.importFeedback(record,result.feedback,content);
      }
      record.packets.find(p=>p.packetId===packetId).delivery={status:result.status,message:result.message||messages[result.status]||'',retryable:result.retryable===true,updatedAt:new Date().toISOString()};
      await write(record);repaint();return true;
    }
    find('[data-understanding-send]').onclick=async()=>{
      if(sending)return;sending=true;find('[data-understanding-send]').disabled=true;
      let ownedPacketId;
        try {
          const packet=await run(packetForPending);if(!packet)return;
          if(inFlight.has(packet.packetId)){say('这批回答正在连接或投递，请稍候。');return;}
          inFlight.add(packet.packetId);ownedPacketId=packet.packetId;
          await api('/health');
          const reserved=await run(()=>updateDelivery(packet.packetId,{status:'dispatching',message:'请求已准备发送，等待点评服务确认。'}));
          if(!reserved)return;
          try { const result=await api('/requests',{packet});await run(()=>updateDelivery(packet.packetId,result)); }
          catch(error){await run(()=>updateDelivery(packet.packetId,{status:'uncertain',message:error.message+' 请查看进展或检查原 Codex 任务。'}));}
        } catch(error){say(error.message);notify(error.message,false);}finally { if(ownedPacketId)inFlight.delete(ownedPacketId);sending=false;if(!disposed)find('[data-understanding-send]').disabled=false; }
    };
    async function check(explicit=false) {
      if(polling||disposed)return;polling=true;
      try {
        const packets=data().packets.filter(p=>p.lessonDay===lesson.day && p.delivery && !['prepared','completed'].includes(p.delivery.status));
        if(!packets.length){if(explicit)say('没有正在等待的点评请求。');return;}
        for(const packet of packets){const result=await api('/requests/'+encodeURIComponent(packet.packetId));await run(()=>updateDelivery(packet.packetId,result));}
      } catch(error){if(explicit)throw error;}
      finally{polling=false;}
    }
    find('[data-understanding-check]').onclick=()=>check(true).catch(error=>{say(error.message);notify(error.message,false);});
    const retryButton=find('[data-understanding-retry]');
    if(retryButton)retryButton.onclick=async()=>{
      const saved=data().packets.find(p=>p.lessonDay===lesson.day&&p.delivery?.status==='blocked'&&p.delivery.retryable);
      if(!saved||inFlight.has(saved.packetId))return;
      inFlight.add(saved.packetId);retryButton.disabled=true;
      try { const response=await api('/requests/'+encodeURIComponent(saved.packetId)+'/retry',{confirmRetry:true});await run(()=>updateDelivery(saved.packetId,response)); }
      catch(error){say(error.message);notify(error.message,false);}finally{inFlight.delete(saved.packetId);retryButton.disabled=false;}
    };
    const timer=setInterval(()=>{if(!disposed&&!sending)check(false);},10000);
    cleanup=()=>{disposed=true;clearInterval(timer);};repaint();
  }
  const api={mount,unmount,feedbackHTML,requestFor};
  if(typeof module==='object'&&module.exports)module.exports=api;
  else host.NcaUnderstandingUI=api;
})(typeof globalThis==='object'?globalThis:this);
