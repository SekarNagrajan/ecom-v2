// Modified by Sekar Nagarajan (2026-08-27 19:12)
/** Booking React Query keys — routing popup + lookups + detail. */
export const bookingKeys = {
  all: ["booking"] as const,
  routing: (origin: string, delivery: string, cargoReadyDate: string) =>
    [...bookingKeys.all, "routing", origin, delivery, cargoReadyDate] as const,
  rates: (origin: string, delivery: string) =>
    [...bookingKeys.all, "rates", origin, delivery] as const,
  lookups: (kind: string) => [...bookingKeys.all, "lookups", kind] as const,
  detail: (id: string) => [...bookingKeys.all, "detail", id] as const,
  activity: (id: string) => [...bookingKeys.all, "activity", id] as const,
  list: () => [...bookingKeys.all, "list"] as const,
};
