// Modified by Sekar Nagarajan (2026-10-16 23:20)
import { http } from 'msw';
import { db, eq, session, type Row } from '../db';
import { API, latency, ok, notFound } from '../utils';

/**
 * Portal content + demo-user lookups backed by the fixtures.
 *
 * Login / session routes (/api/auth/login, /api/auth/me, …) are deliberately NOT served here:
 * the portal's auth flow and its LoginSuccessResponse type are owned by src/mocks/auth.handlers.ts.
 * Use GET /api/auth/demo-users to see which anonymised logins exist in the extracted sample.
 */
export function profileFor(login: string) {
  const user = db.users.find(u => eq(u.loginname, login) || eq(u.User_Email, login));
  if (!user) return null;
  const details = db.userDetails.find(d => eq(d.emailid, user.loginname) || eq(d.emailid, user.User_Email));
  const company = db.customerMaster.find(c => eq(c.CustCode, user.cust_code));
  const menuIds = db.customerMenus.filter(m => eq(m.custid, user.cust_code)).map(m => String(m.menuid));
  return {
    loginName: user.loginname,
    email: user.User_Email,
    title: user.Title,
    firstName: user.First_Name,
    lastName: user.Last_Name,
    phone: user.User_Phone,
    mobile: user.User_Mobile,
    role: details?.userrole ?? user.userrole ?? 'U',
    ccMailId: details?.ccmailid ?? '',
    preferredLanguage: user.prefLang ?? 'en',
    preferredTimezone: details?.preferredTimezone ?? user.preferredTimezone,
    lastLogin: details?.logindate ?? null,
    customer: {
      code: user.cust_code,
      name: company?.CustName ?? user.Comp_Name,
      address1: company?.Address1 ?? user.Address,
      address2: company?.Address2 ?? user.Address2,
      city: company?.city ?? user.City,
      state: company?.statecode ?? user.State,
      zip: company?.ZipCode ?? user.Pin_Code,
      country: company?.countryid ?? user.Country,
      phone: company?.Phone ?? user.Comp_Phone,
      controlLocation: user.control_location,
      agencyCode: user.agencycode,
    },
    menuIds,
  };
}

export const authHandlers = [
  /** Handy for the demo: list the login names that exist in the fixtures. */
  http.get(`${API}/auth/demo-users`, async () => {
    await latency();
    return ok(db.users.slice(0, 20).map(u => ({ loginName: u.loginname, name: `${u.First_Name} ${u.Last_Name}`, company: u.Comp_Name, custCode: u.cust_code })));
  }),

  /** Full profile (user + customer master + menu privileges) for one demo login. */
  http.get(`${API}/auth/demo-users/:login`, async ({ params }) => {
    await latency();
    const profile = profileFor(String(params.login));
    return profile ? ok(profile) : notFound(`No fixture user '${params.login}'`);
  }),

  /** Menu tree: parents (MenuType M) with children (MenuType S). */
  http.get(`${API}/menus`, async () => {
    await latency();
    const parents = db.menus.filter(m => m.MenuType === 'M');
    const tree = parents.map(p => ({
      ...p,
      children: db.menus.filter(c => c.MenuType === 'S' && eq(c.ParentMenu, p.MenuId)),
    }));
    return ok(tree);
  }),

  http.get(`${API}/notifications`, async ({ request }) => {
    await latency();
    const url = new URL(request.url);
    const custCode = url.searchParams.get('custCode');
    // EcomNotificationMaster (message) + EcomNotificationDetails (one row per customer code, or 'All')
    const items = db.notificationMaster
      .filter(n => String(n.status ?? 'A').toUpperCase() === 'A')
      .map((n): Row => ({ ...n, custcodes: db.notificationDetails.filter(d => eq(d.msgid, n.msgid)).map(d => String(d.custcode)) }))
      .filter(n => !custCode || n.custcodes.some(c => eq(c, 'All') || eq(c, custCode)))
      .map(n => ({ ...n, isViewed: session.readNotifications.has(String(n.msgid)) ? 'Y' : 'N' }))
      .slice(0, 20);
    return ok(items);
  }),

  http.post(`${API}/notifications/:msgid/read`, async ({ params }) => {
    await latency();
    session.readNotifications.add(String(params.msgid));
    return ok({ msgid: params.msgid, isViewed: 'Y' });
  }),

  http.get(`${API}/advisories`, async () => { await latency(); return ok(db.advisories); }),
  http.get(`${API}/login-images`, async () => { await latency(); return ok(db.loginImages); }),
  http.get(`${API}/notices`, async ({ request }) => {
    await latency();
    const year = new URL(request.url).searchParams.get('year');
    const items = year ? db.notices.filter(n => String(new Date(n.crdate).getFullYear()) === year) : db.notices;
    return ok(items);
  }),

  http.get(`${API}/messages/:module/:criteria`, async ({ params }) => {
    await latency();
    const m = db.messages.find(r => eq(r.Module, params.module) && eq(r.criteria, params.criteria));
    return m ? ok(m) : notFound('Message not configured');
  }),
];
