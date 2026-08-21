// Modified by sekar nagarajan (2026-08-21)
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userCreationApi } from '../api/user-creation.api';
import type { CreateSubUserPayload } from '../types/user-creation.types';

export function useUserCreationController() {
  const queryClient = useQueryClient();

  const subUsersQuery = useQuery({
    queryKey: ['sub-users'],
    queryFn: () => userCreationApi.getSubUsers(),
  });

  const userLimitQuery = useQuery({
    queryKey: ['sub-user-limit'],
    queryFn: () => userCreationApi.getUserLimit(),
  });

  const createSubUserMutation = useMutation({
    mutationFn: (payload: CreateSubUserPayload) => userCreationApi.createSubUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sub-users'] });
      queryClient.invalidateQueries({ queryKey: ['sub-user-limit'] });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => userCreationApi.toggleSubUserStatus(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sub-users'] });
    },
  });

  return {
    subUsers: subUsersQuery.data || [],
    isLoadingUsers: subUsersQuery.isLoading,
    limitInfo: userLimitQuery.data || { allowedUserLimit: 5, currentlyAllocated: 2, remainingSlots: 3, limitReached: false },
    createSubUser: createSubUserMutation.mutateAsync,
    isCreating: createSubUserMutation.isPending,
    toggleSubUserStatus: toggleStatusMutation.mutateAsync,
  };
}
