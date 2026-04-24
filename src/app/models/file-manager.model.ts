// ─── File Manager Models ───────────────────────────────────────────────────────
// Mirrors: src/modules/file-manager/types/ in React project

export type FileType = 'file' | 'folder';
export type FileViewMode = 'grid' | 'list';

/** React `FileType` — table "Type" column (Folder / File / Image / Audio / Video). */
export type FileItemKind = 'Folder' | 'File' | 'Image' | 'Audio' | 'Video';

export interface FileItem {
  fileId: string;
  name: string;
  type: FileType;
  /** Display category for list/grid (React `fileType`). */
  itemKind: FileItemKind;
  mimeType?: string;
  size?: number;
  /** Human-readable size string (React mock uses strings like "21.4 MB"). */
  sizeLabel?: string;
  parentId?: string;
  path: string;
  isShared?: boolean;
  isDeleted?: boolean;
  createdAt: string;
  /** Prefer for sorting / last-modified column when set. */
  lastModifiedAt?: string;
  updatedAt?: string;
  sharedWith?: string[];
  thumbnailUrl?: string;
  downloadUrl?: string;
}

export interface FileFilter {
  parentId?: string;
  search?: string;
  type?: FileType;
  /** Filter by React-style item kind; omit or empty = all. */
  itemKind?: FileItemKind | '';
  dateFrom?: string;
  dateTo?: string;
  sortLastModified?: 'asc' | 'desc';
  pageNo: number;
  pageSize: number;
}

export interface CreateFolderInput {
  name: string;
  parentId?: string;
}

export interface UploadFileInput {
  file: File;
  parentId?: string;
}
