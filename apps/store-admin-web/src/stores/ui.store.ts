// src/stores/ui.store.ts — Sidebar, toasts, modals

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface UIState {
  isSidebarCollapsed: boolean;
  toasts: Toast[];
  toggleSidebar: () => void;
  addToast: (message: string, type: Toast['type']) => void;
  removeToast: (id: string) => void;
}

const isDev = process.env.NODE_ENV !== 'production';

export const useUIStore = create<UIState>()(
  isDev
    ? devtools(
        (set) => ({
          isSidebarCollapsed: false,
          toasts: [],
          toggleSidebar: () =>
            set((s) => ({ isSidebarCollapsed: !s.isSidebarCollapsed }), false, 'ui/toggleSidebar'),
          addToast: (message, type) =>
            set(
              (s) => ({ toasts: [...s.toasts, { id: crypto.randomUUID(), message, type }] }),
              false,
              'ui/addToast',
            ),
          removeToast: (id) =>
            set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }), false, 'ui/removeToast'),
        }),
        { name: 'UIStore' },
      )
    : (set) => ({
        isSidebarCollapsed: false,
        toasts: [],
        toggleSidebar: () => set((s) => ({ isSidebarCollapsed: !s.isSidebarCollapsed })),
        addToast: (message, type) =>
          set((s) => ({ toasts: [...s.toasts, { id: crypto.randomUUID(), message, type }] })),
        removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
      }),
);
