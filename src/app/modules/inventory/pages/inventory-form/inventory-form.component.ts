// ─── Add item wizard — mirrors React `inventory-form.tsx` ─
import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideChevronLeft } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmCard, HlmCardContent } from '@spartan-ng/helm/card';
import { InventoryService } from '../../services/inventory.service';
import { StorageService } from '@app/lib/storage.service';
import { FileStorageModuleName } from '@app/constant/modules.constant';
import { environment } from '@environments/environment';
import {
  CATEGORY_OPTIONS,
  INVENTORY_STATUS,
  INVENTORY_TAG_OPTIONS,
  ITEM_LOC_OPTIONS,
} from '@app/models/inventory.model';

@Component({
  selector: 'app-inventory-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIconComponent,
    HlmButton,
    HlmInput,
    HlmCard,
    HlmCardContent,
  ],
  viewProviders: [provideIcons({ lucideCheck, lucideChevronLeft })],
  template: `
    <div class="mb-4 flex items-center gap-2">
      <button
        hlmBtn
        variant="ghost"
        class="h-9 w-9 rounded-full p-0"
        type="button"
        (click)="router.navigate(['/inventory'])"
        aria-label="Back"
      >
        <ng-icon name="lucideChevronLeft" class="h-5 w-5" />
      </button>
      <h1 class="text-2xl font-bold tracking-tight">Add item</h1>
    </div>

    <div class="mb-6 flex w-full max-w-2xl mx-auto items-center justify-center gap-3 text-sm">
      @for (label of stepLabels; track $index) {
        <div class="flex items-center gap-2">
          <div
            class="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
            [class.bg-primary]="currentStep() >= $index"
            [class.text-primary-foreground]="currentStep() >= $index"
            [class.bg-muted]="currentStep() < $index"
          >
            @if (currentStep() > $index) {
              <ng-icon name="lucideCheck" class="h-3.5 w-3.5" />
            } @else {
              {{ $index + 1 }}
            }
          </div>
          <span
            [class.text-foreground]="currentStep() === $index"
            [class.text-muted-foreground]="currentStep() !== $index"
            class="whitespace-nowrap"
            >{{ label }}</span
          >
        </div>
        @if ($index < stepLabels.length - 1) {
          <div
            class="h-0.5 flex-1 max-w-24"
            [class.bg-primary]="currentStep() > $index"
            [class.bg-border]="currentStep() <= $index"
          ></div>
        }
      }
    </div>

    <form (ngSubmit)="$event.preventDefault(); onSubmit()">
      @if (currentStep() === 0) {
        <div hlmCard class="border-none shadow-sm max-w-3xl mx-auto">
          <div hlmCardContent class="space-y-4 pt-6">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="space-y-1">
                <label class="text-sm font-medium">Item name</label>
                <input
                  hlmInput
                  class="w-full"
                  name="name"
                  [(ngModel)]="form.itemName"
                  placeholder="Enter item name"
                  required
                />
              </div>
              <div class="space-y-1">
                <label class="text-sm font-medium">Category</label>
                <select
                  class="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                  name="cat"
                  [(ngModel)]="form.category"
                >
                  @for (c of categoryOptions; track c) {
                    <option [value]="c">{{ c }}</option>
                  }
                </select>
              </div>
              <div class="space-y-1">
                <label class="text-sm font-medium">Supplier</label>
                <input
                  hlmInput
                  class="w-full"
                  name="supp"
                  [(ngModel)]="form.supplier"
                  placeholder="Enter supplier"
                />
              </div>
              <div class="space-y-1">
                <label class="text-sm font-medium">Item location</label>
                <select
                  class="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                  name="loc"
                  [(ngModel)]="form.itemLoc"
                >
                  @for (l of itemLocOptions; track l) {
                    <option [value]="l">{{ l }}</option>
                  }
                </select>
              </div>
              <div class="space-y-1">
                <label class="text-sm font-medium">Price (CHF)</label>
                <input
                  hlmInput
                  class="w-full"
                  name="pr"
                  type="number"
                  min="0"
                  step="0.01"
                  [(ngModel)]="form.price"
                />
              </div>
              <div class="space-y-1">
                <label class="text-sm font-medium">Status</label>
                <div class="flex flex-wrap gap-4 py-1">
                  <label class="inline-flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="st"
                      [value]="activeS"
                      [(ngModel)]="form.status"
                    />
                    Active
                  </label>
                  <label class="inline-flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="st"
                      [value]="disS"
                      [(ngModel)]="form.status"
                    />
                    Discontinued
                  </label>
                </div>
              </div>
            </div>
            <div class="space-y-1">
              <div class="flex items-center justify-between">
                <label class="text-sm font-medium">Stock</label>
                <span class="text-sm text-muted-foreground">{{ form.stock }}</span>
              </div>
              <input
                type="range"
                class="w-full"
                [min]="0"
                [max]="1000"
                [(ngModel)]="form.stock"
                name="stck"
              />
            </div>

            <p class="text-xs text-muted-foreground">
              *.png, *.jpeg up to 2MB, max 5 uploads
            </p>
            <div
              class="border border-dashed rounded-md p-4 flex flex-wrap gap-2 items-center justify-center"
            >
              <input
                #fileIn
                type="file"
                class="hidden"
                accept="image/*"
                multiple
                (change)="onFilePick($event, fileIn)"
              />
              <button hlmBtn variant="outline" type="button" class="h-20 w-20" (click)="fileIn.click()">+</button>
              @for (u of form.imageUrls; track u) {
                <div class="relative h-20 w-20">
                  <img [src]="u" alt="" class="h-full w-full object-contain rounded" />
                  <button
                    type="button"
                    hlmBtn
                    variant="outline"
                    class="absolute -right-1 -top-1 h-6 w-6 p-0"
                    (click)="removeImage(u)"
                  >×</button>
                </div>
              }
            </div>
            @if (isUploading()) {
              <div class="text-xs text-muted-foreground">Uploading…</div>
            }

            <div class="flex justify-between pt-2">
              <button hlmBtn type="button" variant="outline" (click)="router.navigate(['/inventory'])">
                Cancel
              </button>
              <button
                hlmBtn
                type="button"
                (click)="nextStep()"
                [disabled]="!generalInfoValid() || isUploading()"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      } @else {
        <div hlmCard class="border-none shadow-sm max-w-3xl mx-auto">
          <div hlmCardContent class="space-y-4 pt-6">
            <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div class="space-y-3">
                <label class="flex items-center justify-between gap-2 text-sm">
                  <span>Eligible for warranty</span>
                  <input type="checkbox" name="w" [(ngModel)]="form.eligibleWarranty" />
                </label>
                <label class="flex items-center justify-between gap-2 text-sm">
                  <span>Eligible for replacement</span>
                  <input type="checkbox" name="r" [(ngModel)]="form.eligibleReplacement" />
                </label>
                <label class="flex items-center justify-between gap-2 text-sm">
                  <span>Discount</span>
                  <input type="checkbox" name="d" [(ngModel)]="form.discount" />
                </label>
              </div>
              <div class="space-y-2">
                <div class="text-sm font-medium">Tags</div>
                <div class="rounded-md border">
                  <input
                    hlmInput
                    class="w-full border-0 text-sm"
                    name="tsearch"
                    [(ngModel)]="tagSearch"
                    placeholder="Enter tag name"
                    (keydown.enter)="$event.preventDefault(); addCustomTag()"
                  />
                </div>
                <div class="max-h-40 overflow-y-auto p-2 space-y-1.5 text-sm">
                  @for (tag of filteredTags(); track tag) {
                    <label class="flex items-center gap-2">
                      <input
                        type="checkbox"
                        [checked]="isTagSelected(tag)"
                        (change)="toggleTag(tag)"
                      />
                      {{ tag }}
                    </label>
                  }
                </div>
              </div>
            </div>
            <div class="flex flex-wrap justify-between gap-2 pt-2">
              <button hlmBtn type="button" variant="outline" (click)="router.navigate(['/inventory'])">Cancel</button>
              <div class="flex gap-2">
                <button hlmBtn type="button" variant="outline" (click)="currentStep.set(0)">Previous</button>
                <button
                  hlmBtn
                  type="submit"
                  [disabled]="saving() || isUploading()"
                >
                  {{ saving() ? '…' : 'Finish' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </form>
  `,
})
export class InventoryFormComponent {
  readonly router = inject(Router);
  private readonly _items = inject(InventoryService);
  private readonly _storage = inject(StorageService);

  readonly stepLabels = ['General info', 'Additional info'];
  currentStep = signal(0);
  isUploading = signal(false);
  saving = signal(false);
  tagSearch = '';

  readonly activeS = INVENTORY_STATUS.ACTIVE;
  readonly disS = INVENTORY_STATUS.DISCONTINUED;
  categoryOptions = [...CATEGORY_OPTIONS];
  itemLocOptions = [...ITEM_LOC_OPTIONS];
  tagList = [...INVENTORY_TAG_OPTIONS];

  form: {
    itemName: string;
    category: string;
    supplier: string;
    itemLoc: string;
    price: number;
    status: string;
    stock: number;
    tags: string[];
    eligibleWarranty: boolean;
    eligibleReplacement: boolean;
    discount: boolean;
    itemImageUrl: string;
    imageUrls: string[];
  } = {
    itemName: '',
    category: 'Supplies',
    supplier: '',
    itemLoc: 'Warehouse A',
    price: 0,
    status: INVENTORY_STATUS.ACTIVE,
    stock: 0,
    tags: [],
    eligibleWarranty: true,
    eligibleReplacement: true,
    discount: false,
    itemImageUrl: '',
    imageUrls: [],
  };

  nextStep() {
    if (this.currentStep() === 0 && this.generalInfoValid()) this.currentStep.set(1);
  }

  generalInfoValid() {
    return (
      this.form.itemName.trim() !== '' &&
      this.form.category.trim() !== '' &&
      this.form.supplier.trim() !== '' &&
      this.form.itemLoc.trim() !== '' &&
      this.form.price > 0 &&
      this.form.stock > 0
    );
  }

  filteredTags = () => {
    const s = this.tagSearch.trim().toLowerCase();
    if (!s) return this.tagList;
    return this.tagList.filter((t) => t.toLowerCase().includes(s));
  };

  isTagSelected(tag: string) {
    return this.form.tags.includes(tag);
  }

  toggleTag(tag: string) {
    if (this.form.tags.includes(tag)) this.form.tags = this.form.tags.filter((t) => t !== tag);
    else this.form.tags = [...this.form.tags, tag];
  }

  addCustomTag() {
    const t = this.tagSearch.trim();
    if (t && !this.form.tags.includes(t)) {
      this.form.tags = [...this.form.tags, t];
      this.tagSearch = '';
    }
  }

  removeImage(u: string) {
    this.form.imageUrls = this.form.imageUrls.filter((x) => x !== u);
    if (this.form.itemImageUrl === u) this.form.itemImageUrl = this.form.imageUrls[0] ?? '';
  }

  async onFilePick(ev: Event, input: HTMLInputElement) {
    const files = (ev.target as HTMLInputElement).files;
    if (!files?.length) return;
    const cap = 5 - this.form.imageUrls.length;
    if (cap <= 0) return;
    this.isUploading.set(true);
    const list = Array.from(files).slice(0, cap);
    try {
      for (const file of list) {
        const res = await this.uploadFile(file);
        if (res) {
          this.form.imageUrls = [...this.form.imageUrls, res];
          if (!this.form.itemImageUrl) this.form.itemImageUrl = res;
        }
      }
    } finally {
      this.isUploading.set(false);
      input.value = '';
    }
  }

  private uploadFile(
    file: File
  ): Promise<string | null> {
    return new Promise((resolve) => {
      this._storage
        .getPreSignedUrlForUpload({
          name: file.name,
          projectKey: environment.xBlocksKey,
          itemId: '',
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
            try {
              const put = await fetch(data.uploadUrl, {
                method: 'PUT',
                body: file,
                headers: {
                  'Content-Type': file.type,
                  'x-ms-blob-type': 'BlockBlob',
                },
              });
              if (!put.ok) {
                resolve(null);
                return;
              }
              resolve(data.uploadUrl.split('?')[0] ?? data.uploadUrl);
            } catch {
              resolve(null);
            }
          },
          error: () => resolve(null),
        });
    });
  }

  onSubmit() {
    if (this.currentStep() < 1) {
      this.nextStep();
      return;
    }
    if (!this.generalInfoValid() || this.saving()) return;
    this.saving.set(true);
    this._items
      .addInventoryItem({
        ItemName: this.form.itemName,
        Category: this.form.category,
        Supplier: this.form.supplier,
        ItemLoc: this.form.itemLoc,
        Price: Number(this.form.price),
        Status: this.form.status,
        Stock: this.form.stock,
        Tags: this.form.tags,
        EligibleWarranty: this.form.eligibleWarranty,
        EligibleReplacement: this.form.eligibleReplacement,
        Discount: this.form.discount,
        ItemImageFileId: this.form.itemImageUrl,
        ItemImageFileIds: this.form.imageUrls,
      })
      .pipe(take(1))
      .subscribe({
        next: (d) => {
          this.saving.set(false);
          if (d.insertInventoryItem?.acknowledged && d.insertInventoryItem.itemId) {
            void this.router.navigate(['/inventory', d.insertInventoryItem.itemId]);
          }
        },
        error: () => this.saving.set(false),
      });
  }
}
