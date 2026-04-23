// ─── Forgot Password Page ──────────────────────────────────────────────────────
// Mirrors: src/modules/auth/pages/forgot-password/ in React project

import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideMail, lucideLoader, lucideArrowLeft } from '@ng-icons/lucide';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf, NgIconComponent],
  viewProviders: [provideIcons({ lucideMail, lucideLoader, lucideArrowLeft })],
  template: `
    <div class="bg-card rounded-xl border border-border p-8 shadow-sm">
      <a routerLink="/login" class="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ng-icon name="lucideArrowLeft" class="w-4 h-4" /> Back to sign in
      </a>

      <div class="mb-6">
        <h1 class="text-2xl font-bold text-foreground">Forgot password?</h1>
        <p class="text-muted-foreground text-sm mt-1">Enter your email and we'll send you a reset link</p>
      </div>

      <!-- Success state -->
      <div *ngIf="submitted()" class="text-center py-4">
        <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
          <ng-icon name="lucideMail" class="w-6 h-6 text-primary" />
        </div>
        <h3 class="font-semibold text-foreground">Check your email</h3>
        <p class="text-muted-foreground text-sm mt-1">
          We sent a password reset link to <strong>{{ emailSentTo() }}</strong>
        </p>
        <a routerLink="/login" class="inline-block mt-4 text-primary hover:underline text-sm">Back to sign in</a>
      </div>

      <form *ngIf="!submitted()" [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
        <div class="space-y-1.5">
          <label class="text-sm font-medium text-foreground">Email address</label>
          <input
            type="email" formControlName="email" placeholder="you@example.com"
            class="w-full h-10 px-3 rounded-md border border-input bg-background text-sm
                   focus:outline-none focus:ring-2 focus:ring-ring"
            [class.border-destructive]="fieldInvalid"
          />
          <p *ngIf="fieldInvalid" class="text-destructive text-xs">Enter a valid email address.</p>
        </div>

        <p *ngIf="errorMessage()" class="text-destructive text-sm">{{ errorMessage() }}</p>

        <button type="submit" [disabled]="isLoading() || form.invalid"
          class="w-full h-10 bg-primary text-primary-foreground rounded-md text-sm font-medium
                 hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
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

  readonly isLoading = signal(false);
  readonly submitted = signal(false);
  readonly errorMessage = signal('');
  readonly emailSentTo = signal('');

  readonly form = this._fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  get fieldInvalid(): boolean {
    const c = this.form.get('email');
    return !!(c?.invalid && c?.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isLoading.set(true);
    const email = this.form.value.email!;
    this._authService.forgotPassword(email).subscribe({
      next: () => { this.emailSentTo.set(email); this.submitted.set(true); this.isLoading.set(false); },
      error: err => { this.errorMessage.set(err?.error?.message ?? 'Failed to send email.'); this.isLoading.set(false); },
    });
  }
}
