// Modified by Sekar Nagarajan (2026-09-29 16:45)
import type { BLStatus, SIStatus } from "../types/si.types";

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

export function getSiStatusTagColor(status: SIStatus | string): string {
  switch (status) {
    case "Create SI":
    case "Create Multiple SI":
      return "blue";
    case "Draft":
      return "default";
    case "Submitted":
      return "warning";
    case "Accepted":
      return "success";
    case "Declined":
      return "error";
    case "Locked":
      return "default";
    default:
      return "default";
  }
}

/** Language-reactive SI status label. Data values stay English; only display translates. */
export function getSiStatusLabel(status: SIStatus, t: TranslateFn): string {
  switch (status) {
    case "Create SI":
      return t("status.createSi");
    case "Create Multiple SI":
      return t("status.createMultipleSi");
    case "Draft":
      return t("status.draft");
    case "Submitted":
      return t("status.submitted");
    case "Accepted":
      return t("status.accepted");
    case "Declined":
      return t("status.declined");
    case "Locked":
      return t("status.locked");
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

/** Language-reactive B/L status label on SI list/drawer tags. */
export function getSiBlStatusLabel(status: BLStatus, t: TranslateFn): string {
  switch (status) {
    case "Draft":
      return t("blStatus.draft");
    case "Confirmed":
      return t("blStatus.confirmed");
    case "Issued":
      return t("blStatus.issued");
    case "Cancelled":
      return t("blStatus.cancelled");
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

export function canOpenSiWizard(status: SIStatus): boolean {
  return (
    status === "Create SI" ||
    status === "Create Multiple SI" ||
    status === "Draft" ||
    status === "Submitted" ||
    status === "Declined"
  );
}

export function canViewSiDetails(status: SIStatus): boolean {
  return (
    status === "Submitted" ||
    status === "Accepted" ||
    status === "Declined" ||
    status === "Draft"
  );
}
