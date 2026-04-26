import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authApi } from '@api/auth.api';
import { useAuthStore } from '@store/auth.store';
import { queryKeys } from '@utils/queryKeys';
import type { LoginRequest } from '@/types/auth.types';
import type { ApiError } from '@/types/api.types';

// ---------------------------------------------------------------------------
// useAdminAuth
// ---------------------------------------------------------------------------
// Single hook that owns all authentication side-effects:
//   - login()  — POST /auth/admin/login → store token + admin → redirect
//   - logout() — POST /auth/logout      → clear store     → redirect /login
//
// The store itself stays thin (pure state). All navigation, toasts, and
// query-cache clearing live here.
// ---------------------------------------------------------------------------
export function useAdminAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { setAdmin, clearAuth, admin, isAuthenticated, isLoading } = useAuthStore();

  // Where to go after login — honour the ?from= redirect preserved by AdminRoute
  const from = (location.state as { from?: Location } | null)?.from?.pathname ?? '/dashboard';

  // ── Login ────────────────────────────────────────────────────────────
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
    onSuccess: ({ accessToken, admin: adminUser }) => {
      setAdmin(adminUser, accessToken);
      // Pre-populate the /auth/me query so the first render doesn't refetch
      queryClient.setQueryData(queryKeys.auth.me, adminUser);
      toast.success(`Welcome back, ${adminUser.name.split(' ')[0]}!`);
      navigate(from, { replace: true });
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? 'Login failed. Please check your credentials.');
    },
  });

  // ── Logout ───────────────────────────────────────────────────────────
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function logout() {
    setIsLoggingOut(true);
    try {
      await authApi.logout();
    } catch {
      // Server-side logout failure is non-critical — clear client state anyway
    } finally {
      clearAuth();
      queryClient.clear(); // wipe all cached server data
      navigate('/login', { replace: true });
      setIsLoggingOut(false);
    }
  }

  return {
    // State
    admin,
    isAuthenticated,
    isLoading,
    isLoggingOut,
    // Login mutation
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoginPending: loginMutation.isPending,
    loginError: loginMutation.error as ApiError | null,
    // Logout
    logout,
  };
}