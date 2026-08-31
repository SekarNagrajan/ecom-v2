// Modified by Sekar Nagarajan (2026-08-31 16:45)
import type { BLListDTO, BLRowStatus } from "../types/bl.types";
import { BL_STATUS_LABELS } from "../types/bl.types";

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
    default:
      return "default";
  }
}

/** List/drawer status tag color — Locked rows use error (red). */
export function getBLListStatusColor(
  row: Pick<BLListDTO, "status" | "isLocked">,
): string {
  if (row.isLocked) return "error";
  return getBLStatusColor(row.status);
}

export function getBLStatusLabel(status: BLRowStatus): string {
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
