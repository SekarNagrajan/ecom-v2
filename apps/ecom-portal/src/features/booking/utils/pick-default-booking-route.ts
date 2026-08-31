// Created by Sekar Nagarajan (2026-08-31 13:09)
import type { SelectedRoute } from "../types/booking.types";

/** Prefer the carrier-marked default sailing; otherwise null (manual pick required). */
export function pickDefaultBookingRoute(
  routes: SelectedRoute[],
): SelectedRoute | null {
  return routes.find((route) => route.isDefaultRoute) ?? null;
}
