// Modified by Sekar Nagarajan (2026-09-29 12:35)
import type { ArrivalNoticePrintStatus } from "../types/arrival-notice.types";
import i18n from "../../../i18n/config";

type TranslateFn = (key: string) => string;

export function getArnPrintStatusLabel(
  status: ArrivalNoticePrintStatus | string,
  t: TranslateFn,
): string {
  return status === "Y" ? t("status.printed") : t("status.notPrinted");
}

export function getArnPrintStatusColor(
  status: ArrivalNoticePrintStatus | string,
): string {
  return status === "Y" ? "success" : "warning";
}

export function isArnPrinted(status: ArrivalNoticePrintStatus | string): boolean {
  return status === "Y";
}

/** Format charge amounts using the active portal language for number grouping. */
export function formatArnAmount(amount: number, currency: string): string {
  const locale = i18n.language || undefined;
  const formatted = amount.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${formatted} ${currency}`;
}
