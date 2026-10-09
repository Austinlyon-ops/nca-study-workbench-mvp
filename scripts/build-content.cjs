/* Shared content -> desktop module and offline web payload. No dependencies. */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const {renderTeaching,lessonMarkdown}=require('./render-teaching.cjs');
const p=JSON.parse(fs.readFileSync(path.join(root,'content/nca-content-v0.2.json'),'utf8'));
require('./validate-content.cjs').validateContent(p);
const target=path.join(root,'web/index.html');
let html=fs.readFileSync(target,'utf8');
const a='/* NCA_CONTENT_START */',b='/* NCA_CONTENT_END */';
if(html.split(a).length!==2||html.split(b).length!==2||html.indexOf(a)>html.indexOf(b))throw new Error('Invalid web content markers');
const json=JSON.stringify(p,null,2);
html=html.slice(0,html.indexOf(a)+a.length)+'\nconst bundle = '+JSON.stringify(p).replace(/</g,'\\u003c')+';\n'+html.slice(html.indexOf(b));
const teachingSections=Object.fromEntries(p.lessons.filter(l=>l.teachingTrial||l.teachingBridge||l.materialGuide).map(l=>[l.day,renderTeaching(l,p)]));
const ta='/* NCA_TEACHING_START */',tb='/* NCA_TEACHING_END */';
function injectTeaching(text){
  if(text.split(ta).length!==2||text.split(tb).length!==2||text.indexOf(ta)>text.indexOf(tb))throw new Error('Invalid teaching markers');
  return text.slice(0,text.indexOf(ta)+ta.length)+'\nconst teachingSections = '+JSON.stringify(teachingSections).replace(/</g,'\\u003c')+';\n'+text.slice(text.indexOf(tb));
}
html=injectTeaching(html);
const ua='/* NCA_UNDERSTANDING_START */',ub='/* NCA_UNDERSTANDING_END */';
function injectUnderstanding(text){
  if(text.split(ua).length!==2||text.split(ub).length!==2)throw new Error('Invalid understanding markers');
  const scripts=['src/understanding.cjs','src/understanding-ui.js'].map(f=>fs.readFileSync(path.join(root,f),'utf8').replace(/<\/script/gi,'<\\/script')).join('\n');
  return text.slice(0,text.indexOf(ua)+ua.length)+'\n'+scripts+'\n'+text.slice(text.indexOf(ub));
}
html=injectUnderstanding(html);
function writeChanged(file,text){if(!fs.existsSync(file)||fs.readFileSync(file,'utf8')!==text)fs.writeFileSync(file,text)}
writeChanged(path.join(root,'src/content.cjs'),'// Generated from content/nca-content-v0.2.json; edit the shared source, then rebuild.\nmodule.exports = '+json+';\n');
writeChanged(target,html);
const renderer=path.join(root,'src/renderer/renderer.js');
writeChanged(renderer,injectUnderstanding(injectTeaching(fs.readFileSync(renderer,'utf8'))));
for(const lesson of p.lessons.filter(l=>l.teachingTrial||l.teachingBridge||l.materialGuide)){
  const file=path.join(root,`docs/day-${String(lesson.day).padStart(2,'0')}-lesson-v0.2.md`);
  const start='<!-- NCA_TEACHING_START -->',end='<!-- NCA_TEACHING_END -->';
  const old=fs.readFileSync(file,'utf8');
  const section=start+'\n\n'+lessonMarkdown(lesson,p)+'\n\n'+end;
  if(old.includes(start)!==old.includes(end))throw new Error('Invalid lesson teaching markers');
  const updated=old.includes(start)?old.slice(0,old.indexOf(start))+section+old.slice(old.indexOf(end)+end.length):old.trimEnd()+'\n\n'+section+'\n';
  writeChanged(file,updated);
}
const cell=s=>String(s).replace(/\|/g,' / ').replace(/\n/g,' ');
let coverage=`# NCA考点覆盖表｜${p.version}\n\n由共享内容生成；日期 ${p.builtOn}。官方22项是范围地图，映射与覆盖程度为项目判断。\n\n现有 ${p.lessons.length} 个可学习单元、${p.cards.length} 张卡、${p.questions.length} 道原创练习。基础内容已接入不等于完整教材、正式模拟或学习者掌握。领域权重不是学习完成率；跨考点映射不重复计算为独立题。\n\n|编号|主题|领域权重|卡/题|内容状态|下一缺口|\n|---|---|---|---|---|---|\n`;
for(const r of p.coverage)coverage+=`|${r.id}|${cell(r.title)}|${r.domainWeight}%|${r.cardIds.length}/${r.questionIds.length}|${cell(r.contentStatus)}|${cell(r.gap)}|\n`;
coverage+='\n## 可追溯映射\n';
for(const r of p.coverage)coverage+=`\n### ${r.id} ${r.title}\n\n- 教材物理页：${r.trainingPages}\n- 知识卡：${r.cardIds.join(', ')||'待补'}\n- 练习：${r.questionIds.join(', ')||'待补'}\n- 证据状态：${r.reviewStatus}\n- 模块阅读：${r.noteReview}\n`;
if(p.coverage.some(r=>r.learningDepth)){
  const exerciseCount=p.lessons.reduce((count,lesson)=>count+(lesson.teachingTrial?.exercises.length||0),0);
  coverage+=`\n## 理解层次与检查方式｜教学补充 ${p.teachingRevision}\n\n以下为试用中的教学目标，不改变上文覆盖程度，也不表示用户已完成检查。Day 1–8 每课六项口述/短答，共${exerciseCount}项教学练习单列，不计入原80道自动计分题；每次精选少量回答，不要求一次完成全部。以下只表示教学关联，不升级原覆盖程度。\n\n|考点|需理解到的程度|怎样检查及证据边界|\n|---|---|---|\n`;
  for(const r of p.coverage.filter(r=>r.learningDepth))coverage+=`|${r.id}|${cell(r.learningDepth)}|${cell(r.assessmentEvidence)}|\n`;
  coverage+='\n使用位置：Day 1–8 的完整主课与理解练习，均有原教材导读。课程示例入口：[Day 1 可读课程](day-01-lesson-v0.2.md)、[Day 2 可读课程](day-02-lesson-v0.2.md)。\n';
}
coverage+='\n## 来源与边界\n\n[当前官方认证页](https://www.nvidia.cn/training/certification/ai-infrastructure-operations-associate/)；[Feb 2026官方中文指南](https://images.nvidia.cn/aem-dam/zh_cn/Solutions/training/certification/nvt-certification-exam-study-guide-aiio-a4-web-zhCN-5103850.pdf)。编号来自指南物理4–6页。培训讲义原文件160物理页，第三方笔记只作教学线索，不接受dump/必出题量声明。来源逐卡登记于共享JSON，原教材与真实学习备忘未改。\n';
writeChanged(path.join(root,'docs/exam-coverage-v0.2.md'),coverage);
console.log(`Built ${p.lessons.length} days, ${p.cards.length} cards, ${p.questions.length} questions.`);
