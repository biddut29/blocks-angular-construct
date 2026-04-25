// ─── SSO Service ───────────────────────────────────────────────────────────────
// Mirrors: react_Constract/src/modules/auth/services/sso.service.ts (GetSocialLogInEndPoint)

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../../lib/http.service';
import { AUTH_ENDPOINTS } from '../../../constant/auth.constant';

export interface SocialLoginEndpointPayload {
  provider: string;
  audience: string;
  sendAsResponse: boolean;
  nextUrl?: string;
}

export interface SocialLoginEndpointResponse {
  providerUrl?: string;
  error?: string;
  requiresMfa?: boolean;
  mfaToken?: string;
  mfaType?: number;
  email?: string;
  status?: number;
  isAResponse?: boolean;
}

@Injectable({ providedIn: 'root' })
export class SsoService {
  private readonly _http = inject(HttpService);

  /** React `SSOservice.getSocialLoginEndpoint` */
  getSocialLoginEndpoint(
    payload: SocialLoginEndpointPayload
  ): Observable<SocialLoginEndpointResponse> {
    return this._http.post<SocialLoginEndpointResponse>(
      AUTH_ENDPOINTS.socialLoginEndpoint,
      JSON.stringify(payload),
      { withCredentials: true }
    );
  }
}
