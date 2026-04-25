// ─── Finance Service ───────────────────────────────────────────────────────────
// Mirrors: src/modules/finance/services/ in React project
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { GraphQLService } from '../../../lib/graphql.service';
import {
  FinanceSummary,
  RevenueData,
  FinanceTransaction,
  FinanceFilter,
} from '../../../models/finance.model';
import { PaginatedResponse } from '../../../types/index';

@Injectable({ providedIn: 'root' })
export class FinanceService {
  private readonly _graphql = inject(GraphQLService);

  // ── Finance Summary ────────────────────────────────────────────────────────
  getFinanceSummary(): Observable<FinanceSummary> {
    // Mock data — replace with actual GraphQL query
    return of({
      totalRevenue: 89000,
      totalExpense: 58000,
      netProfit: 31000,
      revenueChange: 12.5,
      expenseChange: 4.2,
      profitChange: 18.3,
    });
  }

  // ── Revenue Data ───────────────────────────────────────────────────────────
  getRevenueData(): Observable<RevenueData[]> {
    return of([
      { month: 'Jan', revenue: 12000, expense: 8000, profit: 4000 },
      { month: 'Feb', revenue: 15000, expense: 9000, profit: 6000 },
      { month: 'Mar', revenue: 10000, expense: 7500, profit: 2500 },
      { month: 'Apr', revenue: 18000, expense: 11000, profit: 7000 },
      { month: 'May', revenue: 14000, expense: 9500, profit: 4500 },
      { month: 'Jun', revenue: 20000, expense: 13000, profit: 7000 },
    ]);
  }

  // ── Transactions ───────────────────────────────────────────────────────────
  getTransactions(
    filter: Partial<FinanceFilter> = { pageNo: 1, pageSize: 10 }
  ): Observable<PaginatedResponse<FinanceTransaction>> {
    const items: FinanceTransaction[] = [
      {
        transactionId: 'txn-001',
        type: 'INCOME',
        amount: 5000,
        currency: 'USD',
        category: 'Sales',
        description: 'Product sale - Q2',
        date: '2024-06-01',
        createdAt: '2024-06-01T10:00:00Z',
      },
      {
        transactionId: 'txn-002',
        type: 'EXPENSE',
        amount: 1200,
        currency: 'USD',
        category: 'Operations',
        description: 'Server costs',
        date: '2024-06-05',
        createdAt: '2024-06-05T09:00:00Z',
      },
      {
        transactionId: 'txn-003',
        type: 'INCOME',
        amount: 3500,
        currency: 'USD',
        category: 'Services',
        description: 'Consulting fee',
        date: '2024-06-10',
        createdAt: '2024-06-10T14:00:00Z',
      },
      {
        transactionId: 'txn-004',
        type: 'EXPENSE',
        amount: 800,
        currency: 'USD',
        category: 'Marketing',
        description: 'Ad campaign',
        date: '2024-06-12',
        createdAt: '2024-06-12T11:00:00Z',
      },
      {
        transactionId: 'txn-005',
        type: 'INCOME',
        amount: 7200,
        currency: 'USD',
        category: 'Sales',
        description: 'Enterprise deal',
        date: '2024-06-15',
        createdAt: '2024-06-15T16:00:00Z',
      },
    ];

    return of({
      items,
      totalCount: items.length,
      pageNo: filter.pageNo ?? 1,
      pageSize: filter.pageSize ?? 10,
      totalPages: 1,
    });
  }
}
