import { appConfig } from './environment.config';

/** Local / default — used by `ng serve` (development). Values come from `appConfig` in `environment.config.ts` (regenerate with `npm run env:apply`). */
export const environment = {
  ...appConfig,
  production: false,
} as const;
