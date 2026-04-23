// ─── Activity Log Service ──────────────────────────────────────────────────────
// Mirrors: src/modules/activity-log/services/ in React project
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { GraphQLService } from '../../../lib/graphql.service';
import { ActivityLog, ActivityLogFilter } from '../../../models/activity-log.model';
import { PaginatedResponse } from '../../../types/index';

@Injectable({ providedIn: 'root' })
export class ActivityLogService {
  private readonly _graphql = inject(GraphQLService);

  // ── Get Logs ───────────────────────────────────────────────────────────────
  getLogs(filter: Partial<ActivityLogFilter> = { pageNo: 1, pageSize: 20 }): Observable<PaginatedResponse<ActivityLog>> {
    // Mock data — replace with actual GraphQL query
    const items: ActivityLog[] = [
      {
        logId: 'log-001',
        userId: 'u-001',
        userName: 'Alice Johnson',
        userEmail: 'alice@example.com',
        action: 'LOGIN',
        resource: 'Auth',
        description: 'User logged in successfully',
        ipAddress: '192.168.1.1',
        createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      },
      {
        logId: 'log-002',
        userId: 'u-001',
        userName: 'Alice Johnson',
        userEmail: 'alice@example.com',
        action: 'CREATE',
        resource: 'Task',
        resourceId: 'task-123',
        description: 'Created task "Fix login bug"',
        ipAddress: '192.168.1.1',
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      },
      {
        logId: 'log-003',
        userId: 'u-002',
        userName: 'Bob Smith',
        userEmail: 'bob@example.com',
        action: 'UPDATE',
        resource: 'User',
        resourceId: 'u-003',
        description: 'Updated user role to Admin',
        ipAddress: '10.0.0.5',
        createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      },
      {
        logId: 'log-004',
        userId: 'u-003',
        userName: 'Carol White',
        userEmail: 'carol@example.com',
        action: 'DELETE',
        resource: 'File',
        resourceId: 'f-456',
        description: 'Deleted file "old-report.pdf"',
        ipAddress: '172.16.0.10',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        logId: 'log-005',
        userId: 'u-001',
        userName: 'Alice Johnson',
        userEmail: 'alice@example.com',
        action: 'DOWNLOAD',
        resource: 'File',
        resourceId: 'f-789',
        description: 'Downloaded "project-report.pdf"',
        ipAddress: '192.168.1.1',
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      },
      {
        logId: 'log-006',
        userId: 'u-004',
        userName: 'David Brown',
        userEmail: 'david@example.com',
        action: 'VIEW',
        resource: 'Invoice',
        resourceId: 'inv-001',
        description: 'Viewed invoice #INV-2024-001',
        ipAddress: '192.168.2.20',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      },
      {
        logId: 'log-007',
        userId: 'u-002',
        userName: 'Bob Smith',
        userEmail: 'bob@example.com',
        action: 'SHARE',
        resource: 'File',
        resourceId: 'f-101',
        description: 'Shared "design-mockup.png" with team',
        ipAddress: '10.0.0.5',
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      },
      {
        logId: 'log-008',
        userId: 'u-003',
        userName: 'Carol White',
        userEmail: 'carol@example.com',
        action: 'LOGOUT',
        resource: 'Auth',
        description: 'User logged out',
        ipAddress: '172.16.0.10',
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      },
    ];

    return of({
      items,
      totalCount: 50,
      pageNo: filter.pageNo ?? 1,
      pageSize: filter.pageSize ?? 20,
      totalPages: 3,
    });
  }
}
