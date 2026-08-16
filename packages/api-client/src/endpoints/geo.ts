// packages/api-client/src/endpoints/geo.ts

import { ApiClient } from '../client';

export interface City {
  id: string; name: string; state: string; country: string;
  status: string; timezone: string; defaultCommissionPercent: number | null;
  isDeliveryFleetEnabled: boolean; createdAt: string;
}

export interface Zone {
  id: string; cityId: string; name: string; code: string;
  isActive: boolean; colorHex: string | null;
  defaultCommissionPercent: number | null; storeCount: number; createdAt: string;
}

export function createGeoEndpoints(client: ApiClient) {
  return {
    listCities: () => client.get<City[]>('/api/v1/admin/geo/cities'),
    createCity: (dto: Partial<City>) => client.post<City>('/api/v1/admin/geo/cities', dto),
    updateCity: (id: string, dto: Partial<City>) => client.patch<City>(`/api/v1/admin/geo/cities/${id}`, dto),
    listZones: (cityId: string) => client.get<Zone[]>(`/api/v1/admin/geo/cities/${cityId}/zones`),
    createZone: (cityId: string, dto: Partial<Zone> & { lat: number; lng: number }) =>
      client.post<Zone>(`/api/v1/admin/geo/cities/${cityId}/zones`, dto),
    updateZone: (id: string, dto: Partial<Zone & { lat?: number; lng?: number }>) =>
      client.patch<Zone>(`/api/v1/admin/geo/zones/${id}`, dto),
  };
}
