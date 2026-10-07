'use strict';

// Local, qualitative answer records. This module never calls a model or scores MCQs.
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.NcaUnderstanding = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const FORMAT = 'nca-understanding-request';
  const FEEDBACK = 'nca-understanding-feedback';
  const MAX_TEXT = 12000;
  const CONFIDENCE = ['certain', 'uncertain', 'unknown'];
  const DIMENSIONS = ['concept', 'reasoning', 'terminology', 'english'];
  let serial = 0;
  function fail(message) { throw new Error('理解练习记录：' + message); }
  function object(value, label) {
    if (!value || typeof value !== 'object' || Array.isArray(value) || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) fail(label + '必须是对象');
    return value;
  }
  function string(value, label, max = MAX_TEXT, allowEmpty = false) {
    if (typeof value !== 'string' || value.length > max || (!allowEmpty && !value.trim())) fail(label + '文字无效或过长');
    return value;
  }
  function list(value, label, max = 2000) {
    if (!Array.isArray(value) || value.length > max) fail(label + '列表无效或过长');
    return value;
  }
  function timestamp(value, label) {
    string(value, label, 40);
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value) || !Number.isFinite(Date.parse(value))) fail(label + '必须是 UTC ISO 时间');
    return value;
  }
  function time(value) { return timestamp(value === undefined ? new Date().toISOString() : value, '时间'); }
  function id(value, label = 'ID') {
    string(value, label, 160);
    if (!/^[A-Za-z0-9][A-Za-z0-9_.:-]*$/.test(value)) fail(label + '格式无效');
    return value;
  }
  function exerciseId(value) {
    id(value, '练习 ID');
    if (!/^P-[A-Z0-9-]+$/.test(value)) fail('短答必须使用独立 P-ID');
    return value;
  }
  function unique(rows, field, label) {
    const values = rows.map(row => id(object(row, label)[field], label + ' ID'));
    if (new Set(values).size !== values.length) fail(label + ' ID 重复');
  }
  function plainCopy(value) {
    let nodes = 0;
    function check(v, depth) {
      if (++nodes > 300000 || depth > 24) fail('数据过大或层级过深');
      if (v === null || typeof v === 'boolean') return;
      if (typeof v === 'number') { if (!Number.isFinite(v)) fail('无效数字'); return; }
      if (typeof v === 'string') { if (v.length > 1000000) fail('字段过长'); return; }
      if (Array.isArray(v)) { v.forEach(x => check(x, depth + 1)); return; }
      object(v, '数据');
      for (const [key, item] of Object.entries(v)) {
        if (['__proto__', 'prototype', 'constructor'].includes(key)) fail('不安全的字段名');
        check(item, depth + 1);
      }
    }
    check(value, 0);
    const json = JSON.stringify(value);
    if (json.length > 16000000) fail('记录总量过大');
    return JSON.parse(json);
  }
  function freshId(prefix, existing = []) {
    const occupied = new Set(existing);
    for (let n = 0; n < 8; n++) {
      const suffix = typeof globalThis.crypto?.randomUUID === 'function' ? globalThis.crypto.randomUUID() : Date.now().toString(36) + '-' + (++serial).toString(36) + '-' + Math.random().toString(36).slice(2);
      const value = prefix + '-' + suffix;
      if (!occupied.has(value)) return value;
    }
    fail('无法生成唯一记录 ID');
  }
  function canonical(value) {
    if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
    if (value && typeof value === 'object') return '{' + Object.keys(value).sort().map(k => JSON.stringify(k) + ':' + canonical(value[k])).join(',') + '}';
    return JSON.stringify(value);
  }
  function effectiveTeachingRevision(content, lesson) {
    object(content, '课程内容'); object(lesson, '课程');
    return string(lesson.teachingTrial?.teachingRevision ?? lesson.teachingRevision ?? content.teachingRevision, '有效教学版本', 200);
  }
  function empty() { return { version: 1, drafts: {}, exposures: {}, attempts: [], packets: [], feedback: [] }; }
  function confidence(value) {
    if (!CONFIDENCE.includes(value)) fail('确定程度无效');
    return value;
  }
  function optionalTime(value, label) { if (value !== null) timestamp(value, label); }
  function feedbackItem(item) {
    object(item, '点评条目');
    const allowed = ['attemptId', 'answerText', 'assessment', 'strengths', 'gaps', 'misconceptions', 'explanation', 'nextQuestion'];
    if (Object.keys(item).some(k => !allowed.includes(k))) fail('点评包含不支持字段；不得写入 correct/mastery 等成绩或掌握结论');
    id(item.attemptId, '点评作答 ID');
    string(item.answerText, '点评对应原答');
    object(item.assessment, '分维度反馈');
    if (Object.keys(item.assessment).some(k => !DIMENSIONS.includes(k))) fail('点评维度无效');
    for (const key of DIMENSIONS) string(item.assessment[key], key + '反馈', 2000);
    for (const key of ['strengths', 'gaps', 'misconceptions']) list(item[key], key, 20).forEach(v => string(v, key, 2000));
    string(item.explanation, '针对原答的解释');
    string(item.nextQuestion, '下一道检查题', 4000, true);
  }
  function feedbackSource(source) {
    object(source, '反馈来源');
    if (Object.keys(source).some(k => !['name', 'conversationId', 'model'].includes(k))) fail('反馈来源字段无效');
    string(source.name, '反馈来源名称', 200);
    for (const key of ['conversationId', 'model']) if (source[key] !== undefined) string(source[key], key, 200, true);
  }
  function normalize(raw, _content) {
    const s = raw === undefined || raw === null ? empty() : plainCopy(object(raw, '理解练习状态'));
    if (s.version === undefined) s.version = 1;
    if (s.version !== 1) fail('不支持的记录版本');
    for (const key of ['drafts', 'exposures']) { if (s[key] === undefined) s[key] = {}; object(s[key], key); }
    for (const key of ['attempts', 'packets', 'feedback']) { if (s[key] === undefined) s[key] = []; list(s[key], key); }
    if (Object.keys(s.drafts).length > 100 || Object.keys(s.exposures).length > 100) fail('草稿或展开记录过多');
    for (const [key, draft] of Object.entries(s.drafts)) {
      exerciseId(key); object(draft, '草稿'); string(draft.text, '草稿', MAX_TEXT, true); confidence(draft.confidence);
      string(draft.priorExposure, '历史接触声明', 2000); timestamp(draft.updatedAt, '草稿时间');
      if (draft.assistanceNote !== undefined) string(draft.assistanceNote, '本次借助说明', 2000, true);
    }
    for (const [key, exposure] of Object.entries(s.exposures)) {
      exerciseId(key); object(exposure, '参考展开记录');
      optionalTime(exposure.referenceSeenAt, '参考展开时间'); optionalTime(exposure.translationSeenAt, '译文展开时间');
      if (exposure.referenceRevision !== undefined) {
        string(exposure.referenceRevision, '参考展开对应教学版本', 200);
        timestamp(exposure.referenceRevisionSeenAt, '本版参考展开时间');
      } else if (exposure.referenceRevisionSeenAt !== undefined) fail('参考展开版本缺失');
    }
    unique(s.attempts, 'id', '作答'); unique(s.packets, 'packetId', '交接包'); unique(s.feedback, 'id', '点评');
    const attempts = new Map();
    for (const a of s.attempts) {
      exerciseId(a.exerciseId);
      for (const key of ['exerciseTitle', 'contentVersion', 'teachingRevision', 'promptText', 'answerText', 'priorExposure']) string(a[key], key, key === 'priorExposure' ? 2000 : MAX_TEXT);
      if (!['zh', 'en'].includes(a.language)) fail('作答语言无效');
      if (!['pending', 'reviewed'].includes(a.status)) fail('作答点评状态无效');
      confidence(a.confidence); timestamp(a.submittedAt, '提交时间');
      optionalTime(a.referenceSeenAt, '提交前参考展开时间'); optionalTime(a.translationSeenAt, '提交前译文展开时间');
      if (a.assistanceNote !== undefined) string(a.assistanceNote, '本次借助说明', 2000);
      if (a.revisionOf !== null) {
        id(a.revisionOf, '被修订作答 ID');
        const prior = attempts.get(a.revisionOf);
        if (!prior || prior.exerciseId !== a.exerciseId) fail('修订必须指向已保存的同题原答');
      }
      attempts.set(a.id, a);
    }
    const packets = new Map();
    for (const packet of s.packets) {
      timestamp(packet.createdAt, '交接时间');
      if (!Number.isInteger(packet.lessonDay) || packet.lessonDay < 1) fail('交接单元无效');
      string(packet.contentVersion, '交接内容版本', 200); string(packet.teachingRevision, '交接教学版本', 200);
      list(packet.attemptIds, '交接作答', 50);
      if (!packet.attemptIds.length || new Set(packet.attemptIds).size !== packet.attemptIds.length || packet.attemptIds.some(x => !attempts.has(x))) fail('交接作答引用无效');
      if (packet.delivery !== undefined) {
        object(packet.delivery, '交接状态'); string(packet.delivery.status, '交接状态', 80);
        string(packet.delivery.message, '交接说明', 2000, true); timestamp(packet.delivery.updatedAt, '交接更新时间');
      }
      if (packet.items !== undefined) {
        if (packet.format !== FORMAT || packet.version !== 1) fail('已存请求格式无效');
        list(packet.items, '已存请求条目', 50);
        if (packet.items.length !== packet.attemptIds.length || new Set(packet.items.map(i => i.attemptId)).size !== packet.items.length) fail('已存请求与交接引用不一致');
        for (const item of packet.items) {
          object(item, '已存请求条目');
          const a = attempts.get(item.attemptId);
          if (!packet.attemptIds.includes(item.attemptId) || !a || item.answerText !== a.answerText || item.promptText !== a.promptText || item.exerciseId !== a.exerciseId) fail('已存请求与原答不一致');
        }
      }
      packets.set(packet.packetId, packet);
    }
    const reviewed = new Set();
    for (const f of s.feedback) {
      if (f.format !== FEEDBACK || f.version !== 1) fail('已存点评格式无效');
      timestamp(f.createdAt, '点评时间'); timestamp(f.importedAt, '点评导入时间'); feedbackSource(f.source);
      const packet = packets.get(f.packetId);
      if (!packet) fail('点评未对应已保存交接包');
      list(f.items, '点评条目', 50); if (!f.items.length) fail('点评为空');
      if (new Set(f.items.map(x => x.attemptId)).size !== f.items.length) fail('点评作答重复');
      for (const item of f.items) {
        feedbackItem(item);
        if (!packet.attemptIds.includes(item.attemptId) || attempts.get(item.attemptId)?.answerText !== item.answerText) fail('点评与交接原答不一致');
        reviewed.add(item.attemptId);
      }
    }
    for (const a of s.attempts) if ((a.status === 'reviewed') !== reviewed.has(a.id)) fail('点评状态与实际反馈不一致');
    return s;
  }
  function exercise(value) {
    object(value, '练习'); exerciseId(value.id); string(value.title, '练习标题'); string(value.stem, '题干');
    if (!['zh', 'en'].includes(value.language)) fail('题目语言无效');
    return value;
  }
  function saveDraft(raw, e, text, options = {}, now) {
    exercise(e); string(text, '草稿', MAX_TEXT, true); object(options, '草稿选项');
    const s = normalize(raw), previous = s.drafts[e.id] || {};
    s.drafts[e.id] = { ...previous, text, confidence: confidence(options.confidence ?? previous.confidence ?? 'unknown'), priorExposure: string(options.priorExposure ?? previous.priorExposure ?? 'unknown', '历史接触声明', 2000), updatedAt: time(now) };
    if (options.assistanceNote !== undefined) s.drafts[e.id].assistanceNote = string(options.assistanceNote, '本次借助说明', 2000, true);
    return normalize(s);
  }
  function recordExposure(raw, eId, kind, now, teachingRevision) {
    exerciseId(eId);
    if (!['reference', 'translation'].includes(kind)) fail('参考类型无效');
    const s = normalize(raw), at = time(now), field = kind + 'SeenAt';
    const previous = s.exposures[eId] || { referenceSeenAt: null, translationSeenAt: null };
    s.exposures[eId] = { ...previous, [field]: previous[field] && Date.parse(previous[field]) <= Date.parse(at) ? previous[field] : at };
    if (kind === 'reference' && teachingRevision !== undefined) {
      string(teachingRevision, '参考展开对应教学版本', 200);
      const sameRevision = previous.referenceRevision === teachingRevision;
      s.exposures[eId].referenceRevision = teachingRevision;
      s.exposures[eId].referenceRevisionSeenAt = sameRevision && previous.referenceRevisionSeenAt && Date.parse(previous.referenceRevisionSeenAt) <= Date.parse(at) ? previous.referenceRevisionSeenAt : at;
    }
    return normalize(s);
  }
  function submitAnswer(raw, e, text, options = {}, now) {
    exercise(e); string(text, '原始回答'); object(options, '提交选项');
    const at = time(now);
    let s = normalize(raw);
    for (const key of ['referenceSeen', 'translationSeen']) {
      if (options[key] !== undefined && typeof options[key] !== 'boolean') fail(key + '必须是布尔值');
      if (options[key] === true) s = recordExposure(s, e.id, key === 'referenceSeen' ? 'reference' : 'translation', at, key === 'referenceSeen' ? options.teachingRevision : undefined);
    }
    const seen = s.exposures[e.id] || { referenceSeenAt: null, translationSeenAt: null };
    const latest = s.attempts.filter(a => a.exerciseId === e.id).at(-1);
    const draft = s.drafts[e.id] || {};
    const legacyUnchanged = !seen.referenceRevision && options.baseTeachingRevision === options.teachingRevision;
    const matchingSeenAt = seen.referenceRevision === options.teachingRevision ? seen.referenceRevisionSeenAt : legacyUnchanged ? seen.referenceSeenAt : null;
    const referenceSnapshot = matchingSeenAt && Date.parse(matchingSeenAt) <= Date.parse(at) ? matchingSeenAt : null;
    const translationSnapshot = seen.translationSeenAt && Date.parse(seen.translationSeenAt) <= Date.parse(at) ? seen.translationSeenAt : null;
    const assistanceNote = string(options.assistanceNote ?? draft.assistanceNote ?? '', '本次借助说明', 2000, true);
    const attempt = {
      id: freshId('ua', s.attempts.map(a => a.id)), exerciseId: e.id, exerciseTitle: e.title, language: e.language,
      contentVersion: string(options.contentVersion ?? 'unknown', '内容版本', 200), teachingRevision: string(options.teachingRevision ?? 'unknown', '教学版本', 200),
      promptText: e.stem, answerText: text, submittedAt: at, revisionOf: latest?.id ?? null,
      confidence: confidence(options.confidence ?? draft.confidence ?? 'unknown'), priorExposure: string(options.priorExposure ?? draft.priorExposure ?? 'unknown', '历史接触声明', 2000),
      referenceSeenAt: referenceSnapshot, translationSeenAt: translationSnapshot, status: 'pending',
      ...(assistanceNote.trim() ? { assistanceNote } : {})
    };
    s.attempts.push(attempt);
    delete s.drafts[e.id];
    return { state: normalize(s), attempt: plainCopy(attempt) };
  }
  function makePacket(raw, lesson, content, options = {}) {
    object(lesson, '课程'); object(content, '课程内容'); object(options, '交接选项');
    const s = normalize(raw, content), exercises = lesson.teachingTrial?.exercises;
    if (!Array.isArray(exercises) || !exercises.length) fail('本单元没有理解练习');
    const byId = new Map(exercises.map(e => [exercise(e).id, e]));
    let selected;
    if (options.attemptIds !== undefined) {
      list(options.attemptIds, '选择的作答', 50);
      if (new Set(options.attemptIds).size !== options.attemptIds.length) fail('选择了重复作答');
      selected = options.attemptIds.map(aId => { const a = s.attempts.find(x => x.id === aId); if (!a || !byId.has(a.exerciseId)) fail('作答不属于本单元'); return a; });
    } else {
      const latest = new Map();
      s.attempts.filter(a => byId.has(a.exerciseId)).forEach(a => latest.set(a.exerciseId, a));
      selected = [...latest.values()].filter(a => a.status === 'pending');
    }
    if (options.attemptIds === undefined) selected = selected.filter(a => a.promptText === byId.get(a.exerciseId).stem && a.contentVersion === content.version && a.teachingRevision === effectiveTeachingRevision(content, lesson));
    if (!selected.length) fail('没有可交接的本版已提交作答；旧版原答和已存请求仍保留');
    const revision = effectiveTeachingRevision(content, lesson);
    for (const a of selected) {
      if (a.promptText !== byId.get(a.exerciseId).stem || a.contentVersion !== content.version || a.teachingRevision !== revision) fail('题目版本已变化，不能用新要点评价旧原答；请保留旧记录并另行核对');
    }
    const packetId = options.packetId === undefined ? freshId('up', s.packets.map(p => p.packetId)) : id(options.packetId, '交接包 ID');
    if (s.packets.some(p => p.packetId === packetId)) fail('交接包 ID 已存在');
    const createdAt = time(options.now);
    const packet = {
      format: FORMAT, version: 1, packetId, createdAt, lessonDay: lesson.day, contentVersion: content.version, teachingRevision: revision,
      instructions: '按学习者原答给出针对性定性反馈，区分概念、理由、术语和英文困难。不代答、不输出 correct/mastery 或考试准备度。referenceExplanation 是统一教学解释，不是针对这次原答的 AI 点评，也不提高旧 rubric 的要求。assistanceNote 是用户自述；referenceSeenAt/translationSeenAt 只记录已知接触，null 和 unknown 不证明独立未见。保留原答文本与 attemptId，用 nca-understanding-feedback 格式回传。',
      feedbackFormat: { format: FEEDBACK, version: 1, packetId, source: { name: '实际反馈者名称', conversationId: '实际对话 ID（可空）', model: '实际已确认模型（可空）' }, createdAt: 'UTC ISO 时间', items: [{ attemptId: '对应作答 ID', answerText: '逐字保留原答', assessment: { concept: '概念反馈', reasoning: '理由反馈', terminology: '术语反馈', english: '英文阅读反馈；无英文可说明不适用' }, strengths: [], gaps: [], misconceptions: [], explanation: '针对本次原答的解释', nextQuestion: '可选下一小题，或空字符串' }] },
      sources: (content.sources || []).filter(source => selected.some(a => byId.get(a.exerciseId).sourceIds.includes(source.id))).map(source => ({ id: source.id, name: source.name, url: source.url, locator: source.locator })),
      teachingContext: { title: lesson.title, sections: (lesson.teachingTrial.fullLesson?.sections || []).filter(section => selected.some(a => byId.get(a.exerciseId).cardIds.some(cardId => section.cardIds.includes(cardId)))).map(section => ({ title: section.title, paragraphs: plainCopy(section.paragraphs), example: plainCopy(section.example), takeaway: section.takeaway })) },
      items: selected.map(a => {
        const e = byId.get(a.exerciseId);
        return { attemptId: a.id, exerciseId: a.exerciseId, title: a.exerciseTitle, language: a.language, promptText: a.promptText, answerText: a.answerText, submittedAt: a.submittedAt, revisionOf: a.revisionOf, confidence: a.confidence, priorExposure: a.priorExposure, referenceSeenAt: a.referenceSeenAt, translationSeenAt: a.translationSeenAt, ...(a.assistanceNote ? { assistanceNote: a.assistanceNote } : {}), ...(e.supportTable ? { supportTable: plainCopy(e.supportTable) } : {}), ...(e.referenceExplanation ? { referenceExplanation: plainCopy(e.referenceExplanation) } : {}), rubric: plainCopy(e.rubric), sourceIds: plainCopy(e.sourceIds) };
      })
    };
    s.packets.push({ ...plainCopy(packet), attemptIds: selected.map(a => a.id), delivery: { status: 'prepared', message: '交接包已准备，尚未发送', updatedAt: createdAt } });
    return { state: normalize(s, content), packet: plainCopy(packet) };
  }
  function importFeedback(raw, feedbackPacket, content, now) {
    const s = normalize(raw, content), p = plainCopy(object(feedbackPacket, '点评包'));
    const allowed = ['format', 'version', 'packetId', 'source', 'createdAt', 'items'];
    if (Object.keys(p).some(k => !allowed.includes(k))) fail('点评包包含不支持字段');
    if (p.format !== FEEDBACK || p.version !== 1) fail('不是有效的理解练习点评包');
    id(p.packetId, '点评交接包 ID'); timestamp(p.createdAt, '点评时间'); feedbackSource(p.source);
    const sent = s.packets.find(x => x.packetId === p.packetId);
    if (!sent) fail('找不到对应交接包，未导入');
    list(p.items, '点评条目', 50); if (!p.items.length) fail('点评没有内容');
    if (new Set(p.items.map(x => x.attemptId)).size !== p.items.length) fail('点评条目重复');
    for (const item of p.items) {
      feedbackItem(item);
      const a = s.attempts.find(x => x.id === item.attemptId);
      if (!sent.attemptIds.includes(item.attemptId) || !a || a.answerText !== item.answerText) fail('点评与交接原答不一致，未导入');
    }
    const existing = s.feedback.find(f => f.packetId === p.packetId && f.createdAt === p.createdAt && canonical(f.source) === canonical(p.source) && canonical(f.items) === canonical(p.items));
    if (existing) return s;
    s.feedback.push({ ...p, id: freshId('uf', s.feedback.map(f => f.id)), importedAt: time(now) });
    const received = new Set(p.items.map(i => i.attemptId));
    s.attempts.forEach(a => { if (received.has(a.id)) a.status = 'reviewed'; });
    return normalize(s, content);
  }
  return { empty, normalize, saveDraft, submitAnswer, recordExposure, effectiveTeachingRevision, makePacket, importFeedback };
});
