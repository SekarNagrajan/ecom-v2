// Modified by Sekar Nagarajan (2026-08-27 12:20)
import { http, HttpResponse } from 'msw';
import {
  buildImpersonatedUser,
  MOCK_CUSTOMER_LIST,
  MOCK_IMPERSONATION_ADMIN,
  MOCK_MENU_CATEGORIES,
  MOCK_SYSTEM_ADMIN,
  MOCK_TOKEN_USER_MAP,
  MOCK_VENDOR_ADMIN,
  registerMockToken,
} from './auth-admin.mock-data';

export const authAdminHandlers = [
  // POST /api/auth/admin-login
  http.post('/api/auth/admin-login', async ({ request }) => {
    const body = (await request.json()) as {
      userId: string;
      password: string;
      entryType: string;
    };
    const u = body.userId.toLowerCase().trim();

    if (u === 'invalid' || body.password === '') {
      return HttpResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 },
      );
    }

    if (body.entryType === 'cpanel') {
      return HttpResponse.json({ data: MOCK_SYSTEM_ADMIN });
    }

    if (body.entryType === 'eadmin') {
      return HttpResponse.json({ data: MOCK_VENDOR_ADMIN });
    }

    if (body.entryType === 'admin') {
      return HttpResponse.json({ data: MOCK_IMPERSONATION_ADMIN });
    }

    return HttpResponse.json(
      { message: 'Unknown entry type' },
      { status: 400 },
    );
  }),

  // GET /api/auth/me — session rehydration for admin/vendor/impersonation tokens
  // Customer tokens (mock-jwt-tenant-*, mock-jwt-superuser-*) are handled by
  // the landing.handlers.ts /api/auth/me handler if one exists; otherwise
  // MSW will fall through to the next matching handler.
  http.get('/api/auth/me', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return HttpResponse.json(
        { message: 'Unauthorized' },
        { status: 401 },
      );
    }

    const user = MOCK_TOKEN_USER_MAP[token];
    if (user) {
      return HttpResponse.json({ data: { user } });
    }

    return HttpResponse.json(
      { message: 'Invalid or expired token' },
      { status: 401 },
    );
  }),

  // GET /api/admin/customers — customer list for impersonation picker
  http.get('/api/admin/customers', () => {
    return HttpResponse.json({ data: MOCK_CUSTOMER_LIST });
  }),

  // POST /api/auth/impersonate — switch to customer context
  http.post('/api/auth/impersonate', async ({ request }) => {
    const body = (await request.json()) as { custCode: string };
    const user = buildImpersonatedUser(body.custCode);
    return HttpResponse.json({ data: { user } });
  }),

  // POST /api/auth/exit-impersonation — return to admin context
  http.post('/api/auth/exit-impersonation', () => {
    return HttpResponse.json({
      data: { user: MOCK_SYSTEM_ADMIN.user },
    });
  }),

  // GET /api/config/menu-access — full menu category map
  http.get('/api/config/menu-access', () => {
    return HttpResponse.json({ data: MOCK_MENU_CATEGORIES });
  }),
];
