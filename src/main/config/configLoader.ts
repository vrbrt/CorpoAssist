import yaml from 'js-yaml';
import {
  readFile as readFileRaw,
  existsSync,
  writeFile as writeFileRaw,
} from 'fs';
import { homedir } from 'os';
import { promisify } from 'util';

const readFile = promisify(readFileRaw);
const writeFile = promisify(writeFileRaw);

export enum MenuItemType {
  LINK = 'LINK',
  MENU = 'MENU',
  SEPARATOR = 'SEPARATOR',
  RUN = 'RUN',
}

interface MenuItemConfig {
  type: MenuItemType;
}

interface LabeledMenuItemConfig extends MenuItemConfig {
  label: string;
}

interface SubmenuMenuItemConfig extends LabeledMenuItemConfig {
  type: MenuItemType.MENU;
  menu: MenuConfig;
}

interface LinkMenuItemConfig extends LabeledMenuItemConfig {
  type: MenuItemType.LINK;
  link: string;
}

interface RunMenuItemConfig extends LabeledMenuItemConfig {
  type: MenuItemType.RUN;
  path: string;
  parameters?: string[];
  missingNotification?: string;
}

interface Separator extends MenuItemConfig {
  type: MenuItemType.SEPARATOR;
}

export type MenuItem =
  | RunMenuItemConfig
  | LinkMenuItemConfig
  | SubmenuMenuItemConfig
  | Separator;

export type MenuConfig = MenuItem[];

export interface TrayConfig {
  menu: MenuConfig;
}

interface ApplicationConfig {
  tray: TrayConfig;
}

const defaultConfig: ApplicationConfig = {
  tray: {
    menu: [
      {
        type: MenuItemType.LINK,
        label: 'CorpoAssist github',
        link: 'https://github.com/vrbrt/CorpoAssist',
      },
      { type: MenuItemType.SEPARATOR },
      {
        type: MenuItemType.MENU,
        label: 'Main technologies',
        menu: [
          {
            type: MenuItemType.LINK,
            label: 'Electron',
            link: 'https://www.electronjs.org/',
          },
          {
            type: MenuItemType.LINK,
            label: 'React',
            link: 'https://reactjs.org/',
          },
          {
            type: MenuItemType.LINK,
            label: 'Electron React Boilerplate',
            link: 'https://github.com/electron-react-boilerplate/electron-react-boilerplate',
          },
        ],
      },
      {
        type: MenuItemType.RUN,
        label: 'Notepad',
        path: 'C:\\WINDOWS\\system32\\notepad.exe',
      },
    ],
  },
};

const configFile = `${homedir()}\\.corpoAssistConfig.yaml`;

const saveConfig = async (config: ApplicationConfig): Promise<void> => {
  const serializedConfig = yaml.dump(config);
  return writeFile(configFile, serializedConfig, 'utf8');
};

const loadConfig = async (): Promise<ApplicationConfig> => {
  if (!existsSync(configFile)) {
    await saveConfig(defaultConfig);
  }

  const rawData = await readFile(configFile, 'utf8');
  return yaml.load(rawData) as ApplicationConfig;
};

let config: ApplicationConfig | undefined;

const applicationConfig = async (): Promise<ApplicationConfig> => {
  if (!config) {
    config = await loadConfig();
  }
  return config;
};

export default applicationConfig;
