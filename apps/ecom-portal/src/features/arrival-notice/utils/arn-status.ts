// Created by Sekar Nagarajan (2026-08-26 14:50)
import type { ArrivalNoticePrintStatus } from "../types/arrival-notice.types";

export function getArnPrintStatusLabel(
  status: ArrivalNoticePrintStatus | string,
): string {
  return status === "Y" ? "Printed" : "Not Printed";
}

export function getArnPrintStatusColor(
  status: ArrivalNoticePrintStatus | string,
): string {
  return status === "Y" ? "success" : "default";
}

export function isArnPrinted(status: ArrivalNoticePrintStatus | string): boolean {
  return status === "Y";
}

export function formatArnAmount(amount: number, currency: string): string {
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${formatted} ${currency}`;
}
