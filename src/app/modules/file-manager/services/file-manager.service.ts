// ─── File Manager Service ──────────────────────────────────────────────────────
// Mirrors: react_Constract/src/modules/file-manager/hooks/use-mock-files-query + mock-data

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  FileItem,
  FileItemKind,
  FileFilter,
  CreateFolderInput,
  UploadFileInput,
} from '../../../models/file-manager.model';
import { PaginatedResponse } from '../../../types/index';
import { MY_FILES_FOLDER_MOCK, MY_FILES_ROOT_MOCK } from '../data/my-files-mock.data';

@Injectable({ providedIn: 'root' })
export class FileManagerService {
  /** In-memory edits (upload / new folder) keyed by parent folder id or `__root__`. */
  private readonly _localByParent = new Map<string, FileItem[]>();

  // ── Get Files ──────────────────────────────────────────────────────────────
  getFiles(filter: Partial<FileFilter> = {}): Observable<PaginatedResponse<FileItem>> {
    const pageNo = filter.pageNo ?? 1;
    const pageSize = filter.pageSize ?? 10;
    const parentId = filter.parentId;

    const base = parentId
      ? [...(MY_FILES_FOLDER_MOCK[parentId] ?? []), ...(this._localByParent.get(parentId) ?? [])]
      : [...MY_FILES_ROOT_MOCK, ...(this._localByParent.get('__root__') ?? [])];

    let list = [...base];

    const q = (filter.search ?? '').trim().toLowerCase();
    if (q) {
      list = list.filter((f) => f.name.toLowerCase().includes(q));
    }

    if (filter.itemKind) {
      list = list.filter((f) => f.itemKind === filter.itemKind);
    }

    if (filter.dateFrom || filter.dateTo) {
      list = list.filter((f) => {
        const t = new Date(f.lastModifiedAt ?? f.createdAt).getTime();
        if (filter.dateFrom) {
          const from = new Date(filter.dateFrom + 'T00:00:00').getTime();
          if (t < from) return false;
        }
        if (filter.dateTo) {
          const to = new Date(filter.dateTo + 'T23:59:59.999').getTime();
          if (t > to) return false;
        }
        return true;
      });
    }

    const dir = filter.sortLastModified ?? 'desc';
    list.sort((a, b) => {
      const ta = new Date(a.lastModifiedAt ?? a.createdAt).getTime();
      const tb = new Date(b.lastModifiedAt ?? b.createdAt).getTime();
      return dir === 'asc' ? ta - tb : tb - ta;
    });

    const totalCount = list.length;
    const start = (pageNo - 1) * pageSize;
    const items = list.slice(start, start + pageSize);
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    return of({
      items,
      totalCount,
      pageNo,
      pageSize,
      totalPages,
    }).pipe(delay(120));
  }

  // ── Create Folder ──────────────────────────────────────────────────────────
  createFolder(input: CreateFolderInput): Observable<FileItem> {
    const folder: FileItem = {
      fileId: `f-${Date.now()}`,
      name: input.name,
      type: 'folder',
      itemKind: 'Folder',
      path: `/${input.name.toLowerCase().replace(/\s+/g, '-')}`,
      parentId: input.parentId,
      isShared: false,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      lastModifiedAt: new Date().toISOString(),
      sizeLabel: '0 B',
    };
    const key = input.parentId ?? '__root__';
    const cur = this._localByParent.get(key) ?? [];
    this._localByParent.set(key, [folder, ...cur]);
    return of(folder);
  }

  // ── Upload File ────────────────────────────────────────────────────────────
  uploadFile(input: UploadFileInput): Observable<FileItem> {
    const kind = this._inferKind(input.file.name, input.file.type);
    const fileItem: FileItem = {
      fileId: `f-${Date.now()}`,
      name: input.file.name,
      type: 'file',
      itemKind: kind,
      mimeType: input.file.type || 'application/octet-stream',
      size: input.file.size,
      sizeLabel: this._formatSize(input.file.size),
      path: `/${input.file.name}`,
      parentId: input.parentId,
      isShared: false,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      lastModifiedAt: new Date().toISOString(),
    };
    const key = input.parentId ?? '__root__';
    const cur = this._localByParent.get(key) ?? [];
    this._localByParent.set(key, [fileItem, ...cur]);
    return of(fileItem);
  }

  // ── Delete File ────────────────────────────────────────────────────────────
  deleteFile(id: string): Observable<void> {
    for (const [k, arr] of this._localByParent.entries()) {
      const next = arr.filter((f) => f.fileId !== id);
      if (next.length !== arr.length) {
        this._localByParent.set(k, next);
        break;
      }
    }
    return of(void 0);
  }

  // ── Restore File ───────────────────────────────────────────────────────────
  restoreFile(_id: string): Observable<void> {
    return of(void 0);
  }

  private _inferKind(fileName: string, mime: string): FileItemKind {
    const lower = fileName.toLowerCase();
    if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(lower)) return 'Image';
    if (/\.(mp3|wav|ogg|m4a)$/i.test(lower)) return 'Audio';
    if (/\.(mp4|mov|webm|mkv)$/i.test(lower)) return 'Video';
    if (mime.startsWith('image/')) return 'Image';
    if (mime.startsWith('audio/')) return 'Audio';
    if (mime.startsWith('video/')) return 'Video';
    return 'File';
  }

  private _formatSize(bytes: number): string {
    if (!bytes || bytes < 1024) return `${bytes || 0} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }
}
