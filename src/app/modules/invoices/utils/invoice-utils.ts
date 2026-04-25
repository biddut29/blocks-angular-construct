import { InvoiceStatus, type InvoiceItem, type InvoiceItemDetails } from '../types/invoices.types';

export interface InvoiceTotals {
  Subtotal: number;
  Taxes: number;
  TotalAmount: number;
}

export function calculateInvoiceTotals(
  items: InvoiceItemDetails[],
  taxesPercent: number,
  discount: number
): InvoiceTotals {
  const Subtotal = (items ?? []).reduce((acc, item) => acc + (Number(item.Amount) || 0), 0);
  const Taxes = (Subtotal * (Number(taxesPercent) || 0)) / 100;
  const TotalAmount = Subtotal + Taxes - (Number(discount) || 0);
  return { Subtotal, Taxes, TotalAmount };
}

export function createInvoiceFromForm(args: {
  invoiceId: string;
  formValues: {
    customerName: string;
    billingAddress?: string;
    email?: string;
    phoneNumber?: string;
    dueDate?: Date | null;
    currency?: string;
    generalNote?: string;
    taxes?: number;
    discount?: number;
  };
  items: InvoiceItemDetails[];
  action: 'draft' | 'send';
}): InvoiceItem {
  const taxes = Number(args.formValues.taxes) || 0;
  const discount = Number(args.formValues.discount) || 0;
  const { TotalAmount, Subtotal, Taxes } = calculateInvoiceTotals(args.items, taxes, discount);
  const status = args.action === 'send' ? InvoiceStatus.PENDING : InvoiceStatus.DRAFT;

  return {
    ItemId: args.invoiceId,
    DateIssued: new Date().toISOString(),
    Amount: TotalAmount,
    DueDate: args.formValues.dueDate?.toISOString() ?? new Date().toISOString(),
    Status: status,
    GeneralNote: args.formValues.generalNote ?? '',
    Customer: [
      {
        CustomerName: args.formValues.customerName ?? '',
        BillingAddress: args.formValues.billingAddress ?? '',
        Email: args.formValues.email ?? '',
        PhoneNo: args.formValues.phoneNumber ?? '',
      },
    ],
    ItemDetails: (args.items ?? []).map((item) => ({
      ItemId: item.ItemId,
      ItemName: item.ItemName,
      Note: item.Note ?? '',
      Category: item.Category ?? '',
      Quantity: Number(item.Quantity) || 0,
      UnitPrice: Number(item.UnitPrice) || 0,
      Amount: Number(item.Amount) || 0,
    })),
    Currency: args.formValues.currency ?? 'CHF',
    Subtotal,
    Taxes,
    Discount: discount,
    TotalAmount,
  };
}
