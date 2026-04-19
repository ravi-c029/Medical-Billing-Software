import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  address: string;
  dlNo: string;
  lastUsed: string; // ISO timestamp for sorting
}

interface CustomerState {
  customers: Customer[];
  upsertCustomer: (customer: Omit<Customer, 'id' | 'lastUsed'>) => void;
  deleteCustomer: (id: string) => void;
}

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set, get) => ({
      customers: [],

      upsertCustomer: (data) => {
        const existing = get().customers.find(
          (c) => c.name.toLowerCase() === data.name.toLowerCase()
        );
        if (existing) {
          // Update existing customer with latest info
          set((state) => ({
            customers: state.customers.map((c) =>
              c.id === existing.id
                ? { ...c, ...data, lastUsed: new Date().toISOString() }
                : c
            ),
          }));
        } else {
          // Add new customer
          const newCustomer: Customer = {
            id: Date.now().toString(),
            ...data,
            lastUsed: new Date().toISOString(),
          };
          set((state) => ({ customers: [...state.customers, newCustomer] }));
        }
      },

      deleteCustomer: (id) =>
        set((state) => ({
          customers: state.customers.filter((c) => c.id !== id),
        })),
    }),
    { name: 'ravi-customer-storage' }
  )
);
