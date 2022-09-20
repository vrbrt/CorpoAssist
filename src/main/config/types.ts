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

export interface ApplicationConfig {
  tray: TrayConfig;
  tasks: TaskConfig[];
}

export enum TaskType {
  SUPPORT = 'support',
  DEVELOPMENT = 'development',
  INCIDENT = 'incident',
  PROBLEM = 'problem',
}

interface TaskConfig {
  id: number;
  type: TaskType;
  project?: string;
  title: string;
  details: string;
  tags: string[];
  badge?: string;
  subtasks: TaskConfig[];
}
