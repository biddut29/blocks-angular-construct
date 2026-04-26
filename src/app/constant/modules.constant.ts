// ─── Module / Feature Flag Constants ──────────────────────────────────────────
// Mirrors: src/constant/modules.constants.ts in React project

/** File upload `moduleName` for GetPreSignedUrl (mirrors React `ModuleName.DefaultConstruct = 8`). */
export enum FileStorageModuleName {
  DefaultConstruct = 8,
}

export const MODULES = {
  DASHBOARD: 'dashboard',
  FINANCE: 'finance',
  INVENTORY: 'inventory',
  INVOICES: 'invoices',
  TASK_MANAGER: 'task-manager',
  EMAIL: 'mail',
  CHAT: 'chat',
  CALENDAR: 'calendar',
  FILE_MANAGER: 'file-manager',
  ACTIVITY_LOG: 'activity-log',
  IAM: 'identity-management',
  PROFILE: 'profile',
} as const;

export type ModuleKey = (typeof MODULES)[keyof typeof MODULES];

// Page sizes
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100];

// Date formats
export const DATE_FORMAT = 'MMM dd, yyyy';
export const DATETIME_FORMAT = 'MMM dd, yyyy HH:mm';
export const API_DATE_FORMAT = 'yyyy-MM-dd';
