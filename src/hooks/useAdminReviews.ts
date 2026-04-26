import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { reviewsApi } from '@api/reviews.api';
import { queryKeys } from '@utils/queryKeys';
import type { ReviewListParams, UpdateReviewStatusDto } from '@/types/review.types';
import type { ApiError } from '@/types/api.types';

// ---------------------------------------------------------------------------
// useAdminReviews — paginated list with filters
// ---------------------------------------------------------------------------
export function useAdminReviews(params?: ReviewListParams) {
  return useQuery({
    queryKey: queryKeys.reviews.list(params),
    queryFn: () => reviewsApi.list(params),
    placeholderData: keepPreviousData,
    staleTime: 20_000,
  });
}

// ---------------------------------------------------------------------------
// useAdminReview — single review detail
// ---------------------------------------------------------------------------
export function useAdminReview(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.reviews.detail(id ?? ''),
    queryFn: () => reviewsApi.getById(id!),
    enabled: Boolean(id),
    staleTime: 60_000,
  });
}

// ---------------------------------------------------------------------------
// Shared helper
// ---------------------------------------------------------------------------
function useReviewMutationCallbacks(id: string) {
  const queryClient = useQueryClient();
  return {
    onSuccess: (updated: Awaited<ReturnType<typeof reviewsApi.getById>>) => {
      queryClient.setQueryData(queryKeys.reviews.detail(id), updated);
      void queryClient.invalidateQueries({ queryKey: queryKeys.reviews.lists() });
    },
  };
}

// ---------------------------------------------------------------------------
// useUpdateReviewStatus — generic moderation (approve / reject with note)
// ---------------------------------------------------------------------------
export function useUpdateReviewStatus(id: string) {
  const { onSuccess } = useReviewMutationCallbacks(id);
  return useMutation({
    mutationFn: (dto: UpdateReviewStatusDto) => reviewsApi.updateStatus(id, dto),
    onSuccess: updated => {
      onSuccess(updated);
      const label = updated.status === 'approved' ? 'approved' : 'rejected';
      toast.success(`Review ${label}.`);
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? 'Failed to update review status.');
    },
  });
}

// ---------------------------------------------------------------------------
// useApproveReview — convenience shorthand used by the table action button
// ---------------------------------------------------------------------------
export function useApproveReview(id: string) {
  const { onSuccess } = useReviewMutationCallbacks(id);
  return useMutation({
    mutationFn: () => reviewsApi.approve(id),
    onSuccess: updated => {
      onSuccess(updated);
      toast.success('Review approved and published.');
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? 'Failed to approve review.');
    },
  });
}

// ---------------------------------------------------------------------------
// useRejectReview — convenience shorthand
// ---------------------------------------------------------------------------
export function useRejectReview(id: string) {
  const { onSuccess } = useReviewMutationCallbacks(id);
  return useMutation({
    mutationFn: (note?: string) => reviewsApi.reject(id, note),
    onSuccess: updated => {
      onSuccess(updated);
      toast.success('Review rejected.');
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? 'Failed to reject review.');
    },
  });
}

// ---------------------------------------------------------------------------
// useDeleteReview
// ---------------------------------------------------------------------------
export function useDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reviewsApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.reviews.detail(id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.reviews.lists() });
      toast.success('Review deleted.');
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? 'Failed to delete review.');
    },
  });
}