// ─── 403-style unauthorized page (logged in, wrong role) ─────────────────────
// Mirrors: React's UnauthorizedPage from error-view

import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideArrowRight, lucideShieldAlert } from '@ng-icons/lucide';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterLink, NgIconComponent],
  viewProviders: [provideIcons({ lucideArrowRight, lucideShieldAlert })],
  template: `
    <div
      class="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto"
    >
      <ng-icon
        name="lucideShieldAlert"
        class="w-16 h-16 text-destructive/80 mb-6"
        aria-hidden="true"
      />
      <h1 class="text-2xl font-bold text-foreground mb-2">Access denied</h1>
      <p class="text-muted-foreground text-sm mb-8">
        You do not have permission to view this resource. Contact an administrator if you need
        access.
      </p>
      <a
        routerLink="/dashboard"
        class="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground
               rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        Go to dashboard
        <ng-icon name="lucideArrowRight" class="w-4 h-4" />
      </a>
    </div>
  `,
})
export class UnauthorizedComponent {}
