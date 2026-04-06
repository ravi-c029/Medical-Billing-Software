import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Invoice } from '../types';

interface InvoiceState {
  invoices: Invoice[];
  addInvoice: (invoice: Invoice) => void;
  deleteInvoice: (id: string) => void;
  updateInvoiceStatus: (id: string, status: Invoice['status']) => void;
}

export const useInvoiceStore = create<InvoiceState>()(
  persist(
    (set) => ({
      invoices: [],
      addInvoice: (invoice) => set((state) => ({ invoices: [...state.invoices, invoice] })),
      deleteInvoice: (id) => set((state) => ({ invoices: state.invoices.filter(i => i.id !== id) })),
      updateInvoiceStatus: (id, status) => set((state) => ({
        invoices: state.invoices.map((inv) => (inv.id === id ? { ...inv, status } : inv)),
      })),
    }),
    { name: 'ravi-invoice-storage' }
  )
);
