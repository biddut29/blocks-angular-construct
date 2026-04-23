// ─── Finance Models ────────────────────────────────────────────────────────────
// Mirrors: src/modules/finance/types/ in React project

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface FinanceTransaction {
  transactionId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  category: string;
  description: string;
  date: string;
  createdAt: string;
}

export interface RevenueData {
  month: string;
  revenue: number;
  expense: number;
  profit: number;
}

export interface FinanceSummary {
  totalRevenue: number;
  totalExpense: number;
  netProfit: number;
  revenueChange: number;
  expenseChange: number;
  profitChange: number;
}

export interface FinanceFilter {
  type?: TransactionType;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  pageNo: number;
  pageSize: number;
}
