// Modified by Sekar Nagarajan (2026-09-16 15:12)
import {
  createEmptyCargoLine,
  createEmptyContainer,
  type SIContainer,
} from "../types/si.types";
import type { CargoImportPayload } from "./cargo-import.types";

/**
 * Group flat cargo-line import rows into nested SIContainer[] for the wizard.
 * Rows with the same container number (case-insensitive) collapse into one
 * container; the first row wins for container-level fields (type, seals).
 */
export function mapCargoImportRows(
  rows: readonly CargoImportPayload[],
): SIContainer[] {
  const order: string[] = [];
  const byContainer = new Map<
    string,
    {
      containerNo: string;
      containerType: string;
      carrierSeal: string;
      shipperSeal: string;
      lines: CargoImportPayload[];
    }
  >();

  for (const row of rows) {
    const containerNo = String(row.containerNo ?? "").trim().toUpperCase();
    if (!containerNo) {
      continue;
    }
    const key = containerNo;
    const existing = byContainer.get(key);
    if (existing) {
      existing.lines.push(row);
      continue;
    }
    order.push(key);
    byContainer.set(key, {
      containerNo,
      containerType: String(row.containerType ?? "").trim() || "40HC",
      carrierSeal: String(row.carrierSeal ?? "").trim(),
      shipperSeal: String(row.shipperSeal ?? "").trim(),
      lines: [row],
    });
  }

  return order.map((key) => {
    const group = byContainer.get(key);
    if (!group) {
      return createEmptyContainer();
    }
    const container = createEmptyContainer(group.containerType);
    container.containerNo = group.containerNo;
    container.eqpSize = group.containerType;
    container.carrierSeal = group.carrierSeal;
    container.shipperSeal = group.shipperSeal;
    container.cargoLines = group.lines.map((line) => {
      const cargoLine = createEmptyCargoLine();
      cargoLine.marksAndNumbers = String(line.marksAndNumbers ?? "").trim();
      cargoLine.description = String(line.description ?? "").trim();
      cargoLine.hsCode = String(line.hsCode ?? "").trim();
      cargoLine.commodityCode = String(line.commodityCode ?? "").trim();
      cargoLine.packageCount =
        typeof line.packageCount === "number" && Number.isFinite(line.packageCount)
          ? line.packageCount
          : 1;
      cargoLine.packageType = String(line.packageType ?? "").trim();
      cargoLine.grossWeight =
        typeof line.grossWeight === "number" && Number.isFinite(line.grossWeight)
          ? line.grossWeight
          : 1;
      cargoLine.volume =
        typeof line.volume === "number" && Number.isFinite(line.volume)
          ? line.volume
          : 0;
      return cargoLine;
    });
    return container;
  });
}
