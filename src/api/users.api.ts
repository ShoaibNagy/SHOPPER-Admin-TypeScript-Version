import { del, get, patch } from './client';
import type { PaginatedResponse } from '@/types/api.types';
import type { User, UserListItem, UserListParams, UpdateUserDto } from '@/types/user.types';

const BASE = '/users';

export const usersApi = {
  // ── List ────────────────────────────────────────────────────────────────
  /**
   * GET /api/users
   * Admin-scoped: returns ALL users with optional filters.
   */
  list: (params?: UserListParams) =>
    get<PaginatedResponse<UserListItem>>(BASE, params as Record<string, unknown>),

  // ── Single ──────────────────────────────────────────────────────────────
  /**
   * GET /api/users/:id
   * Returns the full user profile with addresses and order summary.
   */
  getById: (id: string) =>
    get<User>(`${BASE}/${id}`),

  // ── Update ──────────────────────────────────────────────────────────────
  /**
   * PATCH /api/users/:id
   * Admins can update name, phone, status, and role.
   */
  update: (id: string, dto: UpdateUserDto) =>
    patch<User>(`${BASE}/${id}`, dto),

  // ── Suspend / Activate ──────────────────────────────────────────────────
  /**
   * PATCH /api/users/:id/suspend
   */
  suspend: (id: string) =>
    patch<User>(`${BASE}/${id}/suspend`),

  /**
   * PATCH /api/users/:id/activate
   */
  activate: (id: string) =>
    patch<User>(`${BASE}/${id}/activate`),

  // ── Delete ──────────────────────────────────────────────────────────────
  /**
   * DELETE /api/users/:id
   * Soft-deletes the user (sets status to 'deleted').
   */
  delete: (id: string) =>
    del<{ deleted: boolean }>(`${BASE}/${id}`),
};