// Modified by Sekar Nagarajan (2026-10-17 02:20)
/**
 * User-module routes (profile, password, quotes, alerts, payment history) served from the
 * SQL-extracted fixtures via src/mocks/fixture-api/bridges/{user,payments}.bridge.ts.
 * Mutations update the in-memory fixture rows, so edits persist for the browser session.
 */
import { http, HttpResponse } from 'msw';
import type {
  AlertPreference,
  CustomerProfile,
  QuoteItem,
} from '../features/user-modules/types/user-modules.types';
import { nextRef, nowIso } from './fixture-api/db';
import { filterPaymentsByDateRange, fixturePaymentHistory } from './fixture-api/bridges/payments.bridge';
import {
  applyAlertPreferences,
  applyProfilePatch,
  currentCustomerCode,
  currentFixtureUser,
  customerParty,
  fixtureAlertLogs,
  fixtureAlertPreferences,
  mapProfile,
} from './fixture-api/bridges/user.bridge';
import { formatYmd } from './fixture-api/bridges/minute-format';
import { createQuote, listQuotes, surchargeAmount } from './fixture-api/bridges/rates.bridge';
import type { QuoteDTO } from '../features/rates/types/rates.types';

// Quotes: one store with the rates module (fixture-api/bridges/rates.bridge.ts) — enquiries derived from the
// customer's route-search log plus the requests raised in this session.
const toQuoteItem = (q: QuoteDTO): QuoteItem => {
  const thc = q.status === 'PENDING_REVIEW' ? 0 : surchargeAmount('THD', q.eqpType);
  return {
    id: q.id,
    quoteNo: q.quoteNo,
    polCode: q.originPort,
    polName: q.originPortName,
    podCode: q.deliveryPort,
    podName: q.deliveryPortName,
    equipmentType: q.eqpType,
    commodity: q.commodity,
    validFrom: q.validFrom,
    validTo: q.validTo,
    oceanFreightUSD: q.quotedAmountUsd,
    thcUSD: thc,
    totalAmountUSD: q.quotedAmountUsd ? q.quotedAmountUsd + thc : 0,
    status: q.status === 'DRAFT' ? 'PENDING_REVIEW' : q.status,
    createdAt: q.createdAt.slice(0, 10),
  };
};

const noUser = () =>
  HttpResponse.json({ error: { code: 'NOT_FOUND', message: 'No fixture user for the demo customer' } }, { status: 404 });

export const userModulesHandlers = [
  // 1. Profile — users (eCom_Reg_Details) + userDetails (ecomuserdetails)
  //    (address falls back to the customer's own party row on its bookings when eCom_Reg_Details left it blank)
  http.get('/api/v1/user/profile', () => {
    const cur = currentFixtureUser();
    return cur ? HttpResponse.json(mapProfile(cur.user, cur.details, customerParty(currentCustomerCode()))) : noUser();
  }),
  http.put('/api/v1/user/profile', async ({ request }) => {
    const cur = currentFixtureUser();
    if (!cur) return noUser();
    const body = (await request.json()) as Partial<CustomerProfile>;
    return HttpResponse.json(applyProfilePatch(cur, body, customerParty(currentCustomerCode())));
  }),

  // 2. Change Password — stamps ecomuserdetails.lastpwdup
  http.post('/api/v1/user/change-password', async ({ request }) => {
    const body = (await request.json()) as { oldPassword?: string; newPassword?: string };
    if (!body.oldPassword) {
      return HttpResponse.json({ success: false, message: 'Current password is required' }, { status: 400 });
    }
    const cur = currentFixtureUser();
    if (cur?.details) cur.details.lastpwdup = nowIso();
    return HttpResponse.json({ success: true, message: 'Password updated successfully' });
  }),

  // 3. Quotes — shared with the rates module
  http.get('/api/v1/user/quotes', () => HttpResponse.json(listQuotes().map(toQuoteItem))),
  http.post('/api/v1/user/quotes', async ({ request }) => {
    const body = (await request.json()) as {
      polPort?: string;
      podPort?: string;
      equipmentType?: string;
      commodity?: string;
      targetDate?: string;
    };
    const code = (port?: string) => String(port ?? '').replace(/^.*\(([A-Z0-9]{5})\).*$/, '$1').slice(0, 5).toUpperCase();
    const quote = createQuote({
      originPort: code(body.polPort),
      deliveryPort: code(body.podPort),
      eqpType: body.equipmentType ?? '',
      eqpQuantity: 1,
      commodity: body.commodity ?? '',
      cargoWeightKg: 0,
      comments: body.targetDate ? `Target shipment date ${body.targetDate}` : undefined,
    });
    // A new request has no price until the agency quotes it.
    return HttpResponse.json(toQuoteItem({ ...quote, quotedAmountUsd: 0, validTo: body.targetDate || quote.validTo }));
  }),

  // 4. Alerts — mailAlerts + activities (fallback notificationSettings / customerNotifications); logs from EcommuserlogDetails
  http.get('/api/v1/user/alerts/preferences', () => HttpResponse.json(fixtureAlertPreferences())),
  http.put('/api/v1/user/alerts/preferences', async ({ request }) => {
    const body = (await request.json()) as AlertPreference;
    return HttpResponse.json(applyAlertPreferences(body));
  }),
  http.get('/api/v1/user/alerts/logs', () => HttpResponse.json(fixtureAlertLogs())),

  // 5. Payments — payments + paymentReferences; optional ?fromDate=&toDate= (YYYY-MM-DD, inclusive)
  http.get('*/api/v1/user/payments', ({ request }) => {
    const url = new URL(request.url);
    const fromDate = url.searchParams.get('fromDate') || undefined;
    const toDate = url.searchParams.get('toDate') || undefined;
    return HttpResponse.json(filterPaymentsByDateRange(fixturePaymentHistory(currentCustomerCode()), fromDate, toDate));
  }),
];
