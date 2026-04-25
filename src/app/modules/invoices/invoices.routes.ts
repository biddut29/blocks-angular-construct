import { Routes } from '@angular/router';

export const INVOICES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/invoices/invoices.component').then((m) => m.InvoicesComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/create-invoice/create-invoice.component').then(
        (m) => m.CreateInvoiceComponent
      ),
  },
  {
    path: ':invoiceId',
    loadComponent: () =>
      import('./pages/invoices-detail/invoices-detail.component').then(
        (m) => m.InvoicesDetailComponent
      ),
  },
  {
    path: ':invoiceId/edit',
    loadComponent: () =>
      import('./pages/edit-invoice/edit-invoice.component').then((m) => m.EditInvoiceComponent),
  },
];
