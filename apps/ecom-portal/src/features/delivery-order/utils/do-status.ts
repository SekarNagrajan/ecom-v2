// Modified by Sekar Nagarajan (2026-09-07 12:00)
import type { DOPrintStatus } from "../types/delivery-order.types";

type TranslateFn = (key: string) => string;

export function getDoPrintStatusLabel(
  status: DOPrintStatus | string,
  t: TranslateFn,
): string {
  return status === "Y" ? t("status.printed") : t("status.notPrinted");
}

export function getDoPrintStatusColor(status: DOPrintStatus | string): string {
  return status === "Y" ? "success" : "warning";
}

export function isDoPrinted(status: DOPrintStatus | string): boolean {
  return status === "Y";
}
