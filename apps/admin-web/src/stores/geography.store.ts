import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { geoApi } from '@/lib/api';
import type { City, Zone } from '@localmart/api-client';

interface GeographyState {
  cities: City[];
  zones: Record<string, Zone[]>;
  expandedCityId: string | null;
  loading: boolean;
  cityModalOpen: boolean;
  zoneModalCityId: string | null;
  editZoneModal: Zone | null;

  setExpandedCityId: (id: string | null) => void;
  setCityModalOpen: (open: boolean) => void;
  setZoneModalCityId: (cityId: string | null) => void;
  setEditZoneModal: (zone: Zone | null) => void;

  fetchCities: () => Promise<void>;
  fetchZones: (cityId: string) => Promise<void>;
  toggleZoneActive: (zone: Zone) => Promise<void>;
  updateZoneInState: (cityId: string, updatedZone: Zone) => void;
  addZoneToState: (cityId: string, newZones: Zone[]) => void;
  updateCityStatus: (cityId: string, status: string) => Promise<void>;
}

const isDev = process.env.NODE_ENV !== 'production';

export const useGeographyStore = create<GeographyState>()(
  isDev
    ? devtools(
        (set, get) => ({
          cities: [],
          zones: {},
          expandedCityId: null,
          loading: true,
          cityModalOpen: false,
          zoneModalCityId: null,
          editZoneModal: null,

          setExpandedCityId: (id) => set({ expandedCityId: id }, false, 'geo/setExpandedCityId'),
          setCityModalOpen: (open) => set({ cityModalOpen: open }, false, 'geo/setCityModalOpen'),
          setZoneModalCityId: (cityId) => set({ zoneModalCityId: cityId }, false, 'geo/setZoneModalCityId'),
          setEditZoneModal: (zone) => set({ editZoneModal: zone }, false, 'geo/setEditZoneModal'),

          fetchCities: async () => {
            set({ loading: true }, false, 'geo/fetchCities/start');
            try {
              const cities = await geoApi.listCities();
              set({ cities, loading: false }, false, 'geo/fetchCities/success');
            } catch {
              set({ loading: false }, false, 'geo/fetchCities/error');
            }
          },

          fetchZones: async (cityId) => {
            if (get().zones[cityId]) return; // Already fetched
            try {
              const z = await geoApi.listZones(cityId);
              set((s) => ({ zones: { ...s.zones, [cityId]: z } }), false, 'geo/fetchZones/success');
            } catch (err) {
              console.error(err);
            }
          },

          toggleZoneActive: async (zone) => {
            try {
              const updated = await geoApi.updateZone(zone.id, { isActive: !zone.isActive } as any);
              get().updateZoneInState(zone.cityId, updated);
            } catch (err: any) {
              console.error('Failed to toggle zone:', err.message);
            }
          },

          updateZoneInState: (cityId, updatedZone) => {
            set((s) => ({
              zones: {
                ...s.zones,
                [cityId]: (s.zones[cityId] ?? []).map(z => z.id === updatedZone.id ? updatedZone : z)
              }
            }), false, 'geo/updateZoneInState');
          },

          addZoneToState: (cityId, newZones) => {
            set((s) => ({
              zones: { ...s.zones, [cityId]: newZones }
            }), false, 'geo/addZoneToState');
          },

          updateCityStatus: async (cityId, status) => {
            const previousCities = get().cities;
            set({ cities: previousCities.map(c => c.id === cityId ? { ...c, status } : c) }, false, 'geo/updateCityStatus/optimistic');
            try {
              await geoApi.updateCity(cityId, { status } as any);
            } catch (err) {
              set({ cities: previousCities }, false, 'geo/updateCityStatus/rollback');
              throw err;
            }
          }
        }),
        { name: 'GeographyStore' }
      )
    : (set, get) => ({
        cities: [],
        zones: {},
        expandedCityId: null,
        loading: true,
        cityModalOpen: false,
        zoneModalCityId: null,
        editZoneModal: null,

        setExpandedCityId: (id) => set({ expandedCityId: id }),
        setCityModalOpen: (open) => set({ cityModalOpen: open }),
        setZoneModalCityId: (cityId) => set({ zoneModalCityId: cityId }),
        setEditZoneModal: (zone) => set({ editZoneModal: zone }),

        fetchCities: async () => {
          set({ loading: true });
          try {
            const cities = await geoApi.listCities();
            set({ cities, loading: false });
          } catch {
            set({ loading: false });
          }
        },

        fetchZones: async (cityId) => {
          if (get().zones[cityId]) return;
          try {
            const z = await geoApi.listZones(cityId);
            set((s) => ({ zones: { ...s.zones, [cityId]: z } }));
          } catch (err) {
            console.error(err);
          }
        },

        toggleZoneActive: async (zone) => {
          try {
            const updated = await geoApi.updateZone(zone.id, { isActive: !zone.isActive } as any);
            get().updateZoneInState(zone.cityId, updated);
          } catch (err: any) {
            console.error('Failed to toggle zone:', err.message);
          }
        },

        updateZoneInState: (cityId, updatedZone) => {
          set((s) => ({
            zones: {
              ...s.zones,
              [cityId]: (s.zones[cityId] ?? []).map(z => z.id === updatedZone.id ? updatedZone : z)
            }
          }));
        },

        addZoneToState: (cityId, newZones) => {
          set((s) => ({
            zones: { ...s.zones, [cityId]: newZones }
          }));
        },

        updateCityStatus: async (cityId, status) => {
          const previousCities = get().cities;
          set({ cities: previousCities.map(c => c.id === cityId ? { ...c, status } : c) });
          try {
            await geoApi.updateCity(cityId, { status } as any);
          } catch (err) {
            set({ cities: previousCities });
            throw err;
          }
        }
      })
);
