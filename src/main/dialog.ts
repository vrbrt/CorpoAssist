import path from 'path';
import { app, BrowserWindow } from 'electron';
import { resolveHtmlPath, getAssetPath } from './util';

let dialogWindow: BrowserWindow | null = null;

export enum Page {
  SETTINGS = 'settings',
  REPORT_CHUNK = 'reportChunk',
  CHUNK_LIST = 'chunkList',
}

const createDialog = async (): Promise<BrowserWindow> => {
  if (dialogWindow !== null) {
    return dialogWindow;
  }

  dialogWindow = new BrowserWindow({
    show: false,
    width: 895,
    height: 637,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      devTools: false,
      sandbox: false,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#222222',
      symbolColor: '#EEEEEE',
      height: 32,
    },
    resizable: false,
    maximizable: false,
  });

  dialogWindow.loadURL(`${resolveHtmlPath(`index.html`)}#/reportChunk`);

  dialogWindow.on('ready-to-show', () => {
    if (!dialogWindow) {
      throw new Error('"dialogWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      dialogWindow.minimize();
    } else {
      dialogWindow.show();
    }
  });

  dialogWindow.on('closed', () => {
    dialogWindow = null;
  });

  // Open urls in the user's browser
  dialogWindow.webContents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });

  return dialogWindow;
};

export default createDialog;
