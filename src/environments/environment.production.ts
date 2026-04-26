import { appConfig } from './environment.config';

/** Swapped in via `angular.json` for production. Regenerate `environment.config.ts` (e.g. `npm run env:apply -- prod`) before release builds. */
export const environment = {
  ...appConfig,
  production: true,
} as const;
