import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from './http.service';
import { environment } from '@environments/environment';

export interface GetOrganizationsParams {
  ProjectKey?: string;
  Page?: number;
  PageSize?: number;
  'Sort.Property'?: string;
  'Sort.IsDescending'?: boolean;
  'Filter.Name'?: string;
  'Filter.IsEnable'?: boolean;
  'Filter.ItemId'?: string;
  'Filter.CreatedDate'?: string;
  'Filter.LastUpdatedDate'?: string;
  'Filter.CreatedBy'?: string;
  'Filter.Language'?: string;
  'Filter.LastUpdatedBy'?: string;
  'Filter.OrganizationIds'?: string[];
  'Filter.Tags'?: string[];
}

export interface Organization {
  itemId: string;
  createdDate: string;
  lastUpdatedDate: string;
  createdBy: string;
  language: string;
  lastUpdatedBy: string;
  organizationIds: string[];
  tags: string[];
  name: string;
  isEnable: boolean;
}

export interface GetOrganizationsResponse {
  errors?: Record<string, string>;
  isSuccess: boolean;
  organizations: Organization[];
  totalCount: number;
}

@Injectable({ providedIn: 'root' })
export class OrganizationsService {
  private readonly _http = inject(HttpService);

  /**
   * Mirrors React: `GET /idp/v1/Iam/GetOrganizations?ProjectKey=...&Page=...`
   * Used by Org switcher and membership filtering.
   */
  getOrganizations(params?: GetOrganizationsParams): Observable<GetOrganizationsResponse> {
    const merged: GetOrganizationsParams = {
      ProjectKey: environment.xBlocksKey,
      Page: 0,
      PageSize: 50,
      ...(params ?? {}),
    };

    const search = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) {
      if (v == null) continue;
      if (Array.isArray(v)) {
        for (const item of v) search.append(k, String(item));
      } else {
        search.append(k, String(v));
      }
    }

    const qs = search.toString();
    const url = `/idp/v1/Iam/GetOrganizations${qs ? `?${qs}` : ''}`;
    return this._http.get<GetOrganizationsResponse>(url);
  }
}
