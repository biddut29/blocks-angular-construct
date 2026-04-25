// ─── Account activation (React: /activate?code=) ────────────────────────────────
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideEye, lucideEyeOff, lucideLoader, lucideCheck, lucideX } from '@ng-icons/lucide';
import { startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../services/auth.service';
import { environment } from '@environments/environment';
import { idpErrorMessage } from '../../utils/idp-error.util';
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_REQUIREMENT_ROWS,
  evaluatePasswordChecks,
  passwordPolicyValidator,
  passwordStrengthBarColorClass,
  passwordStrengthBarPercent,
  passwordsMatchMet,
  type PasswordChecks,
} from '../../validators/password-policy.validator';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirm = control.get('confirmPassword');
  if (password && confirm && password.value !== confirm.value) {
    return { passwordMismatch: true };
  }
  return null;
}

type Phase = 'loading' | 'invalid' | 'ready';

@Component({
  selector: 'app-account-activation',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf, NgIconComponent],
  viewProviders: [provideIcons({ lucideEye, lucideEyeOff, lucideLoader, lucideCheck, lucideX })],
  template: `
    <div class="bg-card rounded-xl border border-border p-8 shadow-sm">
      <!-- Loading -->
      <div *ngIf="phase() === 'loading'" class="flex flex-col items-center py-12 gap-3">
        <ng-icon name="lucideLoader" class="w-8 h-8 animate-spin text-primary" />
        <p class="text-sm text-muted-foreground">Checking your activation link…</p>
      </div>

      <!-- Missing code -->
      <div *ngIf="phase() === 'invalid'" class="text-center py-4">
        <h1 class="text-xl font-bold text-foreground">Invalid link</h1>
        <p class="text-muted-foreground text-sm mt-2">
          This page needs a valid <code class="text-xs bg-muted px-1 rounded">code</code> from your
          email.
        </p>
        <a routerLink="/signup" class="inline-block mt-4 text-primary hover:underline text-sm"
          >Sign up</a
        >
        <span class="text-muted-foreground text-sm mx-2">·</span>
        <a routerLink="/login" class="inline-block mt-4 text-primary hover:underline text-sm"
          >Sign in</a
        >
      </div>

      <!-- Form -->
      <ng-container *ngIf="phase() === 'ready'">
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-foreground">Complete signup</h1>
          <p class="text-muted-foreground text-sm mt-1">
            Set your name and password to activate your account.
          </p>
          <p class="text-sm text-muted-foreground mt-3">
            Already have an account?
            <a routerLink="/login" class="font-semibold text-primary hover:underline">Sign in</a>
          </p>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-sm font-medium text-foreground">First name</label>
              <input
                type="text"
                formControlName="firstName"
                class="w-full h-10 px-3 rounded-md border border-input bg-background text-sm
                       focus:outline-none focus:ring-2 focus:ring-ring"
                [class.border-destructive]="
                  form.get('firstName')?.invalid && form.get('firstName')?.touched
                "
              />
            </div>
            <div class="space-y-1.5">
              <label class="text-sm font-medium text-foreground">Last name</label>
              <input
                type="text"
                formControlName="lastName"
                class="w-full h-10 px-3 rounded-md border border-input bg-background text-sm
                       focus:outline-none focus:ring-2 focus:ring-ring"
                [class.border-destructive]="
                  form.get('lastName')?.invalid && form.get('lastName')?.touched
                "
              />
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="text-sm font-medium text-foreground">Password</label>
            <div class="relative">
              <input
                [type]="showPwd() ? 'text' : 'password'"
                formControlName="password"
                placeholder="Minimum 8 characters"
                class="w-full h-10 px-3 pr-10 rounded-md border border-input bg-background text-sm
                       focus:outline-none focus:ring-2 focus:ring-ring"
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
            <label class="text-sm font-medium text-foreground">Confirm password</label>
            <input
              type="password"
              formControlName="confirmPassword"
              class="w-full h-10 px-3 rounded-md border border-input bg-background text-sm
                     focus:outline-none focus:ring-2 focus:ring-ring"
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

          <!-- Password requirements: default red ✕, satisfied green ✓ -->
          <div
            class="w-full rounded-lg border border-border bg-background px-5 py-4 shadow-sm
                   dark:border-border dark:bg-card"
          >
            <h2 class="text-base font-bold text-foreground tracking-tight">
              Password Requirements
            </h2>
            <div class="mt-2 h-1 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-muted">
              <div
                class="h-full rounded-full transition-[width] duration-300 ease-out"
                [class]="strengthBarColorClass()"
                [style.width.%]="strengthPercent()"
              ></div>
            </div>
            <p class="mb-3 mt-2 text-xs text-muted-foreground">
              Your password must meet these requirements:
            </p>
            <ul class="m-0 list-none space-y-2.5 p-0 text-xs text-foreground">
              @for (row of requirementRows; track row.key) {
                <li class="flex items-start gap-2.5">
                  <span
                    class="mt-0.5 inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center"
                    [class.text-green-600]="checks()[row.key]"
                    [class.text-red-600]="!checks()[row.key]"
                    aria-hidden="true"
                  >
                    <ng-icon
                      [name]="checks()[row.key] ? 'lucideCheck' : 'lucideX'"
                      class="h-[18px] w-[18px] stroke-[2.5]"
                    />
                  </span>
                  <span class="leading-snug">{{ row.label }}</span>
                </li>
              }
              <li class="flex items-start gap-2.5">
                <span
                  class="mt-0.5 inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center"
                  [class.text-green-600]="passwordsMatchRow()"
                  [class.text-red-600]="!passwordsMatchRow()"
                  aria-hidden="true"
                >
                  <ng-icon
                    [name]="passwordsMatchRow() ? 'lucideCheck' : 'lucideX'"
                    class="h-[18px] w-[18px] stroke-[2.5]"
                  />
                </span>
                <span class="leading-snug">Passwords match</span>
              </li>
            </ul>
          </div>

          <p *ngIf="errorMessage()" class="text-destructive text-sm">{{ errorMessage() }}</p>

          <button
            type="submit"
            [disabled]="isLoading() || form.invalid"
            class="w-full h-10 bg-primary text-primary-foreground rounded-md text-sm font-medium
                   hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <ng-icon *ngIf="isLoading()" name="lucideLoader" class="w-4 h-4 animate-spin" />
            {{ isLoading() ? 'Activating…' : 'Activate account' }}
          </button>
        </form>
      </ng-container>
    </div>
  `,
})
export class AccountActivationComponent implements OnInit {
  private readonly _fb = inject(FormBuilder);
  private readonly _auth = inject(AuthService);
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);

  readonly phase = signal<Phase>('loading');
  readonly isLoading = signal(false);
  readonly showPwd = signal(false);
  readonly errorMessage = signal('');

  /** Checklist + strength bar (synced from reactive form, no Zod). */
  readonly checks = signal<PasswordChecks>(evaluatePasswordChecks(''));
  readonly strengthPercent = signal(0);
  readonly passwordsMatchRow = signal(false);
  readonly strengthBarColorClass = computed(() =>
    passwordStrengthBarColorClass(this.strengthPercent())
  );

  readonly requirementRows = [...PASSWORD_REQUIREMENT_ROWS];

  private _code = '';

  readonly form = this._fb.group(
    {
      firstName: ['', [Validators.required, Validators.minLength(1)]],
      lastName: ['', [Validators.required, Validators.minLength(1)]],
      password: [
        '',
        [Validators.required, Validators.maxLength(PASSWORD_MAX_LENGTH), passwordPolicyValidator()],
      ],
      confirmPassword: ['', [Validators.required, Validators.maxLength(PASSWORD_MAX_LENGTH)]],
    },
    { validators: passwordMatchValidator }
  );

  constructor() {
    this.form.valueChanges
      .pipe(startWith(this.form.getRawValue()), takeUntilDestroyed())
      .subscribe(() => {
        const pwd = (this.form.get('password')?.value as string) ?? '';
        const cfm = (this.form.get('confirmPassword')?.value as string) ?? '';
        const c = evaluatePasswordChecks(pwd);
        this.checks.set(c);
        this.strengthPercent.set(passwordStrengthBarPercent(c, pwd, cfm));
        this.passwordsMatchRow.set(passwordsMatchMet(pwd, cfm));
      });
  }

  ngOnInit(): void {
    this._code = this._route.snapshot.queryParamMap.get('code') ?? '';
    if (!this._code) {
      this.phase.set('invalid');
      return;
    }
    this._auth
      .validateActivationCode({
        activationCode: this._code,
        projectKey: environment.xBlocksKey,
      })
      .subscribe({
        next: (res) => {
          if (res.userId) {
            this._router.navigate(['/activate-failed'], { queryParams: { userId: res.userId } });
            return;
          }
          if (res.errors) {
            this._router.navigate(['/signup']);
            return;
          }
          this.phase.set('ready');
        },
        error: () => {
          this._router.navigate(['/signup']);
        },
      });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this._code) return;
    this.isLoading.set(true);
    this.errorMessage.set('');
    const v = this.form.getRawValue();
    this._auth
      .accountActivation({
        firstname: v.firstName!,
        lastname: v.lastName!,
        password: v.password!,
        code: this._code,
        captchaCode: '',
        projectKey: environment.xBlocksKey,
      })
      .subscribe({
        next: () => {
          this._router.navigate(['/success']);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.errorMessage.set(idpErrorMessage(err, 'Activation failed.'));
          this.isLoading.set(false);
        },
      });
  }
}
