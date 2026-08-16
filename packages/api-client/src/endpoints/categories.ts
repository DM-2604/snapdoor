// packages/api-client/src/endpoints/categories.ts

import { ApiClient } from '../client';

export interface Category {
  id: string;
  parentCategoryId: string | null;
  name: string;
  iconUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export function createCategoriesEndpoints(client: ApiClient) {
  return {
    list() {
      return client.get<Category[]>('/api/v1/admin/categories');
    },
    create(dto: { parentCategoryId?: string; name: string; sortOrder?: number; isActive?: boolean }) {
      return client.post<Category>('/api/v1/admin/categories', dto);
    },
    update(id: string, dto: Partial<{ parentCategoryId: string; name: string; sortOrder: number; isActive: boolean }>) {
      return client.patch<Category>(`/api/v1/admin/categories/${id}`, dto);
    },
    delete(id: string) {
      return client.delete<void>(`/api/v1/admin/categories/${id}`);
    },
  };
}
