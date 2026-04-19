import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  setDoc,
  deleteDoc,
  updateDoc,
  doc,
  collection,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Invoice } from '../types';

interface InvoiceState {
  invoices: Invoice[];
  syncing: boolean;
  syncError: string | null;
  addInvoice: (invoice: Invoice) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  updateInvoiceStatus: (id: string, status: Invoice['status']) => Promise<void>;
  initFirestoreSync: () => () => void; // returns unsubscribe fn
}

export const useInvoiceStore = create<InvoiceState>()(
  persist(
    (set, get) => ({
      invoices: [],
      syncing: false,
      syncError: null,

      /**
       * Saves invoice locally immediately, then pushes to Firestore.
       * The onSnapshot listener will confirm and keep state in sync.
       */
      addInvoice: async (invoice: Invoice) => {
        // 1. Optimistic local update
        set((state) => ({ invoices: [...state.invoices, invoice] }));
        // 2. Push to Firestore using invoice.id as the document ID
        try {
          set({ syncing: true, syncError: null });
          await setDoc(doc(db, 'invoices', invoice.id), {
            ...invoice,
            _savedAt: serverTimestamp(),
          });
        } catch (err: any) {
          console.error('Firestore addInvoice error:', err);
          set({ syncError: 'Failed to sync to cloud. Data saved locally.' });
        } finally {
          set({ syncing: false });
        }
      },

      deleteInvoice: async (id: string) => {
        // Optimistic local delete
        set((state) => ({ invoices: state.invoices.filter((i) => i.id !== id) }));
        try {
          // Find Firestore doc by invoice id field
          // We use the local id field to find the corresponding Firestore document
          // Since we stored id inside the document, we delete by querying.
          // Simpler: store firestoreId on doc — but we use invoice.id as doc id.
          await deleteDoc(doc(db, 'invoices', id));
        } catch (err) {
          console.error('Firestore deleteInvoice error:', err);
        }
      },

      updateInvoiceStatus: async (id: string, status: Invoice['status']) => {
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.id === id ? { ...inv, status } : inv
          ),
        }));
        try {
          await updateDoc(doc(db, 'invoices', id), { status });
        } catch (err) {
          console.error('Firestore updateStatus error:', err);
        }
      },

      /**
       * Start real-time Firestore listener. Call once on app mount.
       * Returns unsubscribe function to call on unmount.
       */
      initFirestoreSync: () => {
        const q = query(collection(db, 'invoices'), orderBy('_savedAt', 'desc'));
        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const invoices: Invoice[] = snapshot.docs.map((d) => {
              const data = d.data();
              // Remove Firestore-only fields
              const { _savedAt, ...rest } = data;
              return rest as Invoice;
            });
            set({ invoices, syncError: null });
          },
          (err) => {
            console.error('Firestore onSnapshot error:', err);
            set({ syncError: 'Cloud sync error. Using local data.' });
          }
        );
        return unsubscribe;
      },
    }),
    {
      name: 'ravi-invoice-storage',
      // Only persist as offline cache — Firestore is source of truth
      partialize: (state) => ({ invoices: state.invoices }),
    }
  )
);
