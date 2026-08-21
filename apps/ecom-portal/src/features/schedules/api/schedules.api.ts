// Schedules API Service layer with async delay simulation
// Prepared for backend Struts/EJB REST API integration
// Modified by Antigravity (2026-08-21)

import { MOCK_SCHEDULES, MOCK_VESSELS } from '../mocks/schedules.mock';
import type { ScheduleItem, ScheduleSearchParams, VesselParticulars } from '../types/schedules.types';

export const schedulesApi = {
  /**
   * Search Vessel Schedules (Point-to-point, Vessel schedule, Port schedule)
   */
  async searchSchedules(params?: ScheduleSearchParams): Promise<ScheduleItem[]> {
    await new Promise((resolve) => setTimeout(resolve, 300)); // simulated latency

    if (!params) return MOCK_SCHEDULES;

    let results = [...MOCK_SCHEDULES];

    if (params.searchType === 'POINT_TO_POINT') {
      if (params.polCode) {
        const pol = params.polCode.toLowerCase();
        const matched = results.filter(
          (s) =>
            s.polPortId.toLowerCase().includes(pol) ||
            s.polPortName.toLowerCase().includes(pol)
        );
        if (matched.length > 0) results = matched;
      }
      if (params.podCode) {
        const pod = params.podCode.toLowerCase();
        const matched = results.filter(
          (s) =>
            s.podPortId.toLowerCase().includes(pod) ||
            s.podPortName.toLowerCase().includes(pod)
        );
        if (matched.length > 0) results = matched;
      }
    } else if (params.searchType === 'VESSEL_SCHEDULE' && params.vesselCode) {
      const query = params.vesselCode.toLowerCase();
      const matched = results.filter(
        (s) =>
          s.vesselName.toLowerCase().includes(query) ||
          s.vesselCode.toLowerCase().includes(query)
      );
      if (matched.length > 0) results = matched;
    } else if (params.searchType === 'PORT_SCHEDULE' && params.portCode) {
      const query = params.portCode.toLowerCase();
      const matched = results.filter(
        (s) =>
          s.polPortId.toLowerCase().includes(query) ||
          s.podPortId.toLowerCase().includes(query)
      );
      if (matched.length > 0) results = matched;
    }

    return results;
  },

  /**
   * Get Vessel Particulars & Port Call Sequence
   */
  async getVesselDetails(vesselCode: string): Promise<VesselParticulars | null> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return MOCK_VESSELS[vesselCode] || MOCK_VESSELS['AGEX'];
  },
};
