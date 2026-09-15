// Modified by Sekar Nagarajan (2026-09-15 16:45)
import type {
  BulkBookingImportResult,
  BookingImportPayload,
} from "../types/booking-import.types";

async function readJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }
  return (await res.json()) as T;
}

/**
 * Bulk booking import — dry-run validates without writing; commit creates
 * bookings via the same submit path as the wizard (server-side).
 */
export async function importBookings(
  bookings: BookingImportPayload[],
  options: { dryRun: boolean },
): Promise<{ data: BulkBookingImportResult }> {
  const res = await fetch("/api/booking/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      dryRun: options.dryRun,
      bookings,
    }),
  });
  return readJson<{ data: BulkBookingImportResult }>(res);
}
