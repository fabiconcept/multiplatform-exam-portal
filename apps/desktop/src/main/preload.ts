import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  offline: {
    saveExam: (exam: any) => ipcRenderer.invoke('offline:save-exam', exam),
    getExams: () => ipcRenderer.invoke('offline:get-exams'),
    saveResult: (result: any) => ipcRenderer.invoke('offline:save-result', result),
    getResults: () => ipcRenderer.invoke('offline:get-results'),
    sync: () => ipcRenderer.invoke('offline:sync'),
    isOnline: () => ipcRenderer.invoke('offline:is-online'),
    getPendingCount: () => ipcRenderer.invoke('offline:get-pending-count'),
  },
});
