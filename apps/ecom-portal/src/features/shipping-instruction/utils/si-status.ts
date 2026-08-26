// Created by Sekar Nagarajan (2026-08-26 12:19)
import type { SIStatus } from "../types/si.types";

export function getSiStatusTagColor(status: SIStatus | string): string {
  switch (status) {
    case "Submitted":
      return "success";
    case "Draft":
      return "processing";
    case "Create SI":
      return "cyan";
    case "Accepted":
      return "green";
    case "Declined":
      return "error";
    default:
      return "default";
  }
}

export function canOpenSiWizard(status: SIStatus): boolean {
  return (
    status === "Create SI" ||
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
