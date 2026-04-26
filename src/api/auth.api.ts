import { get, post } from './client';
import type { LoginRequest, LoginResponse, AdminUser } from '@/types/auth.types';

const BASE = '/auth';

export const authApi = {
  /**
   * POST /api/auth/admin/login
   * Returns an access token (stored in memory) + sets httpOnly refresh cookie.
   */
  login: (credentials: LoginRequest) =>
    post<LoginResponse>(`${BASE}/admin/login`, credentials),

  /**
   * POST /api/auth/logout
   * Clears the httpOnly refresh cookie on the server.
   */
  logout: () => post<void>(`${BASE}/logout`),

  /**
   * GET /api/auth/me
   * Returns the currently authenticated admin's profile.
   */
  me: () => get<AdminUser>(`${BASE}/me`),

  /**
   * POST /api/auth/refresh-token
   * Called automatically by the Axios interceptor in client.ts.
   * Exposed here for manual use if needed.
   */
  refreshToken: () => post<{ accessToken: string }>(`${BASE}/refresh-token`),
};