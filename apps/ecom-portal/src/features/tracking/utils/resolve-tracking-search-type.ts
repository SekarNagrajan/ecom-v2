// Created by Sekar Nagarajan (2026-09-18 10:45)
import type { TrackingSearchType } from "../types/tracking.types";

/**
 * Resolve tracking lookup type — JSP `checkBLBookingNo` / `refNoType` parity.
 * Prefer an explicit `searchType` query param when present; otherwise infer from the reference.
 */
export function resolveTrackingSearchType(
  value: string,
  explicit?: string | null,
): TrackingSearchType {
  const normalized = explicit?.trim().toUpperCase();
  if (normalized === "BOOKING" || normalized === "BOOKINGNOS") {
    return "BOOKING";
  }
  if (normalized === "BL" || normalized === "BLNUMBERS") {
    return "BL";
  }
  if (normalized === "CONTAINER" || normalized === "CONTAINERNOS") {
    return "CONTAINER";
  }

  const key = value.trim().toUpperCase();
  if (!key) return "CONTAINER";

  // Booking references (e.g. BKG-2026-9901)
  if (/^BKG([_-]|$)/.test(key) || /^BOOKING/.test(key) || /^BK\d/.test(key)) {
    return "BOOKING";
  }

  // Bill of Lading (e.g. BL-SHA-88401) — avoid bare "BL" container-prefix false positives
  if (/^BL([_-]|$)/.test(key) || /^B\/L/.test(key)) {
    return "BL";
  }

  return "CONTAINER";
}
