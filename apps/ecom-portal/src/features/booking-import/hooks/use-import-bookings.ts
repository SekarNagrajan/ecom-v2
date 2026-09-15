// Modified by Sekar Nagarajan (2026-09-15 16:45)
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { bookingKeys } from "../../booking/api/booking.keys";
import { importBookings } from "../api/booking-import.api";
import type {
  BulkBookingImportResult,
  BookingImportPayload,
} from "../types/booking-import.types";

interface UseImportBookingsOptions {
  onSuccess?: (result: BulkBookingImportResult) => void;
  onError?: (error: unknown) => void;
}

export function useDryRunImportBookings(options?: UseImportBookingsOptions) {
  return useMutation({
    mutationKey: [...bookingKeys.all, "import", "dry-run"] as const,
    mutationFn: async (payloads: BookingImportPayload[]) => {
      const response = await importBookings(payloads, { dryRun: true });
      return response.data;
    },
    onSuccess: (result) => {
      options?.onSuccess?.(result);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
}

export function useCommitImportBookings(options?: UseImportBookingsOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...bookingKeys.all, "import", "commit"] as const,
    mutationFn: async (payloads: BookingImportPayload[]) => {
      const response = await importBookings(payloads, { dryRun: false });
      return response.data;
    },
    onSuccess: async (result) => {
      if (result.successCount > 0) {
        await queryClient.invalidateQueries({ queryKey: bookingKeys.list() });
      }
      options?.onSuccess?.(result);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
}
