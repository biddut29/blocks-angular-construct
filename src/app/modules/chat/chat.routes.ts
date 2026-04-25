// ─── Chat Routes ───────────────────────────────────────────────────────────────
import { Routes } from '@angular/router';
import { roleGuard } from '@app/state/store/auth/role.guard';

export const CHAT_ROUTES: Routes = [
  {
    path: '',
    canActivate: [roleGuard],
    data: { roles: ['admin'] },
    loadComponent: () => import('./pages/chat/chat.component').then((m) => m.ChatComponent),
  },
];
