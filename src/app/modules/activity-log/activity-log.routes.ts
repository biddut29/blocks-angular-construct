// ─── Activity Log Routes ───────────────────────────────────────────────────────
import { Routes } from '@angular/router';

export const ACTIVITY_LOG_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/activity-log/activity-log.component').then(m => m.ActivityLogComponent),
  },
];
