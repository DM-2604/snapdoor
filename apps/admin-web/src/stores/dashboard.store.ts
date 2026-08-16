import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { adminApi } from '@/lib/api';
import type { DashboardSummary } from '@localmart/api-client';

interface DashboardState {
  summary: DashboardSummary | null;
  loading: boolean;
  error: string;
  fetchSummary: () => Promise<void>;
}

const isDev = process.env.NODE_ENV !== 'production';

export const useDashboardStore = create<DashboardState>()(
  isDev
    ? devtools(
        (set, get) => ({
          summary: null,
          loading: true,
          error: '',
          fetchSummary: async () => {
            if (get().summary) set({ loading: true }, false, 'dashboard/fetchSummary/start');
            else set({ loading: true, error: '' }, false, 'dashboard/fetchSummary/start');
            try {
              const summary = await adminApi.getDashboard();
              set({ summary, loading: false, error: '' }, false, 'dashboard/fetchSummary/success');
            } catch (err: any) {
              set({ error: err.message, loading: false }, false, 'dashboard/fetchSummary/error');
            }
          },
        }),
        { name: 'DashboardStore' }
      )
    : (set, get) => ({
        summary: null,
        loading: true,
        error: '',
        fetchSummary: async () => {
          set({ loading: true, error: '' });
          try {
            const summary = await adminApi.getDashboard();
            set({ summary, loading: false, error: '' });
          } catch (err: any) {
            set({ error: err.message, loading: false });
          }
        },
      })
);
