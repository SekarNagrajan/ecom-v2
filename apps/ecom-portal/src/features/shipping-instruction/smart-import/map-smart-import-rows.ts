// Modified by Sekar Nagarajan (2026-09-16 15:52)
import {
  createEmptyCargoLine,
  type SIContainer,
} from "../types/si.types";
import type {
  SmartImportApplyResult,
  SmartImportInsertPosition,
  SmartImportRow,
} from "./smart-import.types";

function newRowId(): string {
  return crypto.randomUUID();
}

function normalizeContainerNo(value: string): string {
  return String(value ?? "").trim().toUpperCase();
}

function stripNonNumeric(raw: unknown): number {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return raw;
  }
  const digits = String(raw ?? "").replace(/[^\d.-]/g, "");
  const parsed = Number(digits);
  return Number.isFinite(parsed) ? parsed : 0;
}

function cloneIdentityRow(source: SmartImportRow): SmartImportRow {
  return {
    rowId: newRowId(),
    containerId: source.containerId,
    oldContainerNo: source.oldContainerNo,
    eqpSize: source.eqpSize,
    isSoc: source.isSoc,
    commodityCode: source.commodityCode,
    actualContainerNo: source.actualContainerNo,
    carrierSeal: source.carrierSeal,
    shipperSeal: source.shipperSeal,
    hsCode: "",
    packageType: "",
    packageCount: 1,
    grossWeight: 1,
    volume: 0,
    marksAndNumbers: "",
    description: "",
  };
}

function cloneFullRow(source: SmartImportRow): SmartImportRow {
  return {
    ...source,
    rowId: newRowId(),
  };
}

/** Flatten SI containers × cargo lines into Smart Import grid rows. */
export function containersToSmartImportRows(
  containers: readonly SIContainer[],
): SmartImportRow[] {
  const rows: SmartImportRow[] = [];
  for (const container of containers) {
    const lines =
      container.cargoLines.length > 0
        ? container.cargoLines
        : [createEmptyCargoLine()];
    for (const line of lines) {
      rows.push({
        rowId: newRowId(),
        containerId: container.id,
        oldContainerNo: container.containerNo,
        eqpSize: container.eqpSize,
        isSoc: Boolean(container.isSoc),
        commodityCode: String(line.commodityCode ?? "").trim(),
        actualContainerNo: container.containerNo,
        carrierSeal: String(container.carrierSeal ?? "").trim(),
        shipperSeal: String(container.shipperSeal ?? "").trim(),
        hsCode: String(line.hsCode ?? "").trim(),
        packageType: String(line.packageType ?? "").trim(),
        packageCount:
          typeof line.packageCount === "number" && Number.isFinite(line.packageCount)
            ? line.packageCount
            : 1,
        grossWeight:
          typeof line.grossWeight === "number" && Number.isFinite(line.grossWeight)
            ? line.grossWeight
            : 1,
        volume:
          typeof line.volume === "number" && Number.isFinite(line.volume)
            ? line.volume
            : 0,
        marksAndNumbers: String(line.marksAndNumbers ?? "").trim(),
        description: String(line.description ?? "").trim(),
      });
    }
  }
  return rows;
}

export function insertSmartImportRow(
  rows: readonly SmartImportRow[],
  index: number,
  position: SmartImportInsertPosition,
): SmartImportRow[] {
  if (index < 0 || index >= rows.length) {
    return [...rows];
  }
  const source = rows[index];
  if (!source) {
    return [...rows];
  }
  const insertAt = position === "before" ? index : index + 1;
  const next = [...rows];
  next.splice(insertAt, 0, cloneIdentityRow(source));
  return next;
}

export function deleteSmartImportRows(
  rows: readonly SmartImportRow[],
  rowIds: readonly string[],
): SmartImportRow[] {
  if (rowIds.length === 0) {
    return [...rows];
  }
  const remove = new Set(rowIds);
  return rows.filter((row) => !remove.has(row.rowId));
}

/** Duplicate a row (full copy) immediately after the source index. */
export function duplicateSmartImportRow(
  rows: readonly SmartImportRow[],
  index: number,
): SmartImportRow[] {
  if (index < 0 || index >= rows.length) {
    return [...rows];
  }
  const source = rows[index];
  if (!source) {
    return [...rows];
  }
  const next = [...rows];
  next.splice(index + 1, 0, cloneFullRow(source));
  return next;
}

/** Clear commodity line fields; keep container identity / seals / SOC. */
export function clearSmartImportLineFields(
  rows: readonly SmartImportRow[],
  rowIds: readonly string[],
): SmartImportRow[] {
  if (rowIds.length === 0) {
    return [...rows];
  }
  const clearIds = new Set(rowIds);
  return rows.map((row) => {
    if (!clearIds.has(row.rowId)) {
      return row;
    }
    return {
      ...row,
      hsCode: "",
      packageType: "",
      packageCount: 1,
      grossWeight: 1,
      volume: 0,
      marksAndNumbers: "",
      description: "",
    };
  });
}

/** Container-level fields that must stay in sync across lines of the same container. */
const CONTAINER_LEVEL_FIELDS = new Set<keyof SmartImportRow>([
  "actualContainerNo",
  "carrierSeal",
  "shipperSeal",
  "isSoc",
]);

const NUMERIC_FIELDS = new Set<keyof SmartImportRow>([
  "packageCount",
  "grossWeight",
  "volume",
]);

/**
 * Apply a single cell edit. Container-level fields propagate to every row
 * sharing the same containerId (legacy Smart Import first-row-wins UX).
 */
export function applySmartImportCellChange(
  rows: readonly SmartImportRow[],
  rowId: string,
  field: keyof SmartImportRow,
  rawValue: unknown,
): SmartImportRow[] {
  const source = rows.find((row) => row.rowId === rowId);
  if (!source) {
    return [...rows];
  }

  let nextValue: unknown = rawValue;
  if (field === "actualContainerNo") {
    nextValue = normalizeContainerNo(String(rawValue ?? ""));
  } else if (field === "isSoc") {
    nextValue = Boolean(rawValue);
  } else if (NUMERIC_FIELDS.has(field)) {
    nextValue = stripNonNumeric(rawValue);
  } else if (typeof rawValue === "string") {
    nextValue = rawValue;
  }

  if (CONTAINER_LEVEL_FIELDS.has(field)) {
    const containerId = source.containerId;
    return rows.map((row) =>
      row.containerId === containerId ? { ...row, [field]: nextValue } : row,
    );
  }

  return rows.map((row) =>
    row.rowId === rowId ? { ...row, [field]: nextValue } : row,
  );
}

/** True when deleting these row ids would leave at least one container with zero lines. */
export function deleteWouldDropContainer(
  rows: readonly SmartImportRow[],
  rowIds: readonly string[],
): boolean {
  const remove = new Set(rowIds);
  const remaining = new Map<string, number>();
  for (const row of rows) {
    if (remove.has(row.rowId)) {
      continue;
    }
    remaining.set(row.containerId, (remaining.get(row.containerId) ?? 0) + 1);
  }
  const originalIds = new Set(rows.map((row) => row.containerId));
  for (const id of originalIds) {
    if ((remaining.get(id) ?? 0) === 0) {
      return true;
    }
  }
  return false;
}

function validateRow(row: SmartImportRow, rowNumber: number): string | null {
  const actual = normalizeContainerNo(row.actualContainerNo);
  if (!actual) {
    return `Row ${rowNumber}: Actual Container No is required`;
  }
  if (actual.length > 11) {
    return `Row ${rowNumber}: Actual Container No must be 11 characters or fewer`;
  }
  if (!/^[A-Z0-9]+$/.test(actual)) {
    return `Row ${rowNumber}: Actual Container No is allowed only alphanumeric`;
  }
  if (!String(row.hsCode ?? "").trim()) {
    return `Row ${rowNumber}: HS Code is required`;
  }
  if (!String(row.description ?? "").trim()) {
    return `Row ${rowNumber}: Commodity Description is required`;
  }
  if (!String(row.packageType ?? "").trim()) {
    return `Row ${rowNumber}: Package Type is required`;
  }
  const packageCount = stripNonNumeric(row.packageCount);
  if (packageCount < 1) {
    return `Row ${rowNumber}: Package Count must be at least 1`;
  }
  const grossWeight = stripNonNumeric(row.grossWeight);
  if (grossWeight < 1) {
    return `Row ${rowNumber}: Gross Weight is required`;
  }
  const volume = stripNonNumeric(row.volume);
  if (volume < 0) {
    return `Row ${rowNumber}: Volume cannot be negative`;
  }
  return null;
}

/**
 * Merge Smart Import rows back into the original SI container list.
 * Preserves eqpSize / isSoc / reefer / OOG from originals; first row wins
 * for containerNo and seals. Container id set must match originals.
 */
export function smartImportRowsToContainers(
  rows: readonly SmartImportRow[],
  originalContainers: readonly SIContainer[],
): SmartImportApplyResult {
  const originalIds = originalContainers.map((c) => c.id);
  const originalById = new Map(originalContainers.map((c) => [c.id, c]));

  const order: string[] = [];
  const byContainer = new Map<string, SmartImportRow[]>();

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    if (!row) {
      continue;
    }
    const rowNumber = i + 1;
    const validationError = validateRow(row, rowNumber);
    if (validationError) {
      return { ok: false, error: validationError };
    }
    const containerId = row.containerId;
    if (!originalById.has(containerId)) {
      return {
        ok: false,
        error: `Row ${rowNumber}: Unknown container (not on this SI)`,
      };
    }
    const existing = byContainer.get(containerId);
    if (existing) {
      existing.push(row);
      continue;
    }
    order.push(containerId);
    byContainer.set(containerId, [row]);
  }

  const smartCount = order.length;
  const siCount = originalIds.length;
  if (smartCount !== siCount) {
    return {
      ok: false,
      error: `The container count does not match between SI(${siCount}) and Smart Import(${smartCount}).`,
    };
  }

  for (const id of originalIds) {
    if (!byContainer.has(id)) {
      return {
        ok: false,
        error: `The container count does not match between SI(${siCount}) and Smart Import(${smartCount}).`,
      };
    }
  }

  const containers: SIContainer[] = [];
  for (const id of originalIds) {
    const original = originalById.get(id);
    const group = byContainer.get(id) ?? [];
    if (!original || group.length === 0) {
      return {
        ok: false,
        error: `The container count does not match between SI(${siCount}) and Smart Import(${smartCount}).`,
      };
    }
    const first = group[0];
    containers.push({
      ...original,
      containerNo: normalizeContainerNo(
        first?.actualContainerNo ?? original.containerNo,
      ),
      carrierSeal: String(first?.carrierSeal ?? "").trim(),
      shipperSeal: String(first?.shipperSeal ?? "").trim(),
      // Eqp type stays locked; SOC is editable in the Smart Import grid.
      eqpSize: original.eqpSize,
      isSoc: Boolean(first?.isSoc),
      cargoLines: group.map((row) => {
        const line = createEmptyCargoLine();
        line.commodityCode = String(row.commodityCode ?? "").trim();
        line.hsCode = String(row.hsCode ?? "").trim();
        line.packageType = String(row.packageType ?? "").trim();
        line.packageCount = Math.max(
          1,
          Math.trunc(stripNonNumeric(row.packageCount)),
        );
        line.grossWeight = Math.max(1, stripNonNumeric(row.grossWeight));
        line.volume = Math.max(0, stripNonNumeric(row.volume));
        line.marksAndNumbers = String(row.marksAndNumbers ?? "").trim();
        line.description = String(row.description ?? "").trim();
        return line;
      }),
    });
  }

  return { ok: true, containers };
}
