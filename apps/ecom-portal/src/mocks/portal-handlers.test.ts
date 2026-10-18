// Created by Sekar Nagarajan (2026-10-16 23:40)
// @vitest-environment jsdom
/**
 * Route-level smoke tests for the fixture-backed admin / auth / registration / user-creation / hotline
 * handlers: envelopes, status codes and in-session mutations, served through msw/node.
 */
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { adminHandlers } from './admin.handlers';
import { authAdminHandlers } from './auth-admin.handlers';
import { authHandlers } from './auth.handlers';
import { DEMO_CUSTOMER_CODE } from './fixture-api/bridges/users.bridge';
import { db, resetDb } from './fixture-api/db';
import { hotlineHandlers } from './hotline.handlers';
import { registrationHandlers } from './registration.handlers';
import { userCreationHandlers } from './user-creation.handlers';

const server = setupServer(...authAdminHandlers, ...registrationHandlers, ...authHandlers, ...hotlineHandlers, ...adminHandlers, ...userCreationHandlers);
// Relative-path handlers resolve against location.origin, hence the jsdom environment.
const BASE = location.origin;

const json = async (path: string, init?: RequestInit) => {
  const res = await fetch(`${BASE}${path}`, { headers: { 'Content-Type': 'application/json' }, ...init });
  return { status: res.status, body: (await res.json()) as Record<string, unknown> & { data?: never } };
};
const post = (path: string, body: unknown, headers: Record<string, string> = {}) =>
  json(path, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json', ...headers } });

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
beforeEach(() => resetDb());

describe('customer auth', () => {
  it('test/test logs in as the first fixture user of the sampled customer', async () => {
    const { status, body } = await post('/api/auth/login', { userName: 'test', password: 'test' });
    expect(status).toBe(200);
    const data = body.data as { token: string; user: { role: string; loginType: string; customerCode: string; capabilities: string[]; email: string } };
    expect(data.user).toMatchObject({ role: 'CUSTOMER', loginType: 'U', customerCode: DEMO_CUSTOMER_CODE });
    expect(data.user.capabilities).toEqual(expect.arrayContaining(['VIEW_DASHBOARD', 'CREATE_BOOKING', 'BL', 'SI', 'BKG', 'DO', 'CRO', 'ARN', 'STMT', 'CO2', 'VGM']));
    expect(db.users.some(u => String(u.loginname).toLowerCase() === data.user.email.toLowerCase())).toBe(true);

    const me = await json('/api/auth/me', { headers: { Authorization: `Bearer ${data.token}` } });
    expect(me.status).toBe(200);
    expect((me.body.data as { user: { email: string } }).user.email).toBe(data.user.email);
  }, 10_000);

  it('accepts any fixture login with any password and rejects unknown users with the old 401 body', async () => {
    const login = String(db.users[1].loginname);
    const ok = await post('/api/auth/login', { userName: login, password: 'whatever' });
    expect(ok.status).toBe(200);
    expect((ok.body.data as { user: { email: string } }).user.email.toLowerCase()).toBe(String(db.users[1].User_Email ?? login).toLowerCase());

    const bad = await post('/api/auth/login', { userName: 'nobody@nowhere.example', password: 'x' });
    expect(bad.status).toBe(401);
    expect(bad.body).toEqual({ message: 'Invalid username or password. Please try again.' });
  }, 10_000);

  it('activates a pending registration and answers forgot-password', async () => {
    const pending = db.users.find(u => String(u.isValid) !== 'Y');
    const act = await post('/api/auth/activate', { token: String(pending?.loginname) });
    expect(act.status).toBe(200);
    expect(pending?.isValid).toBe('Y');
    expect((await post('/api/auth/activate', { token: 'invalid' })).status).toBe(400);
    expect((await post('/api/auth/forgot-password', { userName: String(db.users[0].loginname), captcha: 'A8K2F' })).status).toBe(200);
  }, 10_000);
});

describe('admin auth', () => {
  it('logs admins in per entry type, impersonates and exits', async () => {
    const userId = String(db.adminUsers[0].userid);
    const cpanel = await post('/api/auth/admin-login', { userId, password: 'x', entryType: 'cpanel' });
    expect(cpanel.status).toBe(200);
    const sys = cpanel.body.data as { token: string; user: { role: string; adminUserType: string; vendorMenuList: string[] } };
    expect(sys.user).toMatchObject({ role: 'ADMIN', adminUserType: 'A' });
    expect(sys.user.vendorMenuList).toContain('specialprivi');

    const vendor = await post('/api/auth/admin-login', { userId, password: 'x', entryType: 'eadmin' });
    expect((vendor.body.data as { user: { role: string } }).user.role).toBe('VENDOR');

    const imp = await post('/api/auth/admin-login', { userId, password: 'x', entryType: 'admin' });
    const impData = imp.body.data as { token: string; customerList: { custCode: string }[] };
    expect(impData.customerList.length).toBeGreaterThan(1);
    const customers = await json('/api/admin/customers');
    expect((customers.body.data as unknown[]).length).toBe(impData.customerList.length);

    const auth = { Authorization: `Bearer ${impData.token}` };
    const switched = await post('/api/auth/impersonate', { custCode: DEMO_CUSTOMER_CODE }, auth);
    expect((switched.body.data as { user: { customerCode: string; isImpersonating: boolean } }).user).toMatchObject({ customerCode: DEMO_CUSTOMER_CODE, isImpersonating: true });
    const me = await json('/api/auth/me', { headers: auth });
    expect((me.body.data as { user: { impersonatedCustomer: { custCode: string } } }).user.impersonatedCustomer.custCode).toBe(DEMO_CUSTOMER_CODE);
    const back = await post('/api/auth/exit-impersonation', {}, auth);
    expect((back.body.data as { user: { impersonatedCustomer?: unknown } }).user.impersonatedCustomer).toBeUndefined();

    expect((await post('/api/auth/admin-login', { userId: 'invalid', password: 'x', entryType: 'cpanel' })).status).toBe(401);
    expect((await post('/api/auth/admin-login', { userId, password: 'x', entryType: 'weird' })).status).toBe(400);
    const access = await json('/api/config/menu-access');
    expect(access.body.data).toMatchObject({ BKG: 'P', SCH: 'D' });
  });
});

describe('admin modules', () => {
  const lists = ['menu-config', 'special-privileges', 'email-templates', 'field-config', 'service-restrictions', 'banners', 'customer-advisories'];
  for (const name of lists) {
    it(`GET /api/v1/admin/${name} returns fixture rows`, async () => {
      const { status, body } = await json(`/api/v1/admin/${name}`);
      expect(status).toBe(200);
      expect(Array.isArray(body)).toBe(true);
      expect((body as unknown as unknown[]).length).toBeGreaterThan(0);
    });
  }

  it('serves cut-off configs with ports / terminals and enforces duplicates', async () => {
    const list = (await json('/api/v1/admin/cutoff-configs')).body.data as { id: string; portCode: string; terminalCode: string }[];
    expect(list.length).toBe(db.cutoffConfig.length);
    const dup = await post('/api/v1/admin/cutoff-configs', { ...list[0], cfsClosing: 1, vgmClosing: 1, documentClosing: 1, ediDecClosing: 1, fullCntrGateClosing: 1, excludeWeekends: false });
    expect(dup.status).toBe(409);
    const created = await post('/api/v1/admin/cutoff-configs', { portCode: 'SGSIN', portName: 'Singapore', terminalCode: 'PSA', terminalName: 'PSA', cfsClosing: 10, vgmClosing: 10, documentClosing: 10, ediDecClosing: 10, fullCntrGateClosing: 10, excludeWeekends: true });
    expect(created.status).toBe(200);
    expect(db.cutoffConfig.some(r => r.port === 'SGSIN')).toBe(true);
    const upd = await json(`/api/v1/admin/cutoff-configs/${encodeURIComponent('SGSIN|PSA')}`, { method: 'PUT', body: JSON.stringify({ cfsClosing: 77 }) });
    expect((upd.body.data as { cfsClosing: number }).cfsClosing).toBe(77);
    expect((await json(`/api/v1/admin/cutoff-configs/${encodeURIComponent('SGSIN|PSA')}`, { method: 'DELETE' })).status).toBe(200);
    expect((await json(`/api/v1/admin/cutoff-configs/${encodeURIComponent('SGSIN|PSA')}`, { method: 'DELETE' })).status).toBe(404);
    const ports = (await json('/api/v1/admin/cutoff-ports')).body.data as { portCode: string }[];
    expect(ports[0].portCode).toBe('All');
    expect(ports.some(p => p.portCode === 'INNSA')).toBe(true);
    const terminals = (await json('/api/v1/admin/cutoff-terminals?portCode=INNSA')).body.data as { terminalCode: string }[];
    expect(terminals[0].terminalCode).toBe('All');
    expect(terminals.length).toBeGreaterThan(1);
  });

  it('maps modules per customer and persists add / remove', async () => {
    const customers = (await json('/api/v1/admin/module-mapping/customers?q=')).body.data as { custCode: string; webId: string }[];
    expect(customers.length).toBeGreaterThan(0);
    const c = customers.find(x => x.custCode === DEMO_CUSTOMER_CODE) ?? customers[0];
    const q = `custCode=${c.custCode}&webId=${encodeURIComponent(c.webId)}`;
    const before = (await json(`/api/v1/admin/module-mapping?${q}`)).body.data as { menuId: string; category: string }[];
    const free = before.find(m => m.category === 'P');
    expect(free).toBeDefined();
    const added = (await post('/api/v1/admin/module-mapping/add', { custCode: c.custCode, webId: c.webId, menuIds: [free?.menuId] })).body.data as { menuId: string; category: string }[];
    expect(added.find(m => m.menuId === free?.menuId)?.category).toBe('NP');
    const removed = (await post('/api/v1/admin/module-mapping/remove', { custCode: c.custCode, webId: c.webId, menuIds: [free?.menuId] })).body.data as { menuId: string; category: string }[];
    expect(removed.find(m => m.menuId === free?.menuId)?.category).toBe('P');
  });

  it('mutates templates, banners, advisories, global config and password resets in-session', async () => {
    const id = String(db.emailTemplates[0].id);
    const put = await json(`/api/v1/admin/email-templates/${id}`, { method: 'PUT', body: JSON.stringify({ subject: 'Changed' }) });
    expect(put.status).toBe(200);
    expect(db.emailTemplates[0].subject).toBe('Changed');
    expect((await json('/api/v1/admin/email-templates/999999', { method: 'PUT', body: '{}' })).status).toBe(404);

    const banner = await post('/api/v1/admin/banners', { title: 'Promo', imageUrl: '/promo.png', sortOrder: 9, isActive: true });
    expect((banner.body.data as { title: string }).title).toBe('Promo');
    expect(db.loginImages.at(-1)?.imagename).toBe('Promo');

    const adv = await post('/api/v1/admin/customer-advisories', { title: 'Storm', message: 'Delay', severity: 'WARNING', effectiveFrom: '2026-10-16', effectiveTo: '2026-10-20', isActive: true });
    expect((adv.body.data as { severity: string }).severity).toBe('WARNING');

    const cfg = (await json('/api/v1/admin/global-config')).body as unknown as { enableLoginCaptcha: boolean; attemptLimit: number };
    expect(typeof cfg.enableLoginCaptcha).toBe('boolean');
    const saved = await json('/api/v1/admin/global-config', { method: 'PUT', body: JSON.stringify({ ...cfg, enableLoginCaptcha: !cfg.enableLoginCaptcha, attemptLimit: 7 }) });
    expect((saved.body.data as { enableLoginCaptcha: boolean; attemptLimit: number })).toMatchObject({ enableLoginCaptcha: !cfg.enableLoginCaptcha, attemptLimit: 7 });

    expect((await post('/api/v1/admin/password-reset', { username: String(db.users[0].loginname) })).body.success).toBe(true);
    expect((await post('/api/v1/admin/password-reset', { username: 'ghost' })).status).toBe(404);
  });
});

describe('user creation', () => {
  it('lists sub-users of the demo customer, creates and toggles them', async () => {
    const before = (await json('/api/v1/user-creation/sub-users')).body.data as { id: string; isActive: boolean }[];
    expect(before.length).toBeGreaterThan(0);
    const limit = (await json('/api/v1/user-creation/limit')).body.data as { limitReached: boolean; currentlyAllocated: number };
    expect(limit.limitReached).toBe(false);
    const created = await post('/api/v1/user-creation/sub-users', {
      loginName: 'new.user@example.com', password: 'secret1', firstName: 'New', lastName: 'User', email: 'new.user@example.com', companyName: 'Acme',
      custCountryCode: '+91', custPhoneCode: '22', custPhoneNo: '12345', mobileCode: '+91', mobileNo: '9', defLanguage: 'en', prefLanguage: 'en', allowedModules: ['BKG'],
    });
    expect(created.status).toBe(200);
    const sub = created.body.data as { id: string; loginName: string };
    expect(sub.loginName).toBe('new.user@example.com');
    expect(((await json('/api/v1/user-creation/sub-users')).body.data as unknown[]).length).toBe(before.length + 1);
    const toggled = await json(`/api/v1/user-creation/sub-users/${sub.id}/status`, { method: 'PATCH', body: JSON.stringify({ active: false }) });
    expect((toggled.body.data as { isActive: boolean }).isActive).toBe(false);
    expect((await json('/api/v1/user-creation/sub-users/ud-0/status', { method: 'PATCH', body: JSON.stringify({ active: true }) })).status).toBe(404);
    const dupe = await post('/api/v1/user-creation/sub-users', { loginName: 'new.user@example.com', password: 'secret1', firstName: 'N', lastName: 'U', email: 'new.user@example.com', companyName: 'Acme', custPhoneNo: '12345', allowedModules: [] });
    expect(dupe.status).toBe(400);
  });
});

describe('registration and hotline', () => {
  it('checks e-mails and customer codes against the fixtures and registers a pending user', async () => {
    const taken = String(db.users[0].loginname);
    expect((await json(`/api/check-email?email=${encodeURIComponent(taken)}`)).body).toEqual({ available: false });
    expect((await json('/api/check-email?email=fresh@example.com')).body).toEqual({ available: true });
    const company = await json(`/api/check-company?code=${DEMO_CUSTOMER_CODE}`);
    expect(company.status).toBe(200);
    expect(company.body.valid).toBe(true);
    expect((await json('/api/check-company?code=NOPE')).status).toBe(404);
    const lookup = (await json('/api/address-lookup?q=')).body.results as unknown[];
    expect(lookup.length).toBeGreaterThan(0);

    // URL-encoded string body: Request.formData() parses it like the multipart form the page sends.
    const form = new URLSearchParams({ email: 'fresh@example.com', companyName: 'Fresh Co', firstName: 'F', lastName: 'C', customerType: 'NEW' }).toString();
    const formInit: RequestInit = { method: 'POST', body: form, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } };
    const count = db.users.length;
    const res = await fetch(`${BASE}/api/registration`, formInit);
    expect(res.status).toBe(200);
    expect(db.users.length).toBe(count + 1);
    expect(db.users.at(-1)).toMatchObject({ loginname: 'fresh@example.com', isValid: 'P' });
    expect(db.ECOMRegHistory.at(-1)?.Email).toBe('fresh@example.com');
    const again = await fetch(`${BASE}/api/registration`, formInit);
    expect(again.status).toBe(400);
  }, 15_000);

  it('groups hotline contacts by country', async () => {
    const { countries } = (await json('/api/hotline-contacts')).body as unknown as { countries: { countryName: string; ports: unknown[] }[] };
    expect(countries.length).toBeGreaterThan(1);
    expect(countries.every(c => c.ports.length > 0)).toBe(true);
  });
});
