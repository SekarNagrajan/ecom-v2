// Created by Sekar Nagarajan (2026-09-16 15:32)
/** Flat editable row for SI Smart Import grid (legacy jExcel parity). */
export interface SmartImportRow {
  rowId: string;
  /** Stable SI container id — grouping / identity key (not rewritten from eqp/SOC). */
  containerId: string;
  oldContainerNo: string;
  eqpSize: string;
  isSoc: boolean;
  commodityCode: string;
  actualContainerNo: string;
  carrierSeal: string;
  shipperSeal: string;
  hsCode: string;
  packageType: string;
  packageCount: number;
  grossWeight: number;
  volume: number;
  marksAndNumbers: string;
  description: string;
}

export type SmartImportInsertPosition = "before" | "after";

export type SmartImportApplyResult =
  | { ok: true; containers: import("../types/si.types").SIContainer[] }
  | { ok: false; error: string };
