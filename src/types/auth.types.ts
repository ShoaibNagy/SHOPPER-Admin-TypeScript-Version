import type { ISODateString, ObjectId } from './api.types';

// ---------------------------------------------------------------------------
// Admin role
// ---------------------------------------------------------------------------
export type AdminRole = 'super_admin' | 'admin';

// ---------------------------------------------------------------------------
// Admin user — the shape returned by GET /auth/me
// ---------------------------------------------------------------------------
export interface AdminUser {
  readonly _id: ObjectId;
  readonly name: string;
  readonly email: string;
  readonly role: AdminRole;
  readonly avatar?: string;
  readonly createdAt: ISODateString;
  readonly updatedAt: ISODateString;
}

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------
export interface LoginRequest {
  readonly email: string;
  readonly password: string;
}

export interface LoginResponse {
  readonly accessToken: string;
  readonly admin: AdminUser;
}

// ---------------------------------------------------------------------------
// Token refresh
// ---------------------------------------------------------------------------
export interface RefreshTokenResponse {
  readonly accessToken: string;
}

// ---------------------------------------------------------------------------
// Zustand auth store shape (used by auth.store.ts)
// ---------------------------------------------------------------------------
export interface AuthStoreState {
  readonly admin: AdminUser | null;
  readonly isAuthenticated: boolean;
  readonly isLoading: boolean;
}

export interface AuthStoreActions {
  setAdmin: (admin: AdminUser, token: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export type AuthStore = AuthStoreState & AuthStoreActions;