import { appConfig } from './environment.config';

export const environment = {
  ...appConfig,
  production: false,
} as const;
