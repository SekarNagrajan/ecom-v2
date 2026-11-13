// Modified by Sekar Nagarajan (2026-10-17 00:20)
/**
 * Rates module handlers, served from the Commercial fixtures through fixture-api/bridges/rates.bridge.ts:
 * published tariffs and derived contracts from `tariffs`, surcharge codes from `charges`, session-only quotes.
 */
import { http, HttpResponse } from 'msw';

import type { CreateQuoteInput } from '../features/rates/types/rates.types';
import {
  createQuote,
  fixtureContracts,
  fixtureSurcharges,
  fixtureTariffs,
  listQuotes,
} from './fixture-api/bridges/rates.bridge';
import {
  ensureUserDbReady,
  persistUserDb,
} from './fixture-api/user-persistence';

/** Query parameter or undefined (blank values count as absent). */
const param = (url: URL, key: string): string | undefined => url.searchParams.get(key)?.trim() || undefined;

export const ratesHandlers = [
  // Wildcard paths — survive absolute URL / SW edge cases (same pattern as SI/BL)
  http.get('*/api/v1/rates/tariffs', ({ request }) => {
    const url = new URL(request.url);
    return HttpResponse.json({
      success: true,
      data: fixtureTariffs({
        loadPort: param(url, 'loadPort'),
        dischPort: param(url, 'dischPort'),
        eqpType: param(url, 'eqpType'),
        commodity: param(url, 'commodity'),
        date: param(url, 'date'),
      }),
    });
  }),

  http.get('*/api/v1/rates/surcharges', ({ request }) => {
    const url = new URL(request.url);
    return HttpResponse.json({
      success: true,
      data: fixtureSurcharges({
        origin: param(url, 'origin'),
        pol: param(url, 'pol'),
        pod: param(url, 'pod'),
        delivery: param(url, 'delivery'),
        eqpType: param(url, 'eqpType'),
      }),
    });
  }),

  http.get('*/api/v1/rates/contracts', ({ request }) => {
    const url = new URL(request.url);
    return HttpResponse.json({
      success: true,
      data: fixtureContracts({
        contractNo: param(url, 'contractNo'),
        customerCode: param(url, 'customerCode'),
        pol: param(url, 'pol'),
        pod: param(url, 'pod'),
      }),
    });
  }),

  http.get('*/api/v1/rates/quotes', async () => {
    await ensureUserDbReady();
    return HttpResponse.json({ success: true, data: listQuotes() });
  }),

  http.post('*/api/v1/rates/quotes', async ({ request }) => {
    await ensureUserDbReady();
    const input = (await request.json()) as CreateQuoteInput;
    const quote = createQuote(input);
    persistUserDb();
    return HttpResponse.json({ success: true, data: quote });
  }),

  // Modified by Sekar Nagarajan (2026-09-11 16:25) — share rate quote via email
  http.post('*/api/v1/rates/share-mail', async ({ request }) => {
    const input = (await request.json()) as {
      to: string;
      cc?: string;
      subject: string;
      message: string;
      rates?: unknown[];
    };
    if (!input?.to?.trim() || !input?.subject?.trim() || !input?.message?.trim()) {
      return HttpResponse.json(
        { success: false, message: 'Recipient, subject, and message are required.' },
        { status: 400 },
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 450));
    const recipients = [input.to, ...(input.cc ? input.cc.split(',') : [])]
      .map((v) => v.trim())
      .filter(Boolean);
    return HttpResponse.json({
      success: true,
      data: {
        success: true,
        messageId: `mail-${Date.now()}`,
        recipientCount: recipients.length,
      },
    });
  }),
];
