// ─── Auth Service ──────────────────────────────────────────────────────────────
// Mirrors: react_Constract/src/modules/auth/services/auth.service.ts

import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { HttpService } from '../../../lib/http.service';
import { AuthStore } from '../../../state/store/auth/auth.store';
import {
  LoginRequest,
  SignupRequest,
  AuthTokens,
  User,
  ResetPasswordRequest,
} from '../../../types/index';
import { AUTH_ENDPOINTS } from '../../../constant/auth.constant';
import { environment } from '@environments/environment';
import { LoginOption, SignupSettings } from '../types/login-options.types';

/** Token / sign-in responses use snake_case from IdP (same as React `SignInResponse`). */
interface SignInTokenResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  enable_mfa?: boolean;
  mfaId?: string;
  mfaType?: number;
  error?: string;
  error_description?: string;
}

interface GetAccountWrapper {
  data: User & {
    memberships?: Array<{
      organizationId?: string;
      orgId?: string;
      orgName?: string;
      roles?: string[];
    }>;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _http = inject(HttpService);
  private readonly _authStore = inject(AuthStore);

  private _savedOrgId(): string | null {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem('selected-org-id');
  }

  private _passwordTokenBody(username: string, password: string): URLSearchParams {
    const body = new URLSearchParams();
    body.set('grant_type', 'password');
    body.set('username', username);
    body.set('password', password);
    const orgId = this._savedOrgId();
    if (orgId) {
      body.set('org_id', orgId);
    }
    return body;
  }

  /** Password grant — same contract as React `signin` / `signinByEmail` token POST */
  login(body: LoginRequest): Observable<AuthTokens> {
    const form = this._passwordTokenBody(body.email, body.password);
    return this._http
      .post<SignInTokenResponse>(AUTH_ENDPOINTS.token, form, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        withCredentials: true,
      })
      .pipe(
        switchMap(res => {
          if (res.enable_mfa) {
            return throwError(
              () =>
                new Error(
                  res.error_description ??
                    'Multi-factor authentication is required for this account.',
                ),
            );
          }
          const access = res.access_token;
          const refresh = res.refresh_token;
          if (!access || !refresh) {
            return throwError(
              () => new Error(res.error_description ?? res.error ?? 'Invalid sign-in response.'),
            );
          }
          return of({
            accessToken: access,
            refreshToken: refresh,
            expiresIn: res.expires_in,
            tokenType: res.token_type,
          } satisfies AuthTokens);
        }),
        tap(tokens => this._authStore.setTokens(tokens)),
      );
  }

  /** React `signupByEmail` — only `email` + `captchaCode` are sent to the API */
  signup(body: SignupRequest): Observable<{ itemId: string | null; isSuccess: boolean }> {
    const payload = {
      email: body.email,
      captchaCode: body.captchaCode ?? '',
    };
    return this._http.post(AUTH_ENDPOINTS.signup, JSON.stringify(payload));
  }

  /** React `forgotPassword` → `/idp/v1/Iam/Recover` */
  forgotPassword(email: string): Observable<{ isSuccess: boolean; errors?: unknown }> {
    const payload = {
      email,
      mailPurpose: 'RecoverAccount',
      projectKey: environment.xBlocksKey,
    };
    return this._http.post(AUTH_ENDPOINTS.recover, JSON.stringify(payload));
  }

  /** React `resetPassword` → `/idp/v1/Iam/ResetPassword` */
  resetPassword(body: ResetPasswordRequest): Observable<unknown> {
    const payload = {
      code: body.code,
      password: body.password,
      logoutFromAllDevices: true,
      ProjectKey: environment.xBlocksKey,
    };
    return this._http.post(AUTH_ENDPOINTS.resetPassword, JSON.stringify(payload));
  }

  /** React `validateActivationCode` — used by verify-otp style flows when the value is an activation code */
  verifyOtp(body: { email: string; otp: string }): Observable<unknown> {
    return this._http.post(
      AUTH_ENDPOINTS.validateActivationCode,
      JSON.stringify({
        activationCode: body.otp,
        projectKey: environment.xBlocksKey,
      }),
    );
  }

  /** React `getAccount` — `/idp/v1/Iam/GetAccount` */
  getProfile(): Observable<User> {
    return this._http.get<GetAccountWrapper>(AUTH_ENDPOINTS.getAccount).pipe(
      map(w => this._mapAccountUser(w?.data)),
    );
  }

  /**
   * React `signout` — POST `/idp/v1/Authentication/Logout` with refresh token,
   * then clear local session (React clears storage before calling; we clear after success or on error).
   */
  signOut(): Observable<{ isSuccess: boolean }> {
    const refreshToken = this._authStore.refreshToken();
    return this._http
      .post<{ isSuccess: boolean }>(
        AUTH_ENDPOINTS.logout,
        JSON.stringify({ refreshToken }),
      )
      .pipe(
        tap(() => this._authStore.logout()),
        catchError(() => {
          this._authStore.logout();
          return of({ isSuccess: true });
        }),
      );
  }

  /** React `logoutAll` */
  logoutAll(): Observable<unknown> {
    return this._http.post(AUTH_ENDPOINTS.logoutAll, '');
  }

  /** Local-only logout (no IdP call) */
  logout(): void {
    this._authStore.logout();
  }

  /**
   * React `getLoginOption` — `GET /idp/v1/Authentication/GetLoginOptions`
   * (fetch with `x-blocks-key` + credentials; Angular uses `HttpService` + interceptor).
   */
  getLoginOptions(): Observable<LoginOption> {
    return this._http.get<LoginOption>(AUTH_ENDPOINTS.loginOptions, { withCredentials: true });
  }

  /** React `getSignupSettings` — `GET .../GetSignUpSetting?ProjectKey=` */
  getSignupSettings(): Observable<SignupSettings> {
    const key = environment.xBlocksKey;
    const path = `${AUTH_ENDPOINTS.getSignUpSetting}?ProjectKey=${encodeURIComponent(key)}`;
    return this._http.get<SignupSettings>(path);
  }

  private _mapAccountUser(
    data: GetAccountWrapper['data'] | null | undefined,
  ): User {
    if (!data) {
      throw new Error('Empty account response');
    }
    const raw = data as User & {
      memberships?: Array<{
        organizationId?: string;
        orgId?: string;
        orgName?: string;
        roles?: string[];
      }>;
    };
    const memberships = raw.memberships?.map(m => {
      const row = m as { organizationId?: string; orgId?: string; orgName?: string; roles?: string[] };
      return {
        orgId: row.organizationId ?? row.orgId ?? '',
        orgName: row.orgName ?? '',
        roles: row.roles ?? [],
      };
    });
    return { ...raw, memberships };
  }
}
