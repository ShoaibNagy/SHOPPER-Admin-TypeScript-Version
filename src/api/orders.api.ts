import { del, get, patch } from './client';
import type { PaginatedResponse } from '@/types/api.types';
import type {
  Order,
  OrderListItem,
  OrderListParams,
  UpdateOrderAdminNotesDto,
  UpdateOrderStatusDto,
  UpdateOrderTrackingDto,
} from '@/types/order.types';

const BASE = '/orders';

export const ordersApi = {
  // ── List ────────────────────────────────────────────────────────────────
  /**
   * GET /api/orders
   * Admin-scoped: returns ALL orders with optional filters.
   */
  list: (params?: OrderListParams) =>
    get<PaginatedResponse<OrderListItem>>(BASE, params as Record<string, unknown>),

  // ── Single ──────────────────────────────────────────────────────────────
  /**
   * GET /api/orders/:id
   * Returns the full order document with line items and status history.
   */
  getById: (id: string) =>
    get<Order>(`${BASE}/${id}`),

  // ── Status ──────────────────────────────────────────────────────────────
  /**
   * PATCH /api/orders/:id/status
   * Updates the order status and appends a history entry.
   */
  updateStatus: (id: string, dto: UpdateOrderStatusDto) =>
    patch<Order>(`${BASE}/${id}/status`, dto),

  // ── Tracking ────────────────────────────────────────────────────────────
  /**
   * PATCH /api/orders/:id/tracking
   */
  updateTracking: (id: string, dto: UpdateOrderTrackingDto) =>
    patch<Order>(`${BASE}/${id}/tracking`, dto),

  // ── Admin Notes ─────────────────────────────────────────────────────────
  /**
   * PATCH /api/orders/:id/notes
   */
  updateAdminNotes: (id: string, dto: UpdateOrderAdminNotesDto) =>
    patch<Order>(`${BASE}/${id}/notes`, dto),

  // ── Refund ──────────────────────────────────────────────────────────────
  /**
   * POST /api/orders/:id/refund
   * Triggers a Stripe refund and sets status to 'refunded'.
   */
  refund: (id: string) =>
    patch<Order>(`${BASE}/${id}/refund`),

  // ── Delete ──────────────────────────────────────────────────────────────
  /**
   * DELETE /api/orders/:id
   * Soft-delete or hard-delete depending on backend config.
   */
  delete: (id: string) =>
    del<{ deleted: boolean }>(`${BASE}/${id}`),
};