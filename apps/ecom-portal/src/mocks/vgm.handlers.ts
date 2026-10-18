// Modified by Sekar Nagarajan (2026-10-16 23:40)
/**
 * VGM (SOLAS verified gross mass) MSW handlers, served from the SQL-extracted fixtures
 * (src/mocks/fixtures/vgm.json = ecom_vgmsolas, plus bookings / SI / cargo tables).
 *
 *   GET  /api/vgm/search?type=bookno|blno&ref=<reference>
 *        200 { data: VgmDeclarationDTO }
 *        404 { error: { code: 'NOT_FOUND', message: 'Invalid Booking or BL Number.' } }
 *   POST /api/vgm/submit   body: VgmSubmitPayload
 *        200 { data: { message: 'VGM successfully submitted and email sent.' } }
 *        400 { error: { code: 'BAD_REQUEST', message } }
 *
 * Registered in browser.ts before the generic fixture routes (GET/POST /api/vgm) so both can coexist.
 */
import { http, HttpResponse } from 'msw';
import type { VgmSubmitPayload } from '../features/vgm/types/vgm.types';
import { applyVgmSubmission, buildVgmDeclaration } from './fixture-api/bridges/vgm.bridge';
import { currentLogin } from './fixture-api/bridges/user.bridge';
import { latency } from './fixture-api/utils';

const INVALID_REFERENCE = 'Invalid Booking or BL Number.';

export const vgmHandlers = [
  http.get('/api/vgm/search', async ({ request }) => {
    await latency();
    const sp = new URL(request.url).searchParams;
    const type = sp.get('type') === 'blno' ? 'blno' : 'bookno';
    const ref = (sp.get('ref') ?? '').trim();
    const declaration = ref ? buildVgmDeclaration(type, ref) : null;
    if (!declaration) {
      return HttpResponse.json({ error: { code: 'NOT_FOUND', message: INVALID_REFERENCE } }, { status: 404 });
    }
    return HttpResponse.json({ data: declaration });
  }),

  http.post('/api/vgm/submit', async ({ request }) => {
    await latency();
    const body = (await request.json().catch(() => null)) as VgmSubmitPayload | null;
    if (!body?.referenceNo || !Array.isArray(body.containers) || !body.containers.length) {
      return HttpResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Reference number and at least one container are required.' } },
        { status: 400 },
      );
    }
    applyVgmSubmission(body, currentLogin());
    return HttpResponse.json({ data: { message: 'VGM successfully submitted and email sent.' } });
  }),
];
