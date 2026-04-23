// ─── Signup Page Component ─────────────────────────────────────────────────────
// Mirrors: src/modules/auth/pages/signup/ in React project

import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideUser, lucideMail, lucideLock, lucideEye, lucideEyeOff, lucideLoader,
} from '@ng-icons/lucide';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf, NgIconComponent],
  viewProviders: [provideIcons({ lucideUser, lucideMail, lucideLock, lucideEye, lucideEyeOff, lucideLoader })],
  template: `
    <div class="bg-card rounded-xl border border-border p-8 shadow-sm">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-foreground">Create account</h1>
        <p class="text-muted-foreground text-sm mt-1">Fill in the details below to get started</p>
      </div>

      <!-- Error alert -->
      <div *ngIf="errorMessage()" class="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
        {{ errorMessage() }}
      </div>

      <form [formGroup]="signupForm" (ngSubmit)="onSubmit()" class="space-y-4">
        <!-- Name row -->
        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1.5">
            <label class="text-sm font-medium text-foreground">First Name</label>
            <input
              type="text"
              formControlName="firstName"
              placeholder="John"
              class="w-full h-10 px-3 rounded-md border border-input bg-background text-sm
                     focus:outline-none focus:ring-2 focus:ring-ring"
              [class.border-destructive]="fieldInvalid('firstName')"
            />
          </div>
          <div class="space-y-1.5">
            <label class="text-sm font-medium text-foreground">Last Name</label>
            <input
              type="text"
              formControlName="lastName"
              placeholder="Doe"
              class="w-full h-10 px-3 rounded-md border border-input bg-background text-sm
                     focus:outline-none focus:ring-2 focus:ring-ring"
              [class.border-destructive]="fieldInvalid('lastName')"
            />
          </div>
        </div>

        <!-- Email -->
        <div class="space-y-1.5">
          <label class="text-sm font-medium text-foreground">Email</label>
          <input
            type="email"
            formControlName="email"
            placeholder="you@example.com"
            class="w-full h-10 px-3 rounded-md border border-input bg-background text-sm
                   focus:outline-none focus:ring-2 focus:ring-ring"
            [class.border-destructive]="fieldInvalid('email')"
          />
          <p *ngIf="fieldInvalid('email')" class="text-destructive text-xs">Enter a valid email.</p>
        </div>

        <!-- Password -->
        <div class="space-y-1.5">
          <label class="text-sm font-medium text-foreground">Password</label>
          <div class="relative">
            <input
              [type]="showPassword() ? 'text' : 'password'"
              formControlName="password"
              placeholder="Minimum 8 characters"
              class="w-full h-10 px-3 pr-10 rounded-md border border-input bg-background text-sm
                     focus:outline-none focus:ring-2 focus:ring-ring"
              [class.border-destructive]="fieldInvalid('password')"
            />
            <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              (click)="showPassword.set(!showPassword())">
              <ng-icon [name]="showPassword() ? 'lucideEyeOff' : 'lucideEye'" class="w-4 h-4" />
            </button>
          </div>
          <p *ngIf="fieldInvalid('password')" class="text-destructive text-xs">Minimum 8 characters.</p>
        </div>

        <!-- Submit -->
        <button type="submit" [disabled]="isLoading() || signupForm.invalid"
          class="w-full h-10 bg-primary text-primary-foreground rounded-md text-sm font-medium
                 hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
          <ng-icon *ngIf="isLoading()" name="lucideLoader" class="w-4 h-4 animate-spin" />
          {{ isLoading() ? 'Creating account...' : 'Create account' }}
        </button>
      </form>

      <p class="text-center text-sm text-muted-foreground mt-6">
        Already have an account?
        <a routerLink="/login" class="text-primary hover:underline font-medium">Sign in</a>
      </p>
    </div>
  `,
})
export class SignupComponent {
  private readonly _fb = inject(FormBuilder);
  private readonly _authService = inject(AuthService);
  private readonly _router = inject(Router);

  readonly isLoading = signal(false);
  readonly showPassword = signal(false);
  readonly errorMessage = signal('');

  readonly signupForm = this._fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  fieldInvalid(name: string): boolean {
    const ctrl = this.signupForm.get(name);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  onSubmit(): void {
    if (this.signupForm.invalid) { this.signupForm.markAllAsTouched(); return; }
    this.isLoading.set(true);
    this.errorMessage.set('');
    const { firstName, lastName, email, password } = this.signupForm.value;
    this._authService.signup({ firstName: firstName!, lastName: lastName!, email: email!, password: password! }).subscribe({
      next: () => this._router.navigate(['/email-sent']),
      error: err => { this.errorMessage.set(err?.error?.message ?? 'Signup failed.'); this.isLoading.set(false); },
    });
  }
}
