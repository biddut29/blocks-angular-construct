// ─── Finance Component ─────────────────────────────────────────────────────────
// Mirrors: src/modules/finance/pages/FinancePage.tsx in React project
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables, ChartData, ChartOptions } from 'chart.js';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideDollarSign,
  lucideTrendingUp,
  lucideTrendingDown,
  lucideArrowUpRight,
  lucideArrowDownRight,
} from '@ng-icons/lucide';
import { HlmCard, HlmCardContent, HlmCardHeader, HlmCardTitle } from '@spartan-ng/helm/card';
import { HlmTable } from '@spartan-ng/helm/table';
import { FinanceService } from '../../services/finance.service';
import { FinanceSummary, FinanceTransaction } from '../../../../models/finance.model';

Chart.register(...registerables);

@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    BaseChartDirective,
    NgIconComponent,
    HlmCard,
    HlmCardHeader,
    HlmCardTitle,
    HlmCardContent,
    HlmTable,
  ],
  viewProviders: [
    provideIcons({
      lucideDollarSign,
      lucideTrendingUp,
      lucideTrendingDown,
      lucideArrowUpRight,
      lucideArrowDownRight,
    }),
  ],
  template: `
    <div class="p-6 space-y-6">
      <!-- ── Page Header ─────────────────────────────────────────── -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Finance</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Track your revenue, expenses and transactions.
        </p>
      </div>

      <!-- ── Summary Cards ──────────────────────────────────────── -->
      @if (summary()) {
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <!-- Total Revenue -->
          <div
            hlmCard
            class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm"
          >
            <div hlmCardHeader class="flex items-center justify-between px-6 pt-6 pb-2">
              <p hlmCardTitle class="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Revenue
              </p>
              <div class="p-2 rounded-lg bg-green-50 dark:bg-green-900/30">
                <ng-icon
                  name="lucideDollarSign"
                  class="text-green-600 dark:text-green-400"
                  size="18"
                ></ng-icon>
              </div>
            </div>
            <div hlmCardContent class="px-6 pb-6">
              <div class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ summary()!.totalRevenue | currency }}
              </div>
              <div class="flex items-center gap-1 mt-1">
                <ng-icon name="lucideArrowUpRight" class="text-green-500" size="14"></ng-icon>
                <span class="text-green-600 text-xs font-medium"
                  >+{{ summary()!.revenueChange }}%</span
                >
              </div>
            </div>
          </div>

          <!-- Total Expense -->
          <div
            hlmCard
            class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm"
          >
            <div hlmCardHeader class="flex items-center justify-between px-6 pt-6 pb-2">
              <p hlmCardTitle class="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Expense
              </p>
              <div class="p-2 rounded-lg bg-red-50 dark:bg-red-900/30">
                <ng-icon
                  name="lucideTrendingDown"
                  class="text-red-600 dark:text-red-400"
                  size="18"
                ></ng-icon>
              </div>
            </div>
            <div hlmCardContent class="px-6 pb-6">
              <div class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ summary()!.totalExpense | currency }}
              </div>
              <div class="flex items-center gap-1 mt-1">
                <ng-icon name="lucideArrowUpRight" class="text-red-500" size="14"></ng-icon>
                <span class="text-red-600 text-xs font-medium"
                  >+{{ summary()!.expenseChange }}%</span
                >
              </div>
            </div>
          </div>

          <!-- Net Profit -->
          <div
            hlmCard
            class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm"
          >
            <div hlmCardHeader class="flex items-center justify-between px-6 pt-6 pb-2">
              <p hlmCardTitle class="text-sm font-medium text-gray-500 dark:text-gray-400">
                Net Profit
              </p>
              <div class="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30">
                <ng-icon
                  name="lucideTrendingUp"
                  class="text-indigo-600 dark:text-indigo-400"
                  size="18"
                ></ng-icon>
              </div>
            </div>
            <div hlmCardContent class="px-6 pb-6">
              <div class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ summary()!.netProfit | currency }}
              </div>
              <div class="flex items-center gap-1 mt-1">
                <ng-icon name="lucideArrowUpRight" class="text-green-500" size="14"></ng-icon>
                <span class="text-green-600 text-xs font-medium"
                  >+{{ summary()!.profitChange }}%</span
                >
              </div>
            </div>
          </div>
        </div>
      }

      <!-- ── Area Chart: Revenue vs Expense ─────────────────────── -->
      <div
        class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-6"
      >
        <h2 class="text-base font-semibold text-gray-900 dark:text-white mb-4">
          Revenue vs Expense
        </h2>
        <div class="relative h-72">
          <canvas baseChart [data]="areaChartData" [options]="areaChartOptions" type="line">
          </canvas>
        </div>
      </div>

      <!-- ── Transaction Table ───────────────────────────────────── -->
      <div
        class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden"
      >
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-base font-semibold text-gray-900 dark:text-white">Recent Transactions</h2>
        </div>
        <div class="overflow-x-auto">
          <table hlmTable class="w-full text-sm">
            <thead>
              <tr
                class="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50"
              >
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  ID
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Type
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Category
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Description
                </th>
                <th
                  class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Amount
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              @for (txn of transactions(); track txn.transactionId) {
                <tr
                  class="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                >
                  <td class="px-6 py-4 text-gray-600 dark:text-gray-400 font-mono text-xs">
                    {{ txn.transactionId }}
                  </td>
                  <td class="px-6 py-4">
                    <span
                      [class]="
                        txn.type === 'INCOME'
                          ? 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      "
                    >
                      {{ txn.type }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-gray-700 dark:text-gray-300">{{ txn.category }}</td>
                  <td class="px-6 py-4 text-gray-600 dark:text-gray-400">{{ txn.description }}</td>
                  <td
                    class="px-6 py-4 text-right font-semibold"
                    [class]="
                      txn.type === 'INCOME'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    "
                  >
                    {{ txn.type === 'INCOME' ? '+' : '-' }}{{ txn.amount | currency: txn.currency }}
                  </td>
                  <td class="px-6 py-4 text-gray-500 dark:text-gray-400">{{ txn.date }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class FinanceComponent implements OnInit {
  private readonly financeService = inject(FinanceService);

  // ── Signals ────────────────────────────────────────────────────────────────
  readonly summary = signal<FinanceSummary | null>(null);
  readonly transactions = signal<FinanceTransaction[]>([]);

  // ── Chart: Area (Revenue vs Expense) ──────────────────────────────────────
  areaChartData: ChartData<'line'> = { labels: [], datasets: [] };

  areaChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } },
    scales: { y: { beginAtZero: true } },
    elements: { line: { tension: 0.4 } },
  };

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.financeService.getFinanceSummary().subscribe((data) => this.summary.set(data));

    this.financeService.getRevenueData().subscribe((data) => {
      this.areaChartData = {
        labels: data.map((d) => d.month),
        datasets: [
          {
            label: 'Revenue',
            data: data.map((d) => d.revenue),
            borderColor: '#16a34a',
            backgroundColor: 'rgba(22,163,74,0.15)',
            fill: true,
            tension: 0.4,
          },
          {
            label: 'Expense',
            data: data.map((d) => d.expense),
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239,68,68,0.1)',
            fill: true,
            tension: 0.4,
          },
        ],
      };
    });

    this.financeService.getTransactions().subscribe((res) => this.transactions.set(res.items));
  }
}
