const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('ncaDesk', {
  getState: () => ipcRenderer.invoke('state:get'), getContent: () => ipcRenderer.invoke('content:get'), saveState: (state) => ipcRenderer.invoke('state:save', state),
  scheduleCard: (input) => ipcRenderer.invoke('scheduler:next', input),
  getCloudConfig: () => ipcRenderer.invoke('cloud:config:get'), setCloudConfig: (input) => ipcRenderer.invoke('cloud:config:set', input),
  testCloud: () => ipcRenderer.invoke('cloud:test'), pushCloud: () => ipcRenderer.invoke('cloud:push'), pullCloud: () => ipcRenderer.invoke('cloud:pull'),
  exportBackup: () => ipcRenderer.invoke('backup:export'), importBackup: () => ipcRenderer.invoke('backup:import'), openSource: (url) => ipcRenderer.invoke('external:open', url)
});
