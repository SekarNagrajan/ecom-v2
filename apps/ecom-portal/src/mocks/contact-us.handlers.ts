// Modified by Antigravity (2026-08-21)
import { http, HttpResponse, delay } from 'msw';

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
   * Mock country list for the contact us form dropdown.
   */
  http.get('/api/countries', async () => {
    await delay(300);
    return HttpResponse.json({
      countries: [
        { code: 'SG', name: 'Singapore' },
        { code: 'IN', name: 'India' },
        { code: 'US', name: 'United States' },
        { code: 'GB', name: 'United Kingdom' },
        { code: 'AE', name: 'United Arab Emirates' },
        { code: 'MY', name: 'Malaysia' },
        { code: 'CN', name: 'China' },
        { code: 'DE', name: 'Germany' },
        { code: 'JP', name: 'Japan' },
        { code: 'AU', name: 'Australia' },
      ],
    });
  }),

  /**
   * GET /api/states?country=XX
   * Mock state list based on country.
   */
  http.get('/api/states', async ({ request }) => {
    await delay(200);
    const url = new URL(request.url);
    const country = url.searchParams.get('country');

    const stateMap: Record<string, Array<{ code: string; name: string }>> = {
      IN: [
        { code: 'TN', name: 'Tamil Nadu' },
        { code: 'KA', name: 'Karnataka' },
        { code: 'MH', name: 'Maharashtra' },
        { code: 'DL', name: 'Delhi' },
        { code: 'KL', name: 'Kerala' },
      ],
      US: [
        { code: 'CA', name: 'California' },
        { code: 'NY', name: 'New York' },
        { code: 'TX', name: 'Texas' },
        { code: 'FL', name: 'Florida' },
        { code: 'WA', name: 'Washington' },
      ],
    };

    return HttpResponse.json({
      states: country ? stateMap[country] || [] : [],
    });
  }),
];
