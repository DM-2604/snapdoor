// packages/api-client/src/endpoints/documents.ts

import { ApiClient } from '../client';

export interface Document {
  id: string;
  ownerType: 'STORE' | 'STORE_OWNER' | 'DELIVERY_PARTNER';
  ownerId: string;
  docType: string;
  fileUrl: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  rejectionReason: string | null;
  verifiedAt: string | null;
  createdAt: string;
}

export function createDocumentsEndpoints(client: ApiClient) {
  return {
    listByOwner(ownerType: string, ownerId: string) {
      return client.get<Document[]>('/api/v1/admin/documents', { ownerType, ownerId });
    },
    verify(id: string) {
      return client.post<Document>(`/api/v1/admin/documents/${id}/verify`);
    },
    reject(id: string, reason: string) {
      return client.post<Document>(`/api/v1/admin/documents/${id}/reject`, { reason });
    },
  };
}
