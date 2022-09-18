import path from 'path';
import console from 'console';
import { app, BrowserWindow, shell } from 'electron';
import MenuBuilder from './menu';
import { resolveHtmlPath, getAssetPath } from './util';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const installExtensions = async () => {
  // eslint-disable-next-line global-require
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

let mainWindow: BrowserWindow | null = null;

export enum Page {
  SETTINGS = 'settings',
  REPORT_CHUNK = 'reportChunk',
  CHUNK_LIST = 'chunkList',
}

const createWindow = async (
  _isDebug: boolean,
  page: Page = Page.SETTINGS
): Promise<BrowserWindow> => {
  // if (mainWindow !== null) {
  //   return mainWindow;
  // }

  // if (isDebug) {
  //   await installExtensions();
  // }

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
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
  });

  mainWindow.loadURL(`${resolveHtmlPath(`index.html`)}#/${page}`);

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  return mainWindow;
};

export default createWindow;
