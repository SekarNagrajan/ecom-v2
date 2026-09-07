// Modified by Sekar Nagarajan (2026-09-07 12:28)
import type {
  CROPrintStatus,
  CROReleaseStatus,
} from "../types/cro.types";

export function getCroReleaseStatusColor(
  status: CROReleaseStatus | string,
): string {
  switch (status) {
    case "Eligible":
      return "processing";
    case "Released":
      return "success";
    case "Blocked":
      return "error";
    case "Cancelled":
      return "default";
    default:
      return "default";
  }
}

export function getCroPrintStatusLabel(
  status: CROPrintStatus | string,
): string {
  return status === "Y" ? "Printed" : "Not Printed";
}

export function getCroPrintStatusColor(
  status: CROPrintStatus | string,
): string {
  return status === "Y" ? "success" : "warning";
}

export function isCroPrinted(status: CROPrintStatus | string): boolean {
  return status === "Y";
}
