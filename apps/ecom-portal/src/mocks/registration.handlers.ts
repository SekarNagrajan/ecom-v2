// Modified by Sekar Nagarajan (2026-10-16 23:35)
import { http, HttpResponse, delay } from 'msw';

import {
  addressSuggestions,
  customerCodeLookup,
  emailAvailable,
  registerUser,
} from './fixture-api/bridges/users.bridge';

/**
 * Registration served from eCom_Reg_Details (db.users): e-mail / customer-code checks look the fixture
 * users up, and a submitted registration is pushed as a pending (isValid P) user + ECOMRegHistory row.
 */
export const registrationHandlers = [
  http.post('/api/registration', async ({ request }) => {
    // Artificial delay to simulate network latency
    await delay(1500);

    try {
      const formData = await request.formData();
      const fields: Record<string, string> = {};
      formData.forEach((value, key) => {
        if (typeof value === 'string') fields[key] = value;
      });

      if (!fields.email || !emailAvailable(fields.email)) {
        return HttpResponse.json(
          { success: false, message: 'This e-mail address is already registered' },
          { status: 400 }
        );
      }

      const user = registerUser(fields);
      return HttpResponse.json({
        success: true,
        message: 'Registration successful',
        userId: String(user.reg_no),
      });
    } catch {
      return HttpResponse.json(
        { success: false, message: 'Internal server error' },
        { status: 500 }
      );
    }
  }),

  // Company typeahead ← distinct registered companies
  http.get('/api/address-lookup', async ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';

    await delay(300);

    return HttpResponse.json({ results: addressSuggestions(query) });
  }),

  // Existing customer code ← users.Cust_Code (else a booking party with that code)
  http.get('/api/check-company', async ({ request }) => {
    const url = new URL(request.url);
    const code = url.searchParams.get('code') ?? '';

    await delay(500);

    const found = customerCodeLookup(code);
    if (found) return HttpResponse.json(found);

    return HttpResponse.json({ valid: false }, { status: 404 });
  }),

  http.get('/api/check-email', async ({ request }) => {
    const url = new URL(request.url);
    const email = url.searchParams.get('email') ?? '';

    await delay(400);

    return HttpResponse.json({ available: emailAvailable(email) });
  }),
];
