import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  passcode: string | null;
  faceDescriptor: number[] | null; // Face data stored as an array of numbers
  isAuthenticated: boolean;
  isRegistered: boolean;
  
  // Actions
  register: (passcode: string, faceDescriptor: number[] | null) => void;
  login: (passcode: string) => boolean;
  loginWithFace: (descriptor: number[]) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      passcode: null,
      faceDescriptor: null,
      isAuthenticated: false,
      isRegistered: false,

      register: (passcode, faceDescriptor) => set({
        passcode,
        faceDescriptor,
        isRegistered: true,
        isAuthenticated: true // Log them in immediately after register
      }),

      login: (passcode) => {
        const state = get();
        if (state.passcode === passcode) {
          set({ isAuthenticated: true });
          return true;
        }
        return false;
      },

      loginWithFace: (descriptor) => {
        const state = get();
        if (!state.faceDescriptor) return false;
        
        // Simple Euclidean Distance for face matching
        const distance = Math.sqrt(
          descriptor.reduce((sum, val, i) => sum + Math.pow(val - (state.faceDescriptor![i] || 0), 2), 0)
        );

        // Threshold of 0.40 - 0.45 is typical for good matching
        if (distance < 0.45) {
          set({ isAuthenticated: true });
          return true;
        }
        return false;
      },

      logout: () => set({ isAuthenticated: false }),
    }),
    { name: 'ravi-auth-storage' }
  )
);
