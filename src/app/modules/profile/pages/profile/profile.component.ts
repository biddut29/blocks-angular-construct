// ─── Profile Component ─────────────────────────────────────────────────────────
// Mirrors: src/modules/profile/pages/ProfilePage.tsx in React project
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideUser,
  lucideLock,
  lucideMonitor,
  lucideSave,
  lucideShieldCheck,
  lucideSmartphone,
  lucideLogOut,
} from '@ng-icons/lucide';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmSwitch } from '@spartan-ng/helm/switch';
import { HlmTabs, HlmTabsContent, HlmTabsList, HlmTabsTrigger } from '@spartan-ng/helm/tabs';
import { ProfileService } from '../../services/profile.service';
import { AuthStore } from '../../../../state/store/auth/auth.store';
import { User } from '../../../../types/index';

interface ActiveSession {
  sessionId: string;
  device: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgIconComponent,
    HlmInput,
    HlmButton,
    HlmLabel,
    HlmSwitch,
    HlmTabs,
    HlmTabsContent,
    HlmTabsList,
    HlmTabsTrigger,
  ],
  viewProviders: [
    provideIcons({
      lucideUser,
      lucideLock,
      lucideMonitor,
      lucideSave,
      lucideShieldCheck,
      lucideSmartphone,
      lucideLogOut,
    }),
  ],
  template: `
    <div class="p-6 max-w-3xl mx-auto space-y-6">
      <!-- ── Page Header ─────────────────────────────────────────── -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your account settings and preferences.
        </p>
      </div>

      <!-- ── Profile Avatar Summary ─────────────────────────────── -->
      @if (profile()) {
        <div
          class="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <div
            class="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-2xl font-bold text-indigo-600 dark:text-indigo-400"
          >
            {{ profile()!.firstName.charAt(0) }}{{ profile()!.lastName.charAt(0) }}
          </div>
          <div>
            <p class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ profile()!.firstName }} {{ profile()!.lastName }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ profile()!.email }}</p>
            <div class="flex gap-1 mt-1">
              @for (role of profile()!.roles; track role) {
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                >
                  {{ role }}
                </span>
              }
            </div>
          </div>
        </div>
      }

      <!-- ── Tabs ────────────────────────────────────────────────── -->
      <hlm-tabs tab="personal" class="block">
        <hlm-tabs-list class="grid grid-cols-3 w-full">
          <button hlmTabsTrigger="personal" class="flex items-center gap-2 text-sm">
            <ng-icon name="lucideUser" size="15"></ng-icon>
            Personal Info
          </button>
          <button hlmTabsTrigger="security" class="flex items-center gap-2 text-sm">
            <ng-icon name="lucideLock" size="15"></ng-icon>
            Security
          </button>
          <button hlmTabsTrigger="devices" class="flex items-center gap-2 text-sm">
            <ng-icon name="lucideMonitor" size="15"></ng-icon>
            Devices
          </button>
        </hlm-tabs-list>

        <!-- ── Tab 1: Personal Info ──────────────────────────────── -->
        <div hlmTabsContent="personal" class="mt-6">
          <div
            class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-6"
          >
            <h2 class="text-base font-semibold text-gray-900 dark:text-white mb-5">
              Personal Information
            </h2>
            <form [formGroup]="personalForm" (ngSubmit)="savePersonalInfo()" class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label hlmLabel>First Name</label>
                  <input hlmInput formControlName="firstName" class="w-full" />
                </div>
                <div class="space-y-1">
                  <label hlmLabel>Last Name</label>
                  <input hlmInput formControlName="lastName" class="w-full" />
                </div>
              </div>
              <div class="space-y-1">
                <label hlmLabel>Email Address</label>
                <input
                  hlmInput
                  type="email"
                  formControlName="email"
                  class="w-full"
                  [disabled]="true"
                />
                <p class="text-xs text-gray-400 mt-1">
                  Email cannot be changed here. Contact support.
                </p>
              </div>
              <div class="space-y-1">
                <label hlmLabel>Phone Number</label>
                <input
                  hlmInput
                  formControlName="phoneNumber"
                  placeholder="+1-555-0100"
                  class="w-full"
                />
              </div>
              <div class="flex justify-end pt-2">
                <button
                  hlmBtn
                  type="submit"
                  [disabled]="personalForm.pristine || personalForm.invalid"
                  class="flex items-center gap-2"
                >
                  <ng-icon name="lucideSave" size="16"></ng-icon>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- ── Tab 2: Security ────────────────────────────────────── -->
        <div hlmTabsContent="security" class="mt-6 space-y-4">
          <!-- Change Password -->
          <div
            class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-6"
          >
            <h2 class="text-base font-semibold text-gray-900 dark:text-white mb-5">
              Change Password
            </h2>
            <form [formGroup]="passwordForm" (ngSubmit)="changePassword()" class="space-y-4">
              <div class="space-y-1">
                <label hlmLabel>Current Password</label>
                <input
                  hlmInput
                  type="password"
                  formControlName="currentPassword"
                  class="w-full"
                  placeholder="••••••••"
                />
              </div>
              <div class="space-y-1">
                <label hlmLabel>New Password</label>
                <input
                  hlmInput
                  type="password"
                  formControlName="newPassword"
                  class="w-full"
                  placeholder="••••••••"
                />
              </div>
              <div class="space-y-1">
                <label hlmLabel>Confirm New Password</label>
                <input
                  hlmInput
                  type="password"
                  formControlName="confirmPassword"
                  class="w-full"
                  placeholder="••••••••"
                />
              </div>
              @if (passwordMismatch()) {
                <p class="text-sm text-red-500">Passwords do not match.</p>
              }
              <div class="flex justify-end pt-2">
                <button
                  hlmBtn
                  type="submit"
                  [disabled]="passwordForm.invalid || passwordMismatch()"
                  class="flex items-center gap-2"
                >
                  <ng-icon name="lucideLock" size="16"></ng-icon>
                  Update Password
                </button>
              </div>
            </form>
          </div>

          <!-- MFA Toggle -->
          <div
            class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-6"
          >
            <div class="flex items-center justify-between">
              <div>
                <div class="flex items-center gap-2">
                  <ng-icon name="lucideShieldCheck" size="18" class="text-green-500"></ng-icon>
                  <h2 class="text-base font-semibold text-gray-900 dark:text-white">
                    Two-Factor Authentication
                  </h2>
                </div>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Add an extra layer of security to your account by enabling 2FA.
                </p>
              </div>
              <hlm-switch [checked]="mfaEnabled()" (checkedChange)="toggleMfa($event)">
              </hlm-switch>
            </div>
            @if (mfaEnabled()) {
              <div
                class="mt-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
              >
                <p class="text-sm text-green-700 dark:text-green-400">
                  Two-factor authentication is currently <strong>enabled</strong>.
                </p>
              </div>
            }
          </div>
        </div>

        <!-- ── Tab 3: Devices ─────────────────────────────────────── -->
        <div hlmTabsContent="devices" class="mt-6">
          <div
            class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm"
          >
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 class="text-base font-semibold text-gray-900 dark:text-white">Active Sessions</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                These devices are currently logged into your account.
              </p>
            </div>
            <div class="divide-y divide-gray-100 dark:divide-gray-700">
              @for (session of sessions(); track session.sessionId) {
                <div class="flex items-center justify-between px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
                    >
                      <ng-icon
                        [name]="
                          session.device.includes('iPhone') || session.device.includes('Android')
                            ? 'lucideSmartphone'
                            : 'lucideMonitor'
                        "
                        size="20"
                        class="text-gray-500 dark:text-gray-400"
                      >
                      </ng-icon>
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <p class="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {{ session.device }}
                        </p>
                        @if (session.isCurrent) {
                          <span
                            class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          >
                            Current
                          </span>
                        }
                      </div>
                      <p class="text-xs text-gray-400">
                        {{ session.location }} &middot; Last active
                        {{ session.lastActive | date: 'mediumDate' }}
                      </p>
                    </div>
                  </div>
                  @if (!session.isCurrent) {
                    <button
                      hlmBtn
                      variant="ghost"
                      size="sm"
                      class="text-red-500 hover:text-red-700 flex items-center gap-1 text-xs"
                    >
                      <ng-icon name="lucideLogOut" size="14"></ng-icon>
                      Revoke
                    </button>
                  }
                </div>
              }
            </div>
          </div>
        </div>
      </hlm-tabs>
    </div>
  `,
})
export class ProfileComponent implements OnInit {
  private readonly profileService = inject(ProfileService);
  readonly authStore = inject(AuthStore);
  private readonly fb = inject(FormBuilder);

  // ── Signals ────────────────────────────────────────────────────────────────
  readonly profile = signal<User | null>(null);
  readonly sessions = signal<ActiveSession[]>([]);
  readonly mfaEnabled = signal(false);

  // ── Computed ───────────────────────────────────────────────────────────────
  readonly passwordMismatch = () => {
    const np = this.passwordForm.get('newPassword')?.value;
    const cp = this.passwordForm.get('confirmPassword')?.value;
    return np && cp && np !== cp;
  };

  // ── Forms ──────────────────────────────────────────────────────────────────
  readonly personalForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: [{ value: '', disabled: true }],
    phoneNumber: [''],
  });

  readonly passwordForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  });

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.profileService.getProfile().subscribe((user) => {
      this.profile.set(user);
      this.mfaEnabled.set(user.mfaEnabled);
      this.personalForm.patchValue({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber ?? '',
      });
    });

    this.profileService.getActiveSessions().subscribe((sessions) => this.sessions.set(sessions));
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  savePersonalInfo(): void {
    if (this.personalForm.invalid) return;
    const val = this.personalForm.getRawValue();
    this.profileService
      .updateProfile({
        firstName: val.firstName!,
        lastName: val.lastName!,
        phoneNumber: val.phoneNumber ?? undefined,
      })
      .subscribe((updated) => {
        this.profile.set(updated);
        this.personalForm.markAsPristine();
      });
  }

  changePassword(): void {
    if (this.passwordForm.invalid || this.passwordMismatch()) return;
    const val = this.passwordForm.getRawValue();
    this.profileService
      .changePassword({
        currentPassword: val.currentPassword!,
        newPassword: val.newPassword!,
        confirmPassword: val.confirmPassword!,
      })
      .subscribe(() => {
        this.passwordForm.reset();
      });
  }

  toggleMfa(enabled: boolean): void {
    this.profileService.toggleMfa(enabled).subscribe(() => {
      this.mfaEnabled.set(enabled);
    });
  }
}
