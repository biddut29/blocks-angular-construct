import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideLoaderCircle } from '@ng-icons/lucide';
import { TranslateModule } from '@ngx-translate/core';
import { NotificationsService, NotificationItem } from '@lib/notifications.service';

@Component({
  selector: 'app-notifications-dropdown',
  standalone: true,
  imports: [CommonModule, NgIconComponent, TranslateModule],
  viewProviders: [provideIcons({ lucideCheck, lucideLoaderCircle })],
  template: `
    <div class="w-80 rounded-md border border-border bg-popover text-popover-foreground shadow-lg">
      <div class="flex items-center justify-between px-3 py-2 border-b border-border">
        <div class="text-sm font-semibold">{{ 'APP.NOTIFICATIONS' | translate }}</div>
        <button
          type="button"
          class="text-xs font-medium text-primary hover:underline disabled:opacity-50"
          [disabled]="loading() || unreadCount() === 0"
          (click)="markAllRead()"
        >
          {{ 'APP.MARK_ALL_READ' | translate }}
        </button>
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center gap-2 px-3 py-10 text-muted-foreground">
          <ng-icon name="lucideLoaderCircle" class="h-5 w-5 animate-spin" />
          <span class="text-sm">Loading…</span>
        </div>
      } @else if (items().length === 0) {
        <div class="px-3 py-10 text-center text-sm text-muted-foreground">
          {{ 'APP.NO_NOTIFICATIONS' | translate }}
        </div>
      } @else {
        <div class="max-h-[360px] overflow-auto">
          @for (n of items(); track n.id) {
            <button
              type="button"
              class="w-full text-left px-3 py-2.5 border-b border-border/60 hover:bg-muted/40 transition-colors"
              (click)="markRead(n)"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="text-sm font-medium truncate">
                    {{ n.denormalizedPayload || 'Notification' }}
                  </div>
                  <div class="text-xs text-muted-foreground mt-0.5">
                    {{ n.createdTime }}
                  </div>
                </div>
                @if (n.isRead) {
                  <ng-icon name="lucideCheck" class="h-4 w-4 text-emerald-600 shrink-0" />
                } @else {
                  <span class="mt-1.5 h-2 w-2 rounded-full bg-destructive shrink-0"></span>
                }
              </div>
            </button>
          }
        </div>
      }
    </div>
  `,
})
export class NotificationsDropdownComponent implements OnInit {
  private readonly _svc = inject(NotificationsService);
  private readonly _destroyRef = inject(DestroyRef);

  readonly loading = signal(false);
  readonly items = signal<NotificationItem[]>([]);
  readonly unreadCount = signal(0);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this._svc
      .getNotifications({ Page: 0, PageSize: 10, IsUnreadOnly: false })
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res) => {
          this.items.set(res.notifications ?? []);
          this.unreadCount.set(res.unReadNotificationsCount ?? 0);
          this.loading.set(false);
        },
        error: () => {
          this.items.set([]);
          this.unreadCount.set(0);
          this.loading.set(false);
        },
      });
  }

  markRead(n: NotificationItem): void {
    if (!n?.id || n.isRead) return;
    this._svc
      .markNotificationAsRead(n.id)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this.items.update((list) =>
            list.map((x) => (x.id === n.id ? { ...x, isRead: true } : x))
          );
          this.unreadCount.update((c) => Math.max(0, c - 1));
        },
      });
  }

  markAllRead(): void {
    this._svc
      .markAllAsRead()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this.items.update((list) => list.map((x) => ({ ...x, isRead: true })));
          this.unreadCount.set(0);
        },
      });
  }
}
