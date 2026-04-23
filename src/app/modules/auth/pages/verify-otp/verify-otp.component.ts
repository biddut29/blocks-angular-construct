// ─── Verify OTP Page ───────────────────────────────────────────────────────────
// Mirrors: src/modules/auth/pages/verify-otp/ in React project
// 6-digit OTP input with auto-focus and resend support

import { Component, inject, signal, OnInit, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideLoader, lucideShieldCheck } from '@ng-icons/lucide';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor, NgIconComponent],
  viewProviders: [provideIcons({ lucideLoader, lucideShieldCheck })],
  template: `
    <div class="bg-card rounded-xl border border-border p-8 shadow-sm text-center">
      <div class="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <ng-icon name="lucideShieldCheck" class="w-7 h-7 text-primary" />
      </div>

      <h1 class="text-2xl font-bold text-foreground">Verify your email</h1>
      <p class="text-muted-foreground text-sm mt-2 mb-6">
        Enter the 6-digit code sent to <strong>{{ email }}</strong>
      </p>

      <p *ngIf="errorMessage()" class="mb-4 text-destructive text-sm">{{ errorMessage() }}</p>

      <!-- OTP boxes -->
      <div class="flex items-center justify-center gap-2 mb-6">
        <input
          *ngFor="let _ of [0,1,2,3,4,5]; let i = index"
          #otpInput
          type="text"
          inputmode="numeric"
          maxlength="1"
          class="w-11 h-11 text-center text-lg font-semibold rounded-md border border-input
                 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          (input)="onInput($event, i)"
          (keydown)="onKeyDown($event, i)"
          (paste)="onPaste($event)"
        />
      </div>

      <button
        [disabled]="isLoading() || otp().length < 6"
        (click)="onVerify()"
        class="w-full h-10 bg-primary text-primary-foreground rounded-md text-sm font-medium
               hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <ng-icon *ngIf="isLoading()" name="lucideLoader" class="w-4 h-4 animate-spin" />
        {{ isLoading() ? 'Verifying...' : 'Verify' }}
      </button>

      <!-- Resend -->
      <p class="text-sm text-muted-foreground mt-4">
        Didn't receive the code?
        <button
          class="text-primary hover:underline disabled:opacity-50 ml-1"
          [disabled]="resendCooldown() > 0"
          (click)="onResend()"
        >
          {{ resendCooldown() > 0 ? 'Resend in ' + resendCooldown() + 's' : 'Resend' }}
        </button>
      </p>
    </div>
  `,
})
export class VerifyOtpComponent implements OnInit {
  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef<HTMLInputElement>>;

  private readonly _authService = inject(AuthService);
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);

  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  readonly otp = signal('');
  readonly resendCooldown = signal(0);

  email = '';

  ngOnInit(): void {
    this.email = this._route.snapshot.queryParamMap.get('email') ?? '';
  }

  onInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');
    input.value = value;

    const inputs = this.otpInputs.toArray();
    const otpArr = inputs.map(i => i.nativeElement.value);
    this.otp.set(otpArr.join(''));

    if (value && index < 5) {
      inputs[index + 1].nativeElement.focus();
    }
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace') {
      const inputs = this.otpInputs.toArray();
      if (!inputs[index].nativeElement.value && index > 0) {
        inputs[index - 1].nativeElement.focus();
      }
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const text = event.clipboardData?.getData('text') ?? '';
    const digits = text.replace(/\D/g, '').slice(0, 6);
    const inputs = this.otpInputs.toArray();
    digits.split('').forEach((d, i) => {
      if (inputs[i]) inputs[i].nativeElement.value = d;
    });
    this.otp.set(digits);
    if (inputs[digits.length - 1]) inputs[digits.length - 1].nativeElement.focus();
  }

  onVerify(): void {
    if (this.otp().length < 6) return;
    this.isLoading.set(true);
    this._authService.verifyOtp({ email: this.email, otp: this.otp() }).subscribe({
      next: () => this._router.navigate(['/activation-success']),
      error: err => { this.errorMessage.set(err?.error?.message ?? 'Invalid OTP.'); this.isLoading.set(false); },
    });
  }

  onResend(): void {
    this.resendCooldown.set(60);
    const interval = setInterval(() => {
      this.resendCooldown.update(v => {
        if (v <= 1) { clearInterval(interval); return 0; }
        return v - 1;
      });
    }, 1000);
  }
}
