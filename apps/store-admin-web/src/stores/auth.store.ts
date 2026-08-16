// src/stores/auth.store.ts — Session state only. No JWT, no entity data.

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface StoreOwnerUser {
  id: string;
  phoneNumber: string;
  name: string | null;
  role: string;
}

interface AuthState {
  currentUser: StoreOwnerUser | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  login: (user: StoreOwnerUser) => void;
  logout: () => void;
  setUser: (user: StoreOwnerUser | null) => void;
  setHydrated: () => void;
}

const isDev = process.env.NODE_ENV !== 'production';

export const useStoreOwnerAuthStore = create<AuthState>()(
  isDev
    ? devtools(
        (set) => ({
          currentUser: null,
          isAuthenticated: false,
          isHydrated: false,
          login: (user) => set({ currentUser: user, isAuthenticated: true }, false, 'auth/login'),
          logout: () => set({ currentUser: null, isAuthenticated: false }, false, 'auth/logout'),
          setUser: (user) =>
            set({ currentUser: user, isAuthenticated: user !== null }, false, 'auth/setUser'),
          setHydrated: () => set({ isHydrated: true }, false, 'auth/setHydrated'),
        }),
        { name: 'StoreOwnerAuthStore' },
      )
    : (set) => ({
        currentUser: null,
        isAuthenticated: false,
        isHydrated: false,
        login: (user) => set({ currentUser: user, isAuthenticated: true }),
        logout: () => set({ currentUser: null, isAuthenticated: false }),
        setUser: (user) => set({ currentUser: user, isAuthenticated: user !== null }),
        setHydrated: () => set({ isHydrated: true }),
      }),
);
