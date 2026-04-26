// ─── Inventory list — mirrors React `pages/inventory/inventory.tsx` + table UX ─
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideLoaderCircle,
  lucidePlus,
  lucideSettings2,
  lucideRefreshCw,
} from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { InventoryService } from '../../services/inventory.service';
import type { InventoryItemGql } from '@app/models/inventory.model';
import {
  CATEGORY_OPTIONS,
  INVENTORY_STATUS,
  ITEM_LOC_OPTIONS,
} from '@app/models/inventory.model';
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '@app/constant/modules.constant';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent, HlmButton, HlmInput, DatePipe, DecimalPipe],
  viewProviders: [
    provideIcons({
      lucideLoaderCircle,
      lucidePlus,
      lucideSettings2,
      lucideRefreshCw,
    }),
  ],
  template: `
    <div class="flex w-full flex-col gap-4">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 class="text-2xl font-bold tracking-tight text-foreground">Inventory</h1>
        <div class="flex flex-wrap items-center gap-2">
          <button
            hlmBtn
            variant="outline"
            class="h-9 gap-1"
            type="button"
            disabled
            title="Column settings (use table columns below for filters)"
          >
            <ng-icon name="lucideSettings2" class="h-4 w-4" />
            Columns
          </button>
          <button
            hlmBtn
            class="h-9 gap-1 inline-flex items-center font-semibold bg-primary text-primary-foreground"
            type="button"
            (click)="router.navigate(['/inventory/add'])"
          >
            <ng-icon name="lucidePlus" class="h-4 w-4" />
            Add item
          </button>
        </div>
      </div>

      <div
        class="overflow-hidden rounded-lg border border-border bg-card shadow-sm"
        *ngIf="!loading() && !errorMessage(); else stateTpl"
      >
        <div class="overflow-x-auto">
          <table class="w-full min-w-[960px] border-collapse text-sm">
            <thead>
              <tr class="border-b border-border bg-muted/50">
                <th class="px-3 py-2 text-left text-xs font-medium uppercase text-muted-foreground w-9">
                  <button
                    hlmBtn
                    variant="ghost"
                    class="h-7 w-7 p-0"
                    type="button"
                    (click)="resetFilters()"
                    title="Reset filters"
                  >
                    <ng-icon name="lucideRefreshCw" class="h-3.5 w-3.5" />
                  </button>
                </th>
                <th class="px-3 py-2 text-left text-xs font-medium uppercase text-muted-foreground">Item name</th>
                <th class="px-3 py-2 text-left text-xs font-medium uppercase text-muted-foreground">Category</th>
                <th class="px-3 py-2 text-left text-xs font-medium uppercase text-muted-foreground">Supplier</th>
                <th class="px-3 py-2 text-left text-xs font-medium uppercase text-muted-foreground">Item location</th>
                <th class="px-3 py-2 text-left text-xs font-medium uppercase text-muted-foreground">Stock</th>
                <th class="px-3 py-2 text-left text-xs font-medium uppercase text-muted-foreground">Last updated</th>
                <th class="px-3 py-2 text-left text-xs font-medium uppercase text-muted-foreground">Price</th>
                <th class="px-3 py-2 text-left text-xs font-medium uppercase text-muted-foreground">Status</th>
              </tr>
              <tr class="border-b border-border bg-background">
                <th class="px-3 py-2 w-9"></th>
                <th class="px-3 py-1">
                  <input
                    hlmInput
                    class="h-8 w-full text-xs"
                    type="search"
                    placeholder="Search"
                    [ngModel]="fItemName()"
                    (ngModelChange)="fItemName.set($event); applyClientFilters()"
                  />
                </th>
                <th class="px-3 py-1">
                  <select
                    class="h-8 w-full rounded-md border border-input bg-background text-xs"
                    [ngModel]="fCategory()"
                    (ngModelChange)="fCategory.set($event); applyClientFilters()"
                  >
                    <option value="">Select</option>
                    @for (c of categoryOptions; track c) {
                      <option [value]="c">{{ c }}</option>
                    }
                  </select>
                </th>
                <th class="px-3 py-1">
                  <input
                    hlmInput
                    class="h-8 w-full text-xs"
                    [ngModel]="fSupplier()"
                    (ngModelChange)="fSupplier.set($event); applyClientFilters()"
                    placeholder="Search"
                  />
                </th>
                <th class="px-3 py-1">
                  <select
                    class="h-8 w-full rounded-md border border-input bg-background text-xs"
                    [ngModel]="fLoc()"
                    (ngModelChange)="fLoc.set($event); applyClientFilters()"
                  >
                    <option value="">Select</option>
                    @for (l of itemLocOptions; track l) {
                      <option [value]="l">{{ l }}</option>
                    }
                  </select>
                </th>
                <th class="px-3 py-1">
                  <input
                    hlmInput
                    class="h-8 w-full text-xs"
                    type="number"
                    [ngModel]="fStockMin()"
                    (ngModelChange)="fStockMin.set(+$event || 0); applyClientFilters()"
                    min="0"
                    placeholder="0"
                  />
                </th>
                <th class="px-3 py-1">
                  <input
                    hlmInput
                    class="h-8 w-full min-w-[120px] text-xs"
                    type="date"
                    [ngModel]="fLastUpd()==='' ? null : fLastUpd()"
                    (ngModelChange)="fLastUpd.set($event || ''); applyClientFilters()"
                  />
                </th>
                <th class="px-3 py-1">
                  <input
                    hlmInput
                    class="h-8 w-full text-xs"
                    [ngModel]="fPrice()"
                    (ngModelChange)="fPrice.set($event); applyClientFilters()"
                    placeholder="Search"
                  />
                </th>
                <th class="px-3 py-1">
                  <select
                    class="h-8 w-full rounded-md border border-input bg-background text-xs"
                    [ngModel]="fStatus()"
                    (ngModelChange)="fStatus.set($event); applyClientFilters()"
                  >
                    <option value="">Select</option>
                    <option [value]="sActive">{{ sActive }}</option>
                    <option [value]="sDis">{{ sDis }}</option>
                  </select>
                </th>
              </tr>
            </thead>
            <tbody>
              @for (row of filtered(); track row.ItemId) {
                <tr
                  class="border-b border-border/80 cursor-pointer hover:bg-muted/30"
                  (click)="goDetail(row)"
                >
                  <td class="px-3 py-2.5 w-9"></td>
                  <td class="px-3 py-2.5 max-w-[200px]">
                    <div class="flex items-center gap-2">
                      <div
                        class="h-8 w-8 shrink-0 rounded border border-border/60 bg-muted/40 flex items-center justify-center"
                      >
                        <span class="text-[9px] text-muted-foreground">img</span>
                      </div>
                      <span class="font-medium text-foreground line-clamp-1">{{ row.ItemName }}</span>
                    </div>
                  </td>
                  <td class="px-3 py-2.5">{{ row.Category }}</td>
                  <td class="px-3 py-2.5 line-clamp-1">{{ row.Supplier }}</td>
                  <td class="px-3 py-2.5">{{ row.ItemLoc }}</td>
                  <td class="px-3 py-2.5">{{ row.Stock }}</td>
                  <td class="px-3 py-2.5 whitespace-nowrap text-muted-foreground text-xs">
                    @if (row.LastUpdatedDate) {
                      {{ row.LastUpdatedDate | date: 'dd/MM/yyyy' }}
                    } @else {
                      —
                    }
                  </td>
                  <td class="px-3 py-2.5">{{ row.Price | number: '1.0-0' }}</td>
                  <td
                    class="px-3 py-2.5"
                    [class.text-emerald-600]="row.Status === sActive"
                    [class.text-muted-foreground]="row.Status === sDis"
                  >
                    {{ row.Status }}
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="9" class="px-4 py-8 text-center text-sm text-muted-foreground">
                    No items on this page.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div
          class="flex flex-col gap-2 border-t border-border sm:flex-row sm:items-center sm:justify-end px-4 py-3"
        >
          <div class="flex flex-wrap items-center justify-end gap-2 text-sm">
            <span class="text-muted-foreground">Rows per page</span>
            <select
              class="h-8 rounded-md border border-input bg-background text-xs"
              [ngModel]="pageSize()"
              (ngModelChange)="changePageSize(+$event)"
            >
              @for (n of pageSizes; track n) {
                <option [value]="n">{{ n }}</option>
              }
            </select>
            <span class="text-muted-foreground ml-2">
              Page {{ pageIndex() + 1 }} of {{ pageCount() }}
            </span>
            <div class="inline-flex items-center gap-0.5">
              <button
                hlmBtn
                variant="ghost"
                size="sm"
                class="h-8 w-8 p-0"
                type="button"
                (click)="firstPage()"
                [disabled]="pageIndex() <= 0"
                aria-label="First page"
              >
                <span class="text-xs">«</span>
              </button>
              <button
                hlmBtn
                variant="ghost"
                size="sm"
                class="h-8 w-8 p-0"
                type="button"
                (click)="prevPage()"
                [disabled]="pageIndex() <= 0"
                aria-label="Previous page"
              >
                <span class="text-xs">‹</span>
              </button>
              <button
                hlmBtn
                variant="ghost"
                size="sm"
                class="h-8 w-8 p-0"
                type="button"
                (click)="nextPage()"
                [disabled]="pageIndex() + 1 >= pageCount() || pageCount() === 0"
                aria-label="Next page"
              >
                <span class="text-xs">›</span>
              </button>
              <button
                hlmBtn
                variant="ghost"
                size="sm"
                class="h-8 w-8 p-0"
                type="button"
                (click)="lastPage()"
                [disabled]="pageIndex() + 1 >= pageCount() || pageCount() === 0"
                aria-label="Last page"
              >
                <span class="text-xs">»</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ng-template #stateTpl>
      @if (loading()) {
        <div
          class="flex items-center justify-center gap-2 rounded-lg border border-border py-20 text-muted-foreground"
        >
          <ng-icon name="lucideLoaderCircle" class="h-6 w-6 animate-spin" />
          <span>Loading inventory…</span>
        </div>
      } @else if (errorMessage()) {
        <div
          class="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {{ errorMessage() }}
        </div>
      }
    </ng-template>
  `,
})
export class InventoryListComponent implements OnInit {
  private readonly _inventory = inject(InventoryService);
  readonly router = inject(Router);

  readonly sActive = INVENTORY_STATUS.ACTIVE;
  readonly sDis = INVENTORY_STATUS.DISCONTINUED;
  readonly categoryOptions = [...CATEGORY_OPTIONS];
  readonly itemLocOptions = [...ITEM_LOC_OPTIONS];
  readonly pageSizes = [...PAGE_SIZE_OPTIONS];

  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly pageIndex = signal(0);
  readonly pageSize = signal(DEFAULT_PAGE_SIZE);
  readonly totalCount = signal(0);
  private readonly pageItems = signal<InventoryItemGql[]>([]);

  fItemName = signal('');
  fCategory = signal('');
  fSupplier = signal('');
  fLoc = signal('');
  fStockMin = signal(0);
  fLastUpd = signal('');
  fPrice = signal('');
  fStatus = signal('');

  readonly filtered = computed(() => {
    const rows = this.pageItems();
    return rows.filter((r) => {
      if (this.fItemName() && !r.ItemName.toLowerCase().includes(this.fItemName().toLowerCase()))
        return false;
      if (this.fCategory() && r.Category !== this.fCategory()) return false;
      if (this.fSupplier() && !r.Supplier.toLowerCase().includes(this.fSupplier().toLowerCase()))
        return false;
      if (this.fLoc() && r.ItemLoc !== this.fLoc()) return false;
      if (this.fStockMin() > 0 && r.Stock < this.fStockMin()) return false;
      if (this.fStatus() && r.Status !== this.fStatus()) return false;
      if (this.fPrice() && String(r.Price) !== this.fPrice() && !String(r.Price).includes(this.fPrice())) return false;
      if (this.fLastUpd() && r.LastUpdatedDate) {
        const d = r.LastUpdatedDate.slice(0, 10);
        if (d !== this.fLastUpd()) return false;
      } else if (this.fLastUpd() && !r.LastUpdatedDate) return false;
      return true;
    });
  });

  readonly pageCount = computed(() => {
    const t = this.totalCount();
    const s = this.pageSize();
    return Math.max(1, Math.ceil(t / s) || 1);
  });

  ngOnInit() {
    this.load();
  }

  private load() {
    this.loading.set(true);
    this.errorMessage.set(null);
    this._inventory
      .getInventoryItems(this.pageIndex() + 1, this.pageSize())
      .pipe(take(1))
      .subscribe({
        next: (d) => {
          this.pageItems.set(d?.items ?? []);
          this.totalCount.set(d?.totalCount ?? 0);
          this.loading.set(false);
        },
        error: (e) => {
          this.loading.set(false);
          this.errorMessage.set(
            e?.message && typeof e.message === 'string' ? e.message : 'Failed to load inventory.'
          );
        },
      });
  }

  applyClientFilters() {
    /* no-op: filtered() is computed from signals; trigger template updates is automatic */
  }

  resetFilters() {
    this.fItemName.set('');
    this.fCategory.set('');
    this.fSupplier.set('');
    this.fLoc.set('');
    this.fStockMin.set(0);
    this.fLastUpd.set('');
    this.fPrice.set('');
    this.fStatus.set('');
  }

  goDetail(item: InventoryItemGql) {
    void this.router.navigate(['/inventory', item.ItemId]);
  }

  firstPage() {
    this.pageIndex.set(0);
    this.load();
  }

  prevPage() {
    if (this.pageIndex() <= 0) return;
    this.pageIndex.set(this.pageIndex() - 1);
    this.load();
  }

  nextPage() {
    if (this.pageIndex() + 1 >= this.pageCount()) return;
    this.pageIndex.set(this.pageIndex() + 1);
    this.load();
  }

  lastPage() {
    this.pageIndex.set(Math.max(0, this.pageCount() - 1));
    this.load();
  }

  changePageSize(n: number) {
    this.pageSize.set(n);
    this.pageIndex.set(0);
    this.load();
  }
}
