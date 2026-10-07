const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('ncaDesk', {
  getState: () => ipcRenderer.invoke('state:get'), getContent: () => ipcRenderer.invoke('content:get'), saveState: (state) => ipcRenderer.invoke('state:save', state),
  exportBackup: () => ipcRenderer.invoke('backup:export'), importBackup: () => ipcRenderer.invoke('backup:import'), openSource: (url) => ipcRenderer.invoke('external:open', url)
});
