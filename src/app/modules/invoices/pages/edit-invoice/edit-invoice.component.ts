import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InvoicesService } from '../../services/invoices.service';
import type {
  InvoiceItem,
  InvoiceItemDetails,
  UpdateInvoiceItemParams,
} from '../../types/invoices.types';
import { InvoiceStatus } from '../../types/invoices.types';
import { calculateInvoiceTotals } from '../../utils/invoice-utils';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideChevronLeft, lucidePlus } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmLabel } from '@spartan-ng/helm/label';

@Component({
  selector: 'app-edit-invoice',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIconComponent, HlmButton, HlmInput, HlmLabel],
  viewProviders: [provideIcons({ lucideChevronLeft, lucidePlus })],
  template: `
    @if (loading()) {
      <div class="flex items-center justify-center w-full h-[60vh] text-muted-foreground">
        Loading…
      </div>
    } @else if (!invoice()) {
      <div class="flex items-center justify-center w-full h-[60vh] text-muted-foreground">
        Invoice not found.
      </div>
    } @else {
      <div class="flex flex-col w-full gap-4">
        <div
          class="flex items-start gap-2 md:gap-0 md:items-center md:justify-between flex-col md:flex-row"
        >
          <div class="flex items-center gap-2">
            <button
              hlmBtn
              variant="ghost"
              size="sm"
              class="bg-card hover:bg-card/60 rounded-full h-9 w-9 p-0"
              type="button"
              (click)="back()"
            >
              <ng-icon name="lucideChevronLeft" class="h-4 w-4" />
            </button>
            <h1 class="text-xl font-semibold">Edit invoice</h1>
          </div>
          <div class="flex items-center gap-3">
            <button hlmBtn variant="outline" type="button" (click)="submit('draft')">
              Save As Draft
            </button>
            <button hlmBtn type="button" (click)="submit('send')">Save & Send</button>
          </div>
        </div>

        @if (banner()) {
          <div
            class="rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground shadow-sm"
          >
            {{ banner() }}
          </div>
        }

        <div class="w-full rounded-lg border border-border bg-card shadow-sm p-6">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6" [formGroup]="form">
            <div class="space-y-1.5">
              <label hlmLabel>Customer name</label>
              <input hlmInput class="h-11 w-full" formControlName="customerName" />
            </div>
            <div class="space-y-1.5">
              <label hlmLabel>Email</label>
              <input hlmInput class="h-11 w-full" formControlName="email" />
            </div>
            <div class="space-y-1.5">
              <label hlmLabel>Phone number</label>
              <input hlmInput class="h-11 w-full" formControlName="phoneNumber" />
            </div>
            <div class="space-y-1.5">
              <label hlmLabel>Billing address</label>
              <input hlmInput class="h-11 w-full" formControlName="billingAddress" />
            </div>
            <div class="space-y-1.5">
              <label hlmLabel>Due date</label>
              <input hlmInput type="date" class="h-11 w-full" formControlName="dueDate" />
            </div>
            <div class="space-y-1.5">
              <label hlmLabel>Currency</label>
              <input hlmInput class="h-11 w-full" formControlName="currency" />
            </div>
          </div>

          <div class="mt-6 overflow-x-auto" [formGroup]="form">
            <table class="w-full min-w-[900px] border-collapse text-sm">
              <thead>
                <tr class="border-b border-border bg-muted/40">
                  <th
                    class="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground"
                  >
                    Item name
                  </th>
                  <th
                    class="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground"
                  >
                    Category
                  </th>
                  <th
                    class="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground"
                  >
                    Quantity
                  </th>
                  <th
                    class="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground"
                  >
                    Unit price
                  </th>
                  <th
                    class="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground"
                  >
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody formArrayName="items">
                @for (row of items.controls; track row; let i = $index) {
                  <tr class="border-b border-border/80" [formGroupName]="i">
                    <td class="px-3 py-3">
                      <input
                        hlmInput
                        class="h-10 w-full"
                        formControlName="ItemName"
                        (input)="recalc(i)"
                      />
                    </td>
                    <td class="px-3 py-3">
                      <input hlmInput class="h-10 w-full" formControlName="Category" />
                    </td>
                    <td class="px-3 py-3">
                      <input
                        hlmInput
                        type="number"
                        class="h-10 w-24"
                        formControlName="Quantity"
                        (input)="recalc(i)"
                      />
                    </td>
                    <td class="px-3 py-3">
                      <input
                        hlmInput
                        type="number"
                        class="h-10 w-32"
                        formControlName="UnitPrice"
                        (input)="recalc(i)"
                      />
                    </td>
                    <td class="px-3 py-3 uppercase text-muted-foreground">
                      {{ currency() }} {{ (row.value.Amount ?? 0).toFixed(2) }}
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="mt-4 flex items-center gap-3">
            <button hlmBtn variant="outline" type="button" (click)="addItem()">
              <ng-icon name="lucidePlus" class="h-4 w-4 mr-2" /> Add item
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class EditInvoiceComponent {
  private readonly _svc = inject(InvoicesService);
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _fb = inject(FormBuilder);

  readonly invoiceId = signal<string>('');
  readonly invoice = signal<InvoiceItem | null>(null);
  readonly loading = signal(true);
  readonly banner = signal('');

  readonly form = this._fb.group({
    customerName: ['', Validators.required],
    email: [''],
    phoneNumber: [''],
    billingAddress: [''],
    dueDate: ['', Validators.required],
    currency: ['CHF', Validators.required],
    generalNote: [''],
    taxes: [0],
    discount: [0],
    items: this._fb.array([] as any[]),
  });

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  readonly currency = computed(() => String(this.form.value.currency ?? 'CHF').toUpperCase());

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
          if (inv) this._patch(inv);
          this.loading.set(false);
        },
        error: () => {
          this.invoice.set(null);
          this.loading.set(false);
        },
      });
  }

  private _patch(inv: InvoiceItem): void {
    const c = inv.Customer[0];
    this.form.patchValue({
      customerName: c?.CustomerName ?? '',
      email: c?.Email ?? '',
      phoneNumber: c?.PhoneNo ?? '',
      billingAddress: c?.BillingAddress ?? '',
      dueDate: inv.DueDate ? new Date(inv.DueDate).toISOString().slice(0, 10) : '',
      currency: (inv.Currency ?? 'CHF').toUpperCase(),
      generalNote: inv.GeneralNote ?? '',
      taxes: inv.Taxes ?? 0,
      discount: inv.Discount ?? 0,
    });
    this.items.clear();
    for (const it of inv.ItemDetails ?? []) {
      this.items.push(
        this._fb.group({
          ItemId: [it.ItemId],
          ItemName: [it.ItemName],
          Category: [it.Category],
          Quantity: [it.Quantity],
          UnitPrice: [it.UnitPrice],
          Amount: [it.Amount],
          Note: [it.Note ?? ''],
        })
      );
    }
    if (this.items.length === 0) this.addItem();
  }

  back(): void {
    this._router.navigate(['/invoices', this.invoiceId()]);
  }

  addItem(): void {
    this.items.push(
      this._fb.group({
        ItemId: [crypto.randomUUID()],
        ItemName: [''],
        Category: [''],
        Quantity: [0],
        UnitPrice: [0],
        Amount: [0],
        Note: [''],
      })
    );
  }

  recalc(index: number): void {
    const row = this.items.at(index);
    const qty = Number(row.get('Quantity')?.value) || 0;
    const price = Number(row.get('UnitPrice')?.value) || 0;
    row.patchValue({ Amount: Number((qty * price).toFixed(2)) }, { emitEvent: false });
  }

  submit(action: 'draft' | 'send'): void {
    this.banner.set('');
    for (let i = 0; i < this.items.length; i++) this.recalc(i);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.banner.set('Please fill required fields.');
      return;
    }

    const v = this.form.getRawValue();
    const items = v.items as InvoiceItemDetails[];
    const totals = calculateInvoiceTotals(items, Number(v.taxes) || 0, Number(v.discount) || 0);

    const params: UpdateInvoiceItemParams = {
      filter: `{"_id": "${this.invoiceId()}"}`,
      input: {
        DateIssued: new Date().toISOString(),
        DueDate: new Date(v.dueDate as string).toISOString(),
        Amount: Number(totals.TotalAmount.toFixed(2)),
        Customer: [
          {
            CustomerName: v.customerName ?? '',
            BillingAddress: v.billingAddress ?? '',
            Email: v.email ?? '',
            PhoneNo: v.phoneNumber ?? '',
          },
        ],
        Currency: this.currency(),
        Status: action === 'send' ? InvoiceStatus.PENDING : InvoiceStatus.DRAFT,
        GeneralNote: v.generalNote ?? '',
        Taxes: Number(v.taxes) || 0,
        Discount: Number(v.discount) || 0,
        ItemDetails: items.map((it) => ({
          ItemId: it.ItemId ?? crypto.randomUUID(),
          ItemName: it.ItemName ?? '',
          Category: it.Category ?? '0',
          Quantity: Number(it.Quantity) || 0,
          UnitPrice: Number(it.UnitPrice) || 0,
          Amount: Number(it.Amount) || 0,
          Note: it.Note ?? '',
        })),
      },
    };

    this._svc
      .updateInvoiceItem(params as unknown as UpdateInvoiceItemParams)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this.banner.set(
            action === 'send' ? 'Invoice updated successfully.' : 'Draft saved successfully.'
          );
          this._router.navigate(['/invoices', this.invoiceId()]);
        },
        error: () => this.banner.set('Failed to update invoice.'),
      });
  }
}
