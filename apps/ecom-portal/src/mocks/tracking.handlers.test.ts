// Modified by Sekar Nagarajan (2026-10-17 00:40)
// @vitest-environment jsdom
/**
 * Route-level tests for the fixture-backed tracking handlers and the trackingApi fetch client that
 * consumes them, served through msw/node.
 */
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { trackingApi } from '../features/tracking/api/tracking.api';
import type { TrackingSearchResult } from '../features/tracking/types/tracking.types';
import { TRACKING_NOT_FOUND, trackingHandlers } from './tracking.handlers';

const server = setupServer(...trackingHandlers);
// Relative-path handlers resolve against location.origin, hence the jsdom environment.
const BASE = location.origin;

const get = async (path: string) => {
  const res = await fetch(`${BASE}${path}`);
  return { status: res.status, body: (await res.json()) as { data?: unknown; error?: { code: string; message: string } } };
};

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('GET /api/tracking/search', () => {
  it('returns the shipment envelope for a known agency booking number', async () => {
    const { status, body } = await get('/api/tracking/search?type=BOOKING&ref=SVMDMU2694105');
    expect(status).toBe(200);
    const data = body.data as TrackingSearchResult;
    expect(data).toMatchObject({ bookingNo: 'SVMDMU2694105', blNo: 'EPIRINDMUM69602', polPortCode: 'INNSA', podPortCode: 'AEJEA', vesselCode: 'RNR' });
    expect(data.containers.map(c => c.containerNo)).toEqual(['AASU1205200', 'DETS0001702']);
    expect(data.milestones.length).toBeGreaterThan(3);
  });

  it('answers 404 with the not-found envelope for unknown or blank references', async () => {
    const missing = await get('/api/tracking/search?type=CONTAINER&ref=SMLU8829102');
    expect(missing.status).toBe(404);
    expect(missing.body.error).toEqual({ code: 'NOT_FOUND', message: TRACKING_NOT_FOUND });
    expect((await get('/api/tracking/search?type=BL')).status).toBe(404);
  });

  it('lists demo references', async () => {
    const { status, body } = await get('/api/tracking/samples');
    expect(status).toBe(200);
    expect(body.data).toMatchObject({ booking: 'SVMDMU2694105', bl: 'EPIRINDMUM69602' });
  });
});

describe('trackingApi.getTrackingDetails', () => {
  it('resolves the result for a B/L and a single container', async () => {
    const byBl = await trackingApi.getTrackingDetails({ searchType: 'BL', searchValue: 'EPIRINDMUM69602' });
    expect(byBl?.searchKey).toBe('EPIRINDMUM69602');
    const byContainer = await trackingApi.getTrackingDetails({ searchType: 'CONTAINER', searchValue: ' aasu1205200 ' });
    expect(byContainer?.containers.map(c => c.containerNo)).toEqual(['AASU1205200']);
  });

  it('resolves null for an unknown reference (the screen shows "no records")', async () => {
    await expect(trackingApi.getTrackingDetails({ searchType: 'BOOKING', searchValue: 'BKG-2026-9901' })).resolves.toBeNull();
    await expect(trackingApi.getTrackingDetails({ searchType: 'BOOKING', searchValue: '   ' })).resolves.toBeNull();
  });
});
