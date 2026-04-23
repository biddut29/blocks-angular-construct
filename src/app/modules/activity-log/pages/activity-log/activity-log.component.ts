// ─── Activity Log Component ────────────────────────────────────────────────────
// Mirrors: src/modules/activity-log/pages/ActivityLogPage.tsx in React project
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideSearch,
  lucideFilter,
  lucideChevronLeft,
  lucideChevronRight,
  lucideActivity,
  lucideRefreshCw,
} from '@ng-icons/lucide';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmButton } from '@spartan-ng/helm/button';
import {
  HlmSelect,
  HlmSelectContent,
  HlmSelectItem,
  HlmSelectTrigger,
  HlmSelectValue,
} from '@spartan-ng/helm/select';
import { ActivityLogService } from '../../services/activity-log.service';
import { ActivityLog, ActivityAction } from '../../../../models/activity-log.model';
import { PaginatedResponse } from '../../../../types/index';

@Component({
  selector: 'app-activity-log',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIconComponent,
    HlmInput,
    HlmButton,
    HlmSelect,
    HlmSelectContent,
    HlmSelectItem,
    HlmSelectTrigger,
    HlmSelectValue,
  ],
  viewProviders: [
    provideIcons({ lucideSearch, lucideFilter, lucideChevronLeft, lucideChevronRight, lucideActivity, lucideRefreshCw }),
  ],
  template: `
    <div class="p-6 space-y-6">
      <!-- ── Page Header ─────────────────────────────────────────── -->
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Activity Log</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Track all user actions and system events.</p>
        </div>
        <button hlmBtn variant="outline" class="flex items-center gap-2 text-sm" (click)="refresh()">
          <ng-icon name="lucideRefreshCw" size="16"></ng-icon>
          Refresh
        </button>
      </div>

      <!-- ── Filters ─────────────────────────────────────────────── -->
      <div class="flex items-center gap-3 flex-wrap">
        <!-- Search -->
        <div class="relative">
          <ng-icon name="lucideSearch" size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></ng-icon>
          <input hlmInput [(ngModel)]="searchQuery" (ngModelChange)="onFilterChange()"
            placeholder="Search by user, action..."
            class="pl-9 w-64 text-sm" />
        </div>

        <!-- Action Filter -->
        <hlm-select [ngModel]="selectedAction" (ngModelChange)="selectedAction = $event; onFilterChange()">
          <hlm-select-trigger class="w-44">
            <hlm-select-value placeholder="All Actions" />
          </hlm-select-trigger>
          <hlm-select-content>
            <hlm-select-item value="">All Actions</hlm-select-item>
            @for (action of actionOptions; track action) {
              <hlm-select-item [value]="action">{{ action }}</hlm-select-item>
            }
          </hlm-select-content>
        </hlm-select>

        <!-- Date From -->
        <input hlmInput type="date" [(ngModel)]="dateFrom" (ngModelChange)="onFilterChange()"
          class="text-sm w-40" placeholder="From date" />

        <!-- Date To -->
        <input hlmInput type="date" [(ngModel)]="dateTo" (ngModelChange)="onFilterChange()"
          class="text-sm w-40" placeholder="To date" />
      </div>

      <!-- ── Activity Table ──────────────────────────────────────── -->
      <div class="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Resource</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">IP Address</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody>
            @for (log of paginatedLogs(); track log.logId) {
              <tr class="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <!-- User -->
                <td class="px-6 py-3">
                  <div>
                    <p class="font-medium text-gray-800 dark:text-gray-200 text-sm">{{ log.userName }}</p>
                    <p class="text-xs text-gray-400">{{ log.userEmail }}</p>
                  </div>
                </td>
                <!-- Action Badge -->
                <td class="px-6 py-3">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    [class]="getActionClass(log.action)">
                    {{ log.action }}
                  </span>
                </td>
                <!-- Resource -->
                <td class="px-6 py-3 text-gray-600 dark:text-gray-400">{{ log.resource }}</td>
                <!-- Description -->
                <td class="px-6 py-3 text-gray-500 dark:text-gray-400 max-w-xs truncate">{{ log.description }}</td>
                <!-- IP -->
                <td class="px-6 py-3 text-gray-500 dark:text-gray-400 font-mono text-xs">{{ log.ipAddress ?? '—' }}</td>
                <!-- Date -->
                <td class="px-6 py-3 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                  {{ log.createdAt | date:'medium' }}
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="px-6 py-12 text-center text-gray-400">
                  <div class="flex flex-col items-center gap-2">
                    <ng-icon name="lucideActivity" size="32"></ng-icon>
                    <p>No activity logs found</p>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>

        <!-- ── Pagination ──────────────────────────────────────── -->
        <div class="px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Showing {{ startIndex() + 1 }}–{{ endIndex() }} of {{ totalCount() }} entries
          </p>
          <div class="flex items-center gap-1">
            <button hlmBtn variant="outline" size="sm" (click)="prevPage()" [disabled]="currentPage() === 1">
              <ng-icon name="lucideChevronLeft" size="16"></ng-icon>
            </button>
            @for (page of pageNumbers(); track page) {
              <button hlmBtn
                [variant]="currentPage() === page ? 'default' : 'outline'"
                size="sm"
                (click)="goToPage(page)"
                class="w-8 h-8 text-xs">
                {{ page }}
              </button>
            }
            <button hlmBtn variant="outline" size="sm" (click)="nextPage()" [disabled]="currentPage() === totalPages()">
              <ng-icon name="lucideChevronRight" size="16"></ng-icon>
            </button>
          </div>
        </div>
      </div>

    </div>
  `,
})
export class ActivityLogComponent implements OnInit {
  private readonly activityLogService = inject(ActivityLogService);

  // ── Signals ────────────────────────────────────────────────────────────────
  readonly logs = signal<ActivityLog[]>([]);
  readonly currentPage = signal(1);
  readonly totalCount = signal(0);
  readonly pageSize = 10;

  // ── Filter State ──────────────────────────────────────────────────────────
  searchQuery = '';
  selectedAction = '';
  dateFrom = '';
  dateTo = '';

  // ── Action Options ─────────────────────────────────────────────────────────
  readonly actionOptions: ActivityAction[] = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VIEW', 'DOWNLOAD', 'SHARE'];

  // ── Computed ───────────────────────────────────────────────────────────────
  readonly filteredLogs = computed(() => {
    let items = this.logs();
    const q = this.searchQuery.toLowerCase();
    if (q) items = items.filter(l => l.userName.toLowerCase().includes(q) || l.action.toLowerCase().includes(q) || l.resource.toLowerCase().includes(q));
    if (this.selectedAction) items = items.filter(l => l.action === this.selectedAction);
    return items;
  });

  readonly totalPages = computed(() => Math.ceil(this.filteredLogs().length / this.pageSize) || 1);
  readonly pageNumbers = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));
  readonly startIndex = computed(() => (this.currentPage() - 1) * this.pageSize);
  readonly endIndex = computed(() => Math.min(this.startIndex() + this.pageSize, this.filteredLogs().length));
  readonly paginatedLogs = computed(() => this.filteredLogs().slice(this.startIndex(), this.endIndex()));

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this._loadLogs();
  }

  // ── Handlers ──────────────────────────────────────────────────────────────
  onFilterChange(): void {
    this.currentPage.set(1);
  }

  refresh(): void {
    this._loadLogs();
  }

  prevPage(): void {
    if (this.currentPage() > 1) this.currentPage.update(p => p - 1);
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1);
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  getActionClass(action: ActivityAction): string {
    const map: Record<string, string> = {
      CREATE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      UPDATE: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      DELETE: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      LOGIN: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
      LOGOUT: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      VIEW: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      DOWNLOAD: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
      SHARE: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    };
    return map[action] ?? 'bg-gray-100 text-gray-700';
  }

  // ── Private ────────────────────────────────────────────────────────────────
  private _loadLogs(): void {
    this.activityLogService.getLogs({ pageNo: 1, pageSize: 100 }).subscribe(res => {
      this.logs.set(res.items);
      this.totalCount.set(res.totalCount);
    });
  }
}
