// ─── IAM Service ──────────────────────────────────────────────────────────────
// Mirrors: react_Constract/src/modules/iam/services/user-service.ts

import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpService } from '../../../lib/http.service';
import {
  IamUser,
  CreateUserInput,
  UpdateUserInput,
  GetUsersPayload,
} from '../../../models/iam.model';
import { PaginatedResponse } from '../../../types/index';

const GET_USERS_PATH = '/idp/v1/Iam/GetUsers';

function mapApiRow(row: Record<string, unknown>): IamUser {
  const itemId = String(row['itemId'] ?? row['ItemId'] ?? '');
  const firstName = (row['firstName'] as string) ?? '';
  const lastName = (row['lastName'] as string | null) ?? '';
  const roles = (row['roles'] as string[]) ?? [];
  const permissions = (row['permissions'] as string[]) ?? [];
  const active = Boolean(row['active']);
  return {
    ItemId: itemId,
    firstName,
    lastName,
    email: (row['email'] as string) ?? '',
    userName: (row['userName'] as string) ?? '',
    phoneNumber: (row['phoneNumber'] as string | null) ?? undefined,
    roles,
    permissions,
    active,
    isVarified: Boolean(row['isVarified']),
    profileImageUrl: (row['profileImageUrl'] as string | null) ?? undefined,
    isMfaVerified: Boolean(row['isMfaVerified']),
    mfaEnabled: Boolean(row['mfaEnabled']),
    status: active ? 'ACTIVE' : 'INACTIVE',
    createdDate: (row['createdDate'] as string) ?? undefined,
    lastLoggedInTime: (row['lastLoggedInTime'] as string) ?? undefined,
    createdAt: (row['createdDate'] as string) ?? undefined,
  };
}

@Injectable({ providedIn: 'root' })
export class IamService {
  private readonly _http = inject(HttpService);

  /**
   * Same contract as React `getUsers` → `POST /idp/v1/Iam/GetUsers`
   * Response: `{ data: IamData[], totalCount: number }`
   */
  getUsers(payload: GetUsersPayload): Observable<PaginatedResponse<IamUser>> {
    const body = {
      page: payload.page,
      pageSize: payload.pageSize,
      filter: {
        email: payload.filter?.email ?? '',
        name: payload.filter?.name ?? '',
      },
    };

    return this._http
      .post<{ data: Record<string, unknown>[]; totalCount: number }>(
        GET_USERS_PATH,
        JSON.stringify(body),
      )
      .pipe(
        map(res => {
          const rows = res.data ?? [];
          const totalCount = res.totalCount ?? 0;
          const pageSize = payload.pageSize;
          return {
            items: rows.map(r => mapApiRow(r)),
            totalCount,
            pageNo: payload.page + 1,
            pageSize,
            totalPages: Math.max(1, Math.ceil(totalCount / pageSize) || 1),
          } satisfies PaginatedResponse<IamUser>;
        }),
      );
  }

  createUser(input: CreateUserInput): Observable<IamUser> {
    const user: IamUser = {
      ItemId: `u-${Date.now()}`,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      userName: `${input.firstName.toLowerCase()}.${input.lastName.toLowerCase()}`,
      phoneNumber: input.phoneNumber,
      roles: input.roles,
      permissions: input.permissions ?? ['read'],
      active: true,
      isVarified: false,
      isMfaVerified: false,
      mfaEnabled: false,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    return of(user);
  }

  updateUser(id: string, input: UpdateUserInput): Observable<IamUser> {
    const updated: IamUser = {
      ItemId: id,
      firstName: input.firstName ?? '',
      lastName: input.lastName ?? '',
      email: input.email ?? '',
      userName: '',
      roles: input.roles ?? [],
      permissions: input.permissions ?? [],
      active: input.active ?? true,
      isVarified: true,
      isMfaVerified: false,
      mfaEnabled: false,
    };
    return of(updated);
  }

  deleteUser(id: string): Observable<void> {
    return of(void 0);
  }
}
