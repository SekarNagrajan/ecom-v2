// Created by Sekar Nagarajan (2026-08-26 18:31)
/** Booking React Query keys — routing popup (ebookRoutingDetails parity). */
export const bookingKeys = {
  all: ["booking"] as const,
  routing: (origin: string, delivery: string, cargoReadyDate: string) =>
    [...bookingKeys.all, "routing", origin, delivery, cargoReadyDate] as const,
};
