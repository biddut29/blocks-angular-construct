// ─── Auth Guard ────────────────────────────────────────────────────────────────
// Mirrors: React's ProtectedRoute / Guard component
// Redirects unauthenticated users to /login

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from './auth.store';

export const authGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.isAuthenticated() && authStore.accessToken()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
