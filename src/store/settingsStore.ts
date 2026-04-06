import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Settings } from '../types';

interface SettingsState {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  incrementInvoiceCounter: () => void;
}

const defaultSettings: Settings = {
  cgstPercent: 2.5,
  sgstPercent: 2.5,
  invoiceCounter: 1,
  agencyName: 'RAVI MEDICAL AGENCY',
  address: 'Rambachan Prasad Keshri Complex, Mohania Road, Kochas',
  mobile: '9430939068',
  cgstNo: '10BTOPK4041F1Z3',
  dlNo: 'ROH 424/42A',
  state: 'Bihar (10)',
  website: 'ravimedical.in',
  signatureImage: ''
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      updateSettings: (newSettings) =>
        set((state) => ({ settings: { ...state.settings, ...newSettings } })),
      incrementInvoiceCounter: () =>
        set((state) => ({
          settings: { ...state.settings, invoiceCounter: state.settings.invoiceCounter + 1 }
        })),
    }),
    { name: 'ravi-settings-storage' }
  )
);
