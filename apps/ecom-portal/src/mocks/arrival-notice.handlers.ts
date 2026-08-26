// Modified by Sekar Nagarajan (2026-08-25 12:20)
import { delay, http, HttpResponse } from 'msw';

import type {
  ArrivalNoticeDTO,
  ArrivalNoticeListDTO,
} from '../features/arrival-notice/types/arrival-notice.types';
import {
  cloneArrivalNoticeListSeed,
  getMockArrivalNoticeDetail,
  mockArrivalNoticeDetailsSeed,
  mockArrivalNoticeListSeed,
} from './arrival-notice.mock-data';

let mockArrivalNoticeList: ArrivalNoticeListDTO[] = cloneArrivalNoticeListSeed();
const mockArrivalNoticeDetails: Record<string, ArrivalNoticeDTO> = {
  ...mockArrivalNoticeDetailsSeed,
};

function syncDetailToList(anNo: string, detail: ArrivalNoticeDTO) {
  mockArrivalNoticeDetails[anNo] = detail;
  const idx = mockArrivalNoticeList.findIndex((r) => r.anNo === anNo);
  if (idx === -1) return;
  mockArrivalNoticeList[idx] = {
    ...mockArrivalNoticeList[idx],
    printStatus: detail.printStatus,
    chargesDue: detail.chargesDue,
    lastFreeDay: detail.lastFreeDay,
  };
}

function filterByArrivalDate(
  rows: ArrivalNoticeListDTO[],
  fromDate?: string | null,
  toDate?: string | null
) {
  return rows.filter((row) => {
    const day = (row.arrivalDate || row.etaDate).slice(0, 10);
    if (fromDate && day < fromDate) return false;
    if (toDate && day > toDate) return false;
    return true;
  });
}

/** Apply print side-effect used by document handler (testable without browser MSW). */
export function markArrivalNoticePrinted(anNo: string): boolean {
  const idx = mockArrivalNoticeList.findIndex((r) => r.anNo === anNo);
  if (idx === -1) return false;
  mockArrivalNoticeList[idx] = { ...mockArrivalNoticeList[idx], printStatus: 'Y' };
  const detail = getMockArrivalNoticeDetail(anNo);
  if (detail) {
    syncDetailToList(anNo, {
      ...detail,
      printStatus: 'Y',
    });
  }
  return true;
}

export function getArrivalNoticeListSnapshot(): ArrivalNoticeListDTO[] {
  return mockArrivalNoticeList.map((row) => ({ ...row }));
}

function mockPdf(anNo: string) {
  const content = `%PDF-1.4 Mock Arrival Notice Document for ${anNo}`;
  return new HttpResponse(new Blob([content], { type: 'application/pdf' }), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${anNo}.pdf"`,
    },
  });
}

/**
 * Specific paths before `/:anNo` so list / document
 * are never swallowed by the parametric detail route.
 */
export const arrivalNoticeHandlers = [
  http.get('*/api/ecom/imp/arrival-notices', async ({ request }) => {
    await delay(250);
    const url = new URL(request.url);
    const fromDate = url.searchParams.get('fromDate');
    const toDate = url.searchParams.get('toDate');
    const data = filterByArrivalDate(mockArrivalNoticeList, fromDate, toDate);
    return HttpResponse.json({ data });
  }),

  http.get('*/api/ecom/imp/arrival-notices/:anNo/document', async ({ params }) => {
    await delay(400);
    const anNo = params.anNo as string;
    if (!markArrivalNoticePrinted(anNo)) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Arrival notice not found' } },
        { status: 404 }
      );
    }
    return mockPdf(anNo);
  }),

  http.get('*/api/ecom/imp/arrival-notices/:anNo', async ({ params }) => {
    await delay(200);
    const anNo = params.anNo as string;
    const live = mockArrivalNoticeDetails[anNo] ?? getMockArrivalNoticeDetail(anNo);
    if (!live) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Arrival notice not found' } },
        { status: 404 }
      );
    }
    const listRow = mockArrivalNoticeList.find((r) => r.anNo === anNo);
    const data: ArrivalNoticeDTO = {
      ...live,
      printStatus: listRow?.printStatus ?? live.printStatus,
    };
    return HttpResponse.json({ data });
  }),
];

/** Reset store for tests */
export function resetArrivalNoticeMockStore() {
  mockArrivalNoticeList = cloneArrivalNoticeListSeed();
  Object.keys(mockArrivalNoticeDetails).forEach((k) => delete mockArrivalNoticeDetails[k]);
  Object.assign(mockArrivalNoticeDetails, mockArrivalNoticeDetailsSeed);
  void mockArrivalNoticeListSeed;
}
