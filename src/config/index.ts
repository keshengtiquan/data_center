import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';

const configFileNameObj = {
  development: 'application-dev',
  production: 'application-prod',
};

const env = process.env.NODE_ENV;

export const getConfig = () => {
  return yaml.load(
    readFileSync(join(`./${configFileNameObj[env]}.yml`), 'utf8'),
  );
};