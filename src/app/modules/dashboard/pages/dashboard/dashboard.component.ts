// ─── Dashboard Component ───────────────────────────────────────────────────────
// Mirrors: src/modules/dashboard/pages/DashboardPage.tsx in React project
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables, ChartData, ChartOptions } from 'chart.js';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideDollarSign,
  lucideUsers,
  lucideShoppingCart,
  lucidePackage,
  lucideTrendingUp,
  lucideTrendingDown,
} from '@ng-icons/lucide';
import { HlmCard, HlmCardContent, HlmCardHeader, HlmCardTitle } from '@spartan-ng/helm/card';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardStats, UserActivityData } from '../../../../models/dashboard.model';

// Register Chart.js globally
Chart.register(...registerables);

// ─── Metric Card Interface ─────────────────────────────────────────────────────
interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  icon: string;
  prefix?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    BaseChartDirective,
    NgIconComponent,
    HlmCard,
    HlmCardHeader,
    HlmCardTitle,
    HlmCardContent,
  ],
  viewProviders: [
    provideIcons({
      lucideDollarSign,
      lucideUsers,
      lucideShoppingCart,
      lucidePackage,
      lucideTrendingUp,
      lucideTrendingDown,
    }),
  ],
  hostDirectives: [],
  template: `
    <div class="p-6 space-y-6">
      <!-- ── Page Header ─────────────────────────────────────────── -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Welcome back! Here is what is happening today.
          </p>
        </div>
      </div>

      <!-- ── Metric Cards ────────────────────────────────────────── -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        @for (card of metricCards(); track card.title) {
          <div
            hlmCard
            class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm"
          >
            <div hlmCardHeader class="flex flex-row items-center justify-between px-6 pt-6 pb-2">
              <p hlmCardTitle class="text-sm font-medium text-gray-500 dark:text-gray-400">
                {{ card.title }}
              </p>
              <div class="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30">
                <ng-icon
                  [name]="card.icon"
                  class="text-indigo-600 dark:text-indigo-400"
                  size="18"
                ></ng-icon>
              </div>
            </div>
            <div hlmCardContent class="px-6 pb-6">
              <div class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ card.prefix }}{{ card.value | number }}
              </div>
              <div class="flex items-center gap-1 mt-1">
                <ng-icon
                  [name]="card.change >= 0 ? 'lucideTrendingUp' : 'lucideTrendingDown'"
                  [class]="card.change >= 0 ? 'text-green-500' : 'text-red-500'"
                  size="14"
                >
                </ng-icon>
                <span
                  [class]="
                    card.change >= 0
                      ? 'text-green-600 text-xs font-medium'
                      : 'text-red-600 text-xs font-medium'
                  "
                >
                  {{ card.change >= 0 ? '+' : '' }}{{ card.change }}% from last month
                </span>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- ── Charts Row ──────────────────────────────────────────── -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- User Activity Line Chart -->
        <div
          class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-6"
        >
          <h2 class="text-base font-semibold text-gray-900 dark:text-white mb-4">User Activity</h2>
          <div class="relative h-64">
            <canvas
              baseChart
              [data]="userActivityChartData"
              [options]="lineChartOptions"
              type="line"
            >
            </canvas>
          </div>
        </div>

        <!-- Revenue Bar Chart -->
        <div
          class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-6"
        >
          <h2 class="text-base font-semibold text-gray-900 dark:text-white mb-4">
            Monthly Revenue
          </h2>
          <div class="relative h-64">
            <canvas baseChart [data]="revenueChartData" [options]="barChartOptions" type="bar">
            </canvas>
          </div>
        </div>
      </div>

      <!-- ── Pie Chart Row ───────────────────────────────────────── -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div
          class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-6"
        >
          <h2 class="text-base font-semibold text-gray-900 dark:text-white mb-4">
            Product Categories
          </h2>
          <div class="relative h-64">
            <canvas baseChart [data]="pieChartData" [options]="pieChartOptions" type="pie">
            </canvas>
          </div>
        </div>

        <!-- Quick Stats -->
        <div
          class="lg:col-span-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-6"
        >
          <h2 class="text-base font-semibold text-gray-900 dark:text-white mb-4">Quick Overview</h2>
          <div class="space-y-4">
            @if (stats()) {
              <div
                class="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700"
              >
                <span class="text-sm text-gray-600 dark:text-gray-400">Total Revenue</span>
                <span class="text-sm font-semibold text-gray-900 dark:text-white"
                  >\${{ stats()!.totalRevenue | number }}</span
                >
              </div>
              <div
                class="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700"
              >
                <span class="text-sm text-gray-600 dark:text-gray-400">Total Users</span>
                <span class="text-sm font-semibold text-gray-900 dark:text-white">{{
                  stats()!.totalUsers | number
                }}</span>
              </div>
              <div
                class="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700"
              >
                <span class="text-sm text-gray-600 dark:text-gray-400">Total Orders</span>
                <span class="text-sm font-semibold text-gray-900 dark:text-white">{{
                  stats()!.totalOrders | number
                }}</span>
              </div>
              <div class="flex items-center justify-between py-3">
                <span class="text-sm text-gray-600 dark:text-gray-400">Total Products</span>
                <span class="text-sm font-semibold text-gray-900 dark:text-white">{{
                  stats()!.totalProducts | number
                }}</span>
              </div>
            } @else {
              <p class="text-sm text-gray-400">Loading stats...</p>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  // ── Signals ────────────────────────────────────────────────────────────────
  readonly stats = signal<DashboardStats | null>(null);
  readonly metricCards = signal<MetricCard[]>([]);

  // ── Chart Data: User Activity (Line) ───────────────────────────────────────
  userActivityChartData: ChartData<'line'> = {
    labels: [],
    datasets: [],
  };

  // ── Chart Data: Revenue (Bar) ──────────────────────────────────────────────
  revenueChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [],
  };

  // ── Chart Data: Categories (Pie) ───────────────────────────────────────────
  pieChartData: ChartData<'pie'> = {
    labels: [],
    datasets: [],
  };

  // ── Chart Options ──────────────────────────────────────────────────────────
  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    scales: { y: { beginAtZero: true } },
  };

  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    scales: { y: { beginAtZero: true } },
  };

  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'right' } },
  };

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this._loadStats();
    this._loadUserActivity();
    this._loadRevenueData();
    this._loadCategoryData();
  }

  // ── Private Loaders ────────────────────────────────────────────────────────
  private _loadStats(): void {
    this.dashboardService.getStats().subscribe((data) => {
      this.stats.set(data);
      this.metricCards.set([
        {
          title: 'Total Revenue',
          value: data.totalRevenue,
          change: data.revenueChange,
          icon: 'lucideDollarSign',
          prefix: '$',
        },
        {
          title: 'Total Users',
          value: data.totalUsers,
          change: data.usersChange,
          icon: 'lucideUsers',
        },
        {
          title: 'Total Orders',
          value: data.totalOrders,
          change: data.ordersChange,
          icon: 'lucideShoppingCart',
        },
        { title: 'Total Products', value: data.totalProducts, change: 0, icon: 'lucidePackage' },
      ]);
    });
  }

  private _loadUserActivity(): void {
    this.dashboardService.getUserActivity().subscribe((data: UserActivityData[]) => {
      this.userActivityChartData = {
        labels: data.map((d) => d.date),
        datasets: [
          {
            label: 'Active Users',
            data: data.map((d) => d.activeUsers),
            borderColor: '#4f46e5',
            backgroundColor: 'rgba(79,70,229,0.1)',
            fill: true,
            tension: 0.4,
          },
          {
            label: 'New Users',
            data: data.map((d) => d.newUsers),
            borderColor: '#0ea5e9',
            backgroundColor: 'rgba(14,165,233,0.1)',
            fill: true,
            tension: 0.4,
          },
        ],
      };
    });
  }

  private _loadRevenueData(): void {
    this.dashboardService.getRevenueData().subscribe((data) => {
      this.revenueChartData = {
        labels: data.map((d) => d.month),
        datasets: [
          {
            label: 'Revenue',
            data: data.map((d) => d.revenue),
            backgroundColor: 'rgba(79,70,229,0.8)',
            borderRadius: 6,
          },
          {
            label: 'Expense',
            data: data.map((d) => d.expense),
            backgroundColor: 'rgba(239,68,68,0.7)',
            borderRadius: 6,
          },
        ],
      };
    });
  }

  private _loadCategoryData(): void {
    this.dashboardService.getCategoryDistribution().subscribe((data) => {
      this.pieChartData = {
        labels: data.map((d) => d.category),
        datasets: [
          {
            data: data.map((d) => d.value),
            backgroundColor: ['#4f46e5', '#0ea5e9', '#16a34a', '#f59e0b', '#ef4444'],
            hoverOffset: 6,
          },
        ],
      };
    });
  }
}
