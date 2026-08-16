/**
 * stores/auth.store.ts — Client-side auth state (Zustand)
 *
 * ─── CLIENT STATE vs SERVER STATE BOUNDARY ───────────────────────────────────
 * This store owns SESSION state only — information decoded from the httpOnly
 * JWT cookie that is needed for UI decisions (show admin name, role-gate a
 * button, redirect to login). It does NOT own any server-fetched data
 * (store lists, dashboard summary, orders, etc.) — that data is fetched fresh
 * by React Server Components or by page-level useEffect calls and must NOT be
 * cached here because doing so causes stale-data bugs on navigation.
 *
 * Rules:
 *  1. Never store the JWT token itself here — it lives in the httpOnly cookie.
 *  2. Never store lists, counts, or any entity data here — use React state or
 *     server component fetches for that.
 *  3. Keep this boundary in mind when building store-web — the same pattern
 *     applies: one useAuthStore, no entity data in Zustand.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface AdminUser {
  id: string;
  phoneNumber: string;
  name: string | null;
  role: string;
  adminRole: string | null;
}

interface AuthState {
  currentUser: AdminUser | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  /** Called after a successful OTP verify — sets decoded user info from the API response */
  login: (user: AdminUser) => void;
  /** Called on logout — clears state (cookie deletion is handled server-side via DELETE /api/auth) */
  logout: () => void;
  /** Called once on app load to populate from the /api/session endpoint */
  setUser: (user: AdminUser | null) => void;
  setHydrated: () => void;
}

const isDev = process.env.NODE_ENV !== 'production';

export const useAuthStore = create<AuthState>()(
  isDev
    ? devtools(
        (set) => ({
          currentUser: null,
          isAuthenticated: false,
          isHydrated: false,

          login: (user) =>
            set({ currentUser: user, isAuthenticated: true }, false, 'auth/login'),

          logout: () =>
            set({ currentUser: null, isAuthenticated: false }, false, 'auth/logout'),

          setUser: (user) =>
            set(
              { currentUser: user, isAuthenticated: user !== null },
              false,
              'auth/setUser',
            ),

          setHydrated: () => set({ isHydrated: true }, false, 'auth/setHydrated'),
        }),
        { name: 'AuthStore' },
      )
    : (set) => ({
        currentUser: null,
        isAuthenticated: false,
        isHydrated: false,

        login: (user) => set({ currentUser: user, isAuthenticated: true }),

        logout: () => set({ currentUser: null, isAuthenticated: false }),

        setUser: (user) =>
          set({ currentUser: user, isAuthenticated: user !== null }),

        setHydrated: () => set({ isHydrated: true }),
      }),
);
