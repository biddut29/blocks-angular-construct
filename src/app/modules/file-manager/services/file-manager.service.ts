// ─── File Manager Service ──────────────────────────────────────────────────────
// Mirrors: src/modules/file-manager/services/ in React project
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { GraphQLService } from '../../../lib/graphql.service';
import {
  FileItem,
  FileFilter,
  CreateFolderInput,
  UploadFileInput,
} from '../../../models/file-manager.model';
import { PaginatedResponse } from '../../../types/index';

@Injectable({ providedIn: 'root' })
export class FileManagerService {
  private readonly _graphql = inject(GraphQLService);

  // ── Get Files ──────────────────────────────────────────────────────────────
  getFiles(filter: Partial<FileFilter> = { pageNo: 1, pageSize: 20 }): Observable<PaginatedResponse<FileItem>> {
    // Mock data — replace with actual GraphQL query
    const items: FileItem[] = [
      {
        fileId: 'f-001',
        name: 'Documents',
        type: 'folder',
        path: '/documents',
        isShared: false,
        isDeleted: false,
        createdAt: '2024-05-01T08:00:00Z',
      },
      {
        fileId: 'f-002',
        name: 'Images',
        type: 'folder',
        path: '/images',
        isShared: true,
        isDeleted: false,
        createdAt: '2024-05-02T08:00:00Z',
      },
      {
        fileId: 'f-003',
        name: 'project-report.pdf',
        type: 'file',
        mimeType: 'application/pdf',
        size: 204800,
        path: '/project-report.pdf',
        isShared: false,
        isDeleted: false,
        createdAt: '2024-05-10T10:00:00Z',
      },
      {
        fileId: 'f-004',
        name: 'design-mockup.png',
        type: 'file',
        mimeType: 'image/png',
        size: 512000,
        path: '/design-mockup.png',
        isShared: true,
        isDeleted: false,
        thumbnailUrl: 'https://via.placeholder.com/150',
        createdAt: '2024-05-12T14:00:00Z',
      },
      {
        fileId: 'f-005',
        name: 'data-export.xlsx',
        type: 'file',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        size: 102400,
        path: '/data-export.xlsx',
        isShared: false,
        isDeleted: false,
        createdAt: '2024-06-01T09:00:00Z',
      },
    ];

    return of({
      items,
      totalCount: items.length,
      pageNo: filter.pageNo ?? 1,
      pageSize: filter.pageSize ?? 20,
      totalPages: 1,
    });
  }

  // ── Create Folder ──────────────────────────────────────────────────────────
  createFolder(input: CreateFolderInput): Observable<FileItem> {
    const folder: FileItem = {
      fileId: `f-${Date.now()}`,
      name: input.name,
      type: 'folder',
      path: `/${input.name.toLowerCase().replace(/\s+/g, '-')}`,
      parentId: input.parentId,
      isShared: false,
      isDeleted: false,
      createdAt: new Date().toISOString(),
    };
    return of(folder);
  }

  // ── Upload File ────────────────────────────────────────────────────────────
  uploadFile(input: UploadFileInput): Observable<FileItem> {
    const fileItem: FileItem = {
      fileId: `f-${Date.now()}`,
      name: input.file.name,
      type: 'file',
      mimeType: input.file.type,
      size: input.file.size,
      path: `/${input.file.name}`,
      parentId: input.parentId,
      isShared: false,
      isDeleted: false,
      createdAt: new Date().toISOString(),
    };
    return of(fileItem);
  }

  // ── Delete File ────────────────────────────────────────────────────────────
  deleteFile(id: string): Observable<void> {
    return of(void 0);
  }

  // ── Restore File ───────────────────────────────────────────────────────────
  restoreFile(id: string): Observable<void> {
    return of(void 0);
  }
}
