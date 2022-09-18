import loki from 'lokijs';
import { homedir } from 'os';

interface TimeReportRow {
  taskId: number;
  type: string;
  project: string;
  tags: string[];
  date: Date;
  time: number;
}

let db: loki | undefined;
let hours: Collection<TimeReportRow> | undefined;

let dbLoaded: (value: unknown) => void | undefined;
const dbLoadedPromise = new Promise((resolve) => {
  dbLoaded = resolve;
});

const dbReady = (value: unknown) => {
  hours = db?.getCollection('hours');
  if (hours === null) {
    hours = db?.addCollection('hours', {
      indices: ['type', 'project', 'tags', 'date'],
    });
  }
  dbLoaded(value);
};

const databaseFile = `${homedir()}\\corpoAssist.db`;

// eslint-disable-next-line import/prefer-default-export
export const initDB = () => {
  // eslint-disable-next-line new-cap
  db = new loki(databaseFile, {
    autoload: true,
    autoloadCallback: dbReady,
  });

  return dbLoadedPromise;
};

export const saveTimeReport = (row: TimeReportRow) => {
  hours?.insert(row);
  db?.save();
};

export const getAllHours = () => {
  return hours?.data;
};
