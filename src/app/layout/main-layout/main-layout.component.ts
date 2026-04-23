// ─── Main Layout Component ─────────────────────────────────────────────────────
// Mirrors: src/layout/main-layout/ in React project
// Wraps all authenticated pages with sidebar + header

import { Component, signal, HostListener, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgClass } from '@angular/common';
import { AppSidebarComponent } from '../../components/core/app-sidebar/app-sidebar.component';
import { AppHeaderComponent } from '../../components/core/app-header/app-header.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, NgClass, AppSidebarComponent, AppHeaderComponent],
  template: `
    <div class="flex h-screen overflow-hidden bg-background">
      <!-- Sidebar -->
      <app-sidebar
        [collapsed]="sidebarCollapsed()"
        (collapsedChange)="sidebarCollapsed.set($event)"
      />

      <!-- Main content area -->
      <div
        class="flex flex-col flex-1 overflow-hidden transition-all duration-300"
        [ngClass]="sidebarCollapsed() ? 'ml-16' : 'ml-64'"
      >
        <!-- Top header -->
        <app-header
          [sidebarCollapsed]="sidebarCollapsed()"
          (toggleSidebar)="sidebarCollapsed.set(!sidebarCollapsed())"
        />

        <!-- Page content (router outlet) -->
        <main class="flex-1 overflow-y-auto p-6">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class MainLayoutComponent {
  /** Sidebar collapsed state — mirrors React's sidebar open/close */
  sidebarCollapsed = signal(false);

  @HostListener('window:resize')
  onResize(): void {
    // Auto-collapse sidebar on small screens
    if (window.innerWidth < 768) {
      this.sidebarCollapsed.set(true);
    }
  }
}
