// Modified by Sekar Nagarajan (2026-10-17 00:20)
import { delay, http, HttpResponse } from 'msw';

import { fixtureCountries, fixtureStates } from './fixture-api/bridges/lookups.bridge';

export const contactUsHandlers = [
  /**
   * POST /api/contact-us
   * Mirrors legacy Contactus.do Struts action.
   * Returns success with the agency confirmation message.
   */
  http.post('/api/contact-us', async ({ request }) => {
    await delay(1000);

    try {
      const body = (await request.json()) as Record<string, unknown>;

      // Simulate validation failure if subject is empty
      if (!body.subject) {
        return HttpResponse.json(
          { success: false, message: 'Subject is required' },
          { status: 400 }
        );
      }

      // Simulate agency mail not configured
      if (body.subject === 'ErrorTest') {
        return HttpResponse.json(
          { success: false, message: 'Agency mailid not exists.' },
          { status: 500 }
        );
      }

      return HttpResponse.json({
        success: true,
        message:
          'Thank you for contacting Solverminds. We have received your request and will be processed with the concerned department immediately. You will be contacted by one of our executives shortly.',
      });
    } catch {
      return HttpResponse.json(
        { success: false, message: 'Internal server error' },
        { status: 500 }
      );
    }
  }),

  /**
   * GET /api/countries
   * Country list for the contact us form dropdown — countries master (countrycode / countryname).
   */
  http.get('/api/countries', async () => {
    await delay(300);
    return HttpResponse.json({ countries: fixtureCountries() });
  }),

  /**
   * GET /api/states?country=XX
   * States of the selected country — states master (statecode / statedesc / countrycode).
   */
  http.get('/api/states', async ({ request }) => {
    await delay(200);
    const url = new URL(request.url);
    const country = url.searchParams.get('country');
    return HttpResponse.json({ states: country ? fixtureStates(country) : [] });
  }),
];
