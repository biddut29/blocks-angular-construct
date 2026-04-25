// ─── Profile Service ───────────────────────────────────────────────────────────
// Mirrors: src/modules/profile/services/ in React project
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { GraphQLService } from '../../../lib/graphql.service';
import { User } from '../../../types/index';
import { AuthService } from '../../auth/services/auth.service';

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profileImageUrl?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly _graphql = inject(GraphQLService);
  private readonly _auth = inject(AuthService);

  // ── Get Profile ────────────────────────────────────────────────────────────
  /** Same as React `getAccount` → `GET /idp/v1/Iam/GetAccount` */
  getProfile(): Observable<User> {
    return this._auth.getProfile();
  }

  // ── Update Profile ─────────────────────────────────────────────────────────
  updateProfile(input: UpdateProfileInput): Observable<User> {
    return of({
      itemId: 'u-001',
      firstName: input.firstName ?? 'Alice',
      lastName: input.lastName ?? 'Johnson',
      email: 'alice@example.com',
      userName: 'alice.johnson',
      phoneNumber: input.phoneNumber ?? '+1-555-0101',
      roles: ['Admin', 'User'],
      permissions: ['read', 'write', 'delete'],
      active: true,
      isVarified: true,
      profileImageUrl: input.profileImageUrl ?? '',
      isMfaVerified: true,
      mfaEnabled: true,
    });
  }

  // ── Change Password ────────────────────────────────────────────────────────
  changePassword(_input: ChangePasswordInput): Observable<void> {
    // Mock — replace with actual HTTP/GraphQL call
    return of(void 0);
  }

  // ── Toggle MFA ─────────────────────────────────────────────────────────────
  toggleMfa(_enabled: boolean): Observable<void> {
    return of(void 0);
  }

  // ── Get Active Sessions ────────────────────────────────────────────────────
  getActiveSessions(): Observable<
    {
      sessionId: string;
      device: string;
      location: string;
      lastActive: string;
      isCurrent: boolean;
    }[]
  > {
    return of([
      {
        sessionId: 's-001',
        device: 'Chrome on Windows',
        location: 'New York, US',
        lastActive: new Date().toISOString(),
        isCurrent: true,
      },
      {
        sessionId: 's-002',
        device: 'Safari on iPhone',
        location: 'New York, US',
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        isCurrent: false,
      },
      {
        sessionId: 's-003',
        device: 'Firefox on Mac',
        location: 'San Francisco, US',
        lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        isCurrent: false,
      },
    ]);
  }
}
