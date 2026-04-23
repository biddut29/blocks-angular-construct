// ─── HTTP Service ──────────────────────────────────────────────────────────────
// Mirrors: src/lib/https.ts in React project
// Uses Angular HttpClient instead of custom fetch wrapper

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '@environments/environment';

export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  withCredentials?: boolean;
}

function isLocalHost(): boolean {
  if (typeof window === 'undefined') return false;
  const h = window.location.hostname;
  return h === 'localhost' || h === '127.0.0.1';
}

@Injectable({ providedIn: 'root' })
export class HttpService {
  private readonly _http = inject(HttpClient);

  // ── Public Methods ─────────────────────────────────────────────────────────

  get<T>(url: string, options?: RequestOptions): Observable<T> {
    return this._http
      .get<T>(this._buildUrl(url), this._buildOptions(options))
      .pipe(catchError(err => this._handleError(err)));
  }

  post<T>(url: string, body?: unknown, options?: RequestOptions): Observable<T> {
    return this._http
      .post<T>(this._buildUrl(url), body, this._buildOptions(options))
      .pipe(catchError(err => this._handleError(err)));
  }

  put<T>(url: string, body?: unknown, options?: RequestOptions): Observable<T> {
    return this._http
      .put<T>(this._buildUrl(url), body, this._buildOptions(options))
      .pipe(catchError(err => this._handleError(err)));
  }

  patch<T>(url: string, body?: unknown, options?: RequestOptions): Observable<T> {
    return this._http
      .patch<T>(this._buildUrl(url), body, this._buildOptions(options))
      .pipe(catchError(err => this._handleError(err)));
  }

  delete<T>(url: string, options?: RequestOptions): Observable<T> {
    return this._http
      .delete<T>(this._buildUrl(url), this._buildOptions(options))
      .pipe(catchError(err => this._handleError(err)));
  }

  // ── Private Helpers ────────────────────────────────────────────────────────

  private _buildUrl(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const base = environment.apiBaseUrl.replace(/\/+$/, '');
    const suffix = path.startsWith('/') ? path : `/${path}`;
    return `${base}${suffix}`;
  }

  private _buildOptions(options?: RequestOptions): {
    headers: HttpHeaders;
    params?: HttpParams;
    withCredentials?: boolean;
  } {
    // Authorization and `x-blocks-key` are applied in `authInterceptor` (matches React `https.ts`).
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    });

    let params: HttpParams | undefined;
    if (options?.params) {
      params = new HttpParams();
      for (const [key, val] of Object.entries(options.params)) {
        params = params.set(key, String(val));
      }
    }

    return {
      headers,
      ...(params ? { params } : {}),
      // React `https.ts`: `credentials: 'include'` when not on localhost
      withCredentials: options?.withCredentials ?? !isLocalHost(),
    };
  }

  private _handleError(error: { status: number; error: unknown }): Observable<never> {
    return throwError(() => error);
  }
}
