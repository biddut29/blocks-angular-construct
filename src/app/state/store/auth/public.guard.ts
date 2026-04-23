// ─── Public Guard ──────────────────────────────────────────────────────────────
// Redirects already-authenticated users away from auth pages → /dashboard

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from './auth.store';

export const publicGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.isAuthenticated() && authStore.accessToken()) {
    return router.createUrlTree(['/dashboard']);
  }

  return true;
};
