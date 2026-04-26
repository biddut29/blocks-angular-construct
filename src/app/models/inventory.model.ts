// ─── Inventory Models ──────────────────────────────────────────────────────────
// Mirrors: `react_Constract` src/modules/inventory/types/inventory.types.ts

export const INVENTORY_STATUS = {
  ACTIVE: 'Active',
  DISCONTINUED: 'Discontinued',
} as const;
export type InventoryStatusValue = (typeof INVENTORY_STATUS)[keyof typeof INVENTORY_STATUS];

export const CATEGORY_OPTIONS = [
  'Supplies',
  'Electronics',
  'Furniture',
  'Apparel',
  'Accessories',
  'Wearables',
] as const;
export const ITEM_LOC_OPTIONS = ['Warehouse A', 'Warehouse B', 'Warehouse C'] as const;
export const INVENTORY_TAG_OPTIONS = ['Accessories', 'Electronic', 'Gaming', 'Monitor'] as const;

export interface InventoryItemGql {
  ItemId: string;
  ItemName: string;
  Category: string;
  Supplier: string;
  ItemLoc: string;
  Price: number;
  Stock: number;
  Status: string;
  Tags: string[];
  ItemImageFileId: string;
  ItemImageFileIds: string[];
  EligibleWarranty: boolean;
  EligibleReplacement: boolean;
  Discount: boolean;
  CreatedBy: string;
  CreatedDate: string;
  DeletedDate: string;
  IsDeleted: boolean;
  Language: string;
  LastUpdatedBy: string;
  LastUpdatedDate: string;
  OrganizationIds: string[];
}

export interface GetInventoryGqlData {
  getInventoryItems: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    totalCount: number;
    totalPages: number;
    pageSize: number;
    pageNo: number;
    items: InventoryItemGql[];
  };
}

export interface InsertInventoryGqlData {
  insertInventoryItem: {
    itemId: string;
    totalImpactedData: number;
    acknowledged: boolean;
  };
}

export interface UpdateInventoryGqlData {
  updateInventoryItem: {
    itemId: string;
    totalImpactedData: number;
    acknowledged: boolean;
  };
}

export interface DeleteInventoryGqlData {
  deleteInventoryItem: {
    itemId: string;
    totalImpactedData: number;
    acknowledged: boolean;
  };
}

export interface AddInventoryItemInputGql {
  ItemName: string;
  Category: string;
  Supplier: string;
  ItemLoc: string;
  Price: number;
  Status: string;
  Stock: number;
  Tags: string[];
  EligibleWarranty: boolean;
  EligibleReplacement: boolean;
  Discount: boolean;
  ItemImageFileId: string;
  ItemImageFileIds: string[];
  DeletedDate?: string;
}

export type UpdateInventoryItemInputGql = Partial<AddInventoryItemInputGql> & {
  ItemImageFileId?: string;
  ItemImageFileIds?: string[];
};
