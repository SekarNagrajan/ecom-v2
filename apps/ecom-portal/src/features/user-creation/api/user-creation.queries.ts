// Created by Sekar Nagarajan (2026-08-26 15:06)
import { useToast } from "@solverminds/shared-ui/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { CreateSubUserPayload } from "../types/user-creation.types";
import { EMPTY_USER_LIMIT } from "../types/user-creation.types";
import { userCreationApi } from "./user-creation.api";
import { userCreationKeys } from "./user-creation.keys";

export function useSubUsersQuery() {
  return useQuery({
    queryKey: userCreationKeys.list(),
    queryFn: async () => {
      const res = await userCreationApi.fetchSubUsers();
      if (res.error) {
        throw new Error(res.error.message || "Failed to fetch sub-users");
      }
      return res.data ?? [];
    },
  });
}

export function useUserLimitQuery() {
  return useQuery({
    queryKey: userCreationKeys.limit(),
    queryFn: async () => {
      const res = await userCreationApi.fetchUserLimit();
      if (res.error) {
        throw new Error(res.error.message || "Failed to fetch user limits");
      }
      return res.data ?? EMPTY_USER_LIMIT;
    },
  });
}

export function useCreateSubUserMutation() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (payload: CreateSubUserPayload) => {
      const res = await userCreationApi.createSubUser(payload);
      if (res.error) {
        throw new Error(
          res.error.message || "Failed to create sub-user profile",
        );
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userCreationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userCreationKeys.limits() });
      toast.success("Sub-user profile created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useToggleSubUserStatusMutation() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const res = await userCreationApi.toggleSubUserStatus(id, active);
      if (res.error) {
        throw new Error(res.error.message || "Failed to update user status");
      }
      return res.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: userCreationKeys.lists() });
      toast.success(
        variables.active ? "Account enabled" : "Account disabled",
      );
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
