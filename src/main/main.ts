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
import createWindow, { Page } from './window';
import createDialog from './dialog';
import createTray from './tray';
import applicationConfig, { saveConfig } from './config/configLoader';
import { TaskConfig, TaskType } from './config/types';
import {
  initDB,
  saveTimeReport,
  getAllHours,
  getLastTask,
} from './hours/hoursManagement';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let mainWindow: BrowserWindow | null = null;
let dialogWindow: BrowserWindow | null = null;

type ReportData = {
  title: string;
  type: string;
  details: string;
  project: string;
  tags: string[];
};

ipcMain.on('reportTime', async (_event, arg) => {
  console.log(arg);
  const data = arg[0] as ReportData;
  saveTimeReport({
    project: data.project,
    title: data.title,
    details: data.details,
    tags: data.tags,
    type: data.type,
    time: 0.5,
    date: new Date(),
  });
  dialogWindow?.close();
  mainWindow?.webContents.send('getReports', getAllHours());
});

ipcMain.on('getReports', async (event) => {
  event.reply('getReports', getAllHours());
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

const createMainWindow = (debug: boolean) => async (page: Page) => {
  mainWindow = await createWindow(debug, page);
};

const createDialogWindow = async () => {
  dialogWindow = await createDialog();
};

const getTasksWithSubTasks = (tasks: TaskConfig[]): TaskConfig[] => {
  let flattenedConfig = [...tasks];
  tasks.forEach((task) => {
    flattenedConfig = [
      ...flattenedConfig,
      ...getTasksWithSubTasks(task.subtasks ?? []),
    ];
  });
  return flattenedConfig;
};

const areTasksTheSame = (task1: TaskConfig, task2: TaskConfig) =>
  task1.title === task2.title &&
  task1.details === task2.details &&
  (task1.project === task2.project ||
    ((task1.project ?? '') === '' && (task2.project ?? '') === '')) &&
  task1.type === task2.type;

app
  .whenReady()
  .then(() => initDB())
  .then(() => applicationConfig())
  .then(async (config) => {
    ipcMain.on('getProjects', async (event) => {
      const last = getLastTask();
      let tasks = [...config.tasks];
      if (last) {
        const lastTaskOption: TaskConfig = {
          title: `${last.title} `,
          type: last.type as TaskType,
          project: last.project,
          details: last.details,
          tags: last.tags,
          badge: 'Recent',
        };
        tasks = [lastTaskOption, ...tasks];
      }
      event.reply('getProjects', tasks);
    });
    ipcMain.on('createTask', async (_event, arg) => {
      console.log(arg);
      const { parent, ...data } = arg[0];
      console.log(`Parent: ${JSON.stringify(parent)}`);
      console.log(`Data: ${JSON.stringify(data)}`);
      if (parent === undefined) {
        config.tasks.push(data);
      } else {
        const actualParentFromConfig =
          getTasksWithSubTasks(config.tasks).find((task) => {
            const result = areTasksTheSame(task, parent);
            console.log(
              `Comparing:\ntask: ${JSON.stringify(
                task
              )}\nparent: ${JSON.stringify(parent)}\nresult:${result}`
            );
            return result;
          }) ?? ({} as TaskConfig);
        actualParentFromConfig.subtasks = [
          data,
          ...(actualParentFromConfig.subtasks ?? []),
        ];
      }
      saveConfig(config);
    });
    createTray(config.tray, createMainWindow(isDebug), createDialogWindow);
  })
  .catch(console.log);
