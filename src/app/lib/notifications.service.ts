import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from './http.service';

export interface NotificationItem {
  id: string;
  correlationId: string;
  payload: unknown;
  denormalizedPayload: string;
  createdTime: string;
  readByUserIds: string[];
  readByRoles: string[];
  isRead: boolean;
}

export interface GetNotificationsResponse {
  notifications: NotificationItem[];
  unReadNotificationsCount: number;
  totalNotificationsCount: number;
}

export interface GetNotificationsParams {
  IsUnreadOnly?: boolean;
  UnReadNotificationCount?: number;
  Page?: number;
  PageSize?: number;
  SortProperty?: string;
  SortIsDescending?: boolean;
  Filter?: string;
}

export interface MarkAsReadResponse {
  errors?: Record<string, string>;
  isSuccess: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly _http = inject(HttpService);

  /**
   * Mirrors React:
   * - `GET /communication/v1/Notifier/GetNotifications?...`
   */
  getNotifications(params: GetNotificationsParams): Observable<GetNotificationsResponse> {
    const search = new URLSearchParams();
    for (const [k, v] of Object.entries(params ?? {})) {
      if (v == null) continue;
      search.append(k, String(v));
    }
    const qs = search.toString();
    return this._http.get<GetNotificationsResponse>(
      `/communication/v1/Notifier/GetNotifications${qs ? `?${qs}` : ''}`
    );
  }

  /** Mirrors React: POST `/communication/v1/Notifier/MarkNotificationAsRead` */
  markNotificationAsRead(id: string): Observable<MarkAsReadResponse> {
    return this._http.post<MarkAsReadResponse>(
      '/communication/v1/Notifier/MarkNotificationAsRead',
      JSON.stringify({ id })
    );
  }

  /** Mirrors React: POST `/communication/v1/Notifier/MarkAllNotificationAsRead` */
  markAllAsRead(): Observable<MarkAsReadResponse> {
    return this._http.post<MarkAsReadResponse>(
      '/communication/v1/Notifier/MarkAllNotificationAsRead',
      JSON.stringify({})
    );
  }
}
