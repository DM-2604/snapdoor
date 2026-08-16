/**
 * stores/ui.store.ts — Client-side UI ephemeral state (Zustand)
 *
 * ─── CLIENT STATE vs SERVER STATE BOUNDARY ───────────────────────────────────
 * This store owns UI-only ephemeral state: which modal is open, toast queue,
 * sidebar collapsed state. It does NOT own any entity data, server-fetched
 * lists, or anything that could become stale on navigation. See auth.store.ts
 * for a full explanation of the boundary and why it exists.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface UIState {
  // ── Sidebar ──────────────────────────────────────────────────────────────
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // ── Approve / Review modal ────────────────────────────────────────────────
  // null = closed; string = the storeId whose modal is open.
  approveModalStoreId: string | null;
  openApproveModal: (storeId: string) => void;
  closeApproveModal: () => void;

  // ── Toast queue ───────────────────────────────────────────────────────────
  toasts: Toast[];
  addToast: (message: string, variant?: ToastVariant) => void;
  removeToast: (id: string) => void;
}

let _nextId = 0;

const isDev = process.env.NODE_ENV !== 'production';

export const useUIStore = create<UIState>()(
  isDev
    ? devtools(
        (set) => ({
          // Sidebar
          sidebarCollapsed: false,
          toggleSidebar: () =>
            set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed }), false, 'ui/toggleSidebar'),
          setSidebarCollapsed: (collapsed) =>
            set({ sidebarCollapsed: collapsed }, false, 'ui/setSidebarCollapsed'),

          // Approve modal
          approveModalStoreId: null,
          openApproveModal: (storeId) =>
            set({ approveModalStoreId: storeId }, false, 'ui/openApproveModal'),
          closeApproveModal: () =>
            set({ approveModalStoreId: null }, false, 'ui/closeApproveModal'),

          // Toasts
          toasts: [],
          addToast: (message, variant = 'info') =>
            set(
              (s) => ({ toasts: [...s.toasts, { id: String(++_nextId), message, variant }] }),
              false,
              'ui/addToast',
            ),
          removeToast: (id) =>
            set(
              (s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }),
              false,
              'ui/removeToast',
            ),
        }),
        { name: 'UIStore' },
      )
    : (set) => ({
        sidebarCollapsed: false,
        toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
        setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

        approveModalStoreId: null,
        openApproveModal: (storeId) => set({ approveModalStoreId: storeId }),
        closeApproveModal: () => set({ approveModalStoreId: null }),

        toasts: [],
        addToast: (message, variant = 'info') =>
          set((s) => ({ toasts: [...s.toasts, { id: String(++_nextId), message, variant }] })),
        removeToast: (id) =>
          set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
      }),
);
