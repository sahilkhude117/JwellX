// types/invoice.ts
export type InvoiceStatus = 'PAID' | 'PENDING' | 'PARTIAL';

export type InvoiceRowData = {
  id: string;
  invoiceNumber: string;
  customer: {
    name: string;
    phone: string;
  };
  createdAt: string;
  status: InvoiceStatus;
  netAmount: number;
};

export type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

export type InvoiceFilters = {
  search: string;
  status: InvoiceStatus | 'all';
  dateRange: DateRange;
};


export type InvoiceItemDetail = {
  id: string;
  productName: string;
  variantDescription: string;
  hsnCode?: string;
  quantity: number;
  metalPrice: number;
  makingCharges: number;
  lineTotal: number;
};

export type PaymentRecord = {
  id: string;
  date: string;
  amountPaid: number;
  method: 'CASH' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'UPI';
};

export type FullInvoiceDetails = {
  id: string;
  invoiceNumber: string;
  createdAt: string;
  status: InvoiceStatus;
  customer: {
    name: string;
    phone: string;
    address?: string;
  };
  shopDetails: {
    name: string;
    address: string;
    phone: string;
    gstin: string;
    logoUrl?: string;
  };
  items: InvoiceItemDetail[];
  summary: {
    subTotal: number;
    discount: number;
    taxableAmount: number;
    cgstAmount: number;
    sgstAmount: number;
    grandTotal: number;
    amountInWords: string;
  };
  paymentHistory: PaymentRecord[];
};