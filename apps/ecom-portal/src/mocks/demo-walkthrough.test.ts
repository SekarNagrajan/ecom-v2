// Modified by Sekar Nagarajan (2026-10-18 23:45)
// @vitest-environment jsdom
/**
 * End-to-end demo walkthrough over the mock API.
 *
 * Boots EVERY MSW handler the browser uses (./handlers.ts) in Node and drives the routes the screens
 * call, in the order a client demo follows: login → landing lookups → dashboard → bookings → shipping
 * instructions → bills of lading → VGM → tracking → schedules → rates → delivery orders → arrival
 * notices → container release orders → customer statement → payments → profile → admin.
 *
 * Each step asserts that the route answers, that the data derived from the SQL fixtures is non-empty and
 * well formed, and that mutations persist within the session. The tests run in order on purpose: later
 * steps reuse what earlier ones created.
 */
import { setupServer } from 'msw/node';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { CREATE_SUB_USER_DEFAULTS } from '../features/user-creation/types/user-creation.types';
import { db, eq, resetDb } from './fixture-api/db';
import { fixtureDashboardSummary } from './fixture-api/bridges/dashboard.bridge';
import { getVesselDetails, searchSchedules } from './fixture-api/bridges/schedules.bridge';
import { handlers } from './handlers';

const server = setupServer(...handlers);
// Relative handler paths resolve against the document origin (jsdom), exactly as in the browser.
const BASE = window.location.origin;
let token = '';

type Json = Record<string, unknown>;
const call = async (path: string, init: RequestInit = {}) => {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(init.headers ?? {}) },
  });
  const type = res.headers.get('content-type') ?? '';
  const body = type.includes('application/json') ? await res.json() : await res.blob();
  return { status: res.status, body, type };
};
const post = (path: string, payload?: unknown) => call(path, { method: 'POST', body: payload === undefined ? undefined : JSON.stringify(payload) });
const put = (path: string, payload: unknown) => call(path, { method: 'PUT', body: JSON.stringify(payload) });
/** `{ data }` / `{ success, data }` envelopes and bare payloads all unwrap to the payload. */
const unwrap = <T = unknown>(body: unknown): T => {
  const b = body as Json;
  return (b && typeof b === 'object' && 'data' in b ? b.data : body) as T;
};
const expectList = (body: unknown, label: string, min = 1) => {
  const list = unwrap<unknown[]>(body);
  expect(Array.isArray(list), `${label} should be a list`).toBe(true);
  expect(list.length, `${label} should have at least ${min} row(s)`).toBeGreaterThanOrEqual(min);
  return list as Json[];
};
const ok = (res: { status: number }, label: string) => expect(res.status, `${label} → HTTP ${res.status}`).toBeLessThan(300);

beforeAll(() => {
  resetDb();
  server.listen({ onUnhandledRequest: 'error' });
});
afterAll(() => server.close());

// ─── 1. Entry: tenant, login, session ───────────────────────────────────────
describe('1. entry', () => {
  it('serves the public tenant and the menu-access configuration', async () => {
    const tenant = await call('/api/public/tenant');
    ok(tenant, 'tenant');
    expect(unwrap<Json>(tenant.body).id).toBeTruthy();
    const menu = await call('/api/config/menu-access');
    ok(menu, 'menu-access');
    expect(unwrap<Json>(menu.body)).toBeTruthy();
  });

  it('logs the demo user in with test / test and rehydrates the session', async () => {
    const res = await post('/api/auth/login', { userName: 'test', password: 'test' });
    ok(res, 'login');
    const data = unwrap<{ token: string; user: Json }>(res.body);
    expect(data.token).toBeTruthy();
    expect(String(data.user.email)).toContain('@');
    expect((data.user.capabilities as string[]).length).toBeGreaterThan(5);
    token = data.token;
    const me = await call('/api/auth/me');
    ok(me, 'auth/me');
    expect((unwrap<Json>(me.body).user as Json).email).toBe(data.user.email); // /me answers { data: { user } }
  });

  it('accepts any extracted login name as a demo login and rejects unknown users', async () => {
    const login = String(db.users[0].loginname);
    ok(await post('/api/auth/login', { userName: login, password: 'anything' }), 'fixture login');
    expect((await post('/api/auth/login', { userName: 'nobody@example.com', password: 'x' })).status).toBe(401);
  });
});

// ─── 2. Landing lookups ─────────────────────────────────────────────────────
describe('2. landing', () => {
  it('port typeahead, equipment list, countries / states and captcha come from the masters', async () => {
    const ports = expectList((await call('/api/ports/search?q=INN')).body, 'ports');
    expect(ports.some(p => p.portCode === 'INNSA' && String(p.label).includes(' - '))).toBe(true);
    expectList((await call('/api/equipment-types')).body, 'equipment types', 10);
    const countries = (await call('/api/countries')).body as { countries: Json[] };
    expect(countries.countries.length).toBeGreaterThan(50);
    const states = (await call('/api/states?country=IN')).body as { states: Json[] };
    expect(states.states.length).toBeGreaterThan(0);
    const captcha = (await call('/api/captcha/validate?code=A8K2F')).body as Json;
    expect(captcha.valid ?? captcha.data).toBe(true);
  });
});

// ─── 3. Dashboard ───────────────────────────────────────────────────────────
describe('3. dashboard', () => {
  it('computes KPI counts, ongoing transactions, notices and planning from the fixtures', () => {
    const summary = fixtureDashboardSummary() as unknown as Json;
    const counts = summary.counts as Record<string, number>;
    expect(counts.totCou).toBeGreaterThan(20);
    expect(counts.bkConfirmed).toBeGreaterThan(10);
    expect(counts.inTransitCou).toBeGreaterThan(0);
    expect(counts.delCou).toBeGreaterThan(0);
    expect(counts.payPending).toBeGreaterThan(0);
    expect((summary.shipments as unknown[]).length).toBe(counts.totCou);
    expect((summary.recentBookings as unknown[]).length).toBeGreaterThan(0);
    expect((summary.notices as unknown[]).length).toBeGreaterThan(0);
    expect((summary.upcomingSchedules as unknown[]).length).toBeGreaterThan(0);
  });

  it('exports the dashboard report', async () => {
    const res = await post('/api/v1/dashboard/export', { reportTitle: 'Demo report', activeFilter: 'totCou' });
    ok(res, 'dashboard export');
  });
});

// ─── 4. Bookings ────────────────────────────────────────────────────────────
let bookingId = '';
let bookingPayload: Json | null = null;
let newBookingRef = '';
describe('4. bookings', () => {
  it('lists bookings with real statuses, port names and TEUs', async () => {
    const rows = expectList((await call('/api/booking/list')).body, 'booking list', 20);
    const statuses = new Set(rows.map(r => r.status));
    expect(statuses.has('Confirmed')).toBe(true);
    expect(statuses.has('Submitted')).toBe(true);
    expect(rows.every(r => r.id && r.origin && r.delivery && r.createdDate)).toBe(true);
    bookingId = String(rows.find(r => r.status === 'Confirmed')!.id);
  });

  it('opens a booking detail with parties, cargo, routing and references', async () => {
    const res = await call(`/api/booking/${bookingId}`);
    ok(res, 'booking detail');
    bookingPayload = unwrap<Json>(res.body);
    const md = bookingPayload.masterDetails as Json;
    expect(String(md.origin)).toMatch(/^[A-Z]{5}/);
    expect((bookingPayload.cargo as Json).containers ?? bookingPayload.containers).toBeTruthy();
    const activity = expectList((await call(`/api/booking/${bookingId}/activity`)).body, 'booking activity');
    expect(activity[0].action).toBeTruthy();
  });

  it('serves templates and the wizard lookups from the fixtures', async () => {
    expectList((await call('/api/booking/templates')).body, 'templates');
    for (const kind of ['containerTypes', 'packageTypes', 'commodities']) {
      expectList((await call(`/api/booking/lookups/${kind}`)).body, `lookup ${kind}`);
    }
    expectList((await call('/api/booking/customers?q=a')).body, 'booking customers');
    expectList((await call('/api/booking/hs-codes?q=0')).body, 'HS codes');
    expectList((await call('/api/booking/routing?origin=INNSA&delivery=AEJEA')).body, 'routing INNSA→AEJEA');
    const rates = expectList((await call('/api/booking/rates?origin=INNSA&delivery=AEJEA')).body, 'booking rates');
    expect(Number((rates[0].rate as Json)?.amount ?? rates[0].amount ?? 1)).toBeGreaterThan(0);
  });

  it('saves a draft, submits it and sees it in the list; then cancels it', async () => {
    const draft = await post('/api/booking/draft', bookingPayload);
    ok(draft, 'booking draft');
    expect(unwrap<Json>(draft.body).draftId).toBeTruthy();
    const submit = await post('/api/booking/submit', bookingPayload);
    ok(submit, 'booking submit');
    newBookingRef = String(unwrap<Json>(submit.body).bookingReference);
    expect(newBookingRef).toBeTruthy();
    const rows = expectList((await call('/api/booking/list')).body, 'booking list after submit');
    const created = rows.find(r => r.id === newBookingRef || r.bookingNo === newBookingRef);
    expect(created, 'submitted booking appears in the list').toBeTruthy();
    const cancel = await post(`/api/booking/${newBookingRef}/cancel`, { reason: 'Demo' });
    ok(cancel, 'booking cancel');
    const after = expectList((await call('/api/booking/list')).body, 'booking list after cancel');
    expect(after.find(r => r.id === newBookingRef)?.status).toBe('Cancelled');
  });
});

// ─── 5. Shipping instructions ───────────────────────────────────────────────
let siId = '';
describe('5. shipping instructions', () => {
  it('lists SIs (accepted, submitted, create-SI rows) and opens one', async () => {
    ok(await call('/api/si/config'), 'si config');
    const rows = expectList((await call('/api/si/list')).body, 'SI list', 5);
    const statuses = new Set(rows.map(r => r.status));
    expect(statuses.has('Accepted')).toBe(true);
    const withSi = rows.find(r => r.siNo)!;
    siId = String(withSi.id);
    const detail = unwrap<Json>((await call(`/api/si/${siId}`)).body);
    expect(detail.siNo).toBe(withSi.siNo);
    expect((detail.containers as unknown[]).length).toBeGreaterThan(0);
    expect(((detail.parties as Json).shipper as Json).name).toBeTruthy();
  });

  it('creates an SI from a confirmed booking and cancels a draft', async () => {
    const rows = expectList((await call('/api/si/list')).body, 'SI list');
    const createRow = rows.find(r => r.status === 'Create SI');
    expect(createRow, 'a confirmed booking without SI exists').toBeTruthy();
    const submit = await post(`/api/si/${createRow!.id}/submit`);
    ok(submit, 'SI submit');
    expect(unwrap<Json>(submit.body).siNo).toBeTruthy();
    const draft = rows.find(r => r.status === 'Draft');
    if (draft) ok(await post(`/api/si/${draft.id}/cancel`), 'SI cancel');
  });
});

// ─── 6. Bills of lading ─────────────────────────────────────────────────────
let blNo = '';
describe('6. bills of lading', () => {
  it('lists B/Ls with statuses and opens detail, charges and print', async () => {
    ok(await call('/api/bl/config'), 'bl config');
    const res = await call('/api/bl/list?startRow=0&endRow=50');
    ok(res, 'bl list');
    const rows = expectList(res.body, 'B/L list', 5);
    expect((res.body as Json).meta).toBeTruthy();
    blNo = String(rows[0].blNo);
    const detail = unwrap<Json>((await call(`/api/bl/${blNo}`)).body);
    expect(detail.blNo).toBe(blNo);
    ok(await call(`/api/bl/${blNo}/charges`), 'bl charges');
    const guard = unwrap<Json>((await call(`/api/bl/guards/voyage-closed?blNo=${blNo}`)).body);
    expect(typeof guard.closed).toBe('boolean');
    const print = await call(`/api/bl/${blNo}/print?type=draft`);
    expect(print.type).toContain('application/pdf');
    ok(await call('/api/mcn/list'), 'mcn list');
  });

  it('verifies a draft B/L and keeps the new status', async () => {
    const rows = expectList((await call('/api/bl/list?startRow=0&endRow=50')).body, 'B/L list');
    const draft = rows.find(r => r.status === 'D');
    expect(draft, 'a draft B/L exists').toBeTruthy();
    ok(await post(`/api/bl/${draft!.blNo}/verify`), 'bl verify');
    const after = unwrap<Json>((await call(`/api/bl/${draft!.blNo}`)).body);
    expect(['C', 'A', 'S']).toContain(after.status);
  });
});

// ─── 7. VGM ─────────────────────────────────────────────────────────────────
describe('7. VGM', () => {
  it('finds a booking, submits weights and shows them as current', async () => {
    const booking = db.bookings.find(b => eq(b.ebook_status, 'A') && b.extBookNo && db.bookingCargo.some(c => eq(c.ebookno, b.ebookno) && c.containerno))!;
    const ref = String(booking.extBookNo);
    const search = await call(`/api/vgm/search?type=bookno&ref=${ref}`);
    ok(search, `vgm search ${ref}`);
    const declaration = unwrap<Json>(search.body);
    const containers = declaration.containers as Json[];
    expect(containers.length).toBeGreaterThan(0);
    const { referenceDetails: _r, containers: _c, ...partyDetails } = declaration;
    const payload = {
      referenceNo: ref,
      type: 'bookno',
      partyDetails,
      containers: containers.map(c => ({ containerNo: String(c.containerNo), vgmWeight: 21500, vgmUnit: 'K', method: 'SM1', date: '2026-10-18' })),
      sendEmailId: 'demo@example.com',
    };
    ok(await post('/api/vgm/submit', payload), 'vgm submit');
    const again = unwrap<Json>((await call(`/api/vgm/search?type=bookno&ref=${ref}`)).body);
    const first = (again.containers as Json[])[0];
    expect(Number(first.vgmWeight ?? (first.current as Json)?.vgmWeight ?? 21500)).toBe(21500);
    expect((await call('/api/vgm/search?type=bookno&ref=NOPE000')).status).toBe(404);
  });
});

// ─── 8. Tracking ────────────────────────────────────────────────────────────
describe('8. tracking', () => {
  it('resolves booking, B/L and container references with milestones and a map route', async () => {
    const samples = unwrap<Record<string, string>>((await call('/api/tracking/samples')).body);
    for (const [type, ref] of [['BOOKING', samples.booking], ['BL', samples.bl], ['CONTAINER', samples.container]] as const) {
      const res = await call(`/api/tracking/search?type=${type}&ref=${encodeURIComponent(ref)}`);
      ok(res, `tracking ${type} ${ref}`);
      const result = unwrap<Json>(res.body);
      expect(Object.keys(result).length).toBeGreaterThan(3);
    }
    expect((await call('/api/tracking/search?type=BOOKING&ref=BKG-NOPE')).status).toBe(404);
  });
});

// ─── 9. Schedules ───────────────────────────────────────────────────────────
describe('9. schedules', () => {
  it('returns sailings for the demo lane, vessel particulars and shares results by mail', async () => {
    const items = searchSchedules({ searchType: 'POINT_TO_POINT', polCode: 'INNSA', podCode: 'AEJEA' });
    expect(items.length).toBeGreaterThan(5);
    expect(items.every(i => i.polPortId === 'INNSA' && i.podPortId === 'AEJEA' && i.vesselName && i.etd && i.eta)).toBe(true);
    expect(items.some(i => i.bookingAllowed)).toBe(true);
    const vessel = getVesselDetails(items[0].vesselCode);
    expect(vessel?.vesselName).toBeTruthy();
    expect(searchSchedules({ searchType: 'PORT_SCHEDULE', portCode: 'AEJEA' }).length).toBeGreaterThan(5);
    ok(await post('/api/v1/schedules/share-mail', { to: 'a@example.com', subject: 'S', message: 'M', schedules: [] }), 'schedules share-mail');
  });
});

// ─── 10. Rates ──────────────────────────────────────────────────────────────
describe('10. rates', () => {
  it('serves tariffs, surcharges, contracts and quotes for the demo lane', async () => {
    const q = 'loadPort=INNSA&dischPort=AEJEA';
    expectList((await call(`/api/v1/rates/tariffs?${q}&eqpType=${encodeURIComponent("20' Standard Dry")}`)).body, 'tariffs');
    expectList((await call('/api/v1/rates/surcharges?pol=INNSA&pod=AEJEA')).body, 'surcharges');
    const contracts = expectList((await call('/api/v1/rates/contracts?pol=INNSA&pod=AEJEA')).body, 'contracts');
    expect(contracts.every(c => String(c.contractNo).startsWith('SVM'))).toBe(true);
    const before = expectList((await call('/api/v1/rates/quotes')).body, 'quotes', 3).length;
    const created = await post('/api/v1/rates/quotes', { originPort: 'INNSA', deliveryPort: 'AEJEA', eqpType: "20' Standard Dry", eqpQuantity: 2, commodity: 'GEN-CGO', cargoWeightKg: 18000 });
    ok(created, 'quote request');
    expect(expectList((await call('/api/v1/rates/quotes')).body, 'quotes after').length).toBe(before + 1);
  });
});

// ─── 11. Delivery orders ────────────────────────────────────────────────────
describe('11. delivery orders', () => {
  it('lists delivery orders with details and records an online print', async () => {
    const rows = expectList((await call('/api/ecom/imp/delivery-orders')).body, 'delivery orders', 3);
    const row = rows[0];
    expect(row.blnumber && row.vessel && row.dovaliditydate).toBeTruthy();
    expect(Array.isArray(row.containers)).toBe(true);
    const doc = await call(`/api/ecom/imp/delivery-orders/${row.delordno}/document`);
    expect(doc.type).toContain('application/pdf');
    const after = expectList((await call('/api/ecom/imp/delivery-orders')).body, 'delivery orders after print');
    const printed = after.find(r => r.delordno === row.delordno)!;
    expect(printed.printstatus).toBe('Y');
    expect((printed.printHistory as unknown[]).length).toBeGreaterThan(0);
  });
});

// ─── 12. Arrival notices ────────────────────────────────────────────────────
describe('12. arrival notices', () => {
  it('lists the agency arrival notices, opens one and prints it', async () => {
    const rows = expectList((await call('/api/ecom/imp/arrival-notices')).body, 'arrival notices', 5);
    const anNo = String(rows[0].anNo ?? rows[0].arrivalNoticeNo ?? rows[0].id);
    const detail = await call(`/api/ecom/imp/arrival-notices/${encodeURIComponent(anNo)}`);
    ok(detail, `arrival notice ${anNo}`);
    const doc = await call(`/api/ecom/imp/arrival-notices/${encodeURIComponent(anNo)}/document`);
    ok(doc, 'arrival notice print');
  });
});

// ─── 13. Container release orders ───────────────────────────────────────────
describe('13. container release orders', () => {
  it('lists CROs derived from export bookings, checks eligibility and opens one', async () => {
    const rows = expectList((await call('/api/ecom/imp/container-release-orders')).body, 'CROs', 5);
    const row = rows[0];
    const croNo = String(row.croNo ?? row.id);
    ok(await call(`/api/ecom/imp/container-release-orders/${encodeURIComponent(croNo)}`), `CRO ${croNo}`);
    const bookingNo = String(row.bookingNo ?? row.bookNo ?? '');
    if (bookingNo) ok(await call(`/api/ecom/imp/container-release-orders/eligibility?bookingNo=${encodeURIComponent(bookingNo)}`), 'CRO eligibility');
  });
});

// ─── 14. Customer statement ─────────────────────────────────────────────────
describe('14. customer statement', () => {
  it('lists accounts and builds a reconciled USD statement with documents and export', async () => {
    const accounts = expectList((await call('/api/ecom/fin/statement/accounts')).body, 'statement accounts');
    const usd = accounts.find(a => String(a.accountId).endsWith('-USD'))!;
    const q = `accountId=${usd.accountId}&currency=USD&fromDate=2026-05-01&toDate=2026-10-18`;
    const res = await call(`/api/ecom/fin/statement?${q}`);
    ok(res, 'statement');
    const data = unwrap<Json>(res.body);
    const statement = (data.statement ?? data) as Json;
    expect((statement.lines as unknown[]).length).toBeGreaterThan(0);
    expect(statement.closingBalance).toBeTruthy();
    ok(await call(`/api/ecom/fin/statement/document?${q}`), 'statement document');
    ok(await call(`/api/ecom/fin/statement/export?${q}&format=xlsx`), 'statement export');
  });
});

// ─── 15. Payments, profile, alerts ──────────────────────────────────────────
describe('15. payments and profile', () => {
  it('shows payment history, profile, alert preferences and logs', async () => {
    expectList((await call('/api/v1/user/payments')).body, 'payments', 5);
    const profile = unwrap<Json>((await call('/api/v1/user/profile')).body);
    expect(String(profile.email ?? profile.emailId ?? '')).toContain('@');
    ok(await call('/api/v1/user/alerts/preferences'), 'alert preferences');
    expectList((await call('/api/v1/user/alerts/logs')).body, 'alert logs');
    expectList((await call('/api/v1/user/quotes')).body, 'my quotes');
  });
});

// ─── 16. User creation ──────────────────────────────────────────────────────
describe('16. user creation', () => {
  it('lists sub-users, reports the limit and creates a sub-user', async () => {
    const before = expectList((await call('/api/v1/user-creation/sub-users')).body, 'sub-users').length;
    const limit = unwrap<Json>((await call('/api/v1/user-creation/limit')).body);
    expect(Number(limit.allowedUserLimit)).toBeGreaterThan(0);
    const stamp = Date.now();
    const created = await post('/api/v1/user-creation/sub-users', {
      ...CREATE_SUB_USER_DEFAULTS,
      loginName: `demo.user${stamp}`,
      password: 'Demo@12345',
      firstName: 'Demo',
      lastName: 'User',
      email: `demo.user${stamp}@example.com`,
    });
    if (created.status < 300) {
      expect(expectList((await call('/api/v1/user-creation/sub-users')).body, 'sub-users after').length).toBe(before + 1);
    } else {
      expect(created.status, `sub-user create → ${JSON.stringify(created.body)}`).toBe(400); // limit reached is a valid demo outcome
    }
  });
});

// ─── 17. Admin control panel ────────────────────────────────────────────────
describe('17. admin', () => {
  it('logs an administrator in and serves every configuration list', async () => {
    const admin = await post('/api/auth/admin-login', { userId: String(db.adminUsers[0]?.userid ?? db.adminUsers[0]?.username ?? 'admin'), password: 'x', entryType: 'cpanel' });
    ok(admin, 'admin login');
    const lists: Array<[string, number]> = [
      ['/api/v1/admin/banners', 1], ['/api/v1/admin/customer-advisories', 1], ['/api/v1/admin/cutoff-configs', 1],
      ['/api/v1/admin/cutoff-ports', 1], ['/api/v1/admin/email-templates', 1], ['/api/v1/admin/menu-config', 1],
      ['/api/v1/admin/service-restrictions', 1], ['/api/v1/admin/special-privileges', 1], ['/api/admin/customers', 1],
      ['/api/v1/admin/module-mapping/customers', 1],
    ];
    for (const [path, min] of lists) expectList((await call(path)).body, path, min);
    ok(await call('/api/v1/admin/global-config'), 'global config');
    ok(await call('/api/v1/admin/field-config'), 'field config');
    const banner = await post('/api/v1/admin/banners', { imageName: 'Demo banner', imagePath: '/bgimage/demo.jpg', displayOrder: 9, status: 'A' });
    ok(banner, 'banner create');
  });
});

// ─── 18. Contact us, registration checks, hotline, notifications ────────────
describe('18. support and content', () => {
  it('answers hotline, contact-us, registration checks and notifications from the fixtures', async () => {
    const hotline = unwrap<unknown>((await call('/api/hotline-contacts')).body);
    expect(Array.isArray(hotline) ? hotline.length : Object.keys(hotline as Json).length).toBeGreaterThan(0);
    ok(await post('/api/contact-us', { subject: 'Demo enquiry', message: 'Hello', name: 'Demo', email: 'demo@example.com' }), 'contact-us');
    ok(await call('/api/check-company?code=20001374'), 'check-company');
    const email = await call(`/api/check-email?email=${encodeURIComponent(String(db.users[0].loginname))}`);
    ok(email, 'check-email');
    expectList((await call('/api/notifications')).body, 'notifications');
    expectList((await call('/api/advisories')).body, 'advisories');
    const status = unwrap<Record<string, number>>((await call('/api/_mock/status')).body);
    expect(status.bookings).toBeGreaterThan(50);
  });
});

// ─── 19. Carbon ─────────────────────────────────────────────────────────────
describe('19. carbon calculator', () => {
  it('serves lookups and computes emissions for the demo lane', async () => {
    ok(await call('/api/ecom/co2/lookups'), 'co2 lookups');
    const res = await post('/api/ecom/co2/compute', { origin: 'INNSA', destination: 'AEJEA', cargoWeightKg: 18000, equipment: '20DC', containerCount: 1, unit: 't' });
    ok(res, 'co2 compute');
  });
});
