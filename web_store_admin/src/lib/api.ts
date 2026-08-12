'use client';
// lib/api.ts — API client singleton for store-admin-web

import { ApiClient, createAuthEndpoints, createStoreOwnerEndpoints } from './api-client';

const BASE_URL =
  typeof window !== 'undefined'
    ? '/api/proxy'
    : (process.env.NEXT_PUBLIC_API_URL
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1`
        : 'http://localhost:3001/api/v1');

function handleUnauthorized() {
  if (typeof window === 'undefined') return;
  fetch('/api/auth', { method: 'DELETE' }).finally(() => {
    window.location.replace('/login');
  });
}

const client = new ApiClient({
  baseUrl: BASE_URL,
  getToken: () => null, // httpOnly cookie handled by proxy route handler
  onUnauthorized: handleUnauthorized,
});

export const authApi = createAuthEndpoints(client);
export const storeOwnerApi = createStoreOwnerEndpoints(client);
