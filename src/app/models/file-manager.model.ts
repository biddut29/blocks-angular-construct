// ─── File Manager Models ───────────────────────────────────────────────────────
// Mirrors: src/modules/file-manager/types/ in React project

export type FileType = 'file' | 'folder';
export type FileViewMode = 'grid' | 'list';

export interface FileItem {
  fileId: string;
  name: string;
  type: FileType;
  mimeType?: string;
  size?: number;
  parentId?: string;
  path: string;
  isShared?: boolean;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt?: string;
  sharedWith?: string[];
  thumbnailUrl?: string;
  downloadUrl?: string;
}

export interface FileFilter {
  parentId?: string;
  search?: string;
  type?: FileType;
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
