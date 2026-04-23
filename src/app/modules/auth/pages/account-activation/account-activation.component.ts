// ─── Account Activation Page ───────────────────────────────────────────────────
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideMailOpen } from '@ng-icons/lucide';

@Component({
  selector: 'app-account-activation',
  standalone: true,
  imports: [RouterLink, NgIconComponent],
  viewProviders: [provideIcons({ lucideMailOpen })],
  template: `
    <div class="bg-card rounded-xl border border-border p-8 shadow-sm text-center">
      <div class="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <ng-icon name="lucideMailOpen" class="w-7 h-7 text-primary" />
      </div>
      <h1 class="text-2xl font-bold text-foreground">Activate your account</h1>
      <p class="text-muted-foreground text-sm mt-2">
        We've sent an activation link to your email. Please check your inbox and click the link to activate your account.
      </p>
      <a routerLink="/login" class="inline-block mt-6 text-primary hover:underline text-sm">Back to sign in</a>
    </div>
  `,
})
export class AccountActivationComponent {}
