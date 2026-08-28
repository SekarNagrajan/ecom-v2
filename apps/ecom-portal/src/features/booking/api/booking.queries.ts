// Created by Sekar Nagarajan (2026-08-27 18:30)
import { useQuery } from '@tanstack/react-query';

import { bookingApi } from './booking.api';
import { bookingKeys } from './booking.keys';
import type { BookingLookupKind } from '../mocks/booking-lookups.mock';

export function useBookingLookups(kind: BookingLookupKind) {
  return useQuery({
    queryKey: bookingKeys.lookups(kind),
    queryFn: () => bookingApi.getLookups(kind),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useBookingDetail(id: string | undefined) {
  return useQuery({
    queryKey: bookingKeys.detail(id ?? ''),
    queryFn: () => bookingApi.getBookingById(id as string),
    enabled: Boolean(id),
  });
}
