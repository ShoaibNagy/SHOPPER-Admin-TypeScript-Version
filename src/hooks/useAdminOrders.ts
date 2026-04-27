import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ordersApi } from '@api/orders.api';
import { queryKeys } from '@utils/queryKeys';
import type {
  OrderListParams,
  UpdateOrderStatusDto,
  UpdateOrderTrackingDto,
  UpdateOrderAdminNotesDto,
} from '@/types/order.types';
import { extractErrorMessage } from '@utils/extractErrorMessage';

// ---------------------------------------------------------------------------
// useAdminOrders — paginated list with filters
// ---------------------------------------------------------------------------
export function useAdminOrders(params?: OrderListParams) {
  return useQuery({
    queryKey: queryKeys.orders.list(params),
    queryFn: () => ordersApi.list(params),
    placeholderData: keepPreviousData,
    staleTime: 20_000, // orders change more frequently than products
  });
}

// ---------------------------------------------------------------------------
// useAdminOrder — single order detail
// ---------------------------------------------------------------------------
export function useAdminOrder(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id ?? ''),
    queryFn: () => ordersApi.getById(id!),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}

// ---------------------------------------------------------------------------
// Shared helper — after any order mutation, update the detail cache in-place
// and invalidate the list so the status badge on the list row refreshes.
// ---------------------------------------------------------------------------
function useOrderMutationCallbacks(id: string) {
  const queryClient = useQueryClient();
  return {
    onSuccess: (updated: Awaited<ReturnType<typeof ordersApi.getById>>) => {
      queryClient.setQueryData(queryKeys.orders.detail(id), updated);
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists() });
    },
  };
}

// ---------------------------------------------------------------------------
// useUpdateOrderStatus
// ---------------------------------------------------------------------------
export function useUpdateOrderStatus(id: string) {
  const { onSuccess } = useOrderMutationCallbacks(id);
  return useMutation({
    mutationFn: (dto: UpdateOrderStatusDto) => ordersApi.updateStatus(id, dto),
    onSuccess: updated => {
      onSuccess(updated);
      toast.success(`Order status updated to "${updated.status}".`);
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err, 'Failed to update order status.'));
    },
  });
}

// ---------------------------------------------------------------------------
// useUpdateOrderTracking
// ---------------------------------------------------------------------------
export function useUpdateOrderTracking(id: string) {
  const { onSuccess } = useOrderMutationCallbacks(id);
  return useMutation({
    mutationFn: (dto: UpdateOrderTrackingDto) => ordersApi.updateTracking(id, dto),
    onSuccess: updated => {
      onSuccess(updated);
      toast.success('Tracking information saved.');
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err, 'Failed to save tracking info.'));
    },
  });
}

// ---------------------------------------------------------------------------
// useUpdateOrderAdminNotes
// ---------------------------------------------------------------------------
export function useUpdateOrderAdminNotes(id: string) {
  const { onSuccess } = useOrderMutationCallbacks(id);
  return useMutation({
    mutationFn: (dto: UpdateOrderAdminNotesDto) => ordersApi.updateAdminNotes(id, dto),
    onSuccess: updated => {
      onSuccess(updated);
      toast.success('Admin notes saved.');
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err, 'Failed to save notes.'));
    },
  });
}

// ---------------------------------------------------------------------------
// useRefundOrder
// ---------------------------------------------------------------------------
export function useRefundOrder(id: string) {
  const { onSuccess } = useOrderMutationCallbacks(id);
  return useMutation({
    mutationFn: () => ordersApi.refund(id),
    onSuccess: updated => {
      onSuccess(updated);
      toast.success('Refund initiated successfully.');
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err, 'Refund failed. Please try again or use Stripe dashboard.'));
    },
  });
}

// ---------------------------------------------------------------------------
// useDeleteOrder
// ---------------------------------------------------------------------------
export function useDeleteOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ordersApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.orders.detail(id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists() });
      toast.success('Order deleted.');
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err, 'Failed to delete order.'));
    },
  });
}