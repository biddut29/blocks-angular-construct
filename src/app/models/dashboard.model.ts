// ─── Dashboard Models ──────────────────────────────────────────────────────────
// Mirrors: src/modules/dashboard/types/ in React project

export interface MetricCard {
  title: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: string;
  prefix?: string;
  suffix?: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  date?: string;
}

export interface UserActivityData {
  date: string;
  activeUsers: number;
  newUsers: number;
  sessions: number;
}

export interface DashboardStats {
  totalRevenue: number;
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  revenueChange: number;
  usersChange: number;
  ordersChange: number;
}
