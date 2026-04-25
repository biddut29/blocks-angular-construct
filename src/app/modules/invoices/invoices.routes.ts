import { Routes } from '@angular/router';

export const INVOICES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/invoices/invoices.component').then((m) => m.InvoicesComponent),
  },
];
