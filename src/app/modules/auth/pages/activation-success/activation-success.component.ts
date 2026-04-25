// ─── Activation Success Page ───────────────────────────────────────────────────
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideCircleCheck } from '@ng-icons/lucide';

@Component({
  selector: 'app-activation-success',
  standalone: true,
  imports: [RouterLink, NgIconComponent],
  viewProviders: [provideIcons({ lucideCircleCheck })],
  template: `
    <div class="bg-card rounded-xl border border-border p-8 shadow-sm text-center">
      <div
        class="w-14 h-14 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4"
      >
        <ng-icon name="lucideCircleCheck" class="w-7 h-7 text-green-600" />
      </div>
      <h1 class="text-2xl font-bold text-foreground">Account activated!</h1>
      <p class="text-muted-foreground text-sm mt-2">
        Your account has been successfully activated. You can now sign in.
      </p>
      <a
        routerLink="/login"
        class="inline-block mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium
               hover:bg-primary/90 transition-colors"
      >
        Sign in
      </a>
    </div>
  `,
})
export class ActivationSuccessComponent {}
