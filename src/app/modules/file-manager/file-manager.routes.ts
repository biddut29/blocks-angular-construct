// ─── File Manager Routes ───────────────────────────────────────────────────────
import { Routes } from '@angular/router';

export const FILE_MANAGER_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'my-files' },
  {
    path: 'my-files',
    loadComponent: () =>
      import('./pages/my-files/my-files.component').then(m => m.MyFilesComponent),
  },
  {
    path: 'my-files/:folderId',
    loadComponent: () =>
      import('./pages/my-files/my-files.component').then(m => m.MyFilesComponent),
  },
  {
    path: 'shared-files',
    loadComponent: () =>
      import('./pages/shared-files/shared-files.component').then(m => m.SharedFilesComponent),
  },
  {
    path: 'shared-files/:folderId',
    loadComponent: () =>
      import('./pages/shared-files/shared-files.component').then(m => m.SharedFilesComponent),
  },
  {
    path: 'trash',
    loadComponent: () =>
      import('./pages/trash/trash.component').then(m => m.TrashComponent),
  },
];
