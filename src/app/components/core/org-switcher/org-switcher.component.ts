import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideBuilding2,
  lucideChevronDown,
  lucideLoaderCircle,
  lucideCheck,
} from '@ng-icons/lucide';
import { AuthStore } from '@state/store/auth/auth.store';
import { OrganizationsService, Organization } from '@lib/organizations.service';
import { AuthService } from '@modules/auth/services/auth.service';

@Component({
  selector: 'app-org-switcher',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  viewProviders: [
    provideIcons({ lucideBuilding2, lucideChevronDown, lucideLoaderCircle, lucideCheck }),
  ],
  template: `
    <div class="relative">
      <button
        type="button"
        class="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-accent transition-colors disabled:opacity-50"
        [disabled]="loading() || organizations().length === 0"
        (click)="open.set(!open())"
      >
        <ng-icon name="lucideBuilding2" class="h-4 w-4 text-muted-foreground" />
        <span class="max-w-[160px] truncate text-sm font-medium text-foreground">
          {{ selectedOrgName() }}
        </span>
        <ng-icon name="lucideChevronDown" class="h-4 w-4 text-muted-foreground" />
      </button>

      @if (open()) {
        <div
          class="absolute right-0 top-full mt-2 w-72 rounded-md border border-border bg-popover shadow-lg z-50"
        >
          @if (loading()) {
            <div class="flex items-center justify-center gap-2 px-3 py-8 text-muted-foreground">
              <ng-icon name="lucideLoaderCircle" class="h-5 w-5 animate-spin" />
              <span class="text-sm">Loading…</span>
            </div>
          } @else {
            <div class="max-h-[300px] overflow-auto py-1">
              @for (org of enabledOrganizations(); track org.itemId) {
                <button
                  type="button"
                  class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
                  (click)="selectOrg(org)"
                >
                  @if (org.itemId === selectedOrgId()) {
                    <ng-icon name="lucideCheck" class="h-4 w-4 text-primary" />
                  } @else {
                    <span class="inline-block h-4 w-4"></span>
                  }
                  <span class="truncate">{{ org.name }}</span>
                </button>
              } @empty {
                <div class="px-3 py-6 text-center text-sm text-muted-foreground">
                  No organizations
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class OrgSwitcherComponent {
  private readonly _orgs = inject(OrganizationsService);
  private readonly _auth = inject(AuthService);
  private readonly _authStore = inject(AuthStore);
  private readonly _destroyRef = inject(DestroyRef);

  readonly open = signal(false);
  readonly loading = signal(false);
  readonly organizations = signal<Organization[]>([]);

  readonly membershipOrgIds = computed(
    () => this._authStore.user()?.memberships?.map((m) => m.orgId) ?? []
  );
  readonly enabledOrganizations = computed(() =>
    (this.organizations() ?? []).filter(
      (o) => o.isEnable && this.membershipOrgIds().includes(o.itemId)
    )
  );

  readonly selectedOrgId = signal<string | null>(
    typeof window !== 'undefined' ? window.localStorage.getItem('selected-org-id') : null
  );

  readonly selectedOrgName = computed(() => {
    const enabled = this.enabledOrganizations();
    if (!enabled.length) return 'Organization';
    const current = this.selectedOrgId()
      ? enabled.find((o) => o.itemId === this.selectedOrgId())
      : enabled[0];
    return current?.name ?? enabled[0]?.name ?? 'Organization';
  });

  constructor() {
    this.loading.set(true);
    this._orgs
      .getOrganizations({ Page: 0, PageSize: 50 })
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res) => {
          this.organizations.set(res.organizations ?? []);
          this.loading.set(false);
        },
        error: () => {
          this.organizations.set([]);
          this.loading.set(false);
        },
      });
  }

  selectOrg(org: Organization): void {
    if (!org?.itemId) return;
    if (org.itemId === this.selectedOrgId()) {
      this.open.set(false);
      return;
    }
    this.loading.set(true);
    this._auth
      .switchOrganization(org.itemId)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this.selectedOrgId.set(org.itemId);
          this.open.set(false);
          this.loading.set(false);
        },
        error: () => {
          this.open.set(false);
          this.loading.set(false);
        },
      });
  }
}
