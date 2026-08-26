// Created by Sekar Nagarajan (2026-08-26 12:48)
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { vgmApi } from "./vgm.api";
import { vgmKeys } from "./vgm.keys";
import type { VgmSubmitPayload } from "../types/vgm.types";

export type VgmSearchParams = {
  type: "bookno" | "blno";
  referenceNo: string;
} | null;

export function useVgmSearchQuery(params: VgmSearchParams) {
  return useQuery({
    queryKey: params
      ? vgmKeys.search(params.type, params.referenceNo)
      : vgmKeys.searches(),
    queryFn: async () => {
      if (!params) {
        throw new Error("Missing search params");
      }
      const res = await vgmApi.searchReference(params.type, params.referenceNo);
      if (!res.data) {
        throw { error: { code: "EMPTY", message: "No VGM data returned." } };
      }
      return res.data;
    },
    enabled: Boolean(params?.referenceNo),
    retry: false,
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useSubmitVgmMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: VgmSubmitPayload) => vgmApi.submit(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: vgmKeys.searches() });
    },
  });
}
