import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  passcode: string | null;
  pattern: number[] | null; // Sequential array of node indices (0-8)
  isAuthenticated: boolean;
  isRegistered: boolean;
  
  // Actions
  register: (passcode: string, pattern: number[] | null) => void;
  login: (passcode: string) => boolean;
  loginWithPattern: (inputPattern: number[]) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      passcode: null,
      pattern: null,
      isAuthenticated: false,
      isRegistered: false,

      register: (passcode, pattern) => set({
        passcode,
        pattern,
        isRegistered: true,
        isAuthenticated: true
      }),

      login: (passcode) => {
        const state = get();
        if (state.passcode === passcode) {
          set({ isAuthenticated: true });
          return true;
        }
        return false;
      },

      loginWithPattern: (inputPattern) => {
        const state = get();
        if (!state.pattern) return false;
        
        // Match lengths first
        if (inputPattern.length !== state.pattern.length) return false;
        
        // Check Every element in sequence
        const isMatch = inputPattern.every((node, i) => node === state.pattern![i]);

        if (isMatch) {
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
