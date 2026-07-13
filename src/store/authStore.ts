import { create } from 'zustand';
import { type User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  initAuth: () => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // true initially until Firebase confirms state

  initAuth: () => {
    // Listen to Firebase Auth state changes
    onAuthStateChanged(auth, (user) => {
      set({
        user: user,
        isAuthenticated: !!user,
        isLoading: false
      });
    });
  },

  logout: async () => {
    try {
      await firebaseSignOut(auth);
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Logout error', error);
    }
  },
}));
