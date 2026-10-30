// Modified by Sekar Nagarajan (2026-09-15 15:00)
import { queryOptions, useMutation } from "@tanstack/react-query";

import type {
  ScheduleSearchParams,
  ShareScheduleMailInput,
} from "../types/schedules.types";
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
    mutationFn: (input: ShareScheduleMailInput) =>
      schedulesApi.shareSchedulesByMail(input),
  });
}
