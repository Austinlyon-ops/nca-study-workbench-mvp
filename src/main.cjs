const { app, BrowserWindow, dialog, ipcMain, shell, safeStorage } = require('electron');
const { join } = require('node:path');
const { readFile, writeFile, unlink, copyFile, access } = require('node:fs/promises');
const { randomBytes, pbkdf2Sync, createCipheriv, createDecipheriv } = require('node:crypto');
const { initialState, validState, migrateState, backupFor, parseBackup, scheduleCard } = require('./state.cjs');
const content = require('./content.cjs');

let state;
// 显示名升级为 NCA Study Hub，但安装版继续使用旧数据目录，避免升级后记录看似丢失。
if (process.env.NCA_DESK_USER_DATA) app.setPath('userData', process.env.NCA_DESK_USER_DATA);
else if (app.isPackaged) app.setPath('userData', join(app.getPath('appData'), 'NCA Study Desk'));
const statePath = () => join(app.getPath('userData'), 'study-state-v1.json');
const backupPath = () => join(app.getPath('userData'), 'study-state-v1.backup.json');
const cloudConfigPath = () => join(app.getPath('userData'), 'cloud-sync-settings.json');
async function exists(path) { try { await access(path); return true; } catch { return false; } }
async function loadState() { try { return migrateState(JSON.parse(await readFile(statePath(), 'utf8'))); } catch { return initialState(); } }
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
function cloudUrl(value) { const url=new URL(String(value||''));if(url.protocol!=='https:')throw new Error('云端地址必须使用 HTTPS。');return url.origin; }
async function readCloudConfig() { try { return JSON.parse(await readFile(cloudConfigPath(),'utf8')); } catch { return {}; } }
async function cloudToken() { const config=await readCloudConfig();if(!config.encryptedToken)throw new Error('尚未配置云端同步口令。');if(!safeStorage.isEncryptionAvailable())throw new Error('Windows 安全存储当前不可用，未读取同步口令。');return safeStorage.decryptString(Buffer.from(config.encryptedToken,'base64')); }
function encryptCloud(value,token){const salt=randomBytes(16),iv=randomBytes(12),key=pbkdf2Sync(token,salt,200000,32,'sha256'),cipher=createCipheriv('aes-256-gcm',key,iv),ciphertext=Buffer.concat([cipher.update(JSON.stringify(value),'utf8'),cipher.final()]);return{format:'nca-study-hub-encrypted-backup',version:1,kdf:'PBKDF2-SHA256',iterations:200000,cipher:'AES-256-GCM',salt:salt.toString('base64'),iv:iv.toString('base64'),tag:cipher.getAuthTag().toString('base64'),ciphertext:ciphertext.toString('base64'),createdAt:new Date().toISOString()}}
function decryptCloud(value,token){try{if(value?.format!=='nca-study-hub-encrypted-backup'||value.version!==1||value.iterations!==200000)throw new Error();const salt=Buffer.from(value.salt,'base64'),iv=Buffer.from(value.iv,'base64'),tag=Buffer.from(value.tag,'base64'),key=pbkdf2Sync(token,salt,value.iterations,32,'sha256'),decipher=createDecipheriv('aes-256-gcm',key,iv);decipher.setAuthTag(tag);return JSON.parse(Buffer.concat([decipher.update(Buffer.from(value.ciphertext,'base64')),decipher.final()]).toString('utf8'))}catch{throw new Error('云端数据无法解密：同步口令不匹配或数据已损坏。')}}
async function cloudRequest(pathname,options={}){const config=await readCloudConfig(),base=cloudUrl(config.baseUrl),controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);try{const response=await fetch(base+pathname,{...options,signal:controller.signal});const text=await response.text();let body={};try{body=text?JSON.parse(text):{}}catch{throw new Error('云端服务返回了无法识别的内容。')}if(!response.ok)throw new Error(body.message||`云端服务返回 ${response.status}`);return{body,etag:response.headers.get('etag')}}catch(error){if(error.name==='AbortError')throw new Error('连接云端超时，请检查网络后重试。');if(error instanceof TypeError)throw new Error('无法连接云端服务，请检查地址和网络。');throw error}finally{clearTimeout(timer)}}
function createWindow() {
  const window = new BrowserWindow({ width: 1180, height: 780, minWidth: 1024, minHeight: 768, title: 'NCA Study Hub', icon: join(__dirname, '../assets/app.ico'), webPreferences: { preload: join(__dirname, 'preload.cjs'), contextIsolation: true, sandbox: true, nodeIntegration: false } });
  window.removeMenu(); window.loadFile(join(__dirname, 'renderer/index.html'));
}
app.whenReady().then(async () => { state = await loadState(); createWindow(); app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); }); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
ipcMain.handle('state:get', () => state);
ipcMain.handle('content:get', () => content);
ipcMain.handle('state:save', async (_event, next) => saveState(next));
ipcMain.handle('scheduler:next', (_event, input) => scheduleCard(input.cardId, input.current, input.rating, input.reason, input.reviewedAt, input.evidenceId));
ipcMain.handle('cloud:config:get', async()=>{const config=await readCloudConfig();return{baseUrl:config.baseUrl||'',configured:Boolean(config.encryptedToken),lastEtag:config.lastEtag||null,lastSyncAt:config.lastSyncAt||null}});
ipcMain.handle('cloud:config:set', async(_event,input)=>{const baseUrl=cloudUrl(input.baseUrl),token=String(input.token||''),previous=await readCloudConfig();if(!token&&!previous.encryptedToken)throw new Error('首次配置请输入至少 20 个字符的同步口令。');if(token&&token.length<20)throw new Error('同步口令至少需要 20 个字符。');if(token&&!safeStorage.isEncryptionAvailable())throw new Error('Windows 安全存储当前不可用，未保存口令。');const sameOrigin=previous.baseUrl===baseUrl;const config={baseUrl,encryptedToken:token?safeStorage.encryptString(token).toString('base64'):previous.encryptedToken,updatedAt:new Date().toISOString(),...(sameOrigin?{lastEtag:previous.lastEtag,lastSyncAt:previous.lastSyncAt}:{})};await writeFile(cloudConfigPath(),JSON.stringify(config,null,2),'utf8');return{baseUrl,configured:true}});
ipcMain.handle('cloud:test', async()=>{const result=await cloudRequest('/api/health');return result.body});
ipcMain.handle('cloud:push', async()=>{const token=await cloudToken(),config=await readCloudConfig(),payload=encryptCloud(backupFor(state),token),result=await cloudRequest('/api/state?channel=desktop',{method:'PUT',headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json',...(config.lastEtag?{'If-Match':config.lastEtag}:{})},body:JSON.stringify(payload)});const next={...config,lastEtag:result.etag||result.body.etag||null,lastSyncAt:new Date().toISOString()};await writeFile(cloudConfigPath(),JSON.stringify(next,null,2),'utf8');return{savedAt:result.body.savedAt||next.lastSyncAt,etag:next.lastEtag}});
ipcMain.handle('cloud:pull', async()=>{const token=await cloudToken(),config=await readCloudConfig(),result=await cloudRequest('/api/state?channel=desktop',{headers:{'Authorization':`Bearer ${token}`}}),nextState=parseBackup(decryptCloud(result.body,token));const next={...config,lastEtag:result.etag||null,lastSyncAt:new Date().toISOString()};await writeFile(cloudConfigPath(),JSON.stringify(next,null,2),'utf8');return{state:nextState,savedAt:result.body.createdAt||null,etag:next.lastEtag}});
ipcMain.handle('backup:export', async () => {
  const result = await dialog.showSaveDialog({ title: '导出学习备份', defaultPath: 'NCA-Study-Hub-backup-v2.json', filters: [{ name: 'NCA Study Hub 备份', extensions: ['json'] }] });
  if (result.canceled || !result.filePath) return { canceled: true };
  await writeFile(result.filePath, JSON.stringify(backupFor(state), null, 2), 'utf8');
  return { canceled: false, filePath: result.filePath };
});
ipcMain.handle('backup:import', async () => {
  const result = await dialog.showOpenDialog({ title: '选择学习备份', properties: ['openFile'], filters: [{ name: 'NCA Study Hub 备份', extensions: ['json'] }] });
  if (result.canceled || !result.filePaths[0]) return { canceled: true };
  try { return { canceled:false, valid:true, state:parseBackup(JSON.parse(await readFile(result.filePaths[0], 'utf8'))) }; } catch (error) { return { canceled:false, valid:false, message:error.message || '备份无法读取。' }; }
});
ipcMain.handle('external:open', (_event, url) => { if (typeof url === 'string' && /^https:\/\//.test(url) && [content.source.url, ...(content.sources || []).map(s => s.url)].includes(url)) return shell.openExternal(url); return false; });
