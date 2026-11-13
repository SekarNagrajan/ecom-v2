// Modified by Sekar Nagarajan (2026-11-12 23:50)
// Schedules API — mock search computed from the VSS / Commercial fixtures (schedules.bridge)

import { loadBridge } from "../../../data-source";
import type {
  CarbonCalculationResult,
  ScheduleItem,
  ScheduleSearchParams,
  ShareScheduleMailInput,
  ShareScheduleMailResponse,
  VesselParticulars,
} from "../types/schedules.types";

/** Fixture bridge, loaded on first use so the fixtures stay out of the entry bundle. */
const schedulesBridge = () =>
  loadBridge(() => import("../../../mocks/fixture-api/bridges/schedules.bridge"));

function sortSchedules(items: ScheduleItem[]): ScheduleItem[] {
  // Recommended / direct first so both card cases stay visible when mixed.
  return [...items].sort((a, b) => {
    if (a.isDefaultRoute !== b.isDefaultRoute) {
      return a.isDefaultRoute ? -1 : 1;
    }
    if (a.isDirect !== b.isDirect) {
      return a.isDirect ? -1 : 1;
    }
    return a.etd.localeCompare(b.etd);
  });
}

export const schedulesApi = {
  /**
   * Search Vessel Schedules (Point-to-point, Vessel schedule, Port schedule)
   */
  async searchSchedules(params?: ScheduleSearchParams): Promise<ScheduleItem[]> {
    await new Promise((resolve) => setTimeout(resolve, 300)); // simulated latency

    if (!params) {
      return [];
    }

    const { searchSchedules } = await schedulesBridge();
    return sortSchedules(searchSchedules(params));
  },

  /** Codes + labels for the By Vessel search dropdown (from schedule fixtures + vessel master). */
  async listVesselOptions(): Promise<{ value: string; label: string }[]> {
    const { listVesselSelectOptions } = await schedulesBridge();
    return listVesselSelectOptions();
  },

  /**
   * Get Vessel Particulars & Port Call Sequence
   */
  async getVesselDetails(vesselCode: string): Promise<VesselParticulars | null> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const { getVesselDetails } = await schedulesBridge();
    return getVesselDetails(vesselCode);
  },

  /** POST /api/v1/schedules/share-mail — share sailing results by email */
  async shareSchedulesByMail(input: ShareScheduleMailInput): Promise<ShareScheduleMailResponse> {
    const res = await fetch("/api/v1/schedules/share-mail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      throw new Error("Failed to share sailing schedules by email");
    }
    const json = await res.json();
    return json.data;
  },
};

/**
 * CO2e estimate for the Carbon modal — UI formula over the sailing's great-circle distance
 * (emission factor and TTW/WTT split are constants, not fixture data).
 */
export function calculateCarbonEmissions(
  routeLabel: string,
  qty: number,
  weightTons: number,
  distanceKm: number,
): CarbonCalculationResult {
  const effectiveWeight = weightTons > 0 ? weightTons : qty * 12;
  const emissionFactorGramsPerTonKm = 8.5;
  const totalCo2eGrams = effectiveWeight * distanceKm * emissionFactorGramsPerTonKm;
  const totalCo2eTons = parseFloat((totalCo2eGrams / 1_000_000).toFixed(2));
  const ttwCo2eTons = parseFloat((totalCo2eTons * 0.82).toFixed(2));
  const wttCo2eTons = parseFloat((totalCo2eTons * 0.18).toFixed(2));

  return {
    routeLabel,
    containerQty: qty,
    weightTons: effectiveWeight,
    distanceKm,
    totalCo2eTons,
    ttwCo2eTons,
    wttCo2eTons,
  };
}
