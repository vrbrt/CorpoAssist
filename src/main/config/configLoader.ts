import yaml from 'js-yaml';
import {
  readFile as readFileRaw,
  existsSync,
  writeFile as writeFileRaw,
} from 'fs';
import { homedir } from 'os';
import { promisify } from 'util';
import { ApplicationConfig } from './types';
import defaultConfig from './defaultConfig';

const readFile = promisify(readFileRaw);
const writeFile = promisify(writeFileRaw);

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
