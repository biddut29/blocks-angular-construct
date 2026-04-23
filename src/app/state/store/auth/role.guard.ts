// ─── Role guard ────────────────────────────────────────────────────────────────
// Mirrors: React <ProtectedRoute roles={['admin']}> and useIsProtected (any opt)

import { inject } from '@angular/core';
import { CanActivateFn, Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { AuthStore } from './auth.store';

function getData(
  r: ActivatedRouteSnapshot | null,
  key: 'roles' | 'permissions',
): string[] {
  let current: ActivatedRouteSnapshot | null = r;
  while (current) {
    const v = (current.data[key] as string[] | undefined) ?? [];
    if (v.length) return v;
    current = current.firstChild;
  }
  return [];
}

export const roleGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  _state: RouterStateSnapshot,
) => {
  const auth = inject(AuthStore);
  const router = inject(Router);

  const roles = getData(route, 'roles');
  const permissions = getData(route, 'permissions');
  const opt = (route.data['accessOpt'] as 'all' | 'any' | undefined) ?? 'any';

  if (!roles.length && !permissions.length) {
    return true;
  }
  if (auth.canAccess(roles, permissions, opt)) {
    return true;
  }
  return router.createUrlTree(['/unauthorized']);
};
