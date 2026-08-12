// packages/api-client/src/endpoints/store-owner.ts
// Store Owner (STORE_OWNER role) endpoints — authenticated via httpOnly cookie + proxy

import type { ApiClient } from '../client';

export type StoreStatus = 'DRAFT' | 'PENDING' | 'LIVE' | 'SUSPENDED';
export type DocVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface StoreProfile {
  id: string;
  name: string;
  status: StoreStatus;
  description: string | null;
  address: string | null;
  cityId: string | null;
  zoneId: string | null;
  isOpen: boolean;
  isPaused: boolean;
  createdAt: string;
}

export interface StoreOwner {
  id: string;
  userId: string;
  storeId: string;
}

export interface KycStatus {
  storeStatus: StoreStatus;
  documents: Array<{
    docType: string;
    status: DocVerificationStatus;
    fileUrl: string | null;
    rejectionReason: string | null;
  }>;
  requiredDocs: string[];
  allRequiredUploaded: boolean;
}

export interface StoreOwnerDocument {
  id: string;
  docType: string;
  fileUrl: string;
  verificationStatus: DocVerificationStatus;
  rejectionReason: string | null;
  createdAt: string;
}

export interface UpdateStoreProfileDto {
  description?: string;
  address?: string;
  phoneNumber?: string;
}

export interface UploadDocumentDto {
  docType: string;
  fileUrl: string;
  expiresAt?: string;
}

export interface OperatingHours {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface DocumentUploadUrlDto {
  docType: string;
  fileName: string;
  contentType: string;
}

export interface DocumentUploadUrlResponse {
  uploadUrl: string;
  publicUrl: string;
}

export function createStoreOwnerEndpoints(client: ApiClient) {
  return {
    // ── Profile ────────────────────────────────────────────────────────────────
    getProfile: () =>
      client.get<StoreProfile>('/store/profile'),
    updateProfile: (dto: UpdateStoreProfileDto) =>
      client.patch<StoreProfile>('/store/profile', dto),

    // ── KYC & Documents ────────────────────────────────────────────────────────
    getKycStatus: () => client.get<KycStatus>('/store/kyc-status'),
    listDocuments: () => client.get<StoreOwnerDocument[]>('/store/documents'),

    /** Step 1 of 3: Get a pre-signed Supabase upload URL from the backend */
    getDocumentUploadUrl: (dto: DocumentUploadUrlDto) =>
      client.post<DocumentUploadUrlResponse>('/store/documents/upload-url', dto),

    /** Step 3 of 3: Register the public URL in the database after upload */
    uploadDocument: (dto: UploadDocumentDto) =>
      client.post<StoreOwnerDocument>('/store/documents', dto),

    submitForReview: () =>
      client.post<{ message: string }>('/store/submit-for-review', {}),

    // ── Operating Hours ────────────────────────────────────────────────────────
    getOperatingHours: () => client.get<OperatingHours[]>('/store/operating-hours'),
    upsertOperatingHours: (hours: OperatingHours[]) =>
      client.put<OperatingHours[]>('/store/operating-hours', { hours }),

    // ── Pause / Resume ─────────────────────────────────────────────────────────
    togglePause: (paused: boolean, reason?: string) =>
      client.post<{ isPaused: boolean }>('/store/toggle-pause', { paused, reason }),

    // ── Products ───────────────────────────────────────────────────────────────
    listProducts: (query?: {
      categoryId?: string;
      isActive?: boolean;
      search?: string;
      page?: number;
      limit?: number;
    }) =>
      client.get<{ items: unknown[]; total: number; page: number }>(
        '/store/products',
        query as Record<string, string | number | undefined>,
      ),
    createProduct: (dto: unknown) => client.post<unknown>('/store/products', dto),
    getProduct: (productId: string) => client.get<unknown>(`/store/products/${productId}`),
    updateProduct: (productId: string, dto: unknown) =>
      client.patch<unknown>(`/store/products/${productId}`, dto),
    deleteProduct: (productId: string) => client.delete<void>(`/store/products/${productId}`),
  };
}
