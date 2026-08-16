'use client';
// lib/api.ts — API client singleton for admin-web
// Token source: httpOnly cookie (handled by browser automatically on same-origin requests)
// For server-side fetches, pass the cookie header explicitly using the helper below.

import {
  ApiClient,
  createAuthEndpoints,
  createStoresEndpoints,
  createDocumentsEndpoints,
  createCategoriesEndpoints,
  createGeoEndpoints,
  createAdminEndpoints
} from '@localmart/api-client';

// For client-side requests in the browser, route through the same-origin Next.js proxy (/api/proxy)
// which automatically reads the httpOnly cookie and passes Authorization: Bearer <token> to NestJS.
const BASE_URL = typeof window !== 'undefined'
  ? '/api/proxy'
  : (process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1` : 'http://localhost:3001/api/v1');

function handleUnauthorized() {
  if (typeof window === 'undefined') return;
  // Clear cookie server-side, then redirect to login
  fetch('/api/auth', { method: 'DELETE' }).finally(() => {
    window.location.replace('/login');
  });
}

const client = new ApiClient({
  baseUrl: BASE_URL,
  getToken: () => null,
  onUnauthorized: handleUnauthorized,
});

export const authApi = createAuthEndpoints(client);
export const storesApi = createStoresEndpoints(client);
export const documentsApi = createDocumentsEndpoints(client);
export const categoriesApi = createCategoriesEndpoints(client);
export const geoApi = createGeoEndpoints(client);
export const adminApi = createAdminEndpoints(client);

// Legacy helpers — kept for backward compatibility with any remaining localStorage calls.
// In the cookie-auth model these are no-ops.
export function setToken(_token: string) {}
export function clearToken() {}
export function getToken(): string | null { return null; }
