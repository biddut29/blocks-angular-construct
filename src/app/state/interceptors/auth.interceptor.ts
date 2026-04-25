// ─── Auth HTTP Interceptor ─────────────────────────────────────────────────────
// Mirrors: react_Constract/src/lib/https.ts (headers + handleAuthError refresh)

import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
  HttpClient,
  HttpBackend,
  HttpHeaders,
  HttpEvent,
} from '@angular/common/http';
import { throwError, BehaviorSubject, Observable } from 'rxjs';
import { catchError, filter, take, switchMap, finalize } from 'rxjs/operators';
import { AuthStore } from '@state/store/auth/auth.store';
import { environment } from '@environments/environment';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

function isLocalHost(): boolean {
  if (typeof window === 'undefined') return false;
  const h = window.location.hostname;
  return h === 'localhost' || h === '127.0.0.1';
}

function withCreds(): boolean {
  return !isLocalHost();
}

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authStore = inject(AuthStore);
  const httpBackend = inject(HttpBackend);
  const rawHttp = new HttpClient(httpBackend);

  const token = authStore.accessToken();
  let headers = req.headers.set('x-blocks-key', environment.xBlocksKey);
  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  const authReq = req.clone({ headers });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (
        error.status === 401 &&
        authReq.headers.has('Authorization') &&
        authStore.refreshToken()
      ) {
        return handle401Error(authReq, next, authStore, rawHttp);
      }
      return throwError(() => error);
    })
  );
};

function handle401Error(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authStore: AuthStore,
  rawHttp: HttpClient
): Observable<HttpEvent<unknown>> {
  if (isRefreshing) {
    return refreshTokenSubject.pipe(
      filter((t) => t !== null),
      take(1),
      switchMap((newAccess) =>
        next(
          req.clone({
            setHeaders: {
              Authorization: `Bearer ${newAccess}`,
              'x-blocks-key': environment.xBlocksKey,
            },
          })
        )
      )
    );
  }

  isRefreshing = true;
  refreshTokenSubject.next(null);

  const refreshToken = authStore.refreshToken();
  if (!refreshToken) {
    isRefreshing = false;
    authStore.logout();
    return throwError(() => new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' }));
  }

  const base = environment.apiBaseUrl.replace(/\/+$/, '');
  const url = `${base}/idp/v1/Authentication/Token`;
  const body = new URLSearchParams();
  body.set('grant_type', 'refresh_token');
  body.set('refresh_token', refreshToken);

  const orgId =
    typeof window !== 'undefined' ? window.localStorage.getItem('selected-org-id') : null;
  if (orgId) {
    body.set('org_id', orgId);
  }

  return rawHttp
    .post<{ access_token: string; refresh_token?: string }>(url, body, {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-blocks-key': environment.xBlocksKey,
      }),
      withCredentials: withCreds(),
    })
    .pipe(
      switchMap((res) => {
        if (res.refresh_token) {
          authStore.setTokens({
            accessToken: res.access_token,
            refreshToken: res.refresh_token,
          });
        } else {
          authStore.setAccessToken(res.access_token);
        }
        refreshTokenSubject.next(res.access_token);
        return next(
          req.clone({
            setHeaders: {
              Authorization: `Bearer ${res.access_token}`,
              'x-blocks-key': environment.xBlocksKey,
            },
          })
        );
      }),
      catchError((err) => {
        authStore.logout();
        refreshTokenSubject.next(null);
        return throwError(() => err);
      }),
      finalize(() => {
        isRefreshing = false;
      })
    );
}
