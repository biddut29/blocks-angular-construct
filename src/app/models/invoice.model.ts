// ─── Invoice Models ────────────────────────────────────────────────────────────
// Mirrors: src/modules/invoices/types/ in React project

export type InvoiceStatus = 'DRAFT' | 'PAID' | 'PENDING' | 'OVERDUE';

export interface CustomerDetails {
  name: string;
  email: string;
  address?: string;
  phone?: string;
}

export interface InvoiceItemDetail {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InvoiceItem {
  ItemId: string;
  DateIssued: string;
  DueDate: string;
  Amount: number;
  Customer: CustomerDetails[];
  Status: InvoiceStatus;
  ItemDetails: InvoiceItemDetail[];
  Currency: string;
  Taxes: number;
  Discount: number;
  InvoiceNumber?: string;
  Notes?: string;
}

export interface CreateInvoiceInput {
  DateIssued: string;
  DueDate: string;
  Customer: CustomerDetails[];
  ItemDetails: InvoiceItemDetail[];
  Currency: string;
  Taxes: number;
  Discount: number;
  Notes?: string;
  Status: InvoiceStatus;
}

export type UpdateInvoiceInput = Partial<CreateInvoiceInput>;
