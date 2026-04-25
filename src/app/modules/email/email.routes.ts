// ─── Email Module Routes ───────────────────────────────────────────────────────
// Mirrors: src/routes/app-routes.tsx email section in React project
// /mail  →  /mail/:category  →  /mail/:category/:labels/:emailId

import { Routes } from '@angular/router';

export const EMAIL_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/email/email.component').then((m) => m.EmailComponent),
    children: [
      { path: '', redirectTo: 'inbox', pathMatch: 'full' },
      {
        path: ':category',
        loadComponent: () => import('./pages/email/email.component').then((m) => m.EmailComponent),
      },
      {
        path: ':category/:labels/:emailId',
        loadComponent: () => import('./pages/email/email.component').then((m) => m.EmailComponent),
      },
    ],
  },
];
