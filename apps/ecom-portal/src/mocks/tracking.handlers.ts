// Modified by Sekar Nagarajan (2026-10-17 00:30)
/**
 * Container & cargo tracking MSW handlers, computed from the SQL-extracted fixtures
 * (src/mocks/fixture-api/bridges/tracking.bridge.ts — LRP booking legs / cargo / B/L, operationDetail
 * container moves, schedules & port calls, port coordinates).
 *
 *   GET /api/tracking/search?type=CONTAINER|BOOKING|BL&ref=<reference>
 *       200 { data: TrackingSearchResult }
 *       404 { error: { code: 'NOT_FOUND', message: 'No tracking records found for that reference' } }
 *   GET /api/tracking/samples
 *       200 { data: { container, booking, bl } }   demo references that resolve in the sample
 *
 * Registered in browser.ts before the generic fixture routes.
 */
import { http } from 'msw';
import type { TrackingSearchType } from '../features/tracking/types/tracking.types';
import { fixtureTrackingResult, trackingSampleReferences } from './fixture-api/bridges/tracking.bridge';
import { latency, notFound, ok } from './fixture-api/utils';

export const TRACKING_NOT_FOUND = 'No tracking records found for that reference';

const searchTypeOf = (raw: string | null): TrackingSearchType => {
  const v = (raw ?? '').trim().toUpperCase();
  return v === 'BOOKING' || v === 'BL' ? v : 'CONTAINER';
};

export const trackingHandlers = [
  http.get('/api/tracking/search', async ({ request }) => {
    await latency();
    const sp = new URL(request.url).searchParams;
    const ref = (sp.get('ref') ?? '').trim();
    const result = ref ? fixtureTrackingResult(searchTypeOf(sp.get('type')), ref) : null;
    return result ? ok(result) : notFound(TRACKING_NOT_FOUND);
  }),

  http.get('/api/tracking/samples', () => ok(trackingSampleReferences())),
];
