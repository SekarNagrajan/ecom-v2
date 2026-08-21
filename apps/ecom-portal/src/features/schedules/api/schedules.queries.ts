import { queryOptions } from '@tanstack/react-query';
import { scheduleKeys } from './schedules.keys';
import { schedulesApi } from './schedules.api';
import type { ScheduleSearchParams } from '../types/schedules.types';

export function schedulesQueryOptions(params: ScheduleSearchParams) {
  return queryOptions({
    queryKey: scheduleKeys.list(params),
    queryFn: () => schedulesApi.searchSchedules(params),
    staleTime: 5 * 60 * 1000,
  });
}
