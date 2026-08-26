// Modified by Sekar Nagarajan (2026-08-25 12:10)
import { delay, http, HttpResponse } from 'msw';

import type { CRODTO, CROListDTO } from '../features/container-release-order/types/cro.types';
import {
  cloneCROListSeed,
  getMockCRODetail,
  getMockCROEligibilityByBooking,
  mockCRODetailsSeed,
  mockCROListSeed,
} from './cro.mock-data';

let mockCROList: CROListDTO[] = cloneCROListSeed();
const mockCRODetails: Record<string, CRODTO> = { ...mockCRODetailsSeed };

function syncDetailToList(croNo: string, detail: CRODTO) {
  mockCRODetails[croNo] = detail;
  const idx = mockCROList.findIndex((r) => r.croNo === croNo);
  if (idx === -1) return;
  mockCROList[idx] = {
    ...mockCROList[idx],
    printStatus: detail.printStatus,
    releaseStatus: detail.releaseStatus,
    qtyReleased: detail.qtyReleased,
  };
}

function filterByCroDate(rows: CROListDTO[], fromDate?: string | null, toDate?: string | null) {
  return rows.filter((row) => {
    const croDay = row.croDate.slice(0, 10);
    if (fromDate && croDay < fromDate) return false;
    if (toDate && croDay > toDate) return false;
    return true;
  });
}

/** Apply print side-effect used by document handler (testable without browser MSW). */
export function markCROPrinted(croNo: string): boolean {
  const idx = mockCROList.findIndex((r) => r.croNo === croNo);
  if (idx === -1) return false;
  mockCROList[idx] = { ...mockCROList[idx], printStatus: 'Y' };
  const detail = getMockCRODetail(croNo);
  if (detail) {
    syncDetailToList(croNo, {
      ...detail,
      printStatus: 'Y',
      printCount: Math.max(1, detail.printCount + 1),
    });
  }
  return true;
}

export function getCROListSnapshot(): CROListDTO[] {
  return mockCROList.map((row) => ({ ...row }));
}

function mockPdf(croNo: string) {
  const content = `%PDF-1.4 Mock Container Release Order for ${croNo}`;
  return new HttpResponse(new Blob([content], { type: 'application/pdf' }), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${croNo}.pdf"`,
    },
  });
}

/**
 * Specific paths before `/:croNo` so list / eligibility / document
 * are never swallowed by the parametric detail route.
 */
export const croHandlers = [
  http.get('*/api/ecom/imp/container-release-orders', async ({ request }) => {
    await delay(250);
    const url = new URL(request.url);
    const fromDate = url.searchParams.get('fromDate');
    const toDate = url.searchParams.get('toDate');
    const data = filterByCroDate(mockCROList, fromDate, toDate);
    return HttpResponse.json({ data });
  }),

  http.get('*/api/ecom/imp/container-release-orders/eligibility', async ({ request }) => {
    await delay(150);
    const url = new URL(request.url);
    const bookingNo = url.searchParams.get('bookingNo') ?? '';
    return HttpResponse.json({ data: getMockCROEligibilityByBooking(bookingNo) });
  }),

  http.get(
    '*/api/ecom/imp/container-release-orders/:croNo/document',
    async ({ params }) => {
      await delay(400);
      const croNo = params.croNo as string;
      if (!markCROPrinted(croNo)) {
        return HttpResponse.json(
          { error: { code: 'NOT_FOUND', message: 'CRO not found' } },
          { status: 404 }
        );
      }
      return mockPdf(croNo);
    }
  ),

  http.get('*/api/ecom/imp/container-release-orders/:croNo', async ({ params }) => {
    await delay(200);
    const croNo = params.croNo as string;
    const live = mockCRODetails[croNo] ?? getMockCRODetail(croNo);
    if (!live) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'CRO not found' } },
        { status: 404 }
      );
    }
    const listRow = mockCROList.find((r) => r.croNo === croNo);
    const data: CRODTO = {
      ...live,
      printStatus: listRow?.printStatus ?? live.printStatus,
      printCount:
        listRow?.printStatus === 'Y'
          ? Math.max(1, live.printCount)
          : live.printCount,
    };
    return HttpResponse.json({ data });
  }),

  // P2 stubs — handlers exist; UI CTA stays disabled
  http.post('*/api/ecom/imp/container-release-orders', async () => {
    return HttpResponse.json(
      { error: { code: 'NOT_IMPLEMENTED', message: 'CRO generate is planned for P2' } },
      { status: 501 }
    );
  }),

  http.post('*/api/ecom/imp/container-release-orders/:croNo/haulier', async () => {
    return HttpResponse.json(
      { error: { code: 'NOT_IMPLEMENTED', message: 'Haulier assignment is planned for P2' } },
      { status: 501 }
    );
  }),

  http.post('*/api/ecom/imp/container-release-orders/:croNo/cancel', async () => {
    return HttpResponse.json(
      { error: { code: 'NOT_IMPLEMENTED', message: 'CRO cancel is planned for P2' } },
      { status: 501 }
    );
  }),
];

/** Reset store for tests */
export function resetCROMockStore() {
  mockCROList = cloneCROListSeed();
  Object.keys(mockCRODetails).forEach((k) => delete mockCRODetails[k]);
  Object.assign(mockCRODetails, mockCRODetailsSeed);
  // Ensure seed reference stays fresh from mockCROListSeed holds
  void mockCROListSeed;
}
