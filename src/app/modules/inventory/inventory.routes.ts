import { Routes } from '@angular/router';

export const INVENTORY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/inventory/inventory.component').then(m => m.InventoryComponent),
  },
];
