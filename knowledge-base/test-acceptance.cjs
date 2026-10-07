/* Developer-only acceptance runner. The app itself needs only index.html.
 * Uses installed Edge, file://, offline mode, a temporary isolated profile.
 * Run: node knowledge-base/test-acceptance.cjs from nca-study-desk.
 */
const { chromium } = require('playwright-core');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { pathToFileURL } = require('node:url');
const { createHash } = require('node:crypto');

const appFile = path.join(__dirname, 'index.html');
const useChrome = process.argv.includes('--chrome');
const browserName = useChrome ? 'Chrome' : 'Edge';
const out = path.resolve(__dirname, '../output/playwright/knowledge-base', useChrome ? 'chrome' : '.');
const originalNca = path.resolve(__dirname, '../web/index.html');
const expectedNcaHash = 'E9D03D899502F9453B4212424745977384F58C8BA829337E5C742DD58CEF969A';
const browserExecutable = (useChrome
  ? ['C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe']
  : ['C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', 'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe']).find(fs.existsSync);
if (!browserExecutable) throw new Error(browserName + ' not found');
fs.mkdirSync(out, { recursive:true });
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'knowledge-base-qa-'));
const key = 'personalKnowledgeBase_v1';
const safetyKey = key + '_safetyBackup';
const deleteMessage = '确定删除这条知识吗？删除后无法从当前知识库恢复。';
const importMessage = '导入将使用备份内容恢复知识库，是否继续？';
const results = [], errors = [], requests = [];
const pass = name => { results.push({ name, status:'passed' }); console.log('PASS ' + name); };
const hash = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex').toUpperCase();
let context, page, browserVersion;
const raw = () => page.evaluate(k => localStorage.getItem(k), key);
const saved = async () => JSON.parse(await raw());
const visibleTitles = () => page.locator('.entry-title').allTextContents();
const findEntry = title => page.locator('.entry-button').filter({ has:page.locator('.entry-title', { hasText:title }) });
const tag = name => page.locator('#filters').getByRole('button', { name, exact:true });

async function launch() {
  context = await chromium.launchPersistentContext(profile, {
    executablePath:browserExecutable, headless:true, viewport:{ width:1440, height:1000 },
    offline:true, hasTouch:true, acceptDownloads:true, locale:'zh-CN', timezoneId:'Asia/Shanghai'
  });
  page = context.pages()[0] || await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('request', request => { if (/^https?:/.test(request.url())) requests.push(request.url()); });
  browserVersion = context.browser().version();
  await page.goto(pathToFileURL(appFile).href);
  await page.locator('#new-entry').waitFor();
}

async function fillNew(title, tags, content) {
  await page.locator('#new-entry').click();
  await page.locator('#title').fill(title);
  await page.locator('#tags').fill(tags);
  await page.locator('#content').fill(content);
  await page.locator('#save').click();
}

async function dialogAction(message, accept, action) {
  let observed = false;
  page.once('dialog', async dialog => {
    observed = true;
    assert.equal(dialog.type(), 'confirm');
    assert.equal(dialog.message(), message);
    if (accept) await dialog.accept(); else await dialog.dismiss();
  });
  await action();
  assert.ok(observed, 'Confirmation dialog was shown');
}

async function download(selector, outputName) {
  const waiting = page.waitForEvent('download');
  await page.locator(selector).click();
  const item = await waiting;
  const file = path.join(out, outputName || item.suggestedFilename());
  await item.saveAs(file);
  assert.equal(await item.failure(), null);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  return { data, file, name:item.suggestedFilename() };
}

async function restore(file, accept = true) {
  const choosing = page.waitForEvent('filechooser');
  await page.locator('#import').click();
  const chooser = await choosing;
  await dialogAction(importMessage, accept, async () => {
    await chooser.setFiles(file);
    await page.waitForFunction(() => !document.getElementById('import').disabled);
  });
}

async function badImport(name, content, expectedMessage) {
  const before = await raw();
  let dialogShown = false;
  const unexpectedDialog = async dialog => { dialogShown = true; await dialog.dismiss(); };
  page.on('dialog', unexpectedDialog);
  await page.locator('#import-file').setInputFiles({ name, mimeType:'application/json', buffer:Buffer.from(content) });
  await page.waitForFunction(() => !document.getElementById('import').disabled);
  page.off('dialog', unexpectedDialog);
  assert.match(await page.locator('#message').textContent(), expectedMessage);
  assert.equal(await page.locator('#message').getAttribute('data-kind'), 'error');
  assert.equal(await raw(), before);
  assert.equal(dialogShown, false);
}

async function layout(width) {
  await page.setViewportSize({ width, height:950 });
  const metrics = await page.evaluate(() => ({
    width:innerWidth, scroll:document.documentElement.scrollWidth,
    overflowing:[...document.querySelectorAll('input:not([type=file]),textarea,form,.workspace,.sidebar,.detail-panel')].filter(el => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && (rect.right > innerWidth + 1 || rect.left < -1);
    }).map(el => el.id || el.className),
    shortButtons:[...document.querySelectorAll('button:not(#clear-search)')].filter(el => {
      const rect = el.getBoundingClientRect(); return rect.width > 0 && rect.height > 0 && rect.height < 44;
    }).map(el => el.id || el.textContent)
  }));
  assert.ok(metrics.scroll <= metrics.width, JSON.stringify(metrics));
  assert.deepEqual(metrics.overflowing, []);
  assert.deepEqual(metrics.shortButtons, []);
}

(async () => {
  const report = { startedAt:new Date().toISOString(), mode:'Offline file://, isolated persistent profile', browserName, profile, appFile, results };
  try {
    assert.equal(hash(originalNca), expectedNcaHash, 'Existing NCA HTML must remain unchanged');
    await launch();
    assert.equal((await saved()).entries.length, 3);
    assert.equal(await page.locator('#empty-state').isVisible(), true);
    assert.equal(await page.locator('#detail').isVisible(), false);
    assert.deepEqual((await saved()).entries.map(entry => entry.title), ['GPU 与 CPU 的区别','NVLink 是什么','DCGM 的用途']);
    await layout(1440);
    pass('初次打开生成且保存 3 条可编辑示例；未选条目显示空状态；直接离线打开 HTML');

    await page.locator('#new-entry').click();
    await page.locator('#title').fill('   ');
    await page.locator('#save').click();
    assert.equal(await page.locator('#form-error').isVisible(), true);
    assert.equal((await saved()).entries.length, 3);
    await page.locator('#cancel').click();
    pass('空白标题阻止保存，取消新增不产生空条目');

    await fillNew('现场演示 · GPU 巡检笔记', 'GPU，演示, GPU, 运维', '先检查温度与利用率。\n交叉检查 NvLiNk 连接状态，保留证据。\n只在正文出现的词：巡检红茶。');
    const created = (await saved()).entries.find(entry => entry.title === '现场演示 · GPU 巡检笔记');
    assert.ok(created.id && created.createdAt && created.updatedAt);
    assert.deepEqual(created.tags, ['GPU','演示','运维']);
    assert.equal(created.createdAt, created.updatedAt);
    assert.equal(await page.locator('#detail-title').textContent(), created.title);
    assert.ok((await visibleTitles()).includes(created.title));
    pass('测试 1：新增标题、多个标签、正文，列表和详情立即更新，日期与稳定 ID 已写入 localStorage');

    const savedAfterNew = await raw();
    await page.reload();
    assert.equal(await raw(), savedAfterNew);
    await findEntry(created.title).click();
    assert.equal(await page.locator('#detail-content').textContent(), created.content);
    await context.close();
    await launch();
    assert.equal(await raw(), savedAfterNew);
    await findEntry(created.title).click();
    pass('测试 2：页面刷新，以及完全关闭隔离 ' + browserName + ' 再以同一配置重开，数据均保留');

    const beforeCancel = await raw();
    await page.locator('#edit').click();
    await page.locator('#title').fill('这段编辑必须被取消');
    await page.locator('#content').fill('不能保存这段内容');
    await page.locator('#cancel').click();
    assert.equal(await raw(), beforeCancel);
    assert.equal(await page.locator('#detail-title').textContent(), created.title);
    await page.locator('#edit').click();
    await page.locator('#title').fill('现场演示 · GPU 巡检笔记（已更新）');
    await page.locator('#content').fill(created.content + '\n补充：核对驱动版本。');
    await page.locator('#save').click();
    const edited = (await saved()).entries.find(entry => entry.id === created.id);
    assert.equal(edited.createdAt, created.createdAt);
    assert.ok(edited.updatedAt > created.updatedAt);
    assert.equal(await page.locator('#detail-title').textContent(), edited.title);
    assert.equal(await page.locator('#detail-content').textContent(), edited.content);
    assert.ok((await visibleTitles()).includes(edited.title));
    pass('测试 3：编辑保存更新标题、正文与修改时间，创建时间和 ID 不变；取消编辑不写入');

    const beforeSearch = await raw();
    await page.locator('#search').fill('gPu 巡检');
    assert.deepEqual(await visibleTitles(), [edited.title]);
    assert.equal(await page.locator('.entry-title mark').textContent(), 'GPU 巡检');
    await page.locator('#search').fill('巡检红茶');
    assert.deepEqual(await visibleTitles(), [edited.title]);
    assert.equal(await page.locator('.snippet mark').textContent(), '巡检红茶');
    await page.locator('#search').fill('nvLINK');
    assert.equal((await visibleTitles()).length, 2);
    assert.ok(await page.locator('.entry-title mark,.snippet mark').count() >= 2);
    assert.equal(await raw(), beforeSearch);
    await page.locator('#clear-search').click();
    assert.equal((await visibleTitles()).length, 4);
    pass('测试 5：实时搜索标题/正文，不区分大小写，命中高亮，清空恢复列表且原始正文未变');

    await tag('网络').click();
    assert.deepEqual(await visibleTitles(), ['NVLink 是什么']);
    assert.equal(await tag('网络').getAttribute('aria-pressed'), 'true');
    await tag('全部').click();
    assert.equal((await visibleTitles()).length, 4);
    await tag('运维').click();
    await page.locator('#search').fill('NvLink');
    assert.deepEqual(await visibleTitles(), [edited.title]);
    await tag('网络').click();
    assert.deepEqual(await visibleTitles(), ['NVLink 是什么']);
    await page.locator('#search').fill('不存在的词');
    assert.deepEqual(await visibleTitles(), []);
    assert.equal(await page.locator('#list-empty').isVisible(), true);
    pass('测试 6 / 7：标签及全部切换有效，激活标签明显，标签与关键词按 AND 同时筛选');

    const beforeExport = await raw();
    const backup = await download('#export');
    assert.match(backup.name, /^knowledge-base-backup-\d{4}-\d{2}-\d{2}\.json$/);
    assert.equal(backup.data.entries.length, 4, 'Export all entries even under a zero-result filter');
    assert.deepEqual(backup.data.entries, (await saved()).entries);
    assert.equal(await raw(), beforeExport);
    pass('测试 8：实际下载完整 JSON 文件，文件名正确，筛选下仍导出全部条目且不修改数据');

    await page.locator('#clear-search').click(); await tag('全部').click();
    await findEntry(edited.title).click();
    await dialogAction(deleteMessage, false, () => page.locator('#delete').click());
    assert.equal(await raw(), beforeExport);
    assert.ok((await visibleTitles()).includes(edited.title));
    await dialogAction(deleteMessage, true, () => page.locator('#delete').click());
    assert.equal((await saved()).entries.length, 3);
    assert.ok(!(await visibleTitles()).includes(edited.title));
    const afterDelete = await raw();
    await page.reload(); assert.equal(await raw(), afterDelete);
    pass('测试 4：删除先显示指定确认文案；取消无变化，确认后列表/详情/存储同步，刷新仍删除');

    await restore(backup.file, false);
    assert.equal(await raw(), afterDelete);
    await restore(backup.file);
    assert.deepEqual((await saved()).entries, backup.data.entries);
    await findEntry(edited.title).click();
    assert.equal(await page.locator('#detail-content').textContent(), edited.content);
    assert.equal(await tag('演示').count(), 1);
    await page.reload(); assert.deepEqual((await saved()).entries, backup.data.entries);
    const safety = await page.evaluate(k => JSON.parse(localStorage.getItem(k)), safetyKey);
    assert.deepEqual(safety, JSON.parse(afterDelete));
    const safetyDownload = await download('#safety-export');
    assert.deepEqual(safetyDownload.data, safety);
    pass('测试 9：导入取消无变化，确认后恢复原始 ID/内容/标签/日期并持久保存；覆盖前安全备份可下载');

    await badImport('broken.json', '{"entries": [', /JSON 格式错误/);
    await badImport('wrong-structure.json', '{"version":1,"entries":"invalid"}', /备份结构不正确/);
    const duplicate = structuredClone(backup.data); duplicate.entries.push(duplicate.entries[0]);
    await badImport('duplicate.json', JSON.stringify(duplicate), /id 无效或重复/);
    const wrongDate = structuredClone(backup.data); wrongDate.entries[0].createdAt = '2026-02-31T00:00:00.000Z';
    await badImport('date.json', JSON.stringify(wrongDate), /有效的 ISO 时间/);
    const wrongTags = structuredClone(backup.data); wrongTags.entries[0].tags = [42];
    await badImport('tags.json', JSON.stringify(wrongTags), /标签必须是文本数组/);
    pass('测试 10：损坏 JSON、错误结构、重复 ID、无效时间及错误标签均拒绝，原数据逐字不变');

    await restore({ name:'bom.json', mimeType:'application/json', buffer:Buffer.from('\ufeff' + JSON.stringify(backup.data)) });
    assert.deepEqual((await saved()).entries, backup.data.entries);
    pass('编码兼容：带 UTF-8 BOM 的合法 JSON 也能通过顶部导入按钮完整恢复');
    const safeHtml = '<img src=x onerror="window.injected=true"> [a+b]';
    await fillNew(safeHtml, '<svg>,安全', '原样显示 <script>window.injected=true</script> 与 [a+b]。');
    assert.equal(await page.locator('#detail-title img,#detail-content script').count(), 0);
    assert.equal(await page.evaluate(() => window.injected), undefined);
    await page.locator('#search').fill('[a+b]');
    assert.equal(await page.locator('.entry-title mark').textContent(), '[a+b]');
    await page.locator('#clear-search').click();
    pass('安全检查：HTML 内容仅按文字展示，搜索特殊符号不报错或执行脚本');

    // Storage quota failures must not discard saved records or the editor draft.
    const beforeFailure = await raw();
    await page.locator('#new-entry').click(); await page.locator('#title').fill('保存失败时保留草稿');
    await page.evaluate(() => {
      window.originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = function() { throw new DOMException('Test quota failure', 'QuotaExceededError'); };
    });
    await page.locator('#save').click();
    assert.equal(await raw(), beforeFailure);
    assert.equal(await page.locator('#editor').isVisible(), true);
    assert.equal(await page.locator('#title').inputValue(), '保存失败时保留草稿');
    assert.match(await page.locator('#message').textContent(), /保存未完成/);
    await page.evaluate(() => { Storage.prototype.setItem = window.originalSetItem; delete window.originalSetItem; });
    await page.locator('#cancel').click();
    pass('存储异常：模拟容量不足，保留已存数据和未保存草稿，明确提示失败');

    // Verify both failure points of the two-write import transaction.
    for (const failedKey of [safetyKey, key]) {
      const beforeFailedImport = await raw();
      await page.evaluate(failedKey => {
        window.originalSetItem = Storage.prototype.setItem;
        Storage.prototype.setItem = function(k, value) {
          if (k === failedKey) throw new DOMException('Test import quota failure', 'QuotaExceededError');
          return window.originalSetItem.call(this, k, value);
        };
      }, failedKey);
      await restore(backup.file);
      assert.equal(await raw(), beforeFailedImport);
      assert.match(await page.locator('#message').textContent(), /恢复未完成/);
      await page.evaluate(() => { Storage.prototype.setItem = window.originalSetItem; delete window.originalSetItem; });
    }
    pass('导入事务：安全备份写入失败或正式库写入失败时，都不会替换原知识库');

    await restore(backup.file);

    await page.setViewportSize({ width:390, height:950 });
    await layout(390);
    await page.locator('#new-entry').tap();
    await page.locator('#title').fill('手机演示 · 本地笔记');
    await page.locator('#tags').fill('手机,演示');
    await page.locator('#content').fill('窄屏也可以新增、搜索、编辑、删除和恢复。');
    await layout(390);
    await page.screenshot({ path:path.join(out,'mobile-390-editor.png'), fullPage:true });
    await page.locator('#save').tap();
    await page.locator('#search').fill('手机演示');
    await tag('手机').tap();
    assert.deepEqual(await visibleTitles(), ['手机演示 · 本地笔记']);
    await findEntry('手机演示 · 本地笔记').tap();
    await page.locator('#edit').tap();
    await page.locator('#content').fill('手机修改已保存。'); await page.locator('#save').tap();
    assert.equal(await page.locator('#detail-content').textContent(), '手机修改已保存。');
    await layout(390);
    const mobileBackup = await download('#export', 'mobile-roundtrip.json');
    await dialogAction(deleteMessage, false, () => page.locator('#delete').tap());
    assert.equal(await page.locator('#detail-title').textContent(), '手机演示 · 本地笔记');
    await dialogAction(deleteMessage, true, () => page.locator('#delete').tap());
    assert.equal((await saved()).entries.some(entry => entry.title === '手机演示 · 本地笔记'), false);
    await restore(mobileBackup.file);
    await findEntry('手机演示 · 本地笔记').tap();
    await layout(390);
    await page.screenshot({ path:path.join(out,'mobile-390-detail.png'), fullPage:true });
    for (const width of [360,430,768,1280,1440]) await layout(width);
    pass('测试 11：390px 触摸模拟完成新增/搜索/标签/编辑/导出/删除/导入；表单不越界，360～1440px 无整页横向滚动');

    await restore(backup.file);
    await findEntry(edited.title).click();
    await page.screenshot({ path:path.join(out,'desktop-1440.png'), fullPage:true });
    await page.locator('#search').fill('nvlink');
    await page.screenshot({ path:path.join(out,'desktop-search-highlight.png'), fullPage:true });
    await page.locator('#clear-search').click();

    // Delete every entry via real UI; an intentionally empty library stays empty.
    while ((await saved()).entries.length) {
      await page.locator('.entry-button').first().click();
      await dialogAction(deleteMessage, true, () => page.locator('#delete').click());
    }
    assert.equal(await page.locator('#empty-state').isVisible(), true);
    await page.reload();
    assert.equal((await saved()).entries.length, 0);
    assert.equal(await page.locator('.entry-button').count(), 0);
    const emptyBackup = await download('#export', 'empty-library.json');
    assert.deepEqual(emptyBackup.data.entries, []);
    await restore(backup.file); await restore(emptyBackup.file);
    assert.equal((await saved()).entries.length, 0);
    pass('空库边界：删除全部后刷新不重新生成示例，空数组备份可导出与恢复');

    await restore(backup.file);
    await page.evaluate(k => { localStorage.setItem(k, '{damaged'); }, key);
    await page.reload();
    assert.equal(await raw(), '{damaged');
    assert.equal(await page.locator('#new-entry').isDisabled(), true);
    assert.equal(await page.locator('#storage-error').isVisible(), true);
    await restore(backup.file);
    assert.deepEqual((await saved()).entries, backup.data.entries);
    assert.equal(await page.evaluate(k => localStorage.getItem(k), safetyKey), '{damaged');
    pass('已有存储损坏时不覆写、不重新填示例；可用有效备份恢复，损坏原始数据另存安全备份');

    assert.deepEqual(errors, []);
    assert.deepEqual(requests, []);
    assert.equal(hash(originalNca), expectedNcaHash);
    pass('控制台无错误、无网络请求，原有 NCA 网页 SHA256 与修改前完全相同');
    report.status = 'passed';
  } catch (error) {
    report.status = 'failed'; report.failure = error.stack; console.error(error);
    if (page && !page.isClosed()) await page.screenshot({ path:path.join(out,'failure.png'), fullPage:true }).catch(() => {});
    process.exitCode = 1;
  } finally {
    if (context) await context.close();
    Object.assign(report, { finishedAt:new Date().toISOString(), browserVersion, appSha256:hash(appFile), originalNcaSha256:hash(originalNca), errors, externalRequests:requests });
    fs.writeFileSync(path.join(out,'acceptance-results.json'), JSON.stringify(report,null,2));
    console.log('Report: ' + path.join(out,'acceptance-results.json'));
  }
})();
