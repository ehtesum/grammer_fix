import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getOfflineStatus: () => ipcRenderer.invoke('get-offline-status'),
  isElectron: true,
});
