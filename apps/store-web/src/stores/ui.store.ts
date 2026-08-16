// src/stores/ui.store.ts
// UI ephemeral state: dark mode, toast notifications, cart bounce animation.

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface UIState {
  isDarkMode: boolean;
  wishlistItems: string[];

  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
  toggleWishlist: (productName: string) => void;
}

const isDev = process.env.NODE_ENV !== 'production';

export const useUIStore = create<UIState>()(
  isDev
    ? devtools(
        (set, get) => ({
          isDarkMode: false,
          wishlistItems: [],

          toggleDarkMode: () => {
            const isDark = !get().isDarkMode;
            set({ isDarkMode: isDark }, false, 'ui/toggleDarkMode');
            if (typeof document !== 'undefined') {
              document.documentElement.classList.toggle('dark', isDark);
              localStorage.setItem('theme', isDark ? 'dark' : 'light');
            }
          },

          setDarkMode: (isDark) => {
            set({ isDarkMode: isDark }, false, 'ui/setDarkMode');
            if (typeof document !== 'undefined') {
              document.documentElement.classList.toggle('dark', isDark);
            }
          },

          toggleWishlist: (productName) => {
            const current = get().wishlistItems;
            const next = current.includes(productName)
              ? current.filter((i) => i !== productName)
              : [...current, productName];
            set({ wishlistItems: next }, false, 'ui/toggleWishlist');
          },
        }),
        { name: 'UIStore' },
      )
    : (set, get) => ({
        isDarkMode: false,
        wishlistItems: [],

        toggleDarkMode: () => {
          const isDark = !get().isDarkMode;
          set({ isDarkMode: isDark });
          if (typeof document !== 'undefined') {
            document.documentElement.classList.toggle('dark', isDark);
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
          }
        },

        setDarkMode: (isDark) => {
          set({ isDarkMode: isDark });
          if (typeof document !== 'undefined') {
            document.documentElement.classList.toggle('dark', isDark);
          }
        },

        toggleWishlist: (productName) => {
          const current = get().wishlistItems;
          set({
            wishlistItems: current.includes(productName)
              ? current.filter((i) => i !== productName)
              : [...current, productName],
          });
        },
      }),
);
