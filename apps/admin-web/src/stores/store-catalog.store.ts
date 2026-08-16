import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { storesApi, geoApi, documentsApi } from '@/lib/api';
import type { StoreListItem, PaginatedResponse, City, StoreDetail, Document } from '@localmart/api-client';

interface StoreCatalogState {
  // ── List State ──
  result: PaginatedResponse<StoreListItem> | null;
  loading: boolean;
  error: string;
  cities: City[];
  
  // Filters
  status: string;
  search: string;
  selectedCityId: string;
  page: number;

  setStatus: (status: string) => void;
  setSearch: (search: string) => void;
  setSelectedCityId: (cityId: string) => void;
  setPage: (page: number) => void;
  resetFilters: () => void;

  fetchCities: () => Promise<void>;
  fetchList: () => Promise<void>;

  // ── Detail State ──
  currentStore: StoreDetail | null;
  documents: Document[];
  loadingDetail: boolean;
  docError: string;

  setDocError: (error: string) => void;
  fetchDetail: (id: string) => Promise<void>;
  verifyDocument: (docId: string) => Promise<void>;
  rejectDocument: (docId: string, reason: string) => Promise<void>;
}

const isDev = process.env.NODE_ENV !== 'production';

export const useStoreCatalogStore = create<StoreCatalogState>()(
  isDev
    ? devtools(
        (set, get) => ({
          result: null,
          loading: true,
          error: '',
          cities: [],
          status: '',
          search: '',
          selectedCityId: '',
          page: 1,

          currentStore: null,
          documents: [],
          loadingDetail: true,
          docError: '',

          setStatus: (status) => set({ status, page: 1 }, false, 'stores/setStatus'),
          setSearch: (search) => set({ search, page: 1 }, false, 'stores/setSearch'),
          setSelectedCityId: (selectedCityId) => set({ selectedCityId, page: 1 }, false, 'stores/setSelectedCityId'),
          setPage: (page) => set({ page }, false, 'stores/setPage'),
          resetFilters: () => set({ status: '', search: '', selectedCityId: '', page: 1 }, false, 'stores/resetFilters'),

          setDocError: (docError) => set({ docError }, false, 'stores/setDocError'),

          fetchCities: async () => {
            try {
              const cities = await geoApi.listCities();
              set({ cities }, false, 'stores/fetchCities');
            } catch (e) { console.error(e); }
          },

          fetchList: async () => {
            const { status, search, selectedCityId, page } = get();
            set({ loading: true, error: '' }, false, 'stores/fetchList/start');
            try {
              const result = await storesApi.list({
                status: status || undefined,
                search: search || undefined,
                cityId: selectedCityId || undefined,
                page,
                limit: 20,
              });
              set({ result, loading: false }, false, 'stores/fetchList/success');
            } catch (e: any) {
              set({ error: e.message, loading: false }, false, 'stores/fetchList/error');
            }
          },

          fetchDetail: async (id: string) => {
            set({ loadingDetail: true, docError: '' }, false, 'stores/fetchDetail/start');
            try {
            const s = await storesApi.get(id);
            const d = await documentsApi.listByOwner('STORE_OWNER', s.owner.id);
            set({ currentStore: s, documents: d, loadingDetail: false }, false, 'stores/fetchDetail/success');
            } catch (e: any) {
              console.error(e);
              set({ loadingDetail: false }, false, 'stores/fetchDetail/error');
            }
          },

          verifyDocument: async (docId: string) => {
            set({ docError: '' }, false, 'stores/verifyDoc');
            try {
              const updated = await documentsApi.verify(docId);
              set((s) => ({
                documents: s.documents.map(d => d.id === docId ? updated : d)
              }), false, 'stores/verifyDoc/success');
            } catch (e: any) {
              set({ docError: e.message }, false, 'stores/verifyDoc/error');
            }
          },

          rejectDocument: async (docId: string, reason: string) => {
            set({ docError: '' }, false, 'stores/rejectDoc');
            try {
              const updated = await documentsApi.reject(docId, reason);
              set((s) => ({
                documents: s.documents.map(d => d.id === docId ? updated : d)
              }), false, 'stores/rejectDoc/success');
            } catch (e: any) {
              set({ docError: e.message }, false, 'stores/rejectDoc/error');
            }
          },
        }),
        { name: 'StoreCatalogStore' }
      )
    : (set, get) => ({
        result: null,
        loading: true,
        error: '',
        cities: [],
        status: '',
        search: '',
        selectedCityId: '',
        page: 1,

        currentStore: null,
        documents: [],
        loadingDetail: true,
        docError: '',

        setStatus: (status) => set({ status, page: 1 }),
        setSearch: (search) => set({ search, page: 1 }),
        setSelectedCityId: (selectedCityId) => set({ selectedCityId, page: 1 }),
        setPage: (page) => set({ page }),
        resetFilters: () => set({ status: '', search: '', selectedCityId: '', page: 1 }),

        setDocError: (docError) => set({ docError }),

        fetchCities: async () => {
          try {
            const cities = await geoApi.listCities();
            set({ cities });
          } catch (e) { console.error(e); }
        },

        fetchList: async () => {
          const { status, search, selectedCityId, page } = get();
          set({ loading: true, error: '' });
          try {
            const result = await storesApi.list({
              status: status || undefined,
              search: search || undefined,
              cityId: selectedCityId || undefined,
              page,
              limit: 20,
            });
            set({ result, loading: false });
          } catch (e: any) {
            set({ error: e.message, loading: false });
          }
        },

        fetchDetail: async (id: string) => {
          set({ loadingDetail: true, docError: '' });
          try {
            const s = await storesApi.get(id);
            const d = await documentsApi.listByOwner('STORE_OWNER', s.owner.id);
            set({ currentStore: s, documents: d, loadingDetail: false });
          } catch (e: any) {
            console.error(e);
            set({ loadingDetail: false });
          }
        },

        verifyDocument: async (docId: string) => {
          set({ docError: '' });
          try {
            const updated = await documentsApi.verify(docId);
            set((s) => ({
              documents: s.documents.map(d => d.id === docId ? updated : d)
            }));
          } catch (e: any) {
            set({ docError: e.message });
          }
        },

        rejectDocument: async (docId: string, reason: string) => {
          set({ docError: '' });
          try {
            const updated = await documentsApi.reject(docId, reason);
            set((s) => ({
              documents: s.documents.map(d => d.id === docId ? updated : d)
            }));
          } catch (e: any) {
            set({ docError: e.message });
          }
        },
      })
);
