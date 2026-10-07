const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const { join } = require('node:path');
const { readFile, writeFile, unlink, copyFile, access } = require('node:fs/promises');
const { initialState, validState, backupFor, validBackup } = require('./state.cjs');
const content = require('./content.cjs');

let state;
if (process.env.NCA_DESK_USER_DATA) app.setPath('userData', process.env.NCA_DESK_USER_DATA);
const statePath = () => join(app.getPath('userData'), 'study-state-v1.json');
const backupPath = () => join(app.getPath('userData'), 'study-state-v1.backup.json');
async function exists(path) { try { await access(path); return true; } catch { return false; } }
async function loadState() { try { const parsed = JSON.parse(await readFile(statePath(), 'utf8')); return validState(parsed) ? parsed : initialState(); } catch { return initialState(); } }
async function saveState(next) {
  if (!validState(next)) throw new Error('学习数据格式无效，未保存。');
  require('./understanding.cjs').normalize(next.understanding);
  const data = { ...next, updatedAt: new Date().toISOString() };
  const path = statePath();
  if (await exists(path)) await copyFile(path, backupPath());
  const temp = `${path}.tmp`;
  await writeFile(temp, JSON.stringify(data, null, 2), 'utf8');
  // Windows/同步目录有时拒绝对现有文件执行 rename 覆盖；旧文件已备份，
  // 因此用复制覆盖并仅在成功后清理临时文件，避免把保存失败伪装为成功。
  await copyFile(temp, path);
  await unlink(temp);
  state = data;
  return state;
}
function createWindow() {
  const window = new BrowserWindow({ width: 1180, height: 780, minWidth: 860, minHeight: 620, title: 'NCA Study Hub', icon: join(__dirname, '../assets/app.ico'), webPreferences: { preload: join(__dirname, 'preload.cjs'), contextIsolation: true, sandbox: true, nodeIntegration: false } });
  window.removeMenu(); window.loadFile(join(__dirname, 'renderer/index.html'));
}
app.whenReady().then(async () => { state = await loadState(); createWindow(); app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); }); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
ipcMain.handle('state:get', () => state);
ipcMain.handle('content:get', () => content);
ipcMain.handle('state:save', async (_event, next) => saveState(next));
ipcMain.handle('backup:export', async () => {
  const result = await dialog.showSaveDialog({ title: '导出学习备份', defaultPath: 'NCA-Study-Desk-backup.json', filters: [{ name: 'NCA Study Hub 备份', extensions: ['json'] }] });
  if (result.canceled || !result.filePath) return { canceled: true };
  await writeFile(result.filePath, JSON.stringify(backupFor(state), null, 2), 'utf8');
  return { canceled: false, filePath: result.filePath };
});
ipcMain.handle('backup:import', async () => {
  const result = await dialog.showOpenDialog({ title: '选择学习备份', properties: ['openFile'], filters: [{ name: 'NCA Study Hub 备份', extensions: ['json'] }] });
  if (result.canceled || !result.filePaths[0]) return { canceled: true };
  try { const backup = JSON.parse(await readFile(result.filePaths[0], 'utf8')); if (!validBackup(backup)) throw new Error('不是有效的 NCA Study Hub v1 备份。'); return { canceled: false, valid: true, state: backup.state }; } catch (error) { return { canceled: false, valid: false, message: error.message }; }
});
ipcMain.handle('external:open', (_event, url) => { if (typeof url === 'string' && /^https:\/\//.test(url) && [content.source.url, ...(content.sources || []).map(s => s.url)].includes(url)) return shell.openExternal(url); return false; });
