/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */

import { app, BrowserWindow, ipcMain } from 'electron';
import console from 'console';
import createWindow from './window';
import createTray from './tray';
import applicationConfig from './config/configLoader';

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

/**
 * Add event listeners...
 */
app.on('window-all-closed', (event: Event) => {
  // Don't stop application when window gets closed
  event.preventDefault();
});

const createMainWindow = async (debug: boolean) => {
  mainWindow = await createWindow(debug);
};

app
  .whenReady()
  .then(async () => {
    const config = await applicationConfig();
    console.log(JSON.stringify(config));
    createTray(config.tray, [
      {
        label: 'Ustawienia',
        click: () => createMainWindow(isDebug),
      },
    ]);
  })
  .catch(console.log);
