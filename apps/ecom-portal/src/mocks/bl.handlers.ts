// Modified by Sekar Nagarajan (2026-10-16 23:20)
/**
 * B/L and MCN endpoints served from the extracted ecomSI fixtures. Reads are derived by the
 * bridges (src/mocks/fixture-api/bridges/bl-*.bridge.ts); writes mutate the fixture rows: the first
 * edit of a plain SI's B/L clones it into an amendment version (editbl ≥ 1) exactly like the legacy
 * "Edit B/L", later edits update that version.
 */
import { delay, http, HttpResponse } from 'msw';

import { DEFAULT_BL_WIZARD_CONFIG } from '../features/bill-of-lading/config/bl-wizard-config';
import type { BLDTO, BLPrintType, BLRowStatus, MCNDTO } from '../features/bill-of-lading/types/bl.types';
import {
  fixtureBlCharges,
  fixtureBlDetail,
  fixtureBlFromSi,
  fixtureBlInsurance,
  fixtureMcnDetail,
  fixtureMcnList,
  fixtureVoyageClosed,
  findMcnRow,
} from './fixture-api/bridges/bl-detail.bridge';
import { fixtureBlList, mcnIdOf } from './fixture-api/bridges/bl-list.bridge';
import { findBlRow, isAmendment, str } from './fixture-api/bridges/si-common.bridge';
import { applySiBody, cloneSiAsAmendment, type WizardBody } from './fixture-api/bridges/si-write.bridge';
import { db, eq, nowIso, resetDb, type Row } from './fixture-api/db';
import { ensureSiDbReady, persistSiDb } from './fixture-api/si-persistence';

const BL_CANCEL_REMARKS = 'Bill of lading amendment cancelled by the customer.';

/** BLRowStatus set by the wizard → ecomSI.status of the amendment version. */
const RAW_STATUS: Record<BLRowStatus, string> = { D: 'D', S: 'S', C: 'A', I: 'I' };

/** The amendment version a B/L edit must land on; a plain SI is cloned first. */
function amendmentFor(blNo: string): Row | null {
  const row = findBlRow(blNo);
  if (!row) return null;
  return isAmendment(row) ? row : cloneSiAsAmendment(row);
}

function setStatus(row: Row, status: string, remarks?: string) {
  row.status = status;
  if (remarks !== undefined) row.declined_remarks = remarks;
  row.ChgDate = nowIso();
}

/** Apply MCN edit fields onto the amendment row + children the detail bridge reads. */
function applyMcnBody(row: Row, body: Partial<MCNDTO>) {
  if (body.remarks !== undefined) row.custremarks = body.remarks;

  if (body.freightTerms !== undefined) {
    const terms = String(body.freightTerms).toUpperCase();
    const collect = terms.includes('COLLECT');
    row.Freight = collect ? 'C' : 'P';
    const eSINo = str(row.eSINo);
    for (const charge of db.siCharges.filter((c) => eq(c.esino, eSINo) && eq(c.chargeid, 'OFR'))) {
      charge.prepaidcollect = collect ? 'C' : 'P';
    }
  }

  if (body.cargoDescription !== undefined) {
    const eSINo = str(row.eSINo);
    const commodities = db.siCommodity.filter((c) => eq(c.eSINo, eSINo));
    if (commodities.length) {
      commodities[0].marksDesc = body.cargoDescription;
      for (let i = 1; i < commodities.length; i++) commodities[i].marksDesc = '';
    }
  }

  if (body.status === 'Submitted') row.status = 'S';
  else if (body.status === 'Draft') row.status = 'D';

  row.ChgDate = nowIso();
}

const notFound = (message: string) => HttpResponse.json({ error: { code: 'NOT_FOUND', message } }, { status: 404 });

function detailOr404(blNo: string) {
  const detail = fixtureBlDetail(blNo);
  return detail ? HttpResponse.json({ data: detail }) : notFound(`B/L ${blNo} not found`);
}

function paginate<T>(rows: T[], startRow: number, endRow: number) {
  return { data: rows.slice(startRow, endRow), meta: { totalCount: rows.length } };
}

function pdf(content: string, fileName: string) {
  return new HttpResponse(new Blob([`%PDF-1.4 ${content}`], { type: 'application/pdf' }), {
    headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${fileName}"` },
  });
}

const csvCell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

/** One CSV line per cargo line of the B/L — the "Excel" cargo template the import step reads back. */
function cargoCsv(detail: BLDTO, template: string): string {
  const header = ['Container No', 'Size/Type', 'Carrier Seal', 'Shipper Seal', 'Marks & Numbers', 'Description', 'HS Code', 'Package Qty', 'Package Type', 'Gross Weight', 'Volume'];
  if (template !== 'standard') header.push('UN No', 'IMO Class');
  const lines = detail.containers.flatMap(c =>
    c.cargoLines.map(l => {
      const cells = [c.containerNo, c.eqpSize, c.carrierSeal, c.shipperSeal, l.marksAndNumbers, l.description, l.hsCode, l.packageCount, l.packageType, l.grossWeight, l.volume];
      if (template !== 'standard') cells.push(l.unNumber ?? '', l.dgClass ?? '');
      return cells.map(csvCell).join(',');
    }),
  );
  return [header.map(csvCell).join(','), ...lines].join('\r\n');
}

/**
 * Specific paths before `/api/bl/:blNo` so list / guards / from-si
 * are never swallowed by the parametric detail route.
 */
export const blHandlers = [
  http.get('*/api/bl/config', async () => {
    await delay(100);
    return HttpResponse.json({ data: DEFAULT_BL_WIZARD_CONFIG });
  }),

  http.get('*/api/bl/list', async ({ request }) => {
    await delay(300);
    await ensureSiDbReady();
    const rows = fixtureBlList() ?? [];
    const url = new URL(request.url);
    const startRow = Number(url.searchParams.get('startRow') ?? 0);
    const endRow = Number(url.searchParams.get('endRow') ?? rows.length);
    return HttpResponse.json(paginate(rows, startRow, endRow));
  }),

  http.get('*/api/bl/guards/voyage-closed', async ({ request }) => {
    const url = new URL(request.url);
    const blNo = url.searchParams.get('blNo') ?? '';
    return HttpResponse.json({ data: { closed: fixtureVoyageClosed(blNo) } });
  }),

  http.get('*/api/bl/from-si/:siNo', async ({ params }) => {
    await delay(200);
    await ensureSiDbReady();
    const siNo = params.siNo as string;
    const detail = fixtureBlFromSi(siNo);
    if (!detail) return notFound('SI not found');
    return HttpResponse.json({ data: detail });
  }),

  http.post('*/api/bl/print/batch', async ({ request }) => {
    await delay(600);
    const body = (await request.json()) as { blNos?: string[] };
    const blNos = (body.blNos ?? []).filter(blNo => findBlRow(blNo));
    return pdf(`Batch B/L print for ${blNos.join(', ')}`, 'bl-batch-print.pdf');
  }),

  http.get('*/api/bl/:blNo/print', async ({ params, request }) => {
    await delay(500);
    await ensureSiDbReady();
    const blNo = params.blNo as string;
    const url = new URL(request.url);
    const type = (url.searchParams.get('type') ?? 'draft') as BLPrintType;
    const detail = fixtureBlDetail(blNo);
    if (!detail) return notFound(`B/L ${blNo} not found`);

    if (type === 'original' && detail.status === 'I') {
      return HttpResponse.json(
        { error: { code: 'REPRINT_BLOCKED', message: 'Original B/L already issued and cannot be reprinted' } },
        { status: 403 },
      );
    }
    if (type === 'original') {
      const row = amendmentFor(blNo);
      if (row) {
        setStatus(row, 'I');
        persistSiDb();
      }
    }
    return pdf(`Bill of Lading (${type}) for ${blNo}`, `${blNo}-${type}.pdf`);
  }),

  http.get('*/api/bl/:blNo/charges', async ({ params }) => {
    await delay(200);
    const blNo = params.blNo as string;
    return HttpResponse.json({ data: fixtureBlCharges(blNo) ?? { blNo, lines: [], totals: [] } });
  }),

  http.get('*/api/bl/:blNo/insurance', async ({ params }) => {
    await delay(150);
    const blNo = params.blNo as string;
    const insurance = fixtureBlInsurance(blNo);
    if (!insurance) return notFound('No insurance policy');
    return HttpResponse.json({ data: insurance });
  }),

  http.post('*/api/bl/payment/intent', async ({ request }) => {
    await delay(300);
    const body = (await request.json()) as { blNos?: string[]; amountUsd?: number };
    const blNos = body.blNos ?? [];
    const amountUsd = body.amountUsd ?? 0;
    return HttpResponse.json({
      data: { clientSecret: `mock_secret_${blNos.join('_')}`, amountUsd, blNos },
    });
  }),

  http.post('*/api/bl/:blNo/cargo/import', async ({ params, request }) => {
    await delay(400);
    const blNo = params.blNo as string;
    const detail = fixtureBlDetail(blNo);
    if (!detail) return notFound('B/L not found');
    const formData = await request.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) {
      return HttpResponse.json({ error: { code: 'INVALID_FILE', message: 'No file uploaded' } }, { status: 400 });
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
    const detail = fixtureBlDetail(blNo);
    if (!detail) return notFound(`B/L ${blNo} not found`);
    return new HttpResponse(new Blob([cargoCsv(detail, template)], { type: 'application/vnd.ms-excel' }), {
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
    await ensureSiDbReady();
    const blNo = params.blNo as string;
    const row = amendmentFor(blNo);
    if (!row) return notFound('B/L not found');
    applySiBody(row, (await request.json()) as WizardBody);
    persistSiDb();
    return detailOr404(blNo);
  }),

  http.post('*/api/bl/:blNo/verify', async ({ params }) => {
    await delay(400);
    await ensureSiDbReady();
    const blNo = params.blNo as string;
    const row = amendmentFor(blNo);
    if (!row) return notFound('Not found');
    setStatus(row, 'A', 'Accepted'); // Approved by customer → Confirmed
    persistSiDb();
    return detailOr404(blNo);
  }),

  http.post('*/api/bl/:blNo/cancel', async ({ params }) => {
    await delay(300);
    await ensureSiDbReady();
    const blNo = params.blNo as string;
    const row = amendmentFor(blNo);
    if (!row) return notFound('Not found');
    setStatus(row, 'D', BL_CANCEL_REMARKS); // back to Verify Copy
    persistSiDb();
    return detailOr404(blNo);
  }),

  http.post('*/api/bl/:blNo/submit', async ({ params, request }) => {
    await delay(400);
    await ensureSiDbReady();
    const blNo = params.blNo as string;
    const row = amendmentFor(blNo);
    if (!row) return notFound('Not found');
    // Optional body: apply draft fields before status flip (parity with SI submit).
    const contentType = request.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      try {
        const body = (await request.json()) as WizardBody | null;
        if (body && typeof body === 'object') applySiBody(row, body);
      } catch {
        // empty / non-JSON body is fine — wizard often PUTs then POSTs without a body
      }
    }
    setStatus(row, 'S', '');
    persistSiDb();
    const detail = fixtureBlDetail(blNo);
    if (!detail) return notFound('Not found');
    detail.submitResult = {
      success: true,
      messages: ['B/L submitted successfully.'],
      insuranceMessage: detail.insurance?.isInsuranceRequired ? 'Insurance policy will be issued within 24 hours.' : undefined,
      fileRestrictionMessage: undefined,
    };
    return HttpResponse.json({ data: detail });
  }),

  http.post('*/api/bl/:blNo/issue', async ({ params }) => {
    await delay(400);
    await ensureSiDbReady();
    const blNo = params.blNo as string;
    const row = amendmentFor(blNo);
    if (!row) return notFound('Not found');
    setStatus(row, 'I', 'Released');
    persistSiDb();
    return detailOr404(blNo);
  }),

  http.put('*/api/bl/:blNo', async ({ params, request }) => {
    await delay(300);
    await ensureSiDbReady();
    const blNo = params.blNo as string;
    const row = amendmentFor(blNo);
    if (!row) return notFound('B/L not found');
    const body = (await request.json()) as Partial<BLDTO>;
    applySiBody(row, body as WizardBody);
    if (body.status && RAW_STATUS[body.status]) row.status = RAW_STATUS[body.status];
    persistSiDb();
    return detailOr404(blNo);
  }),

  http.get('*/api/bl/:blNo', async ({ params }) => {
    await delay(200);
    await ensureSiDbReady();
    return detailOr404(params.blNo as string);
  }),

  http.get('*/api/mcn/list', async () => {
    await delay(200);
    await ensureSiDbReady();
    return HttpResponse.json({ data: fixtureMcnList() });
  }),

  http.get('*/api/mcn/:mcnId/print', async ({ params, request }) => {
    await delay(400);
    await ensureSiDbReady();
    const mcnId = params.mcnId as string;
    const url = new URL(request.url);
    const manifestType = url.searchParams.get('manifestType') ?? 'full';
    return pdf(`Manifest ${manifestType} for ${mcnId}`, `${mcnId}-manifest.pdf`);
  }),

  http.get('*/api/mcn/:mcnId', async ({ params }) => {
    await delay(200);
    await ensureSiDbReady();
    const detail = fixtureMcnDetail(params.mcnId as string);
    return detail ? HttpResponse.json({ data: detail }) : notFound('MCN not found');
  }),

  http.put('*/api/mcn/:mcnId', async ({ params, request }) => {
    await delay(250);
    await ensureSiDbReady();
    const mcnId = params.mcnId as string;
    const row = findMcnRow(mcnId);
    if (!row) return notFound('MCN not found');
    applyMcnBody(row, (await request.json()) as Partial<MCNDTO>);
    persistSiDb();
    return HttpResponse.json({ data: fixtureMcnDetail(mcnIdOf(row)) });
  }),

  http.post('*/api/mcn/:mcnId/submit', async ({ params }) => {
    await delay(300);
    await ensureSiDbReady();
    const mcnId = params.mcnId as string;
    const row = findMcnRow(mcnId);
    if (!row) return notFound('MCN not found');
    setStatus(row, 'S', '');
    persistSiDb();
    return HttpResponse.json({ data: fixtureMcnDetail(str(mcnId)) });
  }),
];

/** Reset store for tests — restores the pristine fixtures. */
export function resetBLMockStore() {
  resetDb();
}
