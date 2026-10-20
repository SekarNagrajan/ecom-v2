// Created by Sekar Nagarajan (2026-09-17 23:28)
/**
 * Default tare weight (kg) by container type — mock parity with JSP
 * `PortListAjax?type=getTareweight` → `ecombkg.getTareweight(eqptype, equipdesc)`.
 * Real values will come from REST; until then use this table.
 * User default: 20DC = 2300 kg.
 */

/** Known mock defaults (kg). Extend as more types are confirmed from master data. */
const DEFAULT_TARE_WEIGHT_KG: Record<string, number> = {
  "20DC": 2300,
  "20DV": 2300,
  "20RF": 2800,
  "20OT": 2400,
  "20FR": 2500,
  "40DV": 3900,
  "40HC": 3900,
  "40RH": 4500,
  "40OT": 4000,
  "40FR": 4200,
  "45HC": 4200,
};

function normalizeContainerTypeCode(containerType?: string): string {
  const raw = (containerType ?? "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return raw || "20DC";
}

/**
 * Resolve default tare (kg) for a container type code/label.
 * Returns undefined when unknown so the field stays blank for manual entry.
 */
export function defaultTareWeightKg(
  containerType: string | undefined,
): number | undefined {
  const code = normalizeContainerTypeCode(containerType);
  if (DEFAULT_TARE_WEIGHT_KG[code] != null) {
    return DEFAULT_TARE_WEIGHT_KG[code];
  }
  // Size-based fallback: 20' → 2300, otherwise 3900 (demo heuristic)
  if (code.startsWith("20")) return 2300;
  if (code.startsWith("40") || code.startsWith("45")) return 3900;
  return undefined;
}
