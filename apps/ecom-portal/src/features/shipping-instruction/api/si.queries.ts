// Created by Sekar Nagarajan (2026-08-26 12:19)
import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { siApi } from "./si.api";
import { siKeys } from "./si.keys";

export function siListQueryOptions() {
  return queryOptions({
    queryKey: siKeys.list(),
    queryFn: async () => {
      const res = await siApi.fetchList();
      return res.data ?? [];
    },
    staleTime: 60 * 1000, // 1 minute
  });
}

export function siDetailQueryOptions(id: string) {
  return queryOptions({
    queryKey: siKeys.detail(id),
    queryFn: async () => {
      const res = await siApi.fetchDetails(id);
      if (!res.data) {
        throw new Error("SI details not found");
      }
      return res.data;
    },
    enabled: Boolean(id),
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useSiListQuery() {
  return useQuery(siListQueryOptions());
}

export function useSiDetailQuery(id: string) {
  return useQuery(siDetailQueryOptions(id));
}

export function useCancelSiMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => siApi.cancel(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: siKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: siKeys.detail(id) });
    },
  });
}

export function useSubmitSiMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: string; payload?: Parameters<typeof siApi.submit>[1] }) =>
      siApi.submit(args.id, args.payload),
    onSuccess: (_data, args) => {
      void queryClient.invalidateQueries({ queryKey: siKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: siKeys.detail(args.id) });
    },
  });
}
