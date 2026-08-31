// Modified by Sekar Nagarajan (2026-08-31 15:17)
import type { SIStatus } from "../types/si.types";

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
