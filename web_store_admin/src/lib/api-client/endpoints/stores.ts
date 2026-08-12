// packages/api-client/src/endpoints/stores.ts

import { ApiClient } from '../client';

export interface StoreListItem {
  id: string;
  name: string;
  storeCode: string;
  status: 'PENDING' | 'LIVE' | 'REJECTED' | 'SUSPENDED';
  address: string;
  createdAt: string;
  owner: { id: string; name: string | null; phoneNumber: string; email: string | null };
  city: { id: string; name: string };
  zone: { id: string; name: string } | null;
  businessCategory: { id: string; name: string };
}

export interface StoreDetail extends StoreListItem {
  description: string | null;
  location: { lat: number; lng: number } | null;
  effectiveCommissionPercent: number | null;
  billing: unknown | null; // read-only snapshot
  approvalQueue: Array<{
    id: string;
    decision: string;
    decisionReason: string | null;
    reviewedAt: string | null;
    submittedAt: string;
  }>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export function createStoresEndpoints(client: ApiClient) {
  return {
    list(params?: { status?: string; search?: string; cityId?: string; zoneId?: string; page?: number; limit?: number }) {
      return client.get<PaginatedResponse<StoreListItem>>('/api/v1/admin/stores', params as any);
    },
    create(data: {
      ownerPhoneNumber: string;
      ownerName?: string;
      name: string;
      storeCode?: string;
      businessCategoryId: string;
      cityId: string;
      zoneId?: string;
      address: string;
      latitude?: number;
      longitude?: number;
    }) {
      return client.post<StoreDetail>('/api/v1/admin/stores', data);
    },
    get(id: string) {
      return client.get<StoreDetail>(`/api/v1/admin/stores/${id}`);
    },
    approve(id: string) {
      return client.post<StoreDetail>(`/api/v1/admin/stores/${id}/approve`);
    },
    requestChanges(id: string, reason: string) {
      return client.post<StoreDetail>(`/api/v1/admin/stores/${id}/request-changes`, { reason });
    },
    reject(id: string, reason: string) {
      return client.post<StoreDetail>(`/api/v1/admin/stores/${id}/reject`, { reason });
    },
  };
}
