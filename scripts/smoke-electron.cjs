const { _electron } = require('playwright-core');
const { mkdtemp } = require('node:fs/promises');
const { join } = require('node:path');
const { tmpdir } = require('node:os');

(async () => {
  const userData = await mkdtemp(join(tmpdir(), 'nca-study-desk-smoke-'));
  const env = { ...process.env, NCA_DESK_USER_DATA: userData };
  delete env.ELECTRON_RUN_AS_NODE;
  const config = { executablePath: require('electron'), args: [join(__dirname, '..')], env };
  const electronApp = await _electron.launch(config);
  try {
    const page = await electronApp.firstWindow();
    await page.getByText('继续学习', { exact: true }).click();
    await page.getByText('已阅读', { exact: true }).first().click();
    await page.waitForTimeout(250);
    await page.locator('#toPractice').click();
    await page.locator('input[name="answer"][value="a"]').check();
    await page.waitForTimeout(150);
    await page.getByText('提交并查看解析', { exact: true }).click();
    await page.getByText('这题暂时答错了', { exact: true }).waitFor();
    await page.getByRole('button', { name: '到期复习' }).click();
    await page.getByText('查看未来安排（1）', { exact: true }).waitFor();
    await page.waitForTimeout(350);
  } finally { await electronApp.close(); }
  const reopenedApp = await _electron.launch(config);
  try {
    const reopened = await reopenedApp.firstWindow();
    await reopened.getByRole('button', { name: '到期复习' }).click();
    await reopened.getByText('查看未来安排（1）', { exact: true }).waitFor();
    if ((await reopened.locator('#notice').textContent()).trim()) throw new Error('unexpected save-failure notice after reopen');
    await reopened.screenshot({ path: 'output/playwright/electron-learning-review-flow.png', fullPage: true });
    console.log('Electron UI smoke passed: learning -> wrong answer -> FSRS future review -> close/reopen persistence');
  } finally { await reopenedApp.close(); }
})();
