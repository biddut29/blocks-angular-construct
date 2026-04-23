// ─── Inventory Models ──────────────────────────────────────────────────────────
// Mirrors: src/modules/inventory/types/ in React project

export type InventoryStatus = 'ACTIVE' | 'DISCONTINUED';

export interface InventoryItem {
  ItemId: string;
  ItemName: string;
  Category: string;
  Supplier: string;
  Price: number;
  Stock: number;
  Status: InventoryStatus;
  Tags: string[];
  ItemImageFileIds: string[];
  CreatedAt?: string;
  UpdatedAt?: string;
}

export interface InventoryFilter {
  pageNo: number;
  pageSize: number;
  search?: string;
  category?: string;
  status?: InventoryStatus;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateInventoryItemInput {
  ItemName: string;
  Category: string;
  Supplier: string;
  Price: number;
  Stock: number;
  Status: InventoryStatus;
  Tags: string[];
  ItemImageFileIds: string[];
}

export type UpdateInventoryItemInput = Partial<CreateInventoryItemInput>;
