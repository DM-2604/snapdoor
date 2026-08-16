import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { adminApi } from '@/lib/api';
import type { AuditLog } from '@localmart/api-client';

interface AuditState {
  logs: AuditLog[];
  total: number;
  loading: boolean;
  page: number;
  entityType: string;

  setPage: (page: number) => void;
  setEntityType: (entityType: string) => void;
  fetchLogs: () => Promise<void>;
}

const isDev = process.env.NODE_ENV !== 'production';

export const useAuditStore = create<AuditState>()(
  isDev
    ? devtools(
        (set, get) => ({
          logs: [],
          total: 0,
          loading: true,
          page: 1,
          entityType: '',

          setPage: (page) => set({ page }, false, 'audit/setPage'),
          setEntityType: (entityType) => set({ entityType, page: 1 }, false, 'audit/setEntityType'),

          fetchLogs: async () => {
            const { entityType, page } = get();
            set({ loading: true }, false, 'audit/fetch/start');
            try {
              const r = await adminApi.listAuditLogs({ entityType: entityType || undefined, page, limit: 25 });
              set({ logs: r.items, total: r.total, loading: false }, false, 'audit/fetch/success');
            } catch (err) {
              console.error(err);
              set({ loading: false }, false, 'audit/fetch/error');
            }
          },
        }),
        { name: 'AuditStore' }
      )
    : (set, get) => ({
        logs: [],
        total: 0,
        loading: true,
        page: 1,
        entityType: '',

        setPage: (page) => set({ page }),
        setEntityType: (entityType) => set({ entityType, page: 1 }),

        fetchLogs: async () => {
          const { entityType, page } = get();
          set({ loading: true });
          try {
            const r = await adminApi.listAuditLogs({ entityType: entityType || undefined, page, limit: 25 });
            set({ logs: r.items, total: r.total, loading: false });
          } catch (err) {
            console.error(err);
            set({ loading: false });
          }
        },
      })
);
