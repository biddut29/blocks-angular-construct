import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-inventory',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold text-foreground">Inventory</h1>
      <p class="text-sm text-muted-foreground mt-1">This module is not implemented yet.</p>
    </div>
  `,
})
export class InventoryComponent {}
