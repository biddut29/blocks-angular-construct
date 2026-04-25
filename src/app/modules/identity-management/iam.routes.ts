// ─── IAM Routes ────────────────────────────────────────────────────────────────
import { Routes } from '@angular/router';

export const IAM_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/users-table/users-table.component').then((m) => m.UsersTableComponent),
  },
];
