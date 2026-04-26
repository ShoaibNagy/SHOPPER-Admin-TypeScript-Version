import axios, { type AxiosError, type AxiosResponse } from 'axios';
import type { ApiError, ApiResponse } from '@/types/api.types';

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------
// In development, Vite's proxy rewrites /api → http://localhost:3000, so we
// always talk to the same origin and avoid CORS issues.
// In production the env var points directly at the deployed API.
// ---------------------------------------------------------------------------
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  withCredentials: true, // send the httpOnly cookie that holds the refresh token
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15_000,
});

// ---------------------------------------------------------------------------
// Request interceptor — attach the access token stored in memory
// ---------------------------------------------------------------------------
apiClient.interceptors.request.use(config => {
  const token = tokenStore.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---------------------------------------------------------------------------
// Response interceptor — unwrap the standard { success, data, message }
// envelope and normalise errors into ApiError
// ---------------------------------------------------------------------------
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<unknown>>) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };

    // ── 401: try a silent token refresh, then replay the request once ──────
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post<ApiResponse<{ accessToken: string }>>(
          `${import.meta.env.VITE_API_URL ?? '/api'}/auth/refresh-token`,
          {},
          { withCredentials: true },
        );
        const newToken = data.data.accessToken;
        tokenStore.set(newToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return apiClient(originalRequest);
      } catch {
        // Refresh failed — clear auth state; the AdminRoute guard will
        // redirect to /login.
        tokenStore.clear();
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(buildApiError(error));
      }
    }

    return Promise.reject(buildApiError(error));
  },
);

// ---------------------------------------------------------------------------
// In-memory token store — never touches localStorage/sessionStorage
// (access tokens must not be persisted in web storage)
// ---------------------------------------------------------------------------
let _token: string | null = null;

export const tokenStore = {
  get: () => _token,
  set: (t: string) => { _token = t; },
  clear: () => { _token = null; },
};

// ---------------------------------------------------------------------------
// Error normaliser
// ---------------------------------------------------------------------------
function buildApiError(error: AxiosError<ApiResponse<unknown>>): ApiError {
  const serverMsg = error.response?.data?.message;
  return {
    message: serverMsg ?? error.message ?? 'An unexpected error occurred.',
    status: error.response?.status ?? 0,
    errors: error.response?.data?.errors ?? [],
  };
}

// ---------------------------------------------------------------------------
// Typed helper wrappers used by all *.api.ts files
// ---------------------------------------------------------------------------
export async function get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const res = await apiClient.get<ApiResponse<T>>(url, { params });
  return res.data.data;
}

export async function post<T>(url: string, body?: unknown): Promise<T> {
  const res = await apiClient.post<ApiResponse<T>>(url, body);
  return res.data.data;
}

export async function put<T>(url: string, body?: unknown): Promise<T> {
  const res = await apiClient.put<ApiResponse<T>>(url, body);
  return res.data.data;
}

export async function patch<T>(url: string, body?: unknown): Promise<T> {
  const res = await apiClient.patch<ApiResponse<T>>(url, body);
  return res.data.data;
}

export async function del<T>(url: string): Promise<T> {
  const res = await apiClient.delete<ApiResponse<T>>(url);
  return res.data.data;
}

export async function postForm<T>(url: string, formData: FormData): Promise<T> {
  const res = await apiClient.post<ApiResponse<T>>(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
}

export default apiClient;