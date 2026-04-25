// Mirrors: React `modules/activity-log/pages/timeline/timeline.tsx` (admin + filters + v2 timeline)

import { CommonModule } from '@angular/common';
import { Component, OnDestroy, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideSearch, lucideX } from '@ng-icons/lucide';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCard } from '@spartan-ng/helm/card';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { getFormattedDateLabel } from '../../utils/activity-date-label.util';
import {
  TIMELINE_ACTIVITIES_DATA,
  TIMELINE_MODULE_FILTER_IDS,
} from '../../data/timeline-activities.data';
import { ActivityGroup } from '../../types/activity-timeline.model';

const transformCategory = (category: string) => category.toLowerCase().replace(/\s+/g, '_');

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent, HlmInput, HlmButton, HlmCard, HlmBadge],
  viewProviders: [provideIcons({ lucideSearch, lucideX })],
  template: `
    <div class="p-6 flex w-full flex-col gap-4">
      <div>
        <h1 class="text-2xl font-bold text-foreground">Timeline</h1>
        <p class="text-sm text-muted-foreground mt-1">
          Filtered system activity in vertical timeline (admin view).
        </p>
      </div>

      <div class="flex flex-col gap-3">
        <div class="flex flex-wrap items-center gap-3">
          <div class="relative min-w-[200px] flex-1 max-w-sm">
            <ng-icon
              name="lucideSearch"
              class="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2"
            />
            <input
              hlmInput
              class="pl-9 w-full"
              [ngModel]="searchValue()"
              (ngModelChange)="onSearchModelChange($event)"
              placeholder="Search descriptions..."
            />
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            <input
              hlmInput
              class="w-40"
              type="date"
              [ngModel]="dateFrom()"
              (ngModelChange)="setDateFrom($event)"
            />
            <span class="text-xs text-muted-foreground">to</span>
            <input
              hlmInput
              class="w-40"
              type="date"
              [ngModel]="dateTo()"
              (ngModelChange)="setDateTo($event)"
            />
            @if (dateFrom() || dateTo()) {
              <button
                hlmBtn
                variant="outline"
                class="h-8 text-xs"
                type="button"
                (click)="clearDateRange()"
              >
                <ng-icon name="lucideX" class="w-3 h-3 mr-1" />
                Clear dates
              </button>
            }
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-1.5">
          <span class="text-xs text-muted-foreground mr-1">Modules</span>
          @for (m of moduleFilters; track m.id) {
            <button
              hlmBtn
              [variant]="isModuleSelected(m.id) ? 'default' : 'outline'"
              class="h-7 text-xs"
              type="button"
              (click)="toggleModule(m.id)"
            >
              {{ m.label }}
            </button>
          }
        </div>
      </div>

      @if (filtered().length === 0) {
        <div
          class="flex flex-col items-center justify-center py-16 text-center text-muted-foreground"
        >
          <p class="text-lg font-medium">Nothing matched your filters</p>
          <p class="text-sm">Try a different search or clear module filters</p>
        </div>
      } @else {
        <div hlmCard class="w-full border rounded-lg shadow-sm overflow-hidden">
          <div class="px-2 py-6 md:px-12 md:py-8 h-[min(70vh,800px)] overflow-y-auto">
            <div class="relative">
              <div
                class="absolute left-1/2 -translate-x-1/2 w-0.5 bg-border top-[3rem] bottom-[1.5rem] z-0"
              ></div>
              @for (group of filtered(); track group.date; let gIdx = $index) {
                <div class="mb-8 relative">
                  <div class="flex justify-center mb-4 relative z-10">
                    <div hlmBadge variant="secondary" class="text-xs">
                      {{ labelForGroup(group.date) }}
                    </div>
                  </div>
                  @for (activity of group.items; track activity.trackId; let idx = $index) {
                    <div
                      class="relative flex items-start mb-4"
                      [class.mb-0]="isLastInTimeline(gIdx, idx, group.items.length)"
                    >
                      <div class="w-1/2 pr-4 flex justify-end min-h-[1px]">
                        @if (idx % 2 !== 0) {
                          <div class="text-right max-w-[90%]">
                            <div
                              class="flex flex-col lg:flex-row items-end lg:items-center justify-end text-xs mb-2 text-muted-foreground"
                            >
                              <span>{{ formatTime(activity.time) }}</span>
                              <span
                                class="hidden lg:inline mx-2 h-1.5 w-1.5 rounded-full bg-muted-foreground/40"
                              ></span>
                              <span class="text-foreground font-semibold">{{
                                activity.category
                              }}</span>
                            </div>
                            <div class="text-sm text-foreground/90 leading-snug">
                              {{ activity.description }}
                            </div>
                          </div>
                        }
                      </div>

                      <div
                        class="absolute left-1/2 -translate-x-1/2 top-1.5 z-10 w-3 h-3 rounded-full bg-secondary border-2 border-background"
                      ></div>

                      <div class="w-1/2 pl-4 min-h-[1px]">
                        @if (idx % 2 === 0) {
                          <div class="text-left max-w-[90%]">
                            <div
                              class="flex flex-col lg:flex-row items-start lg:items-center text-xs mb-2 text-muted-foreground"
                            >
                              <span>{{ formatTime(activity.time) }}</span>
                              <span
                                class="hidden lg:inline mx-2 h-1.5 w-1.5 rounded-full bg-muted-foreground/40"
                              ></span>
                              <span class="text-foreground font-semibold">{{
                                activity.category
                              }}</span>
                            </div>
                            <div class="text-sm text-foreground/90 leading-snug">
                              {{ activity.description }}
                            </div>
                          </div>
                        }
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class TimelineComponent implements OnDestroy {
  private readonly _source: ActivityGroup[] = TIMELINE_ACTIVITIES_DATA;
  private _searchDebounce: ReturnType<typeof setTimeout> | null = null;

  protected readonly searchValue = signal('');
  protected readonly searchQuery = signal('');
  protected readonly dateFrom = signal<string>('');
  protected readonly dateTo = signal<string>('');
  protected readonly selectedModules = signal<ReadonlySet<string>>(new Set());

  protected readonly moduleFilters = TIMELINE_MODULE_FILTER_IDS;
  private readonly _filtered = signal<ActivityGroup[]>([]);

  readonly filtered = computed(() => this._filtered());

  constructor() {
    this.recompute();
  }

  ngOnDestroy(): void {
    if (this._searchDebounce) {
      clearTimeout(this._searchDebounce);
    }
  }

  isLastInTimeline(gIdx: number, itemIdx: number, groupLen: number): boolean {
    const groups = this._filtered();
    if (gIdx !== groups.length - 1) {
      return false;
    }
    return itemIdx === groupLen - 1;
  }

  formatTime(iso: string): string {
    return new Date(iso).toLocaleString();
  }

  onSearchModelChange(v: string): void {
    this.searchValue.set(v);
    if (this._searchDebounce) {
      clearTimeout(this._searchDebounce);
    }
    this._searchDebounce = setTimeout(() => {
      this.searchQuery.set(v);
      this.recompute();
    }, 500);
  }

  setDateFrom(d: string): void {
    this.dateFrom.set(d);
    this.recompute();
  }

  setDateTo(d: string): void {
    this.dateTo.set(d);
    this.recompute();
  }

  clearDateRange(): void {
    this.dateFrom.set('');
    this.dateTo.set('');
    this.recompute();
  }

  isModuleSelected(id: string): boolean {
    return this.selectedModules().has(id);
  }

  toggleModule(id: string): void {
    this.selectedModules.update((s) => {
      const next = new Set(s);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    this.recompute();
  }

  labelForGroup(d: string): string {
    return getFormattedDateLabel(d);
  }

  private recompute(): void {
    const q = this.searchQuery().trim().toLowerCase();
    const fromStr = this.dateFrom();
    const toStr = this.dateTo();
    const mods = this.selectedModules();
    const hasRange = Boolean(fromStr && toStr);
    let fromMs = 0;
    let toMs = 0;
    if (hasRange) {
      fromMs = new Date(fromStr + 'T00:00:00').getTime();
      toMs = new Date(toStr + 'T23:59:59.999').getTime();
    }

    let out = this._source.map((g) => ({ ...g, items: [...g.items] }));

    if (hasRange) {
      out = out.filter((g) => {
        const t = new Date(g.date).getTime();
        return t >= fromMs && t <= toMs;
      });
    }

    if (q) {
      out = out
        .map((g) => ({
          ...g,
          items: g.items.filter((i) => i.description.toLowerCase().includes(q)),
        }))
        .filter((g) => g.items.length > 0);
    }

    if (mods.size > 0) {
      out = out
        .map((g) => ({
          ...g,
          items: g.items.filter((i) => mods.has(transformCategory(i.category))),
        }))
        .filter((g) => g.items.length > 0);
    }

    this._filtered.set(this.assignTrackIds(out));
  }

  private assignTrackIds(groups: ActivityGroup[]): ActivityGroup[] {
    return groups.map((g, gi) => ({
      ...g,
      items: g.items.map((item, ii) => ({
        ...item,
        trackId: `${g.date}|${gi}|${ii}|${item.time}`,
      })),
    }));
  }
}
