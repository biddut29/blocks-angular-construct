// ─── Forgot Password Page ──────────────────────────────────────────────────────
// Mirrors: src/modules/auth/pages/forgot-password/ in React project

import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideLoader, lucideArrowLeft } from '@ng-icons/lucide';
import { AuthService } from '../../services/auth.service';
import { idpErrorMessage } from '../../utils/idp-error.util';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf, NgIconComponent],
  viewProviders: [provideIcons({ lucideLoader, lucideArrowLeft })],
  template: `
    <div class="bg-card rounded-xl border border-border p-8 shadow-sm">
      <a
        routerLink="/login"
        class="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ng-icon name="lucideArrowLeft" class="w-4 h-4" /> Back to sign in
      </a>

      <div class="mb-6">
        <h1 class="text-2xl font-bold text-foreground">Forgot password?</h1>
        <p class="text-muted-foreground text-sm mt-1">
          Enter your email and we'll send you a reset link
        </p>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
        <div class="space-y-1.5">
          <label class="text-sm font-medium text-foreground">Email address</label>
          <input
            type="email"
            formControlName="email"
            placeholder="you@example.com"
            class="w-full h-10 px-3 rounded-md border border-input bg-background text-sm
                   focus:outline-none focus:ring-2 focus:ring-ring"
            [class.border-destructive]="fieldInvalid"
          />
          <p *ngIf="fieldInvalid" class="text-destructive text-xs">Enter a valid email address.</p>
        </div>

        <p *ngIf="errorMessage()" class="text-destructive text-sm">{{ errorMessage() }}</p>

        <button
          type="submit"
          [disabled]="isLoading() || form.invalid"
          class="w-full h-10 bg-primary text-primary-foreground rounded-md text-sm font-medium
                 hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <ng-icon *ngIf="isLoading()" name="lucideLoader" class="w-4 h-4 animate-spin" />
          {{ isLoading() ? 'Sending...' : 'Send reset link' }}
        </button>
      </form>
    </div>
  `,
})
export class ForgotPasswordComponent {
  private readonly _fb = inject(FormBuilder);
  private readonly _authService = inject(AuthService);
  private readonly _router = inject(Router);

  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  readonly form = this._fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  get fieldInvalid(): boolean {
    const c = this.form.get('email');
    return !!(c?.invalid && c?.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    const email = this.form.value.email!;
    this._authService.forgotPassword(email).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res?.isSuccess) {
          this._router.navigate(['/sent-email'], { queryParams: { email } });
          return;
        }
        this.errorMessage.set('Could not send reset email. Please try again.');
      },
      error: (err) => {
        this.errorMessage.set(idpErrorMessage(err, 'Failed to send email.'));
        this.isLoading.set(false);
      },
    });
  }
}
