import { create } from 'zustand';
import { tokenStore } from '@api/client';
import { authApi } from '@api/auth.api';
import type { AuthStore } from '@/types/auth.types';
import type { AdminUser } from '@/types/auth.types';

// ---------------------------------------------------------------------------
// Auth Store
// ---------------------------------------------------------------------------
// Responsibilities:
//   1. Hold the authenticated admin's profile in memory.
//   2. Bridge the in-memory access token (tokenStore) with React state.
//   3. Expose setAdmin / clearAuth for the useAdminAuth hook to call.
//   4. Hydrate on first mount by calling GET /auth/me — this lets the admin
//      survive a hard refresh as long as the httpOnly refresh cookie is valid.
//
// What this store intentionally does NOT do:
//   - No localStorage / sessionStorage. Access tokens must stay in JS memory.
//   - No direct API calls beyond the silent /me hydration below.
//     All login / logout logic lives in useAdminAuth to keep this store thin.
// ---------------------------------------------------------------------------

export const useAuthStore = create<AuthStore>((set) => ({
  // ── State ────────────────────────────────────────────────────────────
  admin: null,
  isAuthenticated: false,
  isLoading: true, // starts true so AdminRoute can show a spinner before hydration

  // ── Actions ──────────────────────────────────────────────────────────

  /**
   * Called after a successful login or token refresh.
   * Stores the admin profile in state and the access token in memory.
   */
  setAdmin: (admin: AdminUser, token: string) => {
    tokenStore.set(token);
    set({ admin, isAuthenticated: true, isLoading: false });
  },

  /**
   * Called on logout or when the refresh token is expired.
   * Clears all auth state and the in-memory token.
   */
  clearAuth: () => {
    tokenStore.clear();
    set({ admin: null, isAuthenticated: false, isLoading: false });
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));

// ---------------------------------------------------------------------------
// Silent hydration — called once from main.tsx on app startup.
// Attempts to restore the session by exchanging the httpOnly refresh cookie
// for a new access token, then fetching /auth/me to populate the store.
// ---------------------------------------------------------------------------
export async function hydrateAuth(): Promise<void> {
  const { setAdmin, clearAuth } = useAuthStore.getState();
  try {
    // 1. Exchange the refresh cookie for a fresh access token
    const { accessToken } = await authApi.refreshToken();
    tokenStore.set(accessToken);

    // 2. Fetch the admin profile
    const admin = await authApi.me();
    setAdmin(admin, accessToken);
  } catch {
    // Refresh cookie missing or expired — start unauthenticated
    clearAuth();
  }
}

// ---------------------------------------------------------------------------
// Global logout listener — dispatched by the Axios interceptor in client.ts
// when a 401 refresh attempt also fails mid-session.
// ---------------------------------------------------------------------------
if (typeof window !== 'undefined') {
  window.addEventListener('auth:logout', () => {
    useAuthStore.getState().clearAuth();
  });
}