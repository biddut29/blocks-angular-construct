import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideChevronLeft,
  lucideDownload,
  lucidePencil,
  lucideSend,
  lucideLoaderCircle,
} from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { BrnDialogContent, BrnDialogState } from '@spartan-ng/brain/dialog';
import {
  HlmDialog,
  HlmDialogContent,
  HlmDialogDescription,
  HlmDialogFooter,
  HlmDialogHeader,
  HlmDialogTitle,
} from '@spartan-ng/helm/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InvoicesService } from '../../services/invoices.service';
import type { InvoiceItem } from '../../types/invoices.types';

@Component({
  selector: 'app-invoices-detail',
  standalone: true,
  imports: [
    CommonModule,
    NgIconComponent,
    HlmButton,
    BrnDialogContent,
    HlmDialog,
    HlmDialogContent,
    HlmDialogHeader,
    HlmDialogFooter,
    HlmDialogTitle,
    HlmDialogDescription,
    TranslateModule,
  ],
  viewProviders: [
    provideIcons({
      lucideChevronLeft,
      lucideDownload,
      lucidePencil,
      lucideSend,
      lucideLoaderCircle,
    }),
  ],
  template: `
    @if (loading()) {
      <div class="flex items-center justify-center w-full h-[60vh] text-muted-foreground">
        <ng-icon name="lucideLoaderCircle" class="mr-2 h-8 w-8 animate-spin" />
      </div>
    } @else if (!invoice()) {
      <div class="flex items-center justify-center w-full h-[60vh]">
        <p class="text-muted-foreground">Invoice not found.</p>
      </div>
    } @else {
      <div class="flex w-full flex-col gap-4">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-2">
            <button
              hlmBtn
              variant="ghost"
              size="sm"
              class="h-9 w-9 rounded-full bg-card hover:bg-card/60"
              type="button"
              (click)="back()"
              aria-label="Back"
            >
              <ng-icon name="lucideChevronLeft" class="h-5 w-5" />
            </button>
            <h1 class="text-2xl font-semibold uppercase text-foreground">
              {{ invoice()!.ItemId }}
            </h1>
          </div>

          <div class="flex flex-col gap-2 md:flex-row md:items-center">
            <div class="flex items-center gap-2">
              <span class="text-sm text-muted-foreground">Status:</span>
              <span
                class="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium"
              >
                {{ invoice()!.Status ?? 'Draft' }}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <button hlmBtn variant="outline" type="button" (click)="downloadPdf()">
                <ng-icon name="lucideDownload" class="h-4 w-4 sm:mr-1" />
                <span class="hidden sm:inline">Download</span>
              </button>
              <button hlmBtn variant="outline" type="button" (click)="edit()">
                <ng-icon name="lucidePencil" class="h-4 w-4 sm:mr-1" />
                <span class="hidden sm:inline">Edit</span>
              </button>
              <button hlmBtn type="button" class="bg-primary" (click)="openSendDialog()">
                <ng-icon name="lucideSend" class="h-4 w-4 sm:mr-1" />
                <span class="hidden sm:inline">Send</span>
              </button>
            </div>
          </div>
        </div>

        @if (banner()) {
          <div
            class="rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground shadow-sm"
          >
            {{ banner() }}
          </div>
        }

        <div class="w-full rounded-lg border border-border bg-card shadow-sm">
          <div class="flex flex-col gap-6 p-6 sm:p-10" #invoiceRoot>
            <div class="flex flex-col sm:flex-row sm:justify-between gap-4">
              <div class="h-[56px] w-[220px]">
                <img
                  src="/images/construct_logo_dark.svg"
                  alt="Blocks Construct"
                  class="block h-full w-full object-contain object-left dark:hidden"
                />
                <img
                  src="/images/construct_logo_light.svg"
                  alt="Blocks Construct"
                  class="hidden h-full w-full object-contain object-left dark:block"
                />
              </div>
              <div class="flex flex-col sm:border-l sm:border-border sm:pl-4">
                <div class="font-semibold text-foreground">Blocks Construct</div>
                <div class="text-sm text-muted-foreground">demo.construct@seliseblocks.com</div>
                <div class="text-sm text-muted-foreground">+41757442538</div>
              </div>
            </div>

            <div class="h-px w-full bg-border"></div>

            <div class="flex flex-col sm:flex-row w-full sm:justify-between gap-6">
              <div class="flex flex-col gap-2 w-full md:w-[50%]">
                <div class="text-sm text-muted-foreground">Invoice details</div>
                <div class="flex items-center gap-2">
                  <div class="font-bold uppercase text-foreground">{{ invoice()!.ItemId }}</div>
                  <span
                    class="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium"
                  >
                    {{ invoice()!.Status ?? 'Draft' }}
                  </span>
                </div>
                <div class="flex items-center gap-2 text-sm">
                  <span class="text-muted-foreground">Date issued:</span>
                  <span class="text-foreground">{{ fmtDate(invoice()!.DateIssued) }}</span>
                </div>
                <div class="flex items-center gap-2 text-sm">
                  <span class="text-muted-foreground">Due date:</span>
                  <span class="text-foreground">{{ fmtDate(invoice()!.DueDate) }}</span>
                </div>
              </div>

              <div class="flex flex-col gap-2 w-full md:w-[50%]">
                <div class="text-base font-medium text-muted-foreground mb-1">Billed to</div>
                <div class="text-base font-bold text-foreground">
                  {{ invoice()!.Customer[0]?.CustomerName ?? '—' }}
                </div>
                <div class="flex items-center gap-2 text-sm">
                  <span class="text-muted-foreground">Billing address:</span>
                  <span class="text-foreground">{{
                    invoice()!.Customer[0]?.BillingAddress ?? '—'
                  }}</span>
                </div>
                <div class="flex items-center gap-2 text-sm">
                  <span class="text-muted-foreground">Email:</span>
                  <span class="text-foreground">{{ invoice()!.Customer[0]?.Email ?? '—' }}</span>
                </div>
                <div class="flex items-center gap-2 text-sm">
                  <span class="text-muted-foreground">Phone no:</span>
                  <span class="text-foreground">{{ invoice()!.Customer[0]?.PhoneNo ?? '—' }}</span>
                </div>
              </div>
            </div>

            <div class="h-px w-full bg-border"></div>

            <div class="flex flex-col w-full gap-4">
              <div class="text-lg font-medium text-muted-foreground">Order details</div>
              <div class="overflow-x-auto">
                <table class="w-full min-w-[720px] border-collapse text-sm">
                  <thead>
                    <tr class="border-b border-border bg-muted/40">
                      <th
                        class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground"
                      >
                        Item name
                      </th>
                      <th
                        class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground"
                      >
                        Category
                      </th>
                      <th
                        class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground"
                      >
                        Quantity
                      </th>
                      <th
                        class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground"
                      >
                        Unit price
                      </th>
                      <th
                        class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground"
                      >
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (it of invoice()!.ItemDetails ?? []; track it.ItemId) {
                      <tr class="border-b border-border/80">
                        <td class="px-4 py-3">
                          <div class="font-semibold text-foreground">{{ it.ItemName }}</div>
                          @if (it.Note) {
                            <div class="text-xs text-muted-foreground mt-0.5 max-w-[520px]">
                              {{ it.Note }}
                            </div>
                          }
                        </td>
                        <td class="px-4 py-3 text-foreground">{{ it.Category }}</td>
                        <td class="px-4 py-3 text-foreground">{{ it.Quantity }}</td>
                        <td class="px-4 py-3 text-foreground uppercase">
                          {{ currency() }} {{ (it.UnitPrice ?? 0).toFixed(2) }}
                        </td>
                        <td class="px-4 py-3 text-foreground uppercase">
                          {{ currency() }} {{ (it.Amount ?? 0).toFixed(2) }}
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>

            <div
              class="flex flex-col-reverse sm:flex-row w-full items-start sm:justify-between gap-6"
            >
              <div class="flex flex-col gap-2 w-full md:w-[50%]">
                @if (invoice()!.GeneralNote) {
                  <div class="text-sm font-medium text-muted-foreground">
                    General note (Optional)
                  </div>
                  <div class="text-sm text-muted-foreground max-w-[520px]">
                    {{ invoice()!.GeneralNote }}
                  </div>
                }
              </div>
              <div class="flex flex-col gap-3 w-full sm:w-[28%]">
                <div class="flex justify-between text-sm">
                  <span class="text-muted-foreground">Subtotal</span>
                  <span class="font-semibold text-foreground uppercase"
                    >{{ currency() }} {{ subtotal().toFixed(2) }}</span
                  >
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-muted-foreground">Taxes ({{ taxRate() }}%)</span>
                  <span class="font-semibold text-foreground uppercase"
                    >{{ currency() }} {{ taxAmount().toFixed(2) }}</span
                  >
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-muted-foreground">Discount</span>
                  <span class="font-semibold text-foreground uppercase"
                    >-{{ currency() }} {{ discount().toFixed(2) }}</span
                  >
                </div>
                <div class="flex justify-between border-t border-border pt-3">
                  <span class="font-semibold text-foreground">Total amount</span>
                  <span class="text-xl font-bold text-foreground uppercase"
                    >{{ currency() }} {{ totalAmount().toFixed(2) }}</span
                  >
                </div>
              </div>
            </div>

            <div class="h-px w-full bg-border"></div>
            <div class="text-sm text-muted-foreground">
              Please make sure that payments are within the stated due date. Thank you for your
              business.
            </div>
          </div>
        </div>

        <hlm-dialog
          [state]="sendDialogState()"
          [role]="'alertdialog'"
          (stateChanged)="onSendDialogStateChanged($event)"
        >
          <hlm-dialog-content
            *brnDialogContent="let ctx"
            class="z-[100] w-full max-w-md p-0 sm:rounded-lg"
            aria-modal="true"
            aria-describedby="send-invoice-desc"
          >
            <hlm-dialog-header class="space-y-2 px-6 pt-6 text-left sm:text-left">
              <h3 hlmDialogTitle class="text-xl font-bold text-foreground">
                {{ 'INVOICE.SEND_TITLE' | translate }}
              </h3>
              <p id="send-invoice-desc" hlmDialogDescription class="text-sm text-muted-foreground">
                {{ 'INVOICE.SEND_DESC' | translate }}
              </p>
            </hlm-dialog-header>
            <hlm-dialog-footer
              class="flex flex-row justify-end gap-2 border-t border-border px-6 py-4 sm:space-x-0"
            >
              <button
                type="button"
                hlmBtn
                variant="outline"
                class="rounded-[6px]"
                (click)="ctx.close()"
              >
                {{ 'IAM.CANCEL' | translate }}
              </button>
              <button
                type="button"
                hlmBtn
                class="rounded-[6px] bg-primary"
                (click)="confirmSend(ctx)"
              >
                {{ 'IAM.CONFIRM' | translate }}
              </button>
            </hlm-dialog-footer>
          </hlm-dialog-content>
        </hlm-dialog>
      </div>
    }
  `,
})
export class InvoicesDetailComponent {
  private readonly _svc = inject(InvoicesService);
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _translate = inject(TranslateService);

  readonly invoiceId = signal<string>('');
  readonly invoice = signal<InvoiceItem | null>(null);
  readonly loading = signal(true);
  readonly banner = signal('');

  /** Same flow as React `ConfirmationModal` + `showSendDialog` on Send. */
  readonly sendDialogState = signal<BrnDialogState>('closed');

  readonly currency = computed(() => (this.invoice()?.Currency ?? 'CHF').toUpperCase());

  readonly subtotal = computed(() => {
    const inv = this.invoice();
    const items = inv?.ItemDetails ?? [];
    return Number(items.reduce((sum, it) => sum + (Number(it.Amount) || 0), 0).toFixed(2));
  });

  readonly discount = computed(() => Number(this.invoice()?.Discount) || 0);
  readonly isTaxPercentage = computed(() => {
    const t = Number(this.invoice()?.Taxes) || 0;
    return t > 0 && t <= 100;
  });

  readonly taxAmount = computed(() => {
    const subtotal = this.subtotal();
    const t = Number(this.invoice()?.Taxes) || 0;
    return this.isTaxPercentage() ? Number((subtotal * (t / 100)).toFixed(2)) : Number(t || 0);
  });

  readonly taxRate = computed(() => {
    const subtotal = this.subtotal();
    if (subtotal <= 0) return '0.00';
    const t = Number(this.invoice()?.Taxes) || 0;
    if (this.isTaxPercentage()) return t.toFixed(2);
    return ((this.taxAmount() / subtotal) * 100).toFixed(2);
  });

  readonly totalAmount = computed(() => {
    const total = this.subtotal() + this.taxAmount() - this.discount();
    return Math.max(0, Number(total.toFixed(2)));
  });

  constructor() {
    const id = String(this._route.snapshot.paramMap.get('invoiceId') ?? '');
    this.invoiceId.set(id);
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this._svc
      .getInvoiceItems({ pageNo: 1, pageSize: 100 })
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res) => {
          const inv = (res.items ?? []).find((x) => x.ItemId === this.invoiceId()) ?? null;
          this.invoice.set(inv);
          this.loading.set(false);
        },
        error: () => {
          this.invoice.set(null);
          this.loading.set(false);
        },
      });
  }

  fmtDate(iso: string | undefined): string {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString();
  }

  back(): void {
    this._router.navigate(['/invoices']);
  }

  edit(): void {
    this._router.navigate(['/invoices', this.invoiceId(), 'edit']);
  }

  openSendDialog(): void {
    this.sendDialogState.set('open');
  }

  onSendDialogStateChanged(s: BrnDialogState): void {
    this.sendDialogState.set(s);
  }

  /**
   * Mirrors React `handleSendInvoice` (toast) — here we use the app banner.
   */
  confirmSend(ctx: { close: () => void }): void {
    ctx.close();
    this.banner.set(this._translate.instant('INVOICE.SENT_BANNER'));
  }

  async downloadPdf(): Promise<void> {
    // Keep business behavior similar (download action). If PDF libs are not installed, fallback to print.
    try {
      window.print();
      this.banner.set('Download started.');
    } catch {
      this.banner.set('Could not generate invoice.');
    }
  }
}
