// src/stores/location.store.ts
// Owns: GPS detection, Nominatim geocoding, location persistence
// Persisted to localStorage so location survives page refresh.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
}

function extractCity(result: NominatimResult): string {
  const a = result.address;
  // Return empty string if nothing useful found — Header will fall back to address
  return a?.city ?? a?.town ?? a?.village ?? a?.state ?? '';
}

function shortAddress(displayName: string): string {
  // "Connaught Place, New Delhi, Delhi, 110001, India" → "Connaught Place, New Delhi"
  const parts = displayName.split(',');
  return parts.slice(0, 2).join(',').trim();
}

interface LocationState {
  lat: number | null;
  lng: number | null;
  address: string;
  city: string;
  isLoading: boolean;
  error: string | null;
  isLocationModalOpen: boolean;
  permissionRequested: boolean;

  setLocation: (lat: number, lng: number, address: string, city: string) => void;
  detectLocation: () => Promise<void>;
  searchAddress: (query: string) => Promise<NominatimResult[]>;
  reverseGeocode: (lat: number, lng: number) => Promise<void>;
  openModal: () => void;
  closeModal: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      lat: null,
      lng: null,
      address: '',
      city: '',
      isLoading: false,
      error: null,
      isLocationModalOpen: false,
      permissionRequested: false,

      setLocation: (lat, lng, address, city) =>
        set({ lat, lng, address, city, error: null, isLocationModalOpen: false }),

      detectLocation: async () => {
        set({ isLoading: true, error: null, permissionRequested: true });
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            if (!navigator.geolocation) {
              reject(new Error('Geolocation is not supported by your browser'));
              return;
            }
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
            });
          });

          const { latitude: lat, longitude: lng } = position.coords;

          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { 'Accept-Language': 'en' } },
          );
          const data: NominatimResult = await res.json();

          set({
            lat,
            lng,
            address: shortAddress(data.display_name),
            city: extractCity(data),
            isLoading: false,
            isLocationModalOpen: false,
          });
        } catch (err: any) {
          set({
            isLoading: false,
            error: err?.message ?? 'Could not detect location',
          });
        }
      },

      searchAddress: async (query: string): Promise<NominatimResult[]> => {
        if (!query.trim()) return [];
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=in`,
            { headers: { 'Accept-Language': 'en' } },
          );
          return res.json();
        } catch {
          return [];
        }
      },

      reverseGeocode: async (lat: number, lng: number) => {
        set({ isLoading: true });
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { 'Accept-Language': 'en' } },
          );
          const data: NominatimResult = await res.json();
          set({
            lat,
            lng,
            address: shortAddress(data.display_name),
            city: extractCity(data),
            isLoading: false,
          });
        } catch {
          set({ isLoading: false });
        }
      },

      openModal: () => set({ isLocationModalOpen: true }),
      closeModal: () => set({ isLocationModalOpen: false }),
    }),
    {
      name: 'localmart-location',
      partialState: (state: LocationState) => ({
        lat: state.lat,
        lng: state.lng,
        address: state.address,
        city: state.city,
        permissionRequested: state.permissionRequested,
      }),
    } as any,
  ),
);
