// ─── Item detail + edit — mirrors React `advance-inventory-details.tsx` ─
import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideChevronLeft,
  lucidePencil,
  lucidePlus,
  lucideSearch,
  lucideTrash,
} from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmCard, HlmCardContent, HlmCardHeader, HlmCardTitle } from '@spartan-ng/helm/card';
import { InventoryService } from '../../services/inventory.service';
import { StorageService } from '@app/lib/storage.service';
import { FileStorageModuleName } from '@app/constant/modules.constant';
import { environment } from '@environments/environment';
import {
  CATEGORY_OPTIONS,
  INVENTORY_STATUS,
  INVENTORY_TAG_OPTIONS,
  ITEM_LOC_OPTIONS,
  type InventoryItemGql,
} from '@app/models/inventory.model';

const PLACEHOLDER = '/images/unavailable.svg';

@Component({
  selector: 'app-inventory-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIconComponent,
    HlmButton,
    HlmInput,
    HlmCard,
    HlmCardContent,
    HlmCardHeader,
    HlmCardTitle,
  ],
  viewProviders: [
    provideIcons({
      lucideChevronLeft,
      lucidePencil,
      lucidePlus,
      lucideSearch,
      lucideTrash,
    }),
  ],
  template: `
    @if (loading()) {
      <div class="text-sm text-muted-foreground py-8">Loading…</div>
    } @else if (item()) {
      <div class="mb-4 flex w-full items-center justify-between">
        <div class="flex items-center gap-2 min-w-0">
          <button
            hlmBtn
            variant="ghost"
            class="h-9 w-9 rounded-full p-0 shrink-0"
            type="button"
            (click)="back()"
          >
            <ng-icon name="lucideChevronLeft" class="h-5 w-5" />
          </button>
          <h1 class="text-2xl font-bold tracking-tight truncate">
            {{ item()!.ItemName || 'Inventory' }}
          </h1>
        </div>
        <button
          hlmBtn
          type="button"
          variant="outline"
          class="shrink-0"
          (click)="confirmDelete()"
          [disabled]="deleting()"
        >
          <ng-icon name="lucideTrash" class="h-3.5 w-3.5 text-destructive" />
          <span class="ml-1 text-destructive font-semibold">Delete</span>
        </button>
      </div>

      <div hlmCard class="border border-border/60 shadow-sm">
        <div hlmCardHeader>
          <div class="flex items-center justify-between gap-2">
            <h2 hlmCardTitle>General info</h2>
            @if (!edit()) {
              <button hlmBtn type="button" size="sm" variant="ghost" (click)="startEdit()">
                <ng-icon name="lucidePencil" class="h-3.5 w-3.5 text-primary" />
                <span class="ml-1 text-primary font-bold">Edit</span>
              </button>
            } @else {
              <div class="flex gap-2">
                <button hlmBtn type="button" size="sm" variant="outline" (click)="cancelEdit()">
                  Cancel
                </button>
                <button hlmBtn type="button" size="sm" (click)="saveEdit()" [disabled]="saving()">
                  Update
                </button>
              </div>
            }
          </div>
        </div>
        <div class="border-b border-border -mx-6"></div>
        <div hlmCardContent>
          <div class="flex flex-col gap-8 md:flex-row">
            <div class="md:w-[30%] w-full">
              <div
                class="flex h-64 w-full items-center justify-center rounded-lg border p-2"
              >
                <img
                  [src]="selectedImage() || PLACEHOLDER"
                  alt="Product"
                  class="max-h-full max-w-full object-contain"
                  (error)="$any($event.target).src = PLACEHOLDER"
                />
              </div>
              <div class="mt-2 flex flex-wrap items-center gap-2">
                @for (t of thumb(); track t) {
                  <div class="relative">
                    @if (edit()) {
                      <button
                        hlmBtn
                        type="button"
                        class="absolute -right-1 -top-1 h-6 w-6 rounded-full p-0"
                        (click)="removeThumb(t); $event.stopPropagation()"
                        variant="secondary"
                      >
                        <ng-icon name="lucideTrash" class="h-3 w-3 text-destructive" />
                      </button>
                    }
                    <button
                      hlmBtn
                      type="button"
                      class="h-10 w-10 p-0 border rounded-md"
                      (click)="selectedImage.set(t)"
                    >
                      <img [src]="t" class="h-full w-full object-contain rounded" (error)="$any($event.target).src = PLACEHOLDER" />
                    </button>
                  </div>
                }
                @if (isUploading()) {
                  <span class="text-xs text-muted-foreground">Uploading…</span>
                }
                @if (edit() && thumb().length < 5) {
                  <input
                    #imgIn
                    class="hidden"
                    type="file"
                    accept="image/*"
                    (change)="onAddImages($event, imgIn)"
                  />
                  <button
                    hlmBtn
                    type="button"
                    variant="outline"
                    class="h-10 w-10 p-0"
                    (click)="imgIn.click()"
                  >
                    <ng-icon name="lucidePlus" />
                  </button>
                }
              </div>
            </div>
            <div class="md:w-[70%] w-full grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div class="space-y-1">
                <div class="text-xs text-muted-foreground">Item name</div>
                @if (!edit()) {
                  <div>{{ item()!.ItemName }}</div>
                } @else {
                  <input
                    hlmInput
                    class="w-full h-8"
                    [(ngModel)]="d.itemName"
                    name="dname"
                  />
                }
              </div>
              <div class="space-y-1">
                <div class="text-xs text-muted-foreground">Category</div>
                @if (!edit()) {
                  <div [class.text-emerald-600]="isActive(item()!.Status)">
                    {{ item()!.Category }}
                  </div>
                } @else {
                  <select
                    class="h-8 w-full rounded border border-input bg-background px-2"
                    [(ngModel)]="d.category"
                    name="dcat"
                  >
                    @for (c of categoryOptions; track c) {
                      <option [value]="c">{{ c }}</option>
                    }
                  </select>
                }
              </div>
              <div class="space-y-1">
                <div class="text-xs text-muted-foreground">Supplier</div>
                @if (!edit()) {
                  <div>{{ item()!.Supplier }}</div>
                } @else {
                  <input hlmInput class="h-8 w-full" [(ngModel)]="d.supplier" name="ds" />
                }
              </div>
              <div class="space-y-1">
                <div class="text-xs text-muted-foreground">Item location</div>
                @if (!edit()) {
                  <div>{{ item()!.ItemLoc }}</div>
                } @else {
                  <select
                    class="h-8 w-full rounded border border-input bg-background px-2"
                    [(ngModel)]="d.itemLoc"
                    name="dlo"
                  >
                    @for (l of itemLocOptions; track l) {
                      <option [value]="l">{{ l }}</option>
                    }
                  </select>
                }
              </div>
              <div class="space-y-1">
                <div class="text-xs text-muted-foreground">Price (CHF)</div>
                @if (!edit()) {
                  <div>{{ item()!.Price }}</div>
                } @else {
                  <input hlmInput class="h-8 w-full" type="number" [(ngModel)]="d.price" name="dpr" />
                }
              </div>
              <div class="space-y-1">
                <div class="text-xs text-muted-foreground">Stock</div>
                @if (!edit()) {
                  <div>{{ item()!.Stock }}</div>
                } @else {
                  <input hlmInput class="h-8 w-full" type="number" [(ngModel)]="d.stock" name="dst" />
                }
              </div>
              <div class="space-y-1">
                <div class="text-xs text-muted-foreground">Status</div>
                @if (!edit()) {
                  <div
                    [class.text-emerald-600]="isActive(item()!.Status)"
                  >
                    {{ item()!.Status }}
                  </div>
                } @else {
                  <select
                    class="h-8 w-full rounded border border-input bg-background px-2"
                    [(ngModel)]="d.status"
                    name="dstat"
                  >
                    <option [value]="aStat">{{ aStat }}</option>
                    <option [value]="dStat">{{ dStat }}</option>
                  </select>
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      <div hlmCard class="mt-4 border border-border/60 shadow-sm">
        <div hlmCardHeader>
          <h2 hlmCardTitle>Additional info</h2>
        </div>
        <div class="border-b border-border -mx-6"></div>
        <div hlmCardContent>
          <div class="flex flex-col gap-8 md:flex-row">
            <div class="md:w-1/2 space-y-3">
              <div class="flex items-center justify-between text-sm">
                <span>Eligible for warranty</span>
                <input
                  type="checkbox"
                  [checked]="warranty()"
                  (change)="
                    warranty.set($any($event.target).checked);
                    $event.stopPropagation()
                  "
                  [disabled]="!edit()"
                />
              </div>
              <div class="flex items-center justify-between text-sm">
                <span>Eligible for replacement</span>
                <input
                  type="checkbox"
                  [checked]="replacement()"
                  (change)="
                    replacement.set($any($event.target).checked);
                    $event.stopPropagation()
                  "
                  [disabled]="!edit()"
                />
              </div>
              <div class="flex items-center justify-between text-sm">
                <span>Discount</span>
                <input
                  type="checkbox"
                  [checked]="discount()"
                  (change)="
                    discount.set($any($event.target).checked);
                    $event.stopPropagation()
                  "
                  [disabled]="!edit()"
                />
              </div>
            </div>
            <div class="md:w-1/2 w-full">
              <div class="text-sm font-medium mb-1">Tags</div>
              <div class="rounded border">
                <div class="relative">
                  <ng-icon
                    name="lucideSearch"
                    class="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    hlmInput
                    class="w-full border-0 h-8 pl-9"
                    [ngModel]="tagQ()"
                    (ngModelChange)="tagQ.set($event)"
                    placeholder="Enter tag name"
                    (keydown.enter)="onTagEnter($event)"
                    [readOnly]="!edit()"
                  />
                </div>
                <div class="max-h-40 overflow-y-auto p-2 border-t space-y-1 text-sm">
                  @for (tag of filteredTagList(); track tag) {
                    <label class="flex items-center gap-2">
                      <input
                        type="checkbox"
                        [disabled]="!edit()"
                        [checked]="selectedTags().includes(tag)"
                        (change)="toggleTag(tag)"
                      />
                      <span>{{ tag }}</span>
                    </label>
                  } @empty {
                    <p class="text-center text-xs text-muted-foreground py-2">No tags found</p>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    } @else {
      <p class="text-sm text-muted-foreground">Item not found.</p>
    }
  `,
})
export class InventoryDetailsComponent implements OnInit {
  readonly PLACEHOLDER = PLACEHOLDER;
  private readonly _inv = inject(InventoryService);
  private readonly _storage = inject(StorageService);
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);

  aStat = INVENTORY_STATUS.ACTIVE;
  dStat = INVENTORY_STATUS.DISCONTINUED;
  categoryOptions = [...CATEGORY_OPTIONS];
  itemLocOptions = [...ITEM_LOC_OPTIONS];
  tagList = [...INVENTORY_TAG_OPTIONS];

  loading = signal(true);
  item = signal<InventoryItemGql | null>(null);
  edit = signal(false);
  saving = signal(false);
  deleting = signal(false);
  isUploading = signal(false);

  selectedImage = signal<string>('');
  warranty = signal(false);
  replacement = signal(false);
  discount = signal(false);
  tagQ = signal('');

  thumb = signal<string[]>([]);
  selectedTags = signal<string[]>([]);

  d: {
    itemName: string;
    category: string;
    supplier: string;
    itemLoc: string;
    price: number;
    stock: number;
    status: string;
  } = {
    itemName: '',
    category: '',
    supplier: '',
    itemLoc: '',
    price: 0,
    stock: 0,
    status: INVENTORY_STATUS.ACTIVE,
  };

  isActive = (s: string) => s === INVENTORY_STATUS.ACTIVE;

  filteredTagList = computed(() => {
    const q = this.tagQ().trim().toLowerCase();
    if (!q) return this.tagList;
    return this.tagList.filter((t) => t.toLowerCase().includes(q));
  });

  ngOnInit() {
    this.load();
  }

  back() {
    void this._router.navigate(['/inventory']);
  }

  private load() {
    this._inv.getInventoryItems(1, 1000).pipe(take(1)).subscribe({
      next: (p) => {
        const id = this._route.snapshot.paramMap.get('itemId') ?? '';
        const it = p.items.find((i) => String(i.ItemId).trim() === String(id).trim()) ?? null;
        this.item.set(it);
        if (it) {
          this.hydrate(it);
        }
        this.loading.set(false);
      },
      error: () => {
        this.item.set(null);
        this.loading.set(false);
      },
    });
  }

  private hydrate(it: InventoryItemGql) {
    this.warranty.set(!!it.EligibleWarranty);
    this.replacement.set(!!it.EligibleReplacement);
    this.discount.set(!!it.Discount);
    this.selectedTags.set([...(it.Tags ?? [])]);
    const imgs: string[] = (it.ItemImageFileIds && it.ItemImageFileIds.length
      ? it.ItemImageFileIds
      : it.ItemImageFileId
        ? [it.ItemImageFileId]
        : []
    ).filter(Boolean) as string[];
    this.thumb.set(imgs);
    this.selectedImage.set(imgs[0] || '');
    this.d = {
      itemName: it.ItemName,
      category: it.Category,
      supplier: it.Supplier,
      itemLoc: it.ItemLoc,
      price: it.Price,
      stock: it.Stock,
      status: it.Status,
    };
  }

  startEdit() {
    this.edit.set(true);
  }

  cancelEdit() {
    const it = this.item();
    this.edit.set(false);
    if (it) this.hydrate(it);
  }

  saveEdit() {
    const it = this.item();
    if (!it) return;
    this.saving.set(true);
    this._inv
      .updateInventoryItem(it.ItemId, {
        ItemName: this.d.itemName,
        Category: this.d.category,
        Supplier: this.d.supplier,
        ItemLoc: this.d.itemLoc,
        Price: Number(this.d.price),
        Status: this.d.status,
        Stock: Number(this.d.stock),
        Tags: this.selectedTags(),
        EligibleWarranty: this.warranty(),
        EligibleReplacement: this.replacement(),
        Discount: this.discount(),
        ItemImageFileId: this.thumb()[0] ?? it.ItemImageFileId,
        ItemImageFileIds: this.thumb(),
      })
      .pipe(take(1))
      .subscribe({
        next: (d) => {
          this.saving.set(false);
          if (d.updateInventoryItem.acknowledged) {
            this.edit.set(false);
            this.load();
          }
        },
        error: () => this.saving.set(false),
      });
  }

  confirmDelete() {
    if (!this.item() || !confirm('Delete this item?')) return;
    const id = this.item()!.ItemId;
    this.deleting.set(true);
    this._inv
      .deleteInventoryItem(id, true)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.deleting.set(false);
          void this._router.navigate(['/inventory']);
        },
        error: () => this.deleting.set(false),
      });
  }

  removeThumb(url: string) {
    this.thumb.update((a) => a.filter((u) => u !== url));
    if (this.selectedImage() === url) this.selectedImage.set(this.thumb()[0] || '');
  }

  onAddImages(_ev: Event, input: HTMLInputElement) {
    const files = input.files;
    if (!files?.length) return;
    const n = 5 - this.thumb().length;
    if (n <= 0) return;
    this.isUploading.set(true);
    const arr = Array.from(files).slice(0, n);
    let done = 0;
    for (const file of arr) {
      this.uploadFile(file)
        .then((url) => {
          if (url) {
            this.thumb.update((a) => [...a, url]);
            if (!this.selectedImage()) this.selectedImage.set(url);
          }
        })
        .finally(() => {
          done += 1;
          if (done === arr.length) this.isUploading.set(false);
        });
    }
    if (arr.length === 0) this.isUploading.set(false);
    input.value = '';
  }

  private uploadFile(
    file: File
  ): Promise<string | null> {
    return new Promise((resolve) => {
      this._storage
        .getPreSignedUrlForUpload({
          name: file.name,
          projectKey: environment.xBlocksKey,
          itemId: this.item()?.ItemId ?? '',
          metaData: '',
          accessModifier: 'Public',
          configurationName: 'Default',
          parentDirectoryId: '',
          tags: '',
          moduleName: FileStorageModuleName.DefaultConstruct,
        })
        .pipe(take(1))
        .subscribe({
          next: async (data) => {
            if (!data?.isSuccess || !data.uploadUrl) {
              resolve(null);
              return;
            }
            const put = await fetch(data.uploadUrl, {
              method: 'PUT',
              body: file,
              headers: { 'Content-Type': file.type, 'x-ms-blob-type': 'BlockBlob' },
            });
            if (!put.ok) {
              resolve(null);
              return;
            }
            resolve((data.uploadUrl?.split('?')[0] ?? data.uploadUrl) as string);
          },
          error: () => resolve(null),
        });
    });
  }

  onTagEnter(ev: Event) {
    ev.preventDefault();
    if (!this.edit()) return;
    const t = this.tagQ().trim();
    if (t && !this.selectedTags().includes(t)) {
      this.selectedTags.update((a) => [...a, t]);
      this.tagQ.set('');
    }
  }

  toggleTag(tag: string) {
    this.selectedTags.update((a) => (a.includes(tag) ? a.filter((x) => x !== tag) : [...a, tag]));
  }
}
