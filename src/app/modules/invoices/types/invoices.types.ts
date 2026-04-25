export enum InvoiceStatus {
  DRAFT = 'Draft',
  PAID = 'Paid',
  PENDING = 'Pending',
  OVERDUE = 'Overdue',
}

export interface CustomerDetails {
  CustomerName: string;
  BillingAddress: string;
  Email: string;
  PhoneNo: string;
}

export interface InvoiceItemDetails {
  ItemId: string;
  ItemName: string;
  Category: string;
  Quantity: number;
  /** May be missing on partial API records */
  UnitPrice?: number;
  /** May be missing on partial API records */
  Amount?: number;
  Note?: string;
  showNote?: boolean;
}

export interface InvoiceItem {
  ItemId: string;
  CreatedBy?: string;
  CreatedDate?: string;
  IsDeleted?: boolean;
  Language?: string;
  LastUpdatedBy?: string;
  LastUpdatedDate?: string;
  OrganizationIds?: string[];
  Tags?: string[];
  DeletedDate?: string;
  DateIssued: string;
  DueDate: string;
  /** Header line total; optional when the gateway omits it */
  Amount?: number;
  Customer: CustomerDetails[];
  /** Omitted for some API payloads; treat missing as Draft in UI */
  Status?: string;
  GeneralNote?: string;
  ItemDetails?: InvoiceItemDetails[];
  Subtotal?: number;
  TotalAmount?: number;
  Currency?: string;
  Taxes?: number;
  Discount?: number;
}

export type InvoiceItemsData = {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalCount: number;
  totalPages: number;
  pageSize: number;
  pageNo: number;
  items: InvoiceItem[];
};

export interface AddInvoiceItemInput {
  DateIssued: string;
  DueDate: string;
  Amount: number;
  Customer: CustomerDetails[];
  Currency?: string;
  Status: string;
  GeneralNote?: string;
  ItemDetails?: InvoiceItemDetails[];
  Taxes?: number;
  Discount?: number;
}

export interface AddInvoiceItemParams {
  input: AddInvoiceItemInput;
}

export interface AddInvoiceItemResponse {
  insertInvoiceItem: {
    itemId: string;
    totalImpactedData: number;
    acknowledged: boolean;
  };
}

export type UpdateInvoiceItemInput = AddInvoiceItemInput;

export interface UpdateInvoiceItemParams {
  filter: string;
  input: UpdateInvoiceItemInput;
}

export interface UpdateInvoiceItemResponse {
  updateInvoiceItem: {
    itemId: string;
    totalImpactedData: number;
    acknowledged: boolean;
  };
}

export interface DeleteInvoiceItemResponse {
  deleteInvoiceItem: {
    itemId: string;
    totalImpactedData: number;
    acknowledged: boolean;
  };
}
