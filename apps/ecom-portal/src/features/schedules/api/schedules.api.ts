// Modified by Sekar Nagarajan (2026-10-17 00:40)
// Schedules API — mock search computed from the VSS / Commercial fixtures (schedules.bridge)

import {
  getVesselDetails,
  searchSchedules,
} from "../../../mocks/fixture-api/bridges/schedules.bridge";
import type {
  CarbonCalculationResult,
  ScheduleItem,
  ScheduleSearchParams,
  ShareScheduleMailInput,
  ShareScheduleMailResponse,
  VesselParticulars,
} from "../types/schedules.types";

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

    return sortSchedules(searchSchedules(params));
  },

  /**
   * Get Vessel Particulars & Port Call Sequence
   */
  async getVesselDetails(vesselCode: string): Promise<VesselParticulars | null> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return getVesselDetails(vesselCode);
  },

  /** POST /api/v1/schedules/share-mail — share sailing results by email */
  async shareSchedulesByMail(
    input: ShareScheduleMailInput,
  ): Promise<ShareScheduleMailResponse> {
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
  const totalCo2eGrams =
    effectiveWeight * distanceKm * emissionFactorGramsPerTonKm;
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
