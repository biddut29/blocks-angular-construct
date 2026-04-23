// ─── Dashboard Service ─────────────────────────────────────────────────────────
// Mirrors: src/modules/dashboard/services/ in React project
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { GraphQLService } from '../../../lib/graphql.service';
import { DashboardStats, UserActivityData } from '../../../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly _graphql = inject(GraphQLService);

  // ── Stats ──────────────────────────────────────────────────────────────────
  getStats(): Observable<DashboardStats> {
    // Mock data — replace with actual GraphQL query
    return of({
      totalRevenue: 84254,
      totalUsers: 1284,
      totalOrders: 546,
      totalProducts: 89,
      revenueChange: 12.5,
      usersChange: 8.2,
      ordersChange: -3.1,
    });
  }

  // ── User Activity ──────────────────────────────────────────────────────────
  getUserActivity(): Observable<UserActivityData[]> {
    return of([
      { date: 'Jan', activeUsers: 400, newUsers: 240, sessions: 600 },
      { date: 'Feb', activeUsers: 300, newUsers: 139, sessions: 500 },
      { date: 'Mar', activeUsers: 600, newUsers: 380, sessions: 900 },
      { date: 'Apr', activeUsers: 800, newUsers: 430, sessions: 1100 },
      { date: 'May', activeUsers: 500, newUsers: 280, sessions: 750 },
      { date: 'Jun', activeUsers: 900, newUsers: 500, sessions: 1300 },
    ]);
  }

  // ── Revenue Data ───────────────────────────────────────────────────────────
  getRevenueData(): Observable<{ month: string; revenue: number; expense: number }[]> {
    return of([
      { month: 'Jan', revenue: 12000, expense: 8000 },
      { month: 'Feb', revenue: 15000, expense: 9000 },
      { month: 'Mar', revenue: 10000, expense: 7500 },
      { month: 'Apr', revenue: 18000, expense: 11000 },
      { month: 'May', revenue: 14000, expense: 9500 },
      { month: 'Jun', revenue: 20000, expense: 13000 },
    ]);
  }

  // ── Category Distribution ──────────────────────────────────────────────────
  getCategoryDistribution(): Observable<{ category: string; value: number }[]> {
    return of([
      { category: 'Electronics', value: 35 },
      { category: 'Clothing', value: 25 },
      { category: 'Food', value: 20 },
      { category: 'Books', value: 12 },
      { category: 'Other', value: 8 },
    ]);
  }
}
