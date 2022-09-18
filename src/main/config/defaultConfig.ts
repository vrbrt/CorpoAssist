import { ApplicationConfig, MenuItemType, TaskType } from './types';

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
  tasks: [
    {
      id: 0,
      type: TaskType.INCIDENT,
      title: 'Task X',
      details: 'Task X description',
      tags: ['production', 'support', 'incidents'],
      badge: 'Popular',
    },
    {
      id: 1,
      type: TaskType.DEVELOPMENT,
      project: 'New system',
      title: 'Task Y',
      details: 'Task Y description',
      tags: ['development', 'creative'],
      badge: 'Last',
    },
    {
      id: 2,
      type: TaskType.SUPPORT,
      title: 'Task Y',
      details: 'Task Y description',
      tags: ['development', 'creative'],
    },
  ],
};

export default defaultConfig;
