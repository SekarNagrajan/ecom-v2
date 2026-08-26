// Modified by Sekar Nagarajan (2026-08-25 13:00)
import { delay, http, HttpResponse } from 'msw';

import { carbonInputSchema } from '../features/carbon-calculator/types/carbon.types';
import {
  computeMockCarbon,
  mockCarbonLookups,
} from './carbon.mock-data';

export const carbonHandlers = [
  http.get('*/api/ecom/co2/lookups', async () => {
    await delay(150);
    return HttpResponse.json({ data: mockCarbonLookups });
  }),

  http.post('*/api/ecom/co2/document', async ({ request }) => {
    await delay(400);
    const url = new URL(request.url);
    const format = url.searchParams.get('format') ?? 'pdf';
    if (format !== 'pdf') {
      return HttpResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Only PDF export is supported.',
          },
        },
        { status: 400 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return HttpResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request body must be JSON.',
          },
        },
        { status: 400 }
      );
    }

    const parsed = carbonInputSchema.safeParse(body);
    if (!parsed.success) {
      return HttpResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.issues[0]?.message ?? 'Invalid carbon input',
          },
        },
        { status: 400 }
      );
    }

    const result = computeMockCarbon(parsed.data);
    const filename = `CarbonEstimate_${parsed.data.origin}-${parsed.data.destination}.pdf`;
    const content = `%PDF-1.4 Mock Carbon Estimate ${parsed.data.origin}-${parsed.data.destination} total=${result.totalCo2eKg}kg GLEC ${result.methodology.version}`;
    return new HttpResponse(new Blob([content], { type: 'application/pdf' }), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  }),

  http.post('*/api/ecom/co2/compute', async ({ request }) => {
    await delay(350);
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return HttpResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request body must be JSON.',
          },
        },
        { status: 400 }
      );
    }

    const parsed = carbonInputSchema.safeParse(body);
    if (!parsed.success) {
      return HttpResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.issues[0]?.message ?? 'Invalid carbon input',
          },
        },
        { status: 400 }
      );
    }

    const data = computeMockCarbon(parsed.data);
    return HttpResponse.json({ data });
  }),
];
