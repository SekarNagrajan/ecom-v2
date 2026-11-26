// Modified by Sekar Nagarajan (2026-08-25 13:00)
import type { TFunction } from "i18next";
import { z } from "zod";

export type TransportMode = "SEA" | "ROAD" | "RAIL" | "AIR" | "INLAND_WATER";
export type DisplayUnit = "kg" | "t";

export interface LookupOption {
  value: string;
  label: string;
}

export interface CarbonLookupsDTO {
  ports: LookupOption[];
  modes: LookupOption[];
  equipment: LookupOption[];
  fuelTypes: LookupOption[];
}

export interface CarbonLegInput {
  mode: TransportMode;
  from: string;
  to: string;
  distanceKm?: number;
}

export interface CarbonInput {
  origin: string;
  destination: string;
  legs?: CarbonLegInput[];
  cargoWeightKg: number;
  equipment: string;
  containerCount: number;
  fuelType?: string;
  unit: DisplayUnit;
}

export interface CarbonLegResult {
  mode: TransportMode;
  from: string;
  to: string;
  distanceKm: number;
  co2eKg: number;
  co2eTonnes: number;
}

export interface CarbonIntensity {
  perTeu?: number;
  perTonneKm?: number;
}

export interface CarbonMethodology {
  standard: string;
  version: string;
}

export interface CarbonResultDTO {
  totalCo2eKg: number;
  totalCo2eTonnes: number;
  ttwCo2eKg: number;
  ttwCo2eTonnes: number;
  wttCo2eKg: number;
  wttCo2eTonnes: number;
  legs: CarbonLegResult[];
  intensity: CarbonIntensity;
  methodology: CarbonMethodology;
  computedAt: string;
  unit: DisplayUnit;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: string;
  };
}

export const TRANSPORT_MODES = [
  "SEA",
  "ROAD",
  "RAIL",
  "AIR",
  "INLAND_WATER",
] as const satisfies readonly TransportMode[];

export function createCarbonLegInputSchema(t: TFunction) {
  return z.object({
    mode: z.enum(TRANSPORT_MODES),
    from: z.string().length(5, t("validation.originLocode")),
    to: z.string().length(5, t("validation.destinationLocode")),
    distanceKm: z.number().positive().optional(),
  });
}

export function createCarbonInputSchema(t: TFunction) {
  return z
    .object({
      origin: z.string().length(5, t("validation.originLocode")),
      destination: z.string().length(5, t("validation.destinationLocode")),
      legs: z.array(createCarbonLegInputSchema(t)).optional(),
      cargoWeightKg: z
        .number()
        .positive(t("validation.cargoWeightPositive")),
      equipment: z.string().min(1, t("validation.equipmentRequired")),
      containerCount: z.number().int().positive().default(1),
      fuelType: z.string().optional(),
      unit: z.enum(["kg", "t"]).default("kg"),
    })
    .superRefine((v, ctx) => {
      if (v.origin === v.destination) {
        ctx.addIssue({
          path: ["destination"],
          code: "custom",
          message: t("validation.destinationMustDiffer"),
        });
      }
    });
}

/** English-message schema for mocks/tests (same rules as createCarbonInputSchema). */
const enValidationT = ((key: string) => {
  const messages: Record<string, string> = {
    "validation.originLocode": "Origin LOCODE must be 5 characters.",
    "validation.destinationLocode": "Destination LOCODE must be 5 characters.",
    "validation.cargoWeightPositive": "Cargo weight must be greater than zero.",
    "validation.equipmentRequired": "Equipment is required.",
    "validation.destinationMustDiffer": "Destination must differ from origin.",
  };
  return messages[key] ?? key;
}) as TFunction;

export const carbonLegInputSchema = createCarbonLegInputSchema(enValidationT);
export const carbonInputSchema = createCarbonInputSchema(enValidationT);

export type CarbonInputFormValues = z.input<typeof carbonInputSchema>;
export type CarbonInputParsed = z.output<typeof carbonInputSchema>;

export interface Co2eUnitLabels {
  kg: string;
  t: string;
}

/** Format a CO₂e figure with thousands separators and unit suffix. */
export function formatCo2e(
  value: number,
  unit: DisplayUnit,
  unitLabels?: Co2eUnitLabels,
): string {
  const kgLabel = unitLabels?.kg ?? "kg CO₂e";
  const tLabel = unitLabels?.t ?? "t CO₂e";
  const suffix = unit === "kg" ? kgLabel : tLabel;
  if (!Number.isFinite(value)) {
    return `— ${suffix}`;
  }
  const decimals = unit === "kg" ? 0 : 2;
  const formatted = value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${formatted} ${suffix}`;
}

export function pickDisplayTotal(
  result: CarbonResultDTO,
  unit: DisplayUnit,
): number {
  return unit === "kg" ? result.totalCo2eKg : result.totalCo2eTonnes;
}

export function buildCarbonExportFilename(input: CarbonInput): string {
  return `CarbonEstimate_${input.origin}-${input.destination}.pdf`;
}
