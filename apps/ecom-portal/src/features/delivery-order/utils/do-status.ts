// Modified by Sekar Nagarajan (2026-09-07 12:00)
import type { DOPrintStatus } from "../types/delivery-order.types";

export function getDoPrintStatusLabel(status: DOPrintStatus | string): string {
  return status === "Y" ? "Printed" : "Not Printed";
}

export function getDoPrintStatusColor(status: DOPrintStatus | string): string {
  return status === "Y" ? "success" : "warning";
}

export function isDoPrinted(status: DOPrintStatus | string): boolean {
  return status === "Y";
}
