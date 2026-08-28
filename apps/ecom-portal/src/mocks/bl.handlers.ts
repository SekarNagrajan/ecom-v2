// Modified by Sekar Nagarajan (2026-08-25 11:50)
import { delay, http, HttpResponse } from 'msw';

import type { BLDTO, BLListDTO, BLPrintType } from '../features/bill-of-lading/types/bl.types';
import { BL_STATUS_LABELS } from '../features/bill-of-lading/types/bl.types';
import {
  getMockBLDetail,
  mockBLChargesSeed,
  mockBLConfig,
  mockBLDetailsSeed,
  mockBLInsuranceSeed,
  mockBLListSeed,
  mockMCNDetailsSeed,
  mockMCNListSeed,
  REPRINT_BLOCKED_BL_NOS,
  VOYAGE_CLOSED_BL_NOS,
} from './bl.mock-data';

function cloneList(): BLListDTO[] {
  return mockBLListSeed.map((row) => ({ ...row }));
}

let mockBLList = cloneList();
const mockBLDetails: Record<string, BLDTO> = { ...mockBLDetailsSeed };

function syncDetailToList(blNo: string, detail: BLDTO) {
  mockBLDetails[blNo] = detail;
  const idx = mockBLList.findIndex((r) => r.blNo === blNo);
  if (idx === -1) return;
  mockBLList[idx] = {
    ...mockBLList[idx],
    status: detail.status,
    statusLabel: BL_STATUS_LABELS[detail.status],
    printStatus: detail.printCount > 0 ? 'Y' : mockBLList[idx].printStatus,
    confirmedDate: detail.issuedAt ?? mockBLList[idx].confirmedDate,
  };
}

function paginateList(rows: BLListDTO[], startRow: number, endRow: number) {
  const slice = rows.slice(startRow, endRow);
  return { data: slice, meta: { totalCount: rows.length } };
}

function mockPdf(blNo: string, type: BLPrintType) {
  const content = `%PDF-1.4 Mock Bill of Lading (${type}) for ${blNo}`;
  return new HttpResponse(new Blob([content], { type: 'application/pdf' }), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${blNo}-${type}.pdf"`,
    },
  });
}

/**
 * Specific paths before `/api/bl/:blNo` so list / guards / from-si
 * are never swallowed by the parametric detail route.
 */
export const blHandlers = [
  http.get('*/api/bl/config', async () => {
    await delay(100);
    return HttpResponse.json({ data: mockBLConfig });
  }),

  http.get('*/api/bl/list', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const startRow = Number(url.searchParams.get('startRow') ?? 0);
    const endRow = Number(url.searchParams.get('endRow') ?? mockBLList.length);
    return HttpResponse.json(paginateList(mockBLList, startRow, endRow));
  }),

  http.get('*/api/bl/guards/voyage-closed', async ({ request }) => {
    const url = new URL(request.url);
    const blNo = url.searchParams.get('blNo') ?? '';
    return HttpResponse.json({ data: { closed: VOYAGE_CLOSED_BL_NOS.has(blNo) } });
  }),

  http.get('*/api/bl/from-si/:siNo', async ({ params }) => {
    await delay(200);
    const siNo = params.siNo as string;
    const row = mockBLList.find((r) => r.siNo === siNo);
    const detail = row
      ? getMockBLDetail(row.blNo)
      : getMockBLDetail('BL-998824');
    if (!detail) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'SI not found' } },
        { status: 404 }
      );
    }
    return HttpResponse.json({ data: { ...detail, siNo, status: 'D' } });
  }),

  http.post('*/api/bl/print/batch', async ({ request }) => {
    await delay(600);
    const body = (await request.json()) as { blNos?: string[] };
    const blNos = body.blNos ?? [];
    blNos.forEach((blNo) => {
      const idx = mockBLList.findIndex((r) => r.blNo === blNo);
      if (idx !== -1) {
        mockBLList[idx] = { ...mockBLList[idx], printStatus: 'Y' };
      }
    });
    const content = `%PDF-1.4 Mock Batch B/L Print for ${blNos.join(', ')}`;
    return new HttpResponse(new Blob([content], { type: 'application/pdf' }), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="bl-batch-print.pdf"',
      },
    });
  }),

  http.get('*/api/bl/:blNo/print', async ({ params, request }) => {
    await delay(500);
    const blNo = params.blNo as string;
    const url = new URL(request.url);
    const type = (url.searchParams.get('type') ?? 'draft') as BLPrintType;

    if (type === 'original' && REPRINT_BLOCKED_BL_NOS.has(blNo)) {
      return HttpResponse.json(
        { error: { code: 'REPRINT_BLOCKED', message: 'Original B/L already issued and cannot be reprinted' } },
        { status: 403 }
      );
    }

    const idx = mockBLList.findIndex((r) => r.blNo === blNo);
    if (idx !== -1 && (type === 'original' || type === 'nn')) {
      mockBLList[idx] = { ...mockBLList[idx], printStatus: 'Y' };
      const detail = mockBLDetails[blNo] ?? getMockBLDetail(blNo);
      if (detail) {
        detail.printCount += 1;
        if (type === 'original') detail.status = 'I';
        syncDetailToList(blNo, detail);
      }
    }

    return mockPdf(blNo, type);
  }),

  http.get('*/api/bl/:blNo/charges', async ({ params }) => {
    await delay(200);
    const blNo = params.blNo as string;
    const charges = mockBLChargesSeed[blNo] ?? { blNo, lines: [], totals: [] };
    return HttpResponse.json({ data: charges });
  }),

  http.get('*/api/bl/:blNo/insurance', async ({ params }) => {
    await delay(150);
    const blNo = params.blNo as string;
    const insurance = mockBLInsuranceSeed[blNo];
    if (!insurance) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'No insurance policy' } },
        { status: 404 },
      );
    }
    return HttpResponse.json({ data: insurance });
  }),

  http.post('*/api/bl/payment/intent', async ({ request }) => {
    await delay(300);
    const body = (await request.json()) as { blNos?: string[]; amountUsd?: number };
    const blNos = body.blNos ?? [];
    const amountUsd = body.amountUsd ?? 0;
    return HttpResponse.json({
      data: {
        clientSecret: `mock_secret_${blNos.join('_')}`,
        amountUsd,
        blNos,
      },
    });
  }),

  http.post('*/api/bl/:blNo/cargo/import', async ({ params, request }) => {
    await delay(400);
    const blNo = params.blNo as string;
    const detail = mockBLDetails[blNo] ?? getMockBLDetail(blNo);
    if (!detail) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'B/L not found' } },
        { status: 404 },
      );
    }
    const formData = await request.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) {
      return HttpResponse.json(
        { error: { code: 'INVALID_FILE', message: 'No file uploaded' } },
        { status: 400 },
      );
    }
    if (!/\.xls(x)?$/i.test(file.name)) {
      return HttpResponse.json(
        { error: { code: 'INVALID_FILE', message: 'Only .xls/.xlsx files are supported' } },
        { status: 400 },
      );
    }
    return HttpResponse.json({ data: { containers: detail.containers } });
  }),

  http.get('*/api/bl/:blNo/cargo/export', async ({ params, request }) => {
    await delay(200);
    const blNo = params.blNo as string;
    const url = new URL(request.url);
    const template = url.searchParams.get('template') ?? 'standard';
    const content = `Mock Excel cargo template (${template}) for ${blNo}`;
    return new HttpResponse(new Blob([content], { type: 'application/vnd.ms-excel' }), {
      headers: {
        'Content-Type': 'application/vnd.ms-excel',
        'Content-Disposition': `attachment; filename="${blNo}-cargo-${template}.xls"`,
      },
    });
  }),

  http.post('*/api/bl/:blNo/amendment-mail', async ({ params }) => {
    await delay(250);
    const blNo = params.blNo as string;
    return HttpResponse.json({ data: { sent: true, blNo } });
  }),

  http.post('*/api/bl/:blNo/draft', async ({ params, request }) => {
    await delay(150);
    const blNo = params.blNo as string;
    const body = (await request.json()) as Partial<BLDTO>;
    const existing = mockBLDetails[blNo] ?? getMockBLDetail(blNo);
    if (!existing) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'B/L not found' } },
        { status: 404 }
      );
    }
    const updated = { ...existing, ...body };
    syncDetailToList(blNo, updated);
    return HttpResponse.json({ data: updated });
  }),

  http.post('*/api/bl/:blNo/verify', async ({ params }) => {
    await delay(400);
    const blNo = params.blNo as string;
    const detail = mockBLDetails[blNo] ?? getMockBLDetail(blNo);
    if (!detail) {
      return HttpResponse.json({ error: { code: 'NOT_FOUND', message: 'Not found' } }, { status: 404 });
    }
    detail.status = 'C';
    syncDetailToList(blNo, detail);
    const listIdx = mockBLList.findIndex((r) => r.blNo === blNo);
    if (listIdx !== -1) {
      mockBLList[listIdx].confirmedDate = new Date().toISOString();
    }
    return HttpResponse.json({ data: detail });
  }),

  http.post('*/api/bl/:blNo/cancel', async ({ params }) => {
    await delay(300);
    const blNo = params.blNo as string;
    const detail = mockBLDetails[blNo] ?? getMockBLDetail(blNo);
    if (!detail) {
      return HttpResponse.json({ error: { code: 'NOT_FOUND', message: 'Not found' } }, { status: 404 });
    }
    detail.status = 'D';
    syncDetailToList(blNo, detail);
    return HttpResponse.json({ data: detail });
  }),

  http.post('*/api/bl/:blNo/submit', async ({ params }) => {
    await delay(400);
    const blNo = params.blNo as string;
    const detail = mockBLDetails[blNo] ?? getMockBLDetail(blNo);
    if (!detail) {
      return HttpResponse.json({ error: { code: 'NOT_FOUND', message: 'Not found' } }, { status: 404 });
    }
    detail.status = 'S';
    detail.submitResult = {
      success: true,
      messages: ['B/L submitted successfully.'],
      insuranceMessage: detail.insurance?.isInsuranceRequired
        ? 'Insurance policy will be issued within 24 hours.'
        : undefined,
      fileRestrictionMessage: undefined,
    };
    syncDetailToList(blNo, detail);
    return HttpResponse.json({ data: detail });
  }),

  http.post('*/api/bl/:blNo/issue', async ({ params }) => {
    await delay(400);
    const blNo = params.blNo as string;
    const detail = mockBLDetails[blNo] ?? getMockBLDetail(blNo);
    if (!detail) {
      return HttpResponse.json({ error: { code: 'NOT_FOUND', message: 'Not found' } }, { status: 404 });
    }
    detail.status = 'I';
    detail.issuedAt = new Date().toISOString();
    detail.printCount += 1;
    syncDetailToList(blNo, detail);
    return HttpResponse.json({ data: detail });
  }),

  http.put('*/api/bl/:blNo', async ({ params, request }) => {
    await delay(300);
    const blNo = params.blNo as string;
    const body = (await request.json()) as BLDTO;
    const existing = mockBLDetails[blNo] ?? getMockBLDetail(blNo);
    if (!existing) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'B/L not found' } },
        { status: 404 }
      );
    }
    const updated = { ...existing, ...body, blNo };
    syncDetailToList(blNo, updated);
    return HttpResponse.json({ data: updated });
  }),

  http.get('*/api/bl/:blNo', async ({ params }) => {
    await delay(200);
    const blNo = params.blNo as string;
    const detail = mockBLDetails[blNo] ?? getMockBLDetail(blNo);
    if (!detail) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: `B/L ${blNo} not found` } },
        { status: 404 }
      );
    }
    if (!mockBLDetails[blNo]) mockBLDetails[blNo] = detail;
    return HttpResponse.json({ data: structuredClone(detail) });
  }),

  http.get('*/api/mcn/list', async () => {
    await delay(200);
    return HttpResponse.json({ data: mockMCNListSeed });
  }),

  http.get('*/api/mcn/:mcnId/print', async ({ params, request }) => {
    await delay(400);
    const mcnId = params.mcnId as string;
    const url = new URL(request.url);
    const manifestType = url.searchParams.get('manifestType') ?? 'full';
    const content = `%PDF-1.4 Mock Manifest ${manifestType} for ${mcnId}`;
    return new HttpResponse(new Blob([content], { type: 'application/pdf' }), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${mcnId}-manifest.pdf"`,
      },
    });
  }),

  http.get('*/api/mcn/:mcnId', async ({ params }) => {
    await delay(200);
    const mcnId = params.mcnId as string;
    const detail = mockMCNDetailsSeed[mcnId];
    if (!detail) {
      return HttpResponse.json({ error: { code: 'NOT_FOUND', message: 'MCN not found' } }, { status: 404 });
    }
    return HttpResponse.json({ data: detail });
  }),

  http.put('*/api/mcn/:mcnId', async ({ params, request }) => {
    await delay(250);
    const mcnId = params.mcnId as string;
    const body = (await request.json()) as Partial<typeof mockMCNDetailsSeed[string]>;
    const existing = mockMCNDetailsSeed[mcnId];
    if (!existing) {
      return HttpResponse.json({ error: { code: 'NOT_FOUND', message: 'MCN not found' } }, { status: 404 });
    }
    mockMCNDetailsSeed[mcnId] = { ...existing, ...body, mcnId };
    return HttpResponse.json({ data: mockMCNDetailsSeed[mcnId] });
  }),

  http.post('*/api/mcn/:mcnId/submit', async ({ params }) => {
    await delay(300);
    const mcnId = params.mcnId as string;
    const existing = mockMCNDetailsSeed[mcnId];
    if (!existing) {
      return HttpResponse.json({ error: { code: 'NOT_FOUND', message: 'MCN not found' } }, { status: 404 });
    }
    mockMCNDetailsSeed[mcnId] = { ...existing, status: 'Submitted' };
    return HttpResponse.json({ data: mockMCNDetailsSeed[mcnId] });
  }),
];

/** Reset store for tests */
export function resetBLMockStore() {
  mockBLList = cloneList();
  Object.keys(mockBLDetails).forEach((k) => delete mockBLDetails[k]);
  Object.assign(mockBLDetails, mockBLDetailsSeed);
}
