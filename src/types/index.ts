export interface Medicine {
  id: string;
  name: string;
  hsn: string;
  mrp: number;
  mfdBy: string;
  taxPercent: number;
  category: string;
  stock?: number;
}

export interface InvoiceLineItem {
  id: string;
  productName: string;
  hsn: string;
  batch: string;
  exp: string;           // MM/YYYY
  mfdBy: string;
  qty: number;
  mrp: number;
  rate: number;
  taxPercent: number;
  amount: number;        // computed: qty × rate
}

export interface Invoice {
  id: string;
  invoiceNo: number;
  date: string;
  customerName: string;
  address: string;
  mobile: string;
  items: InvoiceLineItem[];
  subTotal: number;
  cgstPercent: number;
  sgstPercent: number;
  cgstAmount: number;
  sgstAmount: number;
  grandTotal: number;
  amountInWords: string;
  paymentMode: 'Cash' | 'UPI' | 'Card' | 'Credit';
  status: 'paid' | 'unpaid' | 'partial';
  createdAt: string;
}

export interface Settings {
  cgstPercent: number;   // default 2.5
  sgstPercent: number;   // default 2.5
  invoiceCounter: number;
  agencyName: string;
  address: string;
  mobile: string;
  cgstNo: string;
  dlNo: string;
  state: string;
  website: string;
  signatureImage?: string;
}
