// ─── Auth Routes ───────────────────────────────────────────────────────────────
// Mirrors: src/routes/auth.route.tsx in React project

import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
];

export const SIGNUP_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/signup/signup.component').then((m) => m.SignupComponent),
  },
];

export const FORGOT_PASSWORD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent
      ),
  },
];

export const RESET_PASSWORD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent
      ),
  },
];

export const VERIFY_OTP_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/verify-otp/verify-otp.component').then((m) => m.VerifyOtpComponent),
  },
];

export const ACCOUNT_ACTIVATION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/account-activation/account-activation.component').then(
        (m) => m.AccountActivationComponent
      ),
  },
];

export const ACTIVATION_SUCCESS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/activation-success/activation-success.component').then(
        (m) => m.ActivationSuccessComponent
      ),
  },
];

export const EMAIL_SENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/email-sent/email-sent.component').then((m) => m.EmailSentComponent),
  },
];
