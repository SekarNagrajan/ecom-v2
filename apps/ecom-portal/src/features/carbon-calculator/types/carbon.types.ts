// Modified by Sekar Nagarajan (2026-08-25 13:00)
import { z } from 'zod';

export type TransportMode = 'SEA' | 'ROAD' | 'RAIL' | 'AIR' | 'INLAND_WATER';
export type DisplayUnit = 'kg' | 't';

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
  'SEA',
  'ROAD',
  'RAIL',
  'AIR',
  'INLAND_WATER',
] as const satisfies readonly TransportMode[];

export const carbonLegInputSchema = z.object({
  mode: z.enum(TRANSPORT_MODES),
  from: z.string().length(5, 'Origin LOCODE must be 5 characters.'),
  to: z.string().length(5, 'Destination LOCODE must be 5 characters.'),
  distanceKm: z.number().positive().optional(),
});

export const carbonInputSchema = z
  .object({
    origin: z.string().length(5, 'Origin LOCODE must be 5 characters.'),
    destination: z.string().length(5, 'Destination LOCODE must be 5 characters.'),
    legs: z.array(carbonLegInputSchema).optional(),
    cargoWeightKg: z.number().positive('Cargo weight must be greater than zero.'),
    equipment: z.string().min(1, 'Equipment is required.'),
    containerCount: z.number().int().positive().default(1),
    fuelType: z.string().optional(),
    unit: z.enum(['kg', 't']).default('kg'),
  })
  .superRefine((v, ctx) => {
    if (v.origin === v.destination) {
      ctx.addIssue({
        path: ['destination'],
        code: 'custom',
        message: 'Destination must differ from origin.',
      });
    }
  });

export type CarbonInputFormValues = z.input<typeof carbonInputSchema>;
export type CarbonInputParsed = z.output<typeof carbonInputSchema>;

/** Format a CO₂e figure with thousands separators and unit suffix. */
export function formatCo2e(value: number, unit: DisplayUnit): string {
  if (!Number.isFinite(value)) {
    return `— ${unit === 'kg' ? 'kg' : 't'} CO₂e`;
  }
  const decimals = unit === 'kg' ? 0 : 2;
  const formatted = value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${formatted} ${unit === 'kg' ? 'kg' : 't'} CO₂e`;
}

export function pickDisplayTotal(
  result: CarbonResultDTO,
  unit: DisplayUnit
): number {
  return unit === 'kg' ? result.totalCo2eKg : result.totalCo2eTonnes;
}

export function buildCarbonExportFilename(input: CarbonInput): string {
  return `CarbonEstimate_${input.origin}-${input.destination}.pdf`;
}
