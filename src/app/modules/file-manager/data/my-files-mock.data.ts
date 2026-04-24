// ─── My Files mock dataset ─────────────────────────────────────────────────────
// Mirrors: react_Constract/src/modules/file-manager/utils/mock-data.ts (root + folder slices)

import { FileItem, FileItemKind } from '../../../models/file-manager.model';

function row(
  fileId: string,
  name: string,
  itemKind: FileItemKind,
  opts: { isShared?: boolean; lastModified?: string; sizeLabel?: string } = {},
): FileItem {
  const isFolder = itemKind === 'Folder';
  const last = opts.lastModified ?? '2025-02-01T12:00:00.000Z';
  return {
    fileId,
    name,
    type: isFolder ? 'folder' : 'file',
    itemKind,
    path: `/${name}`,
    isShared: opts.isShared ?? false,
    isDeleted: false,
    createdAt: last,
    lastModifiedAt: last,
    sizeLabel: opts.sizeLabel ?? '21.4 MB',
    size: isFolder ? undefined : 22_428_800,
    mimeType:
      itemKind === 'Image'
        ? 'image/jpeg'
        : itemKind === 'Audio'
          ? 'audio/mpeg'
          : itemKind === 'Video'
            ? 'video/mp4'
            : itemKind === 'File'
              ? 'application/octet-stream'
              : undefined,
  };
}

/** Root listing (matches React `ROOT_FILES_DEFINITIONS`). */
export const MY_FILES_ROOT_MOCK: FileItem[] = [
  row('1', 'Meeting Notes', 'Folder', { lastModified: '2025-02-01T08:00:00.000Z' }),
  row('2', 'Research Data', 'Folder', { lastModified: '2025-02-01T08:00:00.000Z' }),
  row('3', 'Client Documents', 'Folder', { isShared: true, lastModified: '2025-02-01T08:00:00.000Z' }),
  row('4', 'Project Files', 'Folder', { isShared: true, lastModified: '2025-02-01T08:00:00.000Z' }),
  row('5', 'Design Assets', 'Folder', { isShared: true, lastModified: '2025-02-01T08:00:00.000Z' }),
  row('6', 'Project Documents.doc', 'File', { isShared: true, lastModified: '2025-02-01T08:00:00.000Z' }),
  row('7', 'Image.jpg', 'Image', { lastModified: '2025-02-01T08:00:00.000Z' }),
  row('8', 'Chill Beats Mix.mp3', 'Audio', { isShared: true, lastModified: '2025-02-01T08:00:00.000Z' }),
  row('9', 'Adventure_Video.mp4', 'Video', { isShared: true, lastModified: '2025-02-01T08:00:00.000Z' }),
  row('10', 'Requirements.doc', 'File', { isShared: true, lastModified: '2025-02-01T08:00:00.000Z' }),
  row('11', 'Marketing Assets', 'Folder', {
    isShared: true,
    lastModified: '2025-02-01T08:00:00.000Z',
    sizeLabel: '45.2 MB',
  }),
  row('12', 'Budget Spreadsheet.xlsx', 'File', {
    isShared: true,
    lastModified: '2025-01-28T10:00:00.000Z',
    sizeLabel: '2.1 MB',
  }),
  row('13', 'Team Photo.png', 'Image', {
    isShared: true,
    lastModified: '2025-01-25T14:30:00.000Z',
    sizeLabel: '8.7 MB',
  }),
  row('14', 'Presentation.pptx', 'File', {
    isShared: true,
    lastModified: '2025-01-20T09:15:00.000Z',
    sizeLabel: '15.3 MB',
  }),
  row('15', 'Training Video.mp4', 'Video', {
    isShared: true,
    lastModified: '2025-01-15T16:45:00.000Z',
    sizeLabel: '125.8 MB',
  }),
];

/** Sample folder contents (subset of React `FOLDER_CONTENTS_DATA`). */
export const MY_FILES_FOLDER_MOCK: Record<string, FileItem[]> = {
  '1': [
    row('1-1', 'Weekly_Standup_Notes.doc', 'File', {
      isShared: true,
      lastModified: '2025-01-30T11:00:00.000Z',
      sizeLabel: '2.3 MB',
    }),
    row('1-2', 'Sprint_Planning.pdf', 'File', {
      isShared: true,
      lastModified: '2025-01-28T09:00:00.000Z',
      sizeLabel: '1.8 MB',
    }),
    row('1-3', 'Action_Items.xlsx', 'File', {
      lastModified: '2025-01-25T15:20:00.000Z',
      sizeLabel: '0.9 MB',
    }),
  ],
  '2': [
    row('2-1', 'Survey_Results.csv', 'File', {
      isShared: true,
      lastModified: '2025-02-02T08:00:00.000Z',
      sizeLabel: '5.4 MB',
    }),
    row('2-2', 'Analysis_Report.pdf', 'File', {
      isShared: true,
      lastModified: '2025-01-30T12:00:00.000Z',
      sizeLabel: '3.2 MB',
    }),
  ],
  '3': [
    row('3-1', 'Contract_Agreement.pdf', 'File', {
      isShared: true,
      lastModified: '2025-02-01T10:00:00.000Z',
      sizeLabel: '2.7 MB',
    }),
  ],
};
