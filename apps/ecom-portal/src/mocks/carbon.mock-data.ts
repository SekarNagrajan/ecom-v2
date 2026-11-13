// Modified by Sekar Nagarajan (2026-09-15 12:31)
import type {
  CarbonInput,
  CarbonLegInput,
  CarbonLookupsDTO,
  CarbonResultDTO,
  TransportMode,
} from "../features/carbon-calculator/types/carbon.types";

/** GLEC / Clean Cargo ocean default — mock fixture only (server-side). */
const SEA_FACTOR_G_PER_TONNE_KM = 8.5;

/** Grams CO₂e per tonne-km by mode (mock factor table — never shipped to React). */
const MODE_FACTOR_G_PER_TONNE_KM: Record<TransportMode, number> = {
  SEA: SEA_FACTOR_G_PER_TONNE_KM,
  ROAD: 62,
  RAIL: 22,
  AIR: 602,
  INLAND_WATER: 31,
};

/**
 * Tank-to-wheel share of total CO₂e by fuel — keeps the scope donut visually
 * distinct across fuel selections in the UI.
 */
const TTW_SHARE_BY_FUEL: Record<string, number> = {
  VLSFO: 0.82,
  MGO: 0.8,
  LNG: 0.74,
  HFO: 0.86,
};
const DEFAULT_TTW_SHARE = 0.82;

/** Stub great-circle–style distances (km) for known mock legs. */
const LANE_DISTANCE_KM: Record<string, number> = {
  "SGSIN-NLRTM": 15200,
  "CNSHA-USLAX": 10500,
  "INMAA-AEJEA": 4800,
  "USNYC-DEHAM": 6400,
  "KRPUS-JPYOK": 1200,
  "MYPKG-SGSIN": 48,
  "NLRTM-BEANR": 95,
  "BEANR-NLUTR": 62,
  "CNNKG-CNSHA": 305,
  "USLAX-USCHI": 3180,
  "USCHI-USORD": 55,
  "INMAA-INNSA": 42,
  "INNSA-AEJEA": 4620,
  "AEJEA-AEDXB": 35,
  "USNYC-USBAL": 290,
  "USBAL-DEHAM": 6180,
  "DEHAM-DEBRV": 125,
  "KRINC-KRPUS": 52,
  "JPYOK-JPTYO": 38,
  "SGSIN-CNSHA": 4400,
  "INMAA-SGSIN": 2900,
  "INNSA-SGSIN": 2900,
  "AEJEA-NLRTM": 9800,
  "BEANR-DEHAM": 420,
};

/**
 * Multimodal showcase itineraries — used when the client does not send legs
 * so ECharts (scope / leg / mode) have distinct series values.
 */
const SHOWCASE_ROUTES: Record<string, CarbonLegInput[]> = {
  "SGSIN-NLRTM": [
    { mode: "ROAD", from: "MYPKG", to: "SGSIN", distanceKm: 48 },
    { mode: "SEA", from: "SGSIN", to: "NLRTM", distanceKm: 15200 },
    { mode: "INLAND_WATER", from: "NLRTM", to: "BEANR", distanceKm: 95 },
    { mode: "ROAD", from: "BEANR", to: "NLUTR", distanceKm: 62 },
  ],
  "CNSHA-USLAX": [
    { mode: "RAIL", from: "CNNKG", to: "CNSHA", distanceKm: 305 },
    { mode: "SEA", from: "CNSHA", to: "USLAX", distanceKm: 10500 },
    { mode: "RAIL", from: "USLAX", to: "USCHI", distanceKm: 3180 },
    { mode: "ROAD", from: "USCHI", to: "USORD", distanceKm: 55 },
  ],
  "INMAA-AEJEA": [
    { mode: "ROAD", from: "INMAA", to: "INNSA", distanceKm: 42 },
    { mode: "SEA", from: "INNSA", to: "AEJEA", distanceKm: 4620 },
    { mode: "ROAD", from: "AEJEA", to: "AEDXB", distanceKm: 35 },
  ],
  "USNYC-DEHAM": [
    { mode: "RAIL", from: "USNYC", to: "USBAL", distanceKm: 290 },
    { mode: "SEA", from: "USBAL", to: "DEHAM", distanceKm: 6180 },
    { mode: "ROAD", from: "DEHAM", to: "DEBRV", distanceKm: 125 },
  ],
  "KRPUS-JPYOK": [
    { mode: "ROAD", from: "KRINC", to: "KRPUS", distanceKm: 52 },
    { mode: "SEA", from: "KRPUS", to: "JPYOK", distanceKm: 1200 },
    { mode: "ROAD", from: "JPYOK", to: "JPTYO", distanceKm: 38 },
  ],
  /** Air-heavy contrast lane for a high-intensity mode slice. */
  "INMAA-SGSIN": [
    { mode: "ROAD", from: "INMAA", to: "INNSA", distanceKm: 42 },
    { mode: "AIR", from: "INNSA", to: "SGSIN", distanceKm: 2900 },
    { mode: "ROAD", from: "SGSIN", to: "MYPKG", distanceKm: 48 },
  ],
  "SGSIN-CNSHA": [
    { mode: "SEA", from: "SGSIN", to: "CNSHA", distanceKm: 4400 },
    { mode: "RAIL", from: "CNSHA", to: "CNNKG", distanceKm: 305 },
  ],
  "AEJEA-NLRTM": [
    { mode: "ROAD", from: "AEDXB", to: "AEJEA", distanceKm: 35 },
    { mode: "SEA", from: "AEJEA", to: "NLRTM", distanceKm: 9800 },
    { mode: "INLAND_WATER", from: "NLRTM", to: "BEANR", distanceKm: 95 },
    { mode: "RAIL", from: "BEANR", to: "DEHAM", distanceKm: 420 },
  ],
};

export const mockCarbonLookups: CarbonLookupsDTO = {
  ports: [
    { value: "SGSIN", label: "Singapore (SGSIN)" },
    { value: "NLRTM", label: "Rotterdam (NLRTM)" },
    { value: "CNSHA", label: "Shanghai (CNSHA)" },
    { value: "USLAX", label: "Los Angeles (USLAX)" },
    { value: "INMAA", label: "Chennai (INMAA)" },
    { value: "AEJEA", label: "Jebel Ali (AEJEA)" },
    { value: "USNYC", label: "New York (USNYC)" },
    { value: "DEHAM", label: "Hamburg (DEHAM)" },
    { value: "KRPUS", label: "Busan (KRPUS)" },
    { value: "JPYOK", label: "Yokohama (JPYOK)" },
    { value: "MYPKG", label: "Port Klang (MYPKG)" },
    { value: "BEANR", label: "Antwerp (BEANR)" },
    { value: "NLUTR", label: "Utrecht (NLUTR)" },
    { value: "CNNKG", label: "Nanjing (CNNKG)" },
    { value: "USCHI", label: "Chicago (USCHI)" },
    { value: "USORD", label: "Chicago Metro (USORD)" },
    { value: "INNSA", label: "Nhava Sheva (INNSA)" },
    { value: "AEDXB", label: "Dubai (AEDXB)" },
    { value: "USBAL", label: "Baltimore (USBAL)" },
    { value: "DEBRV", label: "Bremerhaven (DEBRV)" },
    { value: "KRINC", label: "Incheon (KRINC)" },
    { value: "JPTYO", label: "Tokyo (JPTYO)" },
  ],
  modes: [
    { value: "SEA", label: "Sea" },
    { value: "ROAD", label: "Road" },
    { value: "RAIL", label: "Rail" },
    { value: "AIR", label: "Air" },
    { value: "INLAND_WATER", label: "Inland water" },
  ],
  equipment: [
    { value: "20GP", label: "20′ General Purpose" },
    { value: "40GP", label: "40′ General Purpose" },
    { value: "40HC", label: "40′ High Cube" },
    { value: "45HC", label: "45′ High Cube" },
    { value: "20RF", label: "20′ Reefer" },
    { value: "40RF", label: "40′ Reefer" },
  ],
  fuelTypes: [
    { value: "VLSFO", label: "VLSFO" },
    { value: "MGO", label: "MGO" },
    { value: "LNG", label: "LNG" },
    { value: "HFO", label: "HFO" },
  ],
};

/** Known-good fixture for Vitest parity (SGSIN→NLRTM, 14 t, 1×40HC, SEA only). */
export const MOCK_CARBON_FIXTURE_INPUT: CarbonInput = {
  origin: "SGSIN",
  destination: "NLRTM",
  cargoWeightKg: 14000,
  equipment: "40HC",
  containerCount: 1,
  fuelType: "VLSFO",
  unit: "kg",
  legs: [
    {
      mode: "SEA",
      from: "SGSIN",
      to: "NLRTM",
    },
  ],
};

function laneKey(from: string, to: string): string {
  return `${from.toUpperCase()}-${to.toUpperCase()}`;
}

function resolveDistanceKm(
  from: string,
  to: string,
  override?: number,
): number {
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

function resolveTtwShare(fuelType?: string): number {
  if (!fuelType) return DEFAULT_TTW_SHARE;
  return TTW_SHARE_BY_FUEL[fuelType] ?? DEFAULT_TTW_SHARE;
}

/**
 * Prefer a curated multimodal itinerary for chart demos; fall back to a
 * three-leg stub (road → ocean → road) so every lane still has mode variety.
 */
export function resolveShowcaseLegs(
  origin: string,
  destination: string,
): CarbonLegInput[] {
  const from = origin.toUpperCase();
  const to = destination.toUpperCase();
  const curated = SHOWCASE_ROUTES[laneKey(from, to)];
  if (curated) return curated.map((leg) => ({ ...leg }));

  const reverse = SHOWCASE_ROUTES[laneKey(to, from)];
  if (reverse) {
    return reverse
      .slice()
      .reverse()
      .map((leg) => ({
        ...leg,
        from: leg.to,
        to: leg.from,
      }));
  }

  const oceanKm = resolveDistanceKm(from, to);
  const preHub = `${from.slice(0, 2)}HUB`;
  const postHub = `${to.slice(0, 2)}DST`;
  return [
    { mode: "ROAD", from: preHub, to: from, distanceKm: 40 },
    { mode: "SEA", from, to, distanceKm: oceanKm },
    { mode: "ROAD", from: to, to: postHub, distanceKm: 55 },
  ];
}

function roundKg(value: number): number {
  return Math.round(value);
}

function roundTonnes(value: number): number {
  return parseFloat(value.toFixed(2));
}

/**
 * Server-side mock emission engine. Factor tables stay here — never import into React UI.
 * When `legs` are omitted, a multimodal showcase itinerary is resolved for charts.
 */
export function computeMockCarbon(input: CarbonInput): CarbonResultDTO {
  const weightTonnes = input.cargoWeightKg / 1000;
  const legs =
    input.legs && input.legs.length > 0
      ? input.legs
      : resolveShowcaseLegs(input.origin, input.destination);

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
  const ttwShare = resolveTtwShare(input.fuelType);
  const ttwCo2eKg = roundKg(totalCo2eKg * ttwShare);
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
      ? parseFloat(
          ((totalCo2eKg * 1000) / (weightTonnes * totalDistanceKm)).toFixed(2),
        )
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
      standard: "GLEC",
      version: "mock-1.0",
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
  const distanceKm = LANE_DISTANCE_KM["SGSIN-NLRTM"];
  const co2eGrams = weightTonnes * distanceKm * SEA_FACTOR_G_PER_TONNE_KM;
  const totalCo2eKg = roundKg(co2eGrams / 1000);
  return {
    totalCo2eKg,
    totalCo2eTonnes: roundTonnes(totalCo2eKg / 1000),
    distanceKm,
  };
}
