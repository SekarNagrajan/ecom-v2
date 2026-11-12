// Modified by Sekar Nagarajan (2026-11-12 23:55)
import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";

import type { ScheduleSearchParams, ShareScheduleMailInput } from "../types/schedules.types";
import { schedulesApi } from "./schedules.api";
import { scheduleKeys } from "./schedules.keys";

export function schedulesQueryOptions(params: ScheduleSearchParams) {
  return queryOptions({
    queryKey: scheduleKeys.list(params),
    queryFn: () => schedulesApi.searchSchedules(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useShareScheduleMailMutation() {
  return useMutation({
    mutationFn: (input: ShareScheduleMailInput) => schedulesApi.shareSchedulesByMail(input),
  });
}

/** Vessel codes + names for the By Vessel dropdown; static per fixture extract, so never stale. */
export function useScheduleVesselOptionsQuery() {
  return useQuery({
    queryKey: scheduleKeys.vesselOptions(),
    queryFn: () => schedulesApi.listVesselOptions(),
    staleTime: Infinity,
  });
}
