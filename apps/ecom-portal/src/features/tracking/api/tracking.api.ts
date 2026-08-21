// Container & Cargo Tracking API Client Layer
// Parity with Struts TrackingDetails.do backend facade
// Modified by sekar nagarajan (2026-08-21)

import { fetchTrackingDetails } from '../mocks/tracking.mock';
import type { TrackingSearchParams, TrackingSearchResult } from '../types/tracking.types';

export const trackingApi = {
  getTrackingDetails: async (params: TrackingSearchParams): Promise<TrackingSearchResult | null> => {
    return fetchTrackingDetails(params.searchValue);
  },
};
