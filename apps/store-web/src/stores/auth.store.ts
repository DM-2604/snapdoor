// src/stores/auth.store.ts
// Customer auth state. No JWT stored here — lives in httpOnly cookie via API route proxy.

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface CustomerUser {
  id: string;
  phoneNumber: string;
  name: string | null;
  role: string;
}

interface AuthState {
  user: CustomerUser | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  showAuthModal: boolean;
  authStep: 'phone' | 'otp';
  pendingPhone: string;

  login: (user: CustomerUser) => void;
  logout: () => void;
  setGuest: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  setAuthStep: (step: 'phone' | 'otp', phone?: string) => void;
}

const isDev = process.env.NODE_ENV !== 'production';

export const useAuthStore = create<AuthState>()(
  isDev
    ? devtools(
        (set) => ({
          user: null,
          isAuthenticated: false,
          isGuest: false,
          showAuthModal: false,
          authStep: 'phone',
          pendingPhone: '',

          login: (user) =>
            set(
              { user, isAuthenticated: true, isGuest: false, showAuthModal: false },
              false,
              'auth/login',
            ),
          logout: () =>
            set(
              () => {
                try { localStorage.removeItem('localmart_guest_cart'); } catch { /* ssr */ }
                return { user: null, isAuthenticated: false, isGuest: false };
              },
              false,
              'auth/logout',
            ),
          setGuest: () =>
            set({ isGuest: true, showAuthModal: false }, false, 'auth/setGuest'),
          openAuthModal: () =>
            set({ showAuthModal: true, authStep: 'phone', pendingPhone: '' }, false, 'auth/openModal'),
          closeAuthModal: () =>
            set({ showAuthModal: false }, false, 'auth/closeModal'),
          setAuthStep: (step, phone) =>
            set(
              { authStep: step, ...(phone !== undefined ? { pendingPhone: phone } : {}) },
              false,
              'auth/setStep',
            ),
        }),
        { name: 'CustomerAuthStore' },
      )
    : (set) => ({
        user: null,
        isAuthenticated: false,
        isGuest: false,
        showAuthModal: false,
        authStep: 'phone',
        pendingPhone: '',

        login: (user) => set({ user, isAuthenticated: true, isGuest: false, showAuthModal: false }),
        logout: () => {
          try { localStorage.removeItem('localmart_guest_cart'); } catch { /* ssr */ }
          set({ user: null, isAuthenticated: false, isGuest: false });
        },
        setGuest: () => set({ isGuest: true, showAuthModal: false }),
        openAuthModal: () => set({ showAuthModal: true, authStep: 'phone', pendingPhone: '' }),
        closeAuthModal: () => set({ showAuthModal: false }),
        setAuthStep: (step, phone) =>
          set({ authStep: step, ...(phone !== undefined ? { pendingPhone: phone } : {}) }),
      }),
);
