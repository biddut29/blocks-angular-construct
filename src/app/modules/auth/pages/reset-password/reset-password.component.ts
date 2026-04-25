// ─── Reset Password Page ───────────────────────────────────────────────────────
// Mirrors: src/modules/auth/pages/reset-password/ in React project

import { Component, inject, signal, OnInit } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { NgIf } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideLock, lucideEye, lucideEyeOff, lucideLoader, lucideCheck } from '@ng-icons/lucide';
import { AuthService } from '../../services/auth.service';
import { idpErrorMessage } from '../../utils/idp-error.util';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirm = control.get('confirmPassword');
  if (password && confirm && password.value !== confirm.value) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf, NgIconComponent],
  viewProviders: [provideIcons({ lucideLock, lucideEye, lucideEyeOff, lucideLoader, lucideCheck })],
  template: `
    <div class="bg-card rounded-xl border border-border p-8 shadow-sm">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-foreground">Reset password</h1>
        <p class="text-muted-foreground text-sm mt-1">Enter your new password below</p>
      </div>

      <!-- Success -->
      <div *ngIf="success()" class="text-center py-4">
        <div
          class="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3"
        >
          <ng-icon name="lucideCheck" class="w-6 h-6 text-green-600" />
        </div>
        <h3 class="font-semibold text-foreground">Password reset!</h3>
        <p class="text-muted-foreground text-sm mt-1">Your password has been reset successfully.</p>
        <a routerLink="/login" class="inline-block mt-4 text-primary hover:underline text-sm"
          >Sign in</a
        >
      </div>

      <form *ngIf="!success()" [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
        <div class="space-y-1.5">
          <label class="text-sm font-medium text-foreground">New Password</label>
          <div class="relative">
            <input
              [type]="showPwd() ? 'text' : 'password'"
              formControlName="password"
              placeholder="Minimum 8 characters"
              class="w-full h-10 px-3 pr-10 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              (click)="showPwd.set(!showPwd())"
            >
              <ng-icon [name]="showPwd() ? 'lucideEyeOff' : 'lucideEye'" class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="text-sm font-medium text-foreground">Confirm Password</label>
          <input
            type="password"
            formControlName="confirmPassword"
            placeholder="Repeat your password"
            class="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            [class.border-destructive]="
              form.hasError('passwordMismatch') && form.get('confirmPassword')?.touched
            "
          />
          <p
            *ngIf="form.hasError('passwordMismatch') && form.get('confirmPassword')?.touched"
            class="text-destructive text-xs"
          >
            Passwords do not match.
          </p>
        </div>

        <p *ngIf="errorMessage()" class="text-destructive text-sm">{{ errorMessage() }}</p>

        <button
          type="submit"
          [disabled]="isLoading() || form.invalid"
          class="w-full h-10 bg-primary text-primary-foreground rounded-md text-sm font-medium
                 hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <ng-icon *ngIf="isLoading()" name="lucideLoader" class="w-4 h-4 animate-spin" />
          {{ isLoading() ? 'Resetting...' : 'Reset password' }}
        </button>
      </form>
    </div>
  `,
})
export class ResetPasswordComponent implements OnInit {
  private readonly _fb = inject(FormBuilder);
  private readonly _authService = inject(AuthService);
  private readonly _route = inject(ActivatedRoute);

  readonly isLoading = signal(false);
  readonly showPwd = signal(false);
  readonly success = signal(false);
  readonly errorMessage = signal('');

  /** Same query param as React reset-password page: `?code=` */
  private _code = '';

  readonly form = this._fb.group(
    {
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator }
  );

  ngOnInit(): void {
    this._code = this._route.snapshot.queryParamMap.get('code') ?? '';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this._code) {
      this.errorMessage.set('Invalid or missing reset link. Request a new password reset email.');
      return;
    }
    this.isLoading.set(true);
    this._authService
      .resetPassword({
        code: this._code,
        password: this.form.value.password!,
      })
      .subscribe({
        next: () => {
          this.success.set(true);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.errorMessage.set(idpErrorMessage(err, 'Reset failed.'));
          this.isLoading.set(false);
        },
      });
  }
}
