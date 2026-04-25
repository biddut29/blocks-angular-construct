// ─── Auth Signal Store ─────────────────────────────────────────────────────────
// Mirrors: src/state/store/auth/useAuthStore.ts (Zustand) → Angular Signals
// Persists to localStorage under 'auth-storage'

import { Injectable, computed, signal } from '@angular/core';
import type { User, AuthTokens } from '@app/types/index';
import { AUTH_STORAGE_KEY } from '@constant/index';
import { decodeJWT } from '@lib/decode-jwt.utils';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  selectedOrgId: string | null;
  tokens: AuthTokens | null;
}

const defaultState: AuthState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  selectedOrgId: null,
  tokens: null,
};

@Injectable({ providedIn: 'root' })
export class AuthStore {
  // ── Signals (state) ────────────────────────────────────────────────────────
  private readonly _state = signal<AuthState>(this._loadFromStorage());

  // ── Selectors (computed) ───────────────────────────────────────────────────
  readonly isAuthenticated = computed(() => this._state().isAuthenticated);
  readonly user = computed(() => this._state().user);
  readonly accessToken = computed(() => this._state().accessToken);
  readonly refreshToken = computed(() => this._state().refreshToken);
  readonly selectedOrgId = computed(() => this._state().selectedOrgId);
  readonly tokens = computed(() => this._state().tokens);
  /** Current-org roles (JWT `org_id` + memberships) or `user.roles`. Like React `getCurrentOrgRoles`. */
  readonly userRoles = computed(() => this._orgScopedRoles());
  readonly userPermissions = computed(() => this._state().user?.permissions ?? []);

  // ── Actions ────────────────────────────────────────────────────────────────

  /** Called after a successful login */
  login(accessToken: string, refreshToken: string): void {
    const orgId = decodeJWT(accessToken)?.org_id ?? null;
    this._update({ isAuthenticated: true, accessToken, refreshToken, selectedOrgId: orgId });
  }

  /** Update only the access token (after token refresh) */
  setAccessToken(accessToken: string): void {
    const orgId = decodeJWT(accessToken)?.org_id ?? null;
    this._update({ accessToken, selectedOrgId: orgId });
  }

  /** Store full token payload */
  setTokens(tokens: AuthTokens): void {
    const orgId = decodeJWT(tokens.accessToken)?.org_id ?? null;
    this._update({
      tokens,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      isAuthenticated: true,
      selectedOrgId: orgId,
    });
  }

  /** Set the authenticated user profile */
  setUser(user: User): void {
    this._update({ user });
  }

  /** Set selected organisation */
  setSelectedOrgId(orgId: string): void {
    this._update({ selectedOrgId: orgId });
  }

  /** Clear all auth state (logout) */
  logout(): void {
    this._set(defaultState);
  }

  /** Alias for logout — resets store to defaults */
  reset(): void {
    this.logout();
  }

  /** Check if user has a given role in the current org context */
  hasRole(role: string): boolean {
    return this.userRoles().includes(role);
  }

  /**
   * Whether the user may access a resource (mirrors `useIsProtected` with
   * `opt`: `any` = any role or any permission matches; `all` = all required match).
   */
  canAccess(
    requiredRoles: string[] = [],
    requiredPermissions: string[] = [],
    opt: 'all' | 'any' = 'any'
  ): boolean {
    const rList = this.userRoles();
    const perms = this._state().user?.permissions ?? [];

    if (opt === 'all') {
      const hasAllRoles =
        requiredRoles.length === 0 || requiredRoles.every((r) => rList.includes(r));
      const hasAllPerms =
        requiredPermissions.length === 0 || requiredPermissions.every((p) => perms.includes(p));
      return hasAllRoles && hasAllPerms;
    }

    const hasAnyRole = requiredRoles.length > 0 && requiredRoles.some((r) => rList.includes(r));
    const hasAnyPerm =
      requiredPermissions.length > 0 && requiredPermissions.some((p) => perms.includes(p));
    return hasAnyRole || hasAnyPerm;
  }

  /** Check if user has a given permission */
  hasPermission(permission: string): boolean {
    return this.userPermissions().includes(permission);
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private _orgScopedRoles(): string[] {
    const u = this._state().user;
    const token = this._state().accessToken;
    if (!u) return [];
    if (!u.memberships?.length || !token) return u.roles ?? [];
    const orgId = decodeJWT(token)?.org_id;
    if (!orgId) return u.roles ?? [];
    const membership = u.memberships.find((m) => m.orgId === orgId);
    if (membership?.roles?.length) return membership.roles;
    return u.roles ?? [];
  }

  private _update(partial: Partial<AuthState>): void {
    this._state.update((s) => {
      const next = { ...s, ...partial };
      this._saveToStorage(next);
      return next;
    });
  }

  private _set(state: AuthState): void {
    this._state.set(state);
    this._saveToStorage(state);
  }

  private _saveToStorage(state: AuthState): void {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage may not be available in SSR
    }
  }

  private _loadFromStorage(): AuthState {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) return { ...defaultState, ...JSON.parse(raw) };
    } catch {
      // ignore parse errors
    }
    return defaultState;
  }
}
