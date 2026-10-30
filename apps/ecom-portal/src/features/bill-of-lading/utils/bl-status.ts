// Modified by Sekar Nagarajan (2026-09-29 12:50)
import type { BLListDTO, BLRowStatus } from "../types/bl.types";
import { BL_STATUS_LABELS } from "../types/bl.types";

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

export function getBLStatusColor(status: BLRowStatus): string {
  switch (status) {
    case "I":
      return "blue";
    case "D":
      return "default";
    case "S":
      return "warning";
    case "C":
      return "success";
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

/** List/drawer status tag color — Locked rows use error (red). */
export function getBLListStatusColor(
  row: Pick<BLListDTO, "status" | "isLocked">,
): string {
  if (row.isLocked) return "error";
  return getBLStatusColor(row.status);
}

export function getBLStatusLabel(
  status: BLRowStatus,
  t?: TranslateFn,
): string {
  if (t) {
    switch (status) {
      case "D":
        return t("status.draft");
      case "S":
        return t("status.submitted");
      case "C":
        return t("status.confirmed");
      case "I":
        return t("status.issued");
      default: {
        const _exhaustive: never = status;
        return BL_STATUS_LABELS[_exhaustive];
      }
    }
  }
  return BL_STATUS_LABELS[status];
}

/** Draft / Confirmed (non-locked) can open the wizard for edit. */
export function canOpenBlWizard(row: Pick<BLListDTO, "status" | "isLocked">): boolean {
  if (row.isLocked) return false;
  return row.status === "D" || row.status === "C" || row.status === "S";
}

/** Submitted / Confirmed / Issued / Draft peek in drawer (SI-style). */
export function canViewBlDetails(row: Pick<BLListDTO, "status">): boolean {
  return (
    row.status === "D" ||
    row.status === "S" ||
    row.status === "C" ||
    row.status === "I"
  );
}

/** Confirmed + printStatus Y + not locked — batch original print. */
export function isBatchOriginalPrintEligible(
  row: Pick<BLListDTO, "status" | "printStatus" | "isLocked">,
): boolean {
  return (
    row.status === "C" && row.printStatus === "Y" && !row.isLocked
  );
}
