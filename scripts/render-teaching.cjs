'use strict';

// Shared lesson markup. Answer persistence and feedback are bound by understanding-ui.js.
const { effectiveTeachingRevision } = require('../src/understanding.cjs');
const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const list = rows => '<ul>' + rows.map(s => `<li>${esc(s)}</li>`).join('') + '</ul>';
const steps = rows => rows.map(s => `<h4>${esc(s.title)}</h4><p>${esc(s.text)}</p>`).join('');
function sources(ids, p) {
  return ids.map(id => {
    const s = p.sources.find(s => s.id === id);
    return `<a href="${esc(s.url)}" data-teaching-source="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a>`;
  }).join('；');
}
function supportTable(table) {
  if (!table) return '';
  return `<div style="overflow-x:auto"><table class="table"><caption>${esc(table.caption)}</caption><thead><tr>${table.columns.map(c => `<th scope="col">${esc(c)}</th>`).join('')}</tr></thead><tbody>${table.rows.map(row => `<tr>${row.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p class="muted">${esc(table.note)}</p>`;
}
function materialHTML(g,p) {
  if(!g)return '';
  return `<aside class="panel material-guide"><h3>${esc(g.title)}</h3><p><b>当前主课的作用：</b>${esc(g.currentUse)}</p><p><b>什么时候先学到这里就可以：</b>${esc(g.whenToRead)}</p><details><summary>与原教材有什么不同，什么时候回看</summary><p>${esc(g.originalValue)}</p><p><b>具体差异：</b>${esc(g.difference)}</p>${g.readings.map(r=>`<section><h4>${esc(r.locator)}</h4><p>${sources([r.sourceId],p)}</p><p><b>带着这个问题读：</b>${esc(r.task)}</p><p><b>读到哪里停：</b>${esc(r.stop)}</p><p class="muted">${esc(r.warning)}</p></section>`).join("")}<p>${esc(g.officialUse)}</p><p class="muted">${esc(g.mediaStatus)}</p></details><p class="muted">${esc(g.scope)}</p></aside>`;
}
function materialMarkdown(g,p) {
  if(!g)return '';
  return `## ${g.title}\n\n当前主课：${g.currentUse}\n\n何时先用主课：${g.whenToRead}\n\n原教材：${g.originalValue}\n\n具体差异：${g.difference}\n\n${g.readings.map(r=>{const s=p.sources.find(s=>s.id===r.sourceId);return `- [${s.name}](${s.url})：${r.locator}\n  - 阅读任务：${r.task}\n  - 停止条件：${r.stop}\n  - 来源边界：${r.warning}`}).join("\n")}\n\n${g.officialUse}\n\n${g.mediaStatus}\n\n${g.scope}`;
}
function renderTeaching(lesson, p) {
  const t = lesson.teachingTrial, b = lesson.teachingBridge;
  const guide = materialHTML(lesson.materialGuide,p);
  const revision = effectiveTeachingRevision(p, lesson);
  if (!t && !b) return guide ? `<div data-teaching-day="${lesson.day}" data-teaching-revision="${esc(revision)}">${guide}</div>` : '';
  const wrap = body => `<article class="panel teaching-support" style="margin:16px 0;line-height:1.75;overflow-wrap:anywhere" data-teaching-day="${lesson.day}" data-teaching-revision="${esc(revision)}">${guide}${body}</article>`;
  if (b) return wrap(`<span class="tag">从 Day ${b.fromDay} 接着学</span><h3>${esc(b.title)}</h3><p>${esc(b.setup)}</p><details><summary>展开贯穿案例</summary>${steps(b.steps)}</details><h4>学完后试着解释</h4><p>${esc(b.selfCheck)}</p><details data-teaching-feedback><summary>先解释，再看核对要点</summary>${list(b.rubric)}<p class="muted">解释是理解检查，不自动记作已掌握或应用成绩。</p><p>${sources(b.sourceIds, p)}</p></details>`);
  const number = id => t.exercises.findIndex(e => e.id === id) + 1;
  const legacyExercise = (e, i) => `<section id="${esc(e.id)}" data-teaching-exercise="${esc(e.id)}" style="border-top:1px solid var(--line);padding:16px 0"><h4>理解练习 ${i + 1} · ${esc(e.title)}${e.optional?'（选做）':''}</h4><p lang="${e.language === 'en' ? 'en' : 'zh-CN'}">${esc(e.stem)}</p>${supportTable(e.supportTable)}${e.translation ? `<details data-teaching-translation><summary>需要时查看中文题意</summary><p>${esc(e.translation)}</p></details>` : ''}<label for="answer-${esc(e.id)}">用自己的话回答${e.language === 'en' ? '（可以用中文）' : ''}</label><textarea id="answer-${esc(e.id)}" data-understanding-answer rows="5" maxlength="12000" style="display:block;width:100%;box-sizing:border-box;padding:12px;font:inherit;line-height:1.6;resize:vertical" placeholder="可以写出理由，也可以说明具体卡在哪里。草稿保存在当前学习记录中。"></textarea><div class="actions" style="margin:10px 0"><label>把握程度 <select data-understanding-confidence aria-label="把握程度"><option value="unknown">未说明</option><option value="certain">比较确定</option><option value="uncertain">还不确定</option></select></label><label>此前是否接触过 <select data-understanding-prior aria-label="此前接触情况"><option value="unknown">记不清 / 未说明</option><option value="seen">见过题目或解释</option><option value="unseen">据我记忆没有见过</option></select></label></div><button class="secondary" data-understanding-submit>保存这次回答</button><p data-understanding-status class="muted" role="status" aria-live="polite"></p><details data-teaching-feedback><summary>需要时查看参考解释（统一参考，不是对你答案的点评）</summary>${list(e.rubric)}<p class="muted">考点 ${esc(e.objectiveIds.join(' / '))} · ${esc(e.cardIds.map(id => p.cards.find(c => c.id === id).title).join('、'))}</p><p>${sources(e.sourceIds, p)}</p></details><div data-understanding-history></div></section>`;
  const exercise = (e, i) => e.referenceExplanation ? `<section id="${esc(e.id)}" data-teaching-exercise="${esc(e.id)}" style="border-top:1px solid var(--line);padding:16px 0">
    <h4>理解练习 ${i + 1} · ${esc(e.title)}${e.optional?'（选做）':''}</h4><p lang="${e.language === 'en' ? 'en' : 'zh-CN'}">${esc(e.stem)}</p>${supportTable(e.supportTable)}
    ${e.translation ? `<details data-teaching-translation><summary>需要时查看中文题意</summary><p>${esc(e.translation)}</p></details>` : ''}
    <label for="answer-${esc(e.id)}">用自己的话回答${e.language === 'en' ? '（可以用中文）' : ''}</label>
    <textarea id="answer-${esc(e.id)}" data-understanding-answer rows="5" maxlength="12000" style="display:block;width:100%;box-sizing:border-box;padding:12px;font:inherit;line-height:1.6;resize:vertical" placeholder="可以写出理由，也可以说明具体卡在哪里。草稿保存在当前学习记录中。"></textarea>
    <div class="actions" style="margin:10px 0"><label>把握程度 <select data-understanding-confidence aria-label="把握程度"><option value="unknown">未说明</option><option value="certain">比较确定</option><option value="uncertain">还不确定</option></select></label><label>此前是否接触过 <select data-understanding-prior aria-label="此前接触情况"><option value="unknown">记不清 / 未说明</option><option value="seen">见过题目或解释</option><option value="unseen">据我记忆没有见过</option></select></label></div>
    ${e.referenceExplanation ? `<label for="assistance-${esc(e.id)}">本次借助了什么（选填；例如回看讲解、译文或提示，留空表示未说明）</label><input id="assistance-${esc(e.id)}" data-understanding-assistance maxlength="2000" style="display:block;width:100%;box-sizing:border-box;padding:10px;font:inherit" placeholder="只记录本次实际情况，不用于自动判分">` : ''}
    <button class="secondary" data-understanding-submit>保存这次回答</button><p data-understanding-status class="muted" role="status" aria-live="polite"></p>
    <details data-teaching-feedback><summary>${e.referenceExplanation ? '需要时查看参考解释与核对要点' : '需要时查看核对要点'}（统一参考，不是对你答案的点评）</summary>${e.referenceExplanation ? `<h5>为什么这样理解</h5>${e.referenceExplanation.map(v=>`<p>${esc(v)}</p>`).join('')}<h5>核对要点（原评价标准）</h5>` : ''}${list(e.rubric)}<p class="muted">考点 ${esc(e.objectiveIds.join(' / '))} · ${esc(e.cardIds.map(id => p.cards.find(c => c.id === id).title).join('、'))}</p><p>${sources(e.sourceIds, p)}</p></details>
    <div data-understanding-history></div></section>` : legacyExercise(e, i);
  const full = t.fullLesson;
  const fallback = [[0], [1, 3], [2], [], [4, 5]];
  const placement = full?.sections.map((s,i)=>s.exerciseIds ? s.exerciseIds.map(id=>t.exercises.findIndex(e=>e.id===id)) : fallback[i]);
  const main = full ? `<h3>${esc(full.title)}</h3><p>${esc(full.intro)}</p>${list(full.orientation)}<p class="muted">本课英文两项可任选一项，用中文回答；先说清理由，再熟悉英文词，不必把全套短答一次做完。</p><nav aria-label="本课讲解目录">${full.sections.map((s,i)=>`<p><a href="#${esc(s.id)}" data-teaching-jump="${esc(s.id)}">${i+1}. ${esc(s.title)}</a></p>`).join('')}</nav>${full.sections.map((s,i)=>`<details id="${esc(s.id)}" data-full-lesson ${i===0?'open':''}><summary>${i+1}. ${esc(s.title)}${s.priority==='optional'?' · 选读':' · 核心'} · 展开完整讲解</summary>${s.paragraphs.map(v=>`<p>${esc(v)}</p>`).join('')}<h4>${esc(s.example.title)}</h4>${s.example.paragraphs.map(v=>`<p>${esc(v)}</p>`).join('')}<h4>对照着理解</h4>${list(s.contrast)}<p><b>这一节带走：</b>${esc(s.takeaway)}</p><details><summary>依据与选读：已在正文讲解，无需读完原文再答题</summary><p>${sources(s.sourceIds,p)}</p>${(s.readingGuide||[]).map(v=>`<p>${esc(v)}</p>`).join('')}</details>${placement[i].map(j=>exercise(t.exercises[j],j)).join('')}</details>`).join('')}<h4>把关系串起来</h4>${list(full.summary)}<details><summary>按时间与理解情况安排</summary>${list(full.timeGuide)}</details>` : t.exercises.map(exercise).join('');
  return wrap(`<span class="tag">完整讲解与理解练习 · 试用</span><h3>${esc(t.title)}</h3><p>${esc(t.note)}</p><p class="muted">${esc(t.status)}。先学再练，可边看边问。短答单独保存，点评不计入选择题成绩。</p><p><a href="#understanding-feedback" data-teaching-jump="understanding-feedback">查看回答与请求点评</a></p><details><summary>本课学习目标</summary>${list(t.goals)}</details>${main}<section id="understanding-feedback" data-feedback-tools><h3>让回答得到针对性反馈</h3><p>保存两三项回答后，交给「NVIDIA L&E」点评。Codex 负责传递与回收，使用指定的 6 Pro；返回后在对应原答下显示补讲和下一问。</p><p data-understanding-count></p><div class="actions"><button class="primary" data-understanding-send>请求点评</button><button class="secondary" data-understanding-check>查看点评进展</button><button class="secondary" data-understanding-retry hidden>重试尚未送达的请求</button></div><p data-understanding-delivery role="status" aria-live="polite">尚未发送。回答和草稿可离线保存。</p><details><summary>使用说明与手动备份</summary><p>平时双击项目中的“启动学习工作台.cmd”，会自动准备点评服务，并用 Chrome 打开原学习页面。保持 Codex 已登录且目标任务空闲，保存回答后点击“请求点评”即可；后台重启后连接信息会自动更新。直接打开 HTML 仍可离线学习。启动器沿用 Chrome 通常使用的配置；若曾用多个配置，请回到原来有记录的学习页面。无需填写模型 API 密钥。</p><p>目标：NCA Study Desk｜主任务与学习工作流 → NVIDIA L&E（6 Pro）。点击发送即授权传递本课已保存的待点评回答；不传其他课程或选择题历史。</p><div class="actions"><button class="secondary" data-understanding-export>导出题目与回答包</button><label>导入点评文件 <input type="file" data-understanding-import accept=".json,application/json"></label></div></details></section><details><summary>可选回顾：${esc(t.diagnostic.minutes)} 分钟短诊断</summary><p>学过后想检查记忆时，选第 ${t.diagnostic.promptIds.map(number).join('、')} 项；英文可改选第 ${number(t.diagnostic.alternativeEnglishId)} 项。这不是开始本课的门槛。</p>${list(t.diagnostic.instructions)}</details><details><summary>怎样理解反馈和本次记录</summary>${list(t.feedback.dimensions)}${list(t.feedback.instructions)}<p>${esc(t.feedback.exposureNote)}</p></details><details><summary>${esc(t.bridge.title)}</summary><p>${esc(t.bridge.text)}</p>${list(t.bridge.steps)}</details>`);
}

function lessonMarkdown(lesson, p) {
  const t = lesson.teachingTrial, b = lesson.teachingBridge;
  const guide = `<!-- NCA teaching revision: ${effectiveTeachingRevision(p, lesson).replace(/-->/g, '--&gt;')} -->\n\n${materialMarkdown(lesson.materialGuide,p)}`;
  if (!t && !b) return guide;
  const mdList = rows => rows.map(s => '- ' + s).join('\n');
  const mdSteps = rows => rows.map(s => `### ${s.title}\n\n${s.text}`).join('\n\n');
  const mdSources = ids => ids.map(id => { const s = p.sources.find(s => s.id === id); return `- [${s.name}](${s.url}) — ${s.locator}`; }).join('\n');
  if (b) return `## ${b.title}\n\n${b.setup}\n\n${mdSteps(b.steps)}\n\n### 学完后试着解释\n\n${b.selfCheck}\n\n<details>\n<summary>先解释，再看核对要点</summary>\n\n${mdList(b.rubric)}\n\n${mdSources(b.sourceIds)}\n\n</details>\n\n本段不收集作答、不自动计分，不作为已掌握的证据。`;
  const exercises = t.exercises.map((e, i) => {
    const table = e.supportTable;
    const tableMd = table ? `\n\n${table.caption}\n\n|${table.columns.join('|')}|\n|${table.columns.map(() => '---').join('|')}|\n${table.rows.map(row => '|' + row.join('|') + '|').join('\n')}\n\n${table.note}` : '';
    return `### ${i + 1}. ${e.title}${e.optional?'（选做）':''}${e.language === 'en' ? '（英文，可用中文回答）' : ''}\n\n试用练习ID：\`${e.id}\`。\n\n${e.stem}${tableMd}\n\n<details>\n<summary>完成自己的回答后，再看参考解释${e.referenceExplanation ? '与核对要点' : ''}${e.translation ? '与译文' : ''}</summary>\n\n${e.translation ? '**题意：** ' + e.translation + '\n\n' : ''}${e.referenceExplanation ? '**为什么这样理解：**\n\n' + e.referenceExplanation.join('\n\n') + '\n\n**核对要点（原评价标准）：**\n\n' : ''}${mdList(e.rubric)}\n\n对应知识卡：${e.cardIds.join('、')}；考点：${e.objectiveIds.join('、')}；相关旧题：${e.relatedQuestionIds.join('、')}。\n\n${mdSources(e.sourceIds)}\n\n</details>`;
  }).join('\n\n');
  const number = id => t.exercises.findIndex(e => e.id === id) + 1;
  const full=t.fullLesson;
  const main=full?`## ${full.title}\n\n${full.intro}\n\n${mdList(full.orientation)}\n\n${full.sections.map(s=>`### ${s.title}${s.priority==='optional'?'（选读）':'（核心）'}\n\n${s.paragraphs.join('\n\n')}\n\n#### ${s.example.title}\n\n${s.example.paragraphs.join('\n\n')}\n\n${mdList(s.contrast)}\n\n**这一节带走：** ${s.takeaway}\n\n<details>\n<summary>依据与选读</summary>\n\n${mdSources(s.sourceIds)}\n\n${(s.readingGuide||[]).join('\n\n')}\n\n</details>`).join('\n\n')}\n\n### 本课关系总结\n\n${mdList(full.summary)}\n\n${mdList(full.timeGuide)}`:'';
  return `${guide}\n\n## ${t.title}\n\n状态：${t.status}；用户批准日期：${t.approvedOn}。\n\n${t.note}\n\n### 需要理解到什么程度\n\n${mdList(t.goals)}\n\n${main}\n\n## 理解练习\n\n网页和桌面源码可保存原答、修改稿与点评；本 Markdown 是可读讲义，不采集回答。先学后练，允许看提示；参考解释不等于针对性点评。\n\n${exercises}\n\n### 回答后的反馈\n\n${mdList(t.feedback.dimensions)}\n\n${mdList(t.feedback.instructions)}\n\n${t.feedback.exposureNote}\n\n### 可选回顾：${t.diagnostic.minutes}分钟短诊断\n\n第${t.diagnostic.promptIds.map(number).join('、')}项，英文可换第${number(t.diagnostic.alternativeEnglishId)}项；不是入课门槛。\n\n${mdList(t.diagnostic.instructions)}\n\n## ${t.bridge.title}\n\n${t.bridge.text}\n\n${mdList(t.bridge.steps)}`;
}
module.exports = { renderTeaching, lessonMarkdown };
