import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { categoriesApi } from '@/lib/api';
import type { Category } from '@localmart/api-client';

interface CategoryState {
  categories: Category[];
  loading: boolean;
  modalState: { mode: 'create'; parentId?: string } | { mode: 'edit'; cat: Category } | null;

  setModalState: (modalState: { mode: 'create'; parentId?: string } | { mode: 'edit'; cat: Category } | null) => void;
  fetchCategories: () => Promise<void>;
}

const isDev = process.env.NODE_ENV !== 'production';

export const useCategoryStore = create<CategoryState>()(
  isDev
    ? devtools(
        (set, get) => ({
          categories: [],
          loading: true,
          modalState: null,

          setModalState: (modalState) => set({ modalState }, false, 'category/setModalState'),

          fetchCategories: async () => {
            set({ loading: true }, false, 'category/fetch/start');
            try {
              const categories = await categoriesApi.list();
              set({ categories, loading: false }, false, 'category/fetch/success');
            } catch (err) {
              console.error(err);
              set({ loading: false }, false, 'category/fetch/error');
            }
          },
        }),
        { name: 'CategoryStore' }
      )
    : (set, get) => ({
        categories: [],
        loading: true,
        modalState: null,

        setModalState: (modalState) => set({ modalState }),

        fetchCategories: async () => {
          set({ loading: true });
          try {
            const categories = await categoriesApi.list();
            set({ categories, loading: false });
          } catch (err) {
            console.error(err);
            set({ loading: false });
          }
        },
      })
);
