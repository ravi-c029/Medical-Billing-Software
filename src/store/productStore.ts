import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Medicine } from '../types';
import { predefinedMedicines } from '../data/medicines';

interface ProductState {
  medicines: Medicine[];
  addProduct: (medicine: Medicine) => void;
  updateProduct: (id: string, updated: Partial<Medicine>) => void;
  deleteProduct: (id: string) => void;
}

export const useProductStore = create<ProductState>()(
  persist(
    (set) => ({
      medicines: predefinedMedicines,
      addProduct: (medicine) => set((state) => ({ medicines: [...state.medicines, medicine] })),
      updateProduct: (id, updated) => set((state) => ({
        medicines: state.medicines.map((m) => (m.id === id ? { ...m, ...updated } : m)),
      })),
      deleteProduct: (id) => set((state) => ({
        medicines: state.medicines.filter((m) => m.id !== id),
      })),
    }),
    { name: 'ravi-product-storage' }
  )
);
