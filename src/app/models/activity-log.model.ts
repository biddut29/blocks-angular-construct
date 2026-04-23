// ─── Activity Log Models ───────────────────────────────────────────────────────
// Mirrors: src/modules/activity-log/types/ in React project

export type ActivityAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'VIEW'
  | 'DOWNLOAD'
  | 'SHARE';

export interface ActivityLog {
  logId: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: ActivityAction;
  resource: string;
  resourceId?: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface ActivityLogFilter {
  userId?: string;
  action?: ActivityAction;
  resource?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  pageNo: number;
  pageSize: number;
}
