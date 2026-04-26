import { del, get, patch } from './client';
import type { PaginatedResponse } from '@/types/api.types';
import type {
  Review,
  ReviewListItem,
  ReviewListParams,
  UpdateReviewStatusDto,
} from '@/types/review.types';

const BASE = '/reviews';

export const reviewsApi = {
  // ── List ────────────────────────────────────────────────────────────────
  /**
   * GET /api/reviews
   * Admin-scoped: returns ALL reviews across all products.
   */
  list: (params?: ReviewListParams) =>
    get<PaginatedResponse<ReviewListItem>>(BASE, params as Record<string, unknown>),

  // ── Single ──────────────────────────────────────────────────────────────
  /**
   * GET /api/reviews/:id
   */
  getById: (id: string) =>
    get<Review>(`${BASE}/${id}`),

  // ── Moderation ──────────────────────────────────────────────────────────
  /**
   * PATCH /api/reviews/:id/status
   * Approve or reject a review with an optional admin note.
   */
  updateStatus: (id: string, dto: UpdateReviewStatusDto) =>
    patch<Review>(`${BASE}/${id}/status`, dto),

  /**
   * PATCH /api/reviews/:id/approve  (convenience shorthand)
   */
  approve: (id: string) =>
    patch<Review>(`${BASE}/${id}/status`, { status: 'approved' } satisfies UpdateReviewStatusDto),

  /**
   * PATCH /api/reviews/:id/reject  (convenience shorthand)
   */
  reject: (id: string, note?: string) =>
    patch<Review>(
      `${BASE}/${id}/status`,
      { status: 'rejected', adminNote: note! } satisfies UpdateReviewStatusDto,
    ),

  // ── Delete ──────────────────────────────────────────────────────────────
  /**
   * DELETE /api/reviews/:id
   */
  delete: (id: string) =>
    del<{ deleted: boolean }>(`${BASE}/${id}`),
};