import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { OfflineStore } from '../offline/store';

let mainWindow: BrowserWindow | null = null;
const offlineStore = new OfflineStore();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'Fabi CBT',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3001');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('offline:save-exam', async (_event, exam) => {
  return offlineStore.saveExam(exam);
});

ipcMain.handle('offline:get-exams', async () => {
  return offlineStore.getExams();
});

ipcMain.handle('offline:save-result', async (_event, result) => {
  return offlineStore.saveResult(result);
});

ipcMain.handle('offline:get-results', async () => {
  return offlineStore.getResults();
});

ipcMain.handle('offline:sync', async () => {
  return offlineStore.syncPending();
});

ipcMain.handle('offline:is-online', async () => {
  return !offlineStore.isOffline;
});

ipcMain.handle('offline:get-pending-count', async () => {
  return offlineStore.getPendingCount();
});
