// ─── App Header Component ──────────────────────────────────────────────────────
// Mirrors: The top header bar in React's main layout
// Contains: menu toggle, notifications, theme, language, org, profile

import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';

const THEME_STORAGE_KEY = 'theme';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideMenu,
  lucideBell,
  lucideSun,
  lucideMoon,
  lucideGlobe,
  lucideUser,
  lucideLogOut,
  lucideSettings,
  lucideChevronDown,
} from '@ng-icons/lucide';
import { AuthStore } from '../../../state/store/auth/auth.store';
import { Router } from '@angular/router';
import { AuthService } from '../../../modules/auth/services/auth.service';
import { LanguageService } from '../../../lib/i18n/language.service';
import { TranslateModule } from '@ngx-translate/core';
import { NotificationsDropdownComponent } from '../notifications/notifications-dropdown.component';
import { OrgSwitcherComponent } from '../org-switcher/org-switcher.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink,
    NgIf,
    NgIconComponent,
    TranslateModule,
    NotificationsDropdownComponent,
    OrgSwitcherComponent,
  ],
  viewProviders: [
    provideIcons({
      lucideMenu,
      lucideBell,
      lucideSun,
      lucideMoon,
      lucideGlobe,
      lucideUser,
      lucideLogOut,
      lucideSettings,
      lucideChevronDown,
    }),
  ],
  template: `
    <header class="h-16 bg-background border-b border-border flex items-center px-4 gap-4 shrink-0">
      <!-- Sidebar toggle -->
      <button
        class="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
        (click)="toggleSidebar.emit()"
        aria-label="Toggle sidebar"
      >
        <ng-icon name="lucideMenu" class="w-5 h-5" />
      </button>

      <!-- Spacer -->
      <div class="flex-1"></div>

      <!-- Right side actions -->
      <div class="flex items-center gap-2">
        <!-- Theme toggle -->
        <button
          class="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          (click)="toggleTheme()"
          aria-label="Toggle theme"
        >
          <ng-icon [name]="isDark() ? 'lucideSun' : 'lucideMoon'" class="w-5 h-5" />
        </button>

        <!-- Language -->
        <button
          class="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          (click)="toggleLanguage()"
          aria-label="Language"
        >
          <ng-icon name="lucideGlobe" class="w-5 h-5" />
        </button>

        <!-- Notifications -->
        <div class="relative">
          <button
            class="relative p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Notifications"
            (click)="notificationsOpen.set(!notificationsOpen())"
          >
            <ng-icon name="lucideBell" class="w-5 h-5" />
          </button>

          <div *ngIf="notificationsOpen()" class="absolute right-0 top-full mt-2 z-50">
            <app-notifications-dropdown />
          </div>
        </div>

        <!-- Organization switcher -->
        <app-org-switcher />

        <!-- Profile menu -->
        <div class="relative">
          <button
            class="flex items-center gap-2 pl-2 pr-1 py-1 rounded-md
                   hover:bg-accent transition-colors"
            (click)="profileMenuOpen.set(!profileMenuOpen())"
          >
            <!-- Avatar -->
            <div class="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
              <span class="text-primary-foreground text-xs font-medium">
                {{ userInitials() }}
              </span>
            </div>
            <span class="text-sm font-medium text-foreground hidden md:block">
              {{ userName() }}
            </span>
            <ng-icon name="lucideChevronDown" class="w-4 h-4 text-muted-foreground" />
          </button>

          <!-- Dropdown -->
          <div
            *ngIf="profileMenuOpen()"
            class="absolute right-0 top-full mt-1 w-48 bg-popover border border-border
                   rounded-md shadow-lg py-1 z-50"
          >
            <a
              routerLink="/profile"
              class="flex items-center gap-2 px-3 py-2 text-sm text-foreground
                     hover:bg-accent transition-colors"
              (click)="profileMenuOpen.set(false)"
            >
              <ng-icon name="lucideUser" class="w-4 h-4" />
              Profile
            </a>
            <a
              routerLink="/profile"
              class="flex items-center gap-2 px-3 py-2 text-sm text-foreground
                     hover:bg-accent transition-colors"
              (click)="profileMenuOpen.set(false)"
            >
              <ng-icon name="lucideSettings" class="w-4 h-4" />
              Settings
            </a>
            <div class="border-t border-border my-1"></div>
            <button
              class="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive
                     hover:bg-accent transition-colors"
              (click)="logout()"
            >
              <ng-icon name="lucideLogOut" class="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  `,
})
export class AppHeaderComponent {
  @Input() sidebarCollapsed = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  private readonly _authStore = inject(AuthStore);
  private readonly _authService = inject(AuthService);
  private readonly _router = inject(Router);
  private readonly _lang = inject(LanguageService);

  readonly profileMenuOpen = signal(false);
  readonly isDark = signal(false);
  readonly notificationsOpen = signal(false);

  constructor() {
    const stored =
      typeof localStorage !== 'undefined'
        ? (localStorage.getItem(THEME_STORAGE_KEY) as 'light' | 'dark' | null)
        : null;
    const dark = stored === 'dark';
    document.documentElement.classList.toggle('dark', dark);
    this.isDark.set(dark);
    this._lang.init();
  }

  readonly userName = () => {
    const user = this._authStore.user();
    return user ? `${user.firstName} ${user.lastName}` : 'User';
  };

  readonly userInitials = () => {
    const user = this._authStore.user();
    if (!user) return 'U';
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  toggleTheme(): void {
    const html = document.documentElement;
    const nextDark = !html.classList.contains('dark');
    html.classList.toggle('dark', nextDark);
    localStorage.setItem(THEME_STORAGE_KEY, nextDark ? 'dark' : 'light');
    this.isDark.set(nextDark);
  }

  toggleLanguage(): void {
    this._lang.toggle();
  }

  logout(): void {
    this._authService.signOut().subscribe({
      next: () => {
        this.profileMenuOpen.set(false);
        this._router.navigate(['/login']);
      },
    });
  }
}
