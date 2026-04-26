import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { usersApi } from '@api/users.api';
import { queryKeys } from '@utils/queryKeys';
import type { UserListParams, UpdateUserDto } from '@/types/user.types';
import type { ApiError } from '@/types/api.types';

// ---------------------------------------------------------------------------
// useAdminUsers — paginated list with filters
// ---------------------------------------------------------------------------
export function useAdminUsers(params?: UserListParams) {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => usersApi.list(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

// ---------------------------------------------------------------------------
// useAdminUser — single user detail
// ---------------------------------------------------------------------------
export function useAdminUser(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.users.detail(id ?? ''),
    queryFn: () => usersApi.getById(id!),
    enabled: Boolean(id),
    staleTime: 60_000,
  });
}

// ---------------------------------------------------------------------------
// Shared helper — update detail cache + invalidate lists after any mutation
// ---------------------------------------------------------------------------
function useUserMutationCallbacks(id: string) {
  const queryClient = useQueryClient();
  return {
    onSuccess: (updated: Awaited<ReturnType<typeof usersApi.getById>>) => {
      queryClient.setQueryData(queryKeys.users.detail(id), updated);
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  };
}

// ---------------------------------------------------------------------------
// useUpdateUser
// ---------------------------------------------------------------------------
export function useUpdateUser(id: string) {
  const { onSuccess } = useUserMutationCallbacks(id);
  return useMutation({
    mutationFn: (dto: UpdateUserDto) => usersApi.update(id, dto),
    onSuccess: updated => {
      onSuccess(updated);
      toast.success('User updated.');
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? 'Failed to update user.');
    },
  });
}

// ---------------------------------------------------------------------------
// useSuspendUser
// ---------------------------------------------------------------------------
export function useSuspendUser(id: string) {
  const { onSuccess } = useUserMutationCallbacks(id);
  return useMutation({
    mutationFn: () => usersApi.suspend(id),
    onSuccess: updated => {
      onSuccess(updated);
      toast.success(`${updated.name} has been suspended.`);
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? 'Failed to suspend user.');
    },
  });
}

// ---------------------------------------------------------------------------
// useActivateUser
// ---------------------------------------------------------------------------
export function useActivateUser(id: string) {
  const { onSuccess } = useUserMutationCallbacks(id);
  return useMutation({
    mutationFn: () => usersApi.activate(id),
    onSuccess: updated => {
      onSuccess(updated);
      toast.success(`${updated.name}'s account has been reactivated.`);
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? 'Failed to activate user.');
    },
  });
}

// ---------------------------------------------------------------------------
// useDeleteUser
// ---------------------------------------------------------------------------
export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.users.detail(id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      toast.success('User deleted.');
    },
    onError: (err: ApiError) => {
      toast.error(err.message ?? 'Failed to delete user.');
    },
  });
}