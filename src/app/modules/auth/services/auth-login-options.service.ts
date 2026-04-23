// ─── Auth login options (GetLoginOptions) ──────────────────────────────────────
// Mirrors: React `useGetLoginOptions` + `auth-layout` error handling for that query

import { Injectable, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './auth.service';
import { LoginOption } from '../types/login-options.types';

export type AuthLoginOptionsPhase = 'loading' | 'ready' | 'project_error' | 'server_error';

@Injectable({ providedIn: 'root' })
export class AuthLoginOptionsService {
  private readonly _auth = inject(AuthService);

  readonly phase = signal<AuthLoginOptionsPhase>('loading');
  readonly options = signal<LoginOption | null>(null);

  /** Call once when entering auth shell (layout). */
  load(): void {
    this.phase.set('loading');
    this._auth.getLoginOptions().subscribe({
      next: opt => {
        this.options.set(opt);
        this.phase.set('ready');
      },
      error: (err: HttpErrorResponse | unknown) => {
        const status = err instanceof HttpErrorResponse ? err.status : 0;
        if ([404, 403, 406, 424].includes(status)) {
          this.phase.set('project_error');
          return;
        }
        if (status >= 500 && status < 600) {
          this.phase.set('server_error');
          return;
        }
        const msg = String((err as { message?: string })?.message ?? '');
        const m = msg.match(/HTTP (\d{3})/);
        const fromMsg = m ? parseInt(m[1], 10) : 0;
        if ([404, 403, 406, 424].includes(fromMsg)) {
          this.phase.set('project_error');
        } else if (fromMsg >= 500 && fromMsg < 600) {
          this.phase.set('server_error');
        } else {
          this.phase.set('server_error');
        }
      },
    });
  }
}
