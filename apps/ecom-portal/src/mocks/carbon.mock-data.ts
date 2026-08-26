// Modified by Sekar Nagarajan (2026-08-25 13:00)
import type {
  CarbonInput,
  CarbonLookupsDTO,
  CarbonResultDTO,
  TransportMode,
} from '../features/carbon-calculator/types/carbon.types';

/** GLEC / Clean Cargo ocean default — mock fixture only (server-side). */
const SEA_FACTOR_G_PER_TONNE_KM = 8.5;
const TTW_SHARE = 0.82;
const WTT_SHARE = 0.18;

/** Grams CO₂e per tonne-km by mode (mock factor table — never shipped to React). */
const MODE_FACTOR_G_PER_TONNE_KM: Record<TransportMode, number> = {
  SEA: SEA_FACTOR_G_PER_TONNE_KM,
  ROAD: 62,
  RAIL: 22,
  AIR: 602,
  INLAND_WATER: 31,
};

/** Stub great-circle–style distances (km) for known mock lanes. */
const LANE_DISTANCE_KM: Record<string, number> = {
  'SGSIN-NLRTM': 15200,
  'CNSHA-USLAX': 10500,
  'INMAA-AEJEA': 4800,
  'USNYC-DEHAM': 6400,
  'KRPUS-JPYOK': 1200,
};

export const mockCarbonLookups: CarbonLookupsDTO = {
  ports: [
    { value: 'SGSIN', label: 'Singapore (SGSIN)' },
    { value: 'NLRTM', label: 'Rotterdam (NLRTM)' },
    { value: 'CNSHA', label: 'Shanghai (CNSHA)' },
    { value: 'USLAX', label: 'Los Angeles (USLAX)' },
    { value: 'INMAA', label: 'Chennai (INMAA)' },
    { value: 'AEJEA', label: 'Jebel Ali (AEJEA)' },
    { value: 'USNYC', label: 'New York (USNYC)' },
    { value: 'DEHAM', label: 'Hamburg (DEHAM)' },
    { value: 'KRPUS', label: 'Busan (KRPUS)' },
    { value: 'JPYOK', label: 'Yokohama (JPYOK)' },
  ],
  modes: [
    { value: 'SEA', label: 'Sea' },
    { value: 'ROAD', label: 'Road' },
    { value: 'RAIL', label: 'Rail' },
    { value: 'AIR', label: 'Air' },
    { value: 'INLAND_WATER', label: 'Inland water' },
  ],
  equipment: [
    { value: '20GP', label: '20′ General Purpose' },
    { value: '40GP', label: '40′ General Purpose' },
    { value: '40HC', label: '40′ High Cube' },
    { value: '45HC', label: '45′ High Cube' },
    { value: '20RF', label: '20′ Reefer' },
    { value: '40RF', label: '40′ Reefer' },
  ],
  fuelTypes: [
    { value: 'VLSFO', label: 'VLSFO' },
    { value: 'MGO', label: 'MGO' },
    { value: 'LNG', label: 'LNG' },
    { value: 'HFO', label: 'HFO' },
  ],
};

/** Known-good fixture for Vitest parity (SGSIN→NLRTM, 14 t, 1×40HC, SEA). */
export const MOCK_CARBON_FIXTURE_INPUT: CarbonInput = {
  origin: 'SGSIN',
  destination: 'NLRTM',
  cargoWeightKg: 14000,
  equipment: '40HC',
  containerCount: 1,
  fuelType: 'VLSFO',
  unit: 'kg',
  legs: [
    {
      mode: 'SEA',
      from: 'SGSIN',
      to: 'NLRTM',
    },
  ],
};

function laneKey(from: string, to: string): string {
  return `${from.toUpperCase()}-${to.toUpperCase()}`;
}

function resolveDistanceKm(from: string, to: string, override?: number): number {
  if (override != null && override > 0) return override;
  const direct = LANE_DISTANCE_KM[laneKey(from, to)];
  if (direct != null) return direct;
  const reverse = LANE_DISTANCE_KM[laneKey(to, from)];
  if (reverse != null) return reverse;
  // Deterministic stub for unknown lanes (hash of codes → 2k–12k km)
  const seed =
    from.charCodeAt(0) * 100 +
    from.charCodeAt(4) +
    to.charCodeAt(0) * 50 +
    to.charCodeAt(4);
  return 2000 + (seed % 10000);
}

function roundKg(value: number): number {
  return Math.round(value);
}

function roundTonnes(value: number): number {
  return parseFloat(value.toFixed(2));
}

/**
 * Server-side mock emission engine. Factor tables stay here — never import into React UI.
 */
export function computeMockCarbon(input: CarbonInput): CarbonResultDTO {
  const weightTonnes = input.cargoWeightKg / 1000;
  const legs =
    input.legs && input.legs.length > 0
      ? input.legs
      : [
          {
            mode: 'SEA' as const,
            from: input.origin,
            to: input.destination,
          },
        ];

  const legResults = legs.map((leg) => {
    const distanceKm = resolveDistanceKm(leg.from, leg.to, leg.distanceKm);
    const factor = MODE_FACTOR_G_PER_TONNE_KM[leg.mode];
    const co2eGrams = weightTonnes * distanceKm * factor;
    const co2eKg = roundKg(co2eGrams / 1000);
    const co2eTonnes = roundTonnes(co2eKg / 1000);
    return {
      mode: leg.mode,
      from: leg.from.toUpperCase(),
      to: leg.to.toUpperCase(),
      distanceKm,
      co2eKg,
      co2eTonnes,
    };
  });

  const totalCo2eKg = roundKg(legResults.reduce((sum, l) => sum + l.co2eKg, 0));
  const totalCo2eTonnes = roundTonnes(totalCo2eKg / 1000);
  const ttwCo2eKg = roundKg(totalCo2eKg * TTW_SHARE);
  const wttCo2eKg = roundKg(totalCo2eKg - ttwCo2eKg);
  const ttwCo2eTonnes = roundTonnes(ttwCo2eKg / 1000);
  const wttCo2eTonnes = roundTonnes(wttCo2eKg / 1000);

  const totalDistanceKm = legResults.reduce((sum, l) => sum + l.distanceKm, 0);
  const perTeu =
    input.containerCount > 0
      ? roundTonnes(totalCo2eTonnes / input.containerCount)
      : undefined;
  const perTonneKm =
    weightTonnes > 0 && totalDistanceKm > 0
      ? parseFloat(((totalCo2eKg * 1000) / (weightTonnes * totalDistanceKm)).toFixed(2))
      : undefined;

  return {
    totalCo2eKg,
    totalCo2eTonnes,
    ttwCo2eKg,
    ttwCo2eTonnes,
    wttCo2eKg,
    wttCo2eTonnes,
    legs: legResults,
    intensity: {
      perTeu,
      perTonneKm,
    },
    methodology: {
      standard: 'GLEC',
      version: 'mock-1.0',
    },
    computedAt: new Date().toISOString(),
    unit: input.unit,
  };
}

/** Expected totals for MOCK_CARBON_FIXTURE_INPUT (Vitest parity). */
export function expectedFixtureTotals(): {
  totalCo2eKg: number;
  totalCo2eTonnes: number;
  distanceKm: number;
} {
  const weightTonnes = MOCK_CARBON_FIXTURE_INPUT.cargoWeightKg / 1000;
  const distanceKm = LANE_DISTANCE_KM['SGSIN-NLRTM'];
  const co2eGrams = weightTonnes * distanceKm * SEA_FACTOR_G_PER_TONNE_KM;
  const totalCo2eKg = roundKg(co2eGrams / 1000);
  return {
    totalCo2eKg,
    totalCo2eTonnes: roundTonnes(totalCo2eKg / 1000),
    distanceKm,
  };
}
