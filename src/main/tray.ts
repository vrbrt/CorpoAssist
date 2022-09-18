import { Menu, MenuItemConstructorOptions, Tray, shell } from 'electron';
import { spawn } from 'child_process';
import { existsSync } from 'fs';
import console from 'console';
import { clearInterval } from 'timers';

import { getAssetPath } from './util';
import { TrayConfig, MenuItemType, MenuItem, MenuConfig } from './config/types';
import { Page } from './window';

const runProcess = (
  path: string,
  parameters: string[] | undefined,
  missingNotification: string | undefined
) => {
  if (!existsSync(path)) {
    console.log(`File ${path} not found. Info: ${missingNotification}`);
  } else {
    spawn(path, parameters);
  }
};

const convertMenuConfig = (menuConfig: MenuConfig) => {
  return menuConfig.map((value: MenuItem): MenuItemConstructorOptions => {
    let menuItemOptions: MenuItemConstructorOptions | null = null;

    // eslint-disable-next-line default-case
    switch (value.type) {
      case MenuItemType.LINK: {
        menuItemOptions = {
          label: value.label,
          click: () => shell.openExternal(value.link),
        };
        break;
      }
      case MenuItemType.SEPARATOR: {
        menuItemOptions = {
          type: 'separator',
        };
        break;
      }
      case MenuItemType.RUN: {
        menuItemOptions = {
          label: value.label,
          click: () =>
            runProcess(value.path, value.parameters, value.missingNotification),
        };
        break;
      }
      case MenuItemType.MENU: {
        menuItemOptions = {
          label: value.label,
          type: 'submenu',
          submenu: convertMenuConfig(value.menu),
        };
        break;
      }
    }
    return menuItemOptions;
  });
};

const loadContextMenuOptions = (
  config: TrayConfig
): MenuItemConstructorOptions[] => {
  return convertMenuConfig(config.menu);
};

type CreateWindowFunction = (page: Page) => Promise<void>;
type CreateDialogFunction = () => Promise<void>;

const createTray = (
  config: TrayConfig,
  createWindow: CreateWindowFunction,
  createDialog: CreateDialogFunction
) => {
  const tray = new Tray(getAssetPath('icon.png'));

  let interval: NodeJS.Timer | undefined;

  const contextMenu = Menu.buildFromTemplate([
    ...loadContextMenuOptions(config),
    {
      type: 'separator',
    },
    {
      label: 'Reported hours',
      click: () => createWindow(Page.CHUNK_LIST),
    },
    {
      label: 'Report hours',
      click: createDialog,
    },
    {
      label: 'Report popup enabled',
      type: 'checkbox',
      click: (menuItem) => {
        if (menuItem.checked) {
          interval = setInterval(createDialog, 1800000);
        } else {
          clearInterval(interval);
        }
      },
    },
    // {
    //   type: 'separator',
    // },
    // {
    //   label: 'Configuration',
    //   click: () => createWindow(Page.SETTINGS),
    // },
    {
      type: 'separator',
    },
    {
      label: 'Exit',
      role: 'quit',
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.setToolTip('CorpoAssist - custom menus');
};

export default createTray;
