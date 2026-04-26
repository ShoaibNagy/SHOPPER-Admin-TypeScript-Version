import type { OrderListParams } from '@/types/order.types';
import type { ProductListParams } from '@/types/product.types';
import type { ReviewListParams } from '@/types/review.types';
import type { UserListParams } from '@/types/user.types';

// ---------------------------------------------------------------------------
// Query key factory
// ---------------------------------------------------------------------------
// Pattern: [domain, ...scope]
// Using a factory pattern makes invalidation surgical:
//   queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
//   — invalidates all product queries.
//   queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(id) })
//   — invalidates only that product's detail query.
// ---------------------------------------------------------------------------

export const queryKeys = {
  // ── Auth ──────────────────────────────────────────────────────────────
  auth: {
    me: ['auth', 'me'] as const,
  },

  // ── Products ──────────────────────────────────────────────────────────
  products: {
    all:        ['products'] as const,
    lists:      () => [...queryKeys.products.all, 'list'] as const,
    list:       (params?: ProductListParams) => [...queryKeys.products.lists(), params] as const,
    details:    () => [...queryKeys.products.all, 'detail'] as const,
    detail:     (id: string) => [...queryKeys.products.details(), id] as const,
    categories: () => [...queryKeys.products.all, 'categories'] as const,
  },

  // ── Orders ────────────────────────────────────────────────────────────
  orders: {
    all:     ['orders'] as const,
    lists:   () => [...queryKeys.orders.all, 'list'] as const,
    list:    (params?: OrderListParams) => [...queryKeys.orders.lists(), params] as const,
    details: () => [...queryKeys.orders.all, 'detail'] as const,
    detail:  (id: string) => [...queryKeys.orders.details(), id] as const,
  },

  // ── Users ─────────────────────────────────────────────────────────────
  users: {
    all:     ['users'] as const,
    lists:   () => [...queryKeys.users.all, 'list'] as const,
    list:    (params?: UserListParams) => [...queryKeys.users.lists(), params] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail:  (id: string) => [...queryKeys.users.details(), id] as const,
  },

  // ── Reviews ───────────────────────────────────────────────────────────
  reviews: {
    all:     ['reviews'] as const,
    lists:   () => [...queryKeys.reviews.all, 'list'] as const,
    list:    (params?: ReviewListParams) => [...queryKeys.reviews.lists(), params] as const,
    details: () => [...queryKeys.reviews.all, 'detail'] as const,
    detail:  (id: string) => [...queryKeys.reviews.details(), id] as const,
  },

  // ── Dashboard ─────────────────────────────────────────────────────────
  dashboard: {
    all:   ['dashboard'] as const,
    stats: () => [...queryKeys.dashboard.all, 'stats'] as const,
    chart: (range: string) => [...queryKeys.dashboard.all, 'chart', range] as const,
  },
} as const;