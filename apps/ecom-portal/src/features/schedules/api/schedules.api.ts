// Modified by Sekar Nagarajan (2026-09-08 16:25)
// Schedules API — mock search over Direct + Transshipment catalogues

import {
  MOCK_SCHEDULES,
  MOCK_VESSELS,
} from "../mocks/schedules.mock";
import type {
  ScheduleItem,
  ScheduleSearchParams,
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
      return sortSchedules(MOCK_SCHEDULES);
    }

    let results = [...MOCK_SCHEDULES];

    if (params.searchType === "POINT_TO_POINT") {
      if (params.polCode) {
        const pol = params.polCode.toLowerCase();
        const matched = results.filter(
          (s) =>
            s.polPortId.toLowerCase().includes(pol) ||
            s.polPortName.toLowerCase().includes(pol),
        );
        if (matched.length > 0) results = matched;
      }
      if (params.podCode) {
        const pod = params.podCode.toLowerCase();
        const matched = results.filter(
          (s) =>
            s.podPortId.toLowerCase().includes(pod) ||
            s.podPortName.toLowerCase().includes(pod),
        );
        if (matched.length > 0) results = matched;
      }
    } else if (params.searchType === "VESSEL_SCHEDULE" && params.vesselCode) {
      const query = params.vesselCode.toLowerCase();
      const matched = results.filter(
        (s) =>
          s.vesselName.toLowerCase().includes(query) ||
          s.vesselCode.toLowerCase().includes(query) ||
          s.legs.some(
            (leg) =>
              leg.vesselName.toLowerCase().includes(query) ||
              leg.vesselCode.toLowerCase().includes(query),
          ),
      );
      if (matched.length > 0) results = matched;
    } else if (params.searchType === "PORT_SCHEDULE" && params.portCode) {
      const query = params.portCode.toLowerCase();
      const matched = results.filter(
        (s) =>
          s.polPortId.toLowerCase().includes(query) ||
          s.podPortId.toLowerCase().includes(query) ||
          s.legs.some(
            (leg) =>
              leg.polPortId.toLowerCase().includes(query) ||
              leg.podPortId.toLowerCase().includes(query),
          ),
      );
      if (matched.length > 0) results = matched;
    }

    return sortSchedules(results);
  },

  /**
   * Get Vessel Particulars & Port Call Sequence
   */
  async getVesselDetails(vesselCode: string): Promise<VesselParticulars | null> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return MOCK_VESSELS[vesselCode] || MOCK_VESSELS.AGEX;
  },
};
