// packages/api-client/src/endpoints/auth.ts

import { ApiClient } from '../client';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: { id: string; role: string };
}

export function createAuthEndpoints(client: ApiClient) {
  return {
    requestOtp: (phoneNumber: string) =>
      client.post<{ message: string }>('/api/v1/auth/otp/request', { phoneNumber }),
    verifyOtp: (phoneNumber: string, otp: string) =>
      client.post<AuthResponse>('/api/v1/auth/otp/verify', { phoneNumber, otp }),
    refresh: (refreshToken: string) =>
      client.post<AuthResponse>('/api/v1/auth/refresh', { refreshToken }),
    logout: () => client.post<void>('/api/v1/auth/logout'),
  };
}
