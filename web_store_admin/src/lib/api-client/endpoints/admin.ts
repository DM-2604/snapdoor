// packages/api-client/src/endpoints/admin.ts — dashboard + audit logs + settings + commission

import { ApiClient } from '../client';

export interface DashboardSummary {
  stores: Record<string, number>;
  zonesPerCity: { cityId: string; cityName: string; zoneCount: number }[];
  activeFeePlansCount: number;
  totalDocumentsPending: number;
}

export interface AuditLog {
  id: string; actorUserId: string | null; action: string;
  entityType: string; entityId: string;
  before: unknown; after: unknown; createdAt: string;
  actor: { id: string; name: string | null; phoneNumber: string } | null;
}

export interface CommissionRule {
  id: string; cityId: string | null; zoneId: string | null;
  categoryId: string | null; storeId: string | null;
  commissionPercent: string; effectiveFrom: string; effectiveTo: string | null;
  reason: string | null; createdAt: string;
  city?: { id: string; name: string } | null;
  zone?: { id: string; name: string } | null;
  category?: { id: string; name: string } | null;
  store?: { id: string; name: string } | null;
}

export interface FeePlan {
  id: string; name: string; planType: string;
  monthlyFee: string | null; setupFee: string | null;
  isActive: boolean; cityId: string | null;
  effectiveFrom: string; effectiveTo: string | null; createdAt: string;
  city?: { id: string; name: string } | null;
}

export interface CommissionSearchResult {
  data: CommissionRule[];
  nextCursor: string | null;
  totalCount: number;
}

export interface PlatformSetting { id: string; key: string; value: unknown; description: string | null; }

export function createAdminEndpoints(client: ApiClient) {
  return {
    getDashboard: () => client.get<DashboardSummary>('/api/v1/admin/dashboard/summary'),
    listAuditLogs: (params?: { entityType?: string; entityId?: string; actorUserId?: string; page?: number; limit?: number }) =>
      client.get<{ items: AuditLog[]; total: number; page: number; limit: number }>('/api/v1/admin/audit-logs', params as any),
    listCommissionRules: (query?: { cityId?: string; state?: string; zoneId?: string; effectiveDate?: string; cursor?: string; limit?: number; searchQuery?: string }, signal?: AbortSignal) => 
      client.get<CommissionSearchResult>('/api/v1/admin/commission/rules', query as any, { signal }),
    createCommissionRule: (dto: Partial<CommissionRule> & { commissionPercent: number; effectiveFrom: string }) =>
      client.post<CommissionRule>('/api/v1/admin/commission/rules', dto),
    listFeePlans: () => client.get<FeePlan[]>('/api/v1/admin/fee-plans'),
    createFeePlan: (dto: Partial<FeePlan> & { name: string; planType: string; effectiveFrom: string }) =>
      client.post<FeePlan>('/api/v1/admin/fee-plans', dto),
    updateFeePlan: (id: string, dto: Partial<FeePlan>) => client.patch<FeePlan>(`/api/v1/admin/fee-plans/${id}`, dto),
    getSetting: (key: string) => client.get<PlatformSetting>(`/api/v1/admin/settings/${key}`),
    setSetting: (key: string, value: unknown, description?: string) =>
      client.put<PlatformSetting>(`/api/v1/admin/settings/${key}`, { value, description }),
    
    // KYC Review Methods
    verifyDocument: (documentId: string) => client.post<void>(`/api/v1/admin/documents/${documentId}/verify`),
    rejectDocument: (documentId: string, reason: string) => client.post<void>(`/api/v1/admin/documents/${documentId}/reject`, { reason }),
    approveStoreKyc: (storeId: string) => client.post<void>(`/api/v1/admin/stores/${storeId}/approve`),
  };
}
