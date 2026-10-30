import type { BookingListStatus } from "../types/booking-list.types";

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

export function getBookingStatusLabel(
  status: BookingListStatus,
  t?: TranslateFn,
): string {
  if (t) {
    switch (status) {
      case "Draft":
        return t("status.draft");
      case "Submitted":
        return t("status.submitted");
      case "Confirmed":
        return t("status.confirmed");
      case "Awaiting Acceptance":
        return t("status.awaitingAcceptance");
      case "In Transit":
        return t("status.inTransit");
      case "Completed":
        return t("status.completed");
      case "Rejected":
        return t("status.rejected");
      case "Cancelled":
        return t("status.cancelled");
      default: {
        const _exhaustive: never = status;
        return _exhaustive;
      }
    }
  }
  return status;
}
