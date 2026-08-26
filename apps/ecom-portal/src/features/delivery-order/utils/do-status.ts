// Created by Sekar Nagarajan (2026-08-26 14:26)
import type { DOPrintStatus } from "../types/delivery-order.types";

export function getDoPrintStatusLabel(status: DOPrintStatus | string): string {
  return status === "Y" ? "Printed" : "Not Printed";
}

export function getDoPrintStatusColor(status: DOPrintStatus | string): string {
  return status === "Y" ? "success" : "default";
}

export function isDoPrinted(status: DOPrintStatus | string): boolean {
  return status === "Y";
}
