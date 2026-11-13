// Modified by Sekar Nagarajan (2026-09-29 12:28)
import type {
  CROPrintStatus,
  CROReleaseStatus,
} from "../types/cro.types";

type TranslateFn = (key: string) => string;

export function getCroReleaseStatusColor(
  status: CROReleaseStatus,
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
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

export function getCroReleaseStatusLabel(
  status: CROReleaseStatus,
  t: TranslateFn,
): string {
  switch (status) {
    case "Eligible":
      return t("status.eligible");
    case "Blocked":
      return t("status.blocked");
    case "Released":
      return t("status.released");
    case "Cancelled":
      return t("status.cancelled");
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

export function getCroPrintStatusLabel(
  status: CROPrintStatus | string,
  t: TranslateFn,
): string {
  return status === "Y" ? t("status.printed") : t("status.notPrinted");
}

export function getCroPrintStatusColor(
  status: CROPrintStatus | string,
): string {
  return status === "Y" ? "success" : "warning";
}

export function isCroPrinted(status: CROPrintStatus | string): boolean {
  return status === "Y";
}
