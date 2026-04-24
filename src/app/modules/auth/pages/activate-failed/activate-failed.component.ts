// ─── Activation link expired / invalid (React: /activate-failed) ───────────────
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideCircleAlert, lucideLoader, lucideCircleCheck } from '@ng-icons/lucide';
import { AuthService } from '../../services/auth.service';
import { idpErrorMessage } from '../../utils/idp-error.util';

@Component({
  selector: 'app-activate-failed',
  standalone: true,
  imports: [RouterLink, NgIf, NgIconComponent],
  viewProviders: [provideIcons({ lucideCircleAlert, lucideLoader, lucideCircleCheck })],
  template: `
    <div class="bg-card rounded-xl border border-border p-8 shadow-sm">
      <div class="flex justify-center mb-6">
        <div class="w-14 h-14 bg-destructive/10 rounded-full flex items-center justify-center">
          <ng-icon name="lucideCircleAlert" class="w-7 h-7 text-destructive" />
        </div>
      </div>
      <h1 class="text-2xl font-bold text-foreground text-center">Verification failed</h1>
      <p class="text-muted-foreground text-sm mt-2 text-center">
        This activation link is no longer valid. You can request a new link if your account is still pending.
      </p>

      <div *ngIf="userId()" class="mt-6 space-y-3">
        <button
          type="button"
          (click)="onResend()"
          [disabled]="resendPending()"
          class="w-full h-10 bg-primary text-primary-foreground rounded-md text-sm font-medium
                 hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <ng-icon *ngIf="resendPending()" name="lucideLoader" class="w-4 h-4 animate-spin" />
          {{ resendPending() ? 'Sending...' : 'Resend activation link' }}
        </button>
        <p *ngIf="resendError()" class="text-destructive text-sm text-center">{{ resendError() }}</p>
        <div *ngIf="resendSuccess()" class="flex items-center justify-center gap-2 text-sm text-green-600">
          <ng-icon name="lucideCircleCheck" class="w-4 h-4 shrink-0" />
          <span>A new link has been sent to your email.</span>
        </div>
      </div>

      <a
        routerLink="/login"
        class="mt-6 block text-center text-primary hover:underline text-sm font-medium"
      >
        Go to sign in
      </a>
    </div>
  `,
})
export class ActivateFailedComponent {
  private readonly _route = inject(ActivatedRoute);
  private readonly _auth = inject(AuthService);

  readonly userId = signal('');
  readonly resendPending = signal(false);
  readonly resendSuccess = signal(false);
  readonly resendError = signal('');

  constructor() {
    const id = this._route.snapshot.queryParamMap.get('userId');
    if (id) this.userId.set(id);
  }

  onResend(): void {
    const id = this.userId();
    if (!id) return;
    this.resendPending.set(true);
    this.resendError.set('');
    this.resendSuccess.set(false);
    this._auth.resendActivation({ userId: id }).subscribe({
      next: () => {
        this.resendSuccess.set(true);
        this.resendPending.set(false);
      },
      error: err => {
        this.resendError.set(idpErrorMessage(err, 'Could not resend the link.'));
        this.resendPending.set(false);
      },
    });
  }
}
