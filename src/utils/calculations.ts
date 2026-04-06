import type { InvoiceLineItem } from '../types';

export function computeLineAmount(qty: number, rate: number): number {
  return parseFloat((qty * rate).toFixed(2));
}

export function computeSubTotal(items: InvoiceLineItem[]): number {
  return items.reduce((sum, item) => sum + item.amount, 0);
}

export function computeTax(subTotal: number, percent: number): number {
  return parseFloat(((subTotal * percent) / 100).toFixed(2));
}

export function computeGrandTotal(subTotal: number, cgstAmount: number, sgstAmount: number): number {
  return Math.round(subTotal + cgstAmount + sgstAmount);
}
