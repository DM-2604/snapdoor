import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import debounce from 'lodash.debounce';
import { adminApi, geoApi, categoriesApi } from '@/lib/api';
import type { FeePlan, City, Zone, Category } from '@localmart/api-client';

interface CommissionState {
  // We removed rules since react-query manages it
  plans: FeePlan[];
  loading: boolean;
  ruleModalOpen: boolean;
  planModalOpen: boolean;
  
  // Context data for forms
  cities: City[];
  categories: Category[];
  formZones: Zone[];

  // Draft filters (UI inputs)
  draftCityId: string | null;
  draftState: string | null;
  draftZoneId: string | null;
  draftDate: string | null;
  
  // Applied filters (sent to API after debounce)
  appliedFilters: {
    cityId?: string;
    state?: string;
    zoneId?: string;
    effectiveDate?: string;
  };

  setDraftCityId: (id: string | null) => void;
  setDraftState: (state: string | null) => void;
  setDraftZoneId: (id: string | null) => void;
  setDraftDate: (date: string | null) => void;
  
  applyFilters: () => void;
  debouncedApplyFilters: () => void;

  setRuleModalOpen: (open: boolean) => void;
  setPlanModalOpen: (open: boolean) => void;

  fetchPlans: () => Promise<void>;
  fetchCities: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchFormZones: (cityId: string) => Promise<void>;
}

const isDev = process.env.NODE_ENV !== 'production';

const debounceApply = debounce((set: any, get: any) => {
  set({
    appliedFilters: {
      cityId: get().draftCityId || undefined,
      state: get().draftState || undefined,
      zoneId: get().draftZoneId || undefined,
      effectiveDate: get().draftDate || undefined,
    }
  }, false, 'comm/debouncedApplyFilters');
}, 400);

export const useCommissionStore = create<CommissionState>()(
  isDev
    ? devtools(
        (set, get) => ({
          plans: [],
          loading: true,
          ruleModalOpen: false,
          planModalOpen: false,
          cities: [],
          categories: [],
          formZones: [],

          draftCityId: null,
          draftState: null,
          draftZoneId: null,
          draftDate: null,
          appliedFilters: {},

          setDraftCityId: (id) => {
            set({ draftCityId: id, draftZoneId: null }, false, 'comm/setDraftCityId');
            get().debouncedApplyFilters();
          },
          setDraftState: (state) => {
            set({ draftState: state, draftCityId: null, draftZoneId: null }, false, 'comm/setDraftState');
            get().debouncedApplyFilters();
          },
          setDraftZoneId: (id) => {
            set({ draftZoneId: id }, false, 'comm/setDraftZoneId');
            get().debouncedApplyFilters();
          },
          setDraftDate: (date) => {
            set({ draftDate: date }, false, 'comm/setDraftDate');
            get().debouncedApplyFilters();
          },

          applyFilters: () => {
            set({
              appliedFilters: {
                cityId: get().draftCityId || undefined,
                state: get().draftState || undefined,
                zoneId: get().draftZoneId || undefined,
                effectiveDate: get().draftDate || undefined,
              }
            }, false, 'comm/applyFilters');
          },
          debouncedApplyFilters: () => debounceApply(set, get),

          setRuleModalOpen: (open) => set({ ruleModalOpen: open }, false, 'comm/setRuleModalOpen'),
          setPlanModalOpen: (open) => set({ planModalOpen: open }, false, 'comm/setPlanModalOpen'),

          fetchPlans: async () => {
            set({ loading: true }, false, 'comm/fetchPlans/start');
            try {
              const p = await adminApi.listFeePlans();
              set({ plans: p, loading: false }, false, 'comm/fetchPlans/success');
            } catch (err) {
              console.error(err);
              set({ loading: false }, false, 'comm/fetchPlans/error');
            }
          },

          fetchCities: async () => {
            try {
              const cities = await geoApi.listCities();
              set({ cities }, false, 'comm/fetchCities');
            } catch (err) { console.error(err); }
          },

          fetchCategories: async () => {
            try {
              const categories = await categoriesApi.list();
              set({ categories }, false, 'comm/fetchCategories');
            } catch (err) { console.error(err); }
          },

          fetchFormZones: async (cityId) => {
            try {
              const zones = await geoApi.listZones(cityId);
              set({ formZones: zones }, false, 'comm/fetchFormZones');
            } catch (err) { console.error(err); }
          }
        }),
        { name: 'CommissionStore' }
      )
    : (set, get) => ({
        plans: [],
        loading: true,
        ruleModalOpen: false,
        planModalOpen: false,
        cities: [],
        categories: [],
        formZones: [],

        draftCityId: null,
        draftState: null,
        draftZoneId: null,
        draftDate: null,
        appliedFilters: {},

        setDraftCityId: (id) => {
          set({ draftCityId: id, draftZoneId: null });
          get().debouncedApplyFilters();
        },
        setDraftState: (state) => {
          set({ draftState: state, draftCityId: null, draftZoneId: null });
          get().debouncedApplyFilters();
        },
        setDraftZoneId: (id) => {
          set({ draftZoneId: id });
          get().debouncedApplyFilters();
        },
        setDraftDate: (date) => {
          set({ draftDate: date });
          get().debouncedApplyFilters();
        },

        applyFilters: () => {
          set({
            appliedFilters: {
              cityId: get().draftCityId || undefined,
              state: get().draftState || undefined,
              zoneId: get().draftZoneId || undefined,
              effectiveDate: get().draftDate || undefined,
            }
          });
        },
        debouncedApplyFilters: () => debounceApply(set, get),

        setRuleModalOpen: (open) => set({ ruleModalOpen: open }),
        setPlanModalOpen: (open) => set({ planModalOpen: open }),

        fetchPlans: async () => {
          set({ loading: true });
          try {
            const p = await adminApi.listFeePlans();
            set({ plans: p, loading: false });
          } catch (err) {
            console.error(err);
            set({ loading: false });
          }
        },

        fetchCities: async () => {
          try {
            const cities = await geoApi.listCities();
            set({ cities });
          } catch (err) { console.error(err); }
        },

        fetchCategories: async () => {
          try {
            const categories = await categoriesApi.list();
            set({ categories });
          } catch (err) { console.error(err); }
        },

        fetchFormZones: async (cityId) => {
          try {
            const zones = await geoApi.listZones(cityId);
            set({ formZones: zones });
          } catch (err) { console.error(err); }
        }
      })
);
