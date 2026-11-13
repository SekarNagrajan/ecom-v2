// Modified by Sekar Nagarajan (2026-10-16 23:35)
import type { UserProfile } from '@solverminds/auth';
import { http, HttpResponse } from 'msw';
import type { LoginEntryType } from '../features/auth/types/auth.types';
import { bearerToken, bearerUser, registerMockToken, resolveMockToken } from './auth-token-registry';
import { menuCategories } from './fixture-api/bridges/menus.bridge';
import {
  adminToken,
  buildAdminProfile,
  buildImpersonatedUser,
  customerAccounts,
  defaultAdminAccount,
  findAdminAccount,
} from './fixture-api/bridges/users.bridge';

/**
 * Admin / vendor / impersonation auth served from ecom_adminuser_details + EcomAdminUser (any password).
 * The entry point (cpanel | eadmin | admin) decides the role, as the legacy LoginAction did.
 */

/** Token → the admin profile before impersonation, so exit-impersonation can restore it. */
const adminBaseByToken = new Map<string, UserProfile>();

function adminFor(request: Request, entryType: LoginEntryType, userType: 'A' | 'C'): { token: string; user: UserProfile } | null {
  const token = bearerToken(request);
  const current = resolveMockToken(token);
  if (token && current) return { token, user: adminBaseByToken.get(token) ?? current };
  const account = defaultAdminAccount(userType);
  if (!account) return null;
  const fallbackToken = adminToken(entryType, account);
  const user = buildAdminProfile(account, entryType);
  registerMockToken(fallbackToken, user);
  return { token: fallbackToken, user };
}

export const authAdminHandlers = [
  // POST /api/auth/admin-login
  http.post('/api/auth/admin-login', async ({ request }) => {
    const body = (await request.json()) as { userId: string; password: string; entryType: string };
    const entryType = body.entryType as LoginEntryType;
    if (!['cpanel', 'eadmin', 'admin'].includes(entryType)) {
      return HttpResponse.json({ message: 'Unknown entry type' }, { status: 400 });
    }

    const account = body.password ? findAdminAccount(body.userId) : null;
    if (!account) {
      return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const token = adminToken(entryType, account);
    const user = buildAdminProfile(account, entryType);
    registerMockToken(token, user);
    adminBaseByToken.set(token, user);
    return HttpResponse.json({
      data: entryType === 'admin' ? { token, user, customerList: customerAccounts() } : { token, user },
    });
  }),

  // GET /api/auth/me — session rehydration for every mock token (customer, admin, vendor, impersonation)
  http.get('/api/auth/me', ({ request }) => {
    if (!bearerToken(request)) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const user = bearerUser(request);
    if (user) return HttpResponse.json({ data: { user } });
    return HttpResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
  }),

  // GET /api/admin/customers — customer list for the impersonation picker ← eCom_Reg_Details / ecomuserdetails codes
  http.get('/api/admin/customers', () => HttpResponse.json({ data: customerAccounts() })),

  // POST /api/auth/impersonate — switch the admin session to a customer context
  http.post('/api/auth/impersonate', async ({ request }) => {
    const body = (await request.json()) as { custCode: string };
    const admin = adminFor(request, 'admin', 'C');
    if (!admin) return HttpResponse.json({ message: 'No admin account in fixtures' }, { status: 404 });
    const user = buildImpersonatedUser(admin.user, body.custCode);
    adminBaseByToken.set(admin.token, admin.user);
    registerMockToken(admin.token, user);
    return HttpResponse.json({ data: { user } });
  }),

  // POST /api/auth/exit-impersonation — return to the admin context
  http.post('/api/auth/exit-impersonation', ({ request }) => {
    const admin = adminFor(request, 'cpanel', 'A');
    if (!admin) return HttpResponse.json({ message: 'No admin account in fixtures' }, { status: 404 });
    registerMockToken(admin.token, admin.user);
    return HttpResponse.json({ data: { user: admin.user } });
  }),

  // GET /api/config/menu-access — capability → D | P from MenuRegistration.Category
  http.get('/api/config/menu-access', () => HttpResponse.json({ data: menuCategories() })),
];
