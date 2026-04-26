import { Injectable, inject } from '@angular/core';
import { HttpService } from './http.service';
import type {
  GetPreSignedUrlForUploadPayload,
  GetPreSignedUrlForUploadResponse,
} from './types/storage.types';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly _http = inject(HttpService);

  getPreSignedUrlForUpload(
    payload: GetPreSignedUrlForUploadPayload
  ): Observable<GetPreSignedUrlForUploadResponse> {
    return this._http.post<GetPreSignedUrlForUploadResponse>(
      '/uds/v1/Files/GetPreSignedUrlForUpload',
      payload
    );
  }
}
