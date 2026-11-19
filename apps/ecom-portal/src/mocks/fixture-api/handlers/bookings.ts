// Created by Sekar Nagarajan (2026-10-16 22:31)
import { http } from 'msw';
import { db, eq, childRows, nextRef, nowIso, type Row } from '../db';
import { API, latency, ok, notFound, badRequest, paginate, matches, inDateRange, byDateDesc, BOOKING_STATUS, label } from '../utils';

const CHILD_TABLES = {
  parties: 'bookingCust',
  cargo: 'bookingCargo',
  commodities: 'bookingCommodity',
  dangerousGoods: 'bookingDg',
  outOfGauge: 'bookingOog',
  reefer: 'bookingRefer',
  legs: 'bookingLeg',
  haulage: 'bookingHaulage',
  cutoffs: 'bookingConf',
  files: 'bookingFiles',
  ens: 'bookingIcs',
} as const;

const summary = (b: Row) => ({ ...b, statusDesc: label(BOOKING_STATUS, b.ebook_status) });

/** Booking header + every child table, shaped the way the detail screen consumes it. */
function hydrate(b: Row) {
  const id = b.ebookno;
  const legs = childRows('bookingLeg', 'ebookno', id).sort((x, y) => Number(x.leg_no) - Number(y.leg_no));
  return {
    ...summary(b),
    parties: childRows('bookingCust', 'ebookno', id),
    cargo: childRows('bookingCargo', 'ebookno', id).map(c => ({
      ...c,
      commodities: childRows('bookingCommodity', 'ebookno', id).filter(x => eq(x.conid, c.conid)),
      dangerousGoods: childRows('bookingDg', 'ebookno', id).filter(x => eq(x.conid, c.conid)),
      outOfGauge: childRows('bookingOog', 'ebookno', id).filter(x => eq(x.conid, c.conid)),
      reefer: childRows('bookingRefer', 'ebookno', id).filter(x => eq(x.conid, c.conid)),
    })),
    legs,
    haulage: childRows('bookingHaulage', 'ebookno', id),
    cutoffs: childRows('bookingConf', 'ebookno', id)[0] ?? null,
    files: childRows('bookingFiles', 'ebookno', id),
    ens: childRows('bookingIcs', 'ebookno', id)[0] ?? null,
    insurance: db.insurance.filter(i => eq(i.book_no, id) || eq(i.lrpbook_no, b.extBookNo)),
  };
}

function removeChildren(ebookno: string) {
  for (const table of Object.values(CHILD_TABLES)) {
    db[table] = db[table].filter(r => !eq(r.ebookno, ebookno));
  }
}

/** Accepts the same shape hydrate() returns and writes the child arrays back to their tables. */
function writeChildren(ebookno: string, body: Row) {
  const push = (table: keyof typeof CHILD_TABLES, rows: Row[] | Row | undefined) => {
    if (!rows) return;
    const list = Array.isArray(rows) ? rows : [rows];
    db[CHILD_TABLES[table]].push(...list.map(r => ({ ...r, ebookno })));
  };
  push('parties', body.parties);
  push('legs', body.legs);
  push('haulage', body.haulage);
  push('cutoffs', body.cutoffs);
  push('files', body.files);
  push('ens', body.ens);
  (body.cargo ?? []).forEach((c: Row, i: number) => {
    const conid = c.conid ?? i + 1;
    const { commodities, dangerousGoods, outOfGauge, reefer, ...cargoRow } = c;
    push('cargo', { ...cargoRow, conid });
    push('commodities', (commodities ?? []).map((x: Row) => ({ ...x, conid })));
    push('dangerousGoods', (dangerousGoods ?? []).map((x: Row) => ({ ...x, conid })));
    push('outOfGauge', (outOfGauge ?? []).map((x: Row) => ({ ...x, conid })));
    push('reefer', (reefer ?? []).map((x: Row) => ({ ...x, conid })));
  });
}

const HEADER_FIELDS = [
  'cust_code', 'agencyid', 'originPortId', 'finalPortId', 'loadPortId', 'dischargePortId', 'intransitport', 'preCarriage', 'onCarriage',
  'bookDate', 'bookReady', 'routeId', 'rateno', 'trptsvccode', 'nat_code', 'oceanfreight', 'salesagreedrate', 'emptypickup',
  'emptypickupdate', 'pickup_point', 'haulercode', 'haulagetype', 'pickupdate', 'dropdate', 'exportRef', 'custPO', 'customerreference',
  'ShipperReference', 'ACID', 'cargoprotectid', 'releasetype', 'ensfiling', 'enstype', 't2lfiling', 'sisubmitparty', 'remarks',
  'ccmailid', 'templatename',
];
const pickHeader = (body: Row) => Object.fromEntries(HEADER_FIELDS.filter(f => body[f] !== undefined).map(f => [f, body[f]]));

export const bookingHandlers = [
  /** GET /api/bookings?custCode=&status=S,C&q=&fromDate=&toDate=&page=&pageSize= */
  http.get(`${API}/bookings`, async ({ request }) => {
    await latency();
    const url = new URL(request.url);
    const sp = url.searchParams;
    let items = db.bookings.filter(b => b.ebook_status !== 'T');
    if (sp.get('custCode')) items = items.filter(b => eq(b.cust_code, sp.get('custCode')));
    if (sp.get('status')) {
      const wanted = sp.get('status')!.split(',').map(s => s.trim().toUpperCase());
      items = items.filter(b => wanted.includes(String(b.ebook_status).toUpperCase()));
    }
    items = items
      .filter(b => matches(b, ['ebookno', 'extBookNo', 'AgencyRefNo', 'originPortId', 'finalPortId', 'customerreference', 'custPO'], sp.get('q')))
      .filter(b => inDateRange(b.datecr, sp.get('fromDate'), sp.get('toDate')))
      .sort(byDateDesc('dateup'));
    return paginate(items.map(summary), url);
  }),

  http.get(`${API}/bookings/templates`, async ({ request }) => {
    await latency();
    const custCode = new URL(request.url).searchParams.get('custCode');
    const items = db.bookings.filter(b => b.ebook_status === 'T' && (!custCode || eq(b.cust_code, custCode)));
    return ok(items.map(t => ({ ebookno: t.ebookno, templatename: t.templatename, originPortId: t.originPortId, finalPortId: t.finalPortId })));
  }),

  http.get(`${API}/bookings/:ebookno`, async ({ params }) => {
    await latency();
    const b = db.bookings.find(x => eq(x.ebookno, params.ebookno) || eq(x.extBookNo, params.ebookno));
    return b ? ok(hydrate(b)) : notFound(`Booking ${params.ebookno} not found`);
  }),

  /** POST /api/bookings  body: { saveType: 'draft'|'submit'|'template', ...header, parties, cargo, legs, ... } */
  http.post(`${API}/bookings`, async ({ request }) => {
    await latency();
    const body = (await request.json()) as Row;
    if (!body.originPortId || !body.finalPortId) return badRequest('originPortId and finalPortId are required');
    const status = body.saveType === 'template' ? 'T' : body.saveType === 'draft' ? 'D' : 'S';
    const ts = nowIso();
    const booking: Row = {
      ebookno: nextRef('EBK'),
      extBookNo: null,
      ebook_status: status,
      isamendment: 'N',
      version: 1,
      appversion: 'V2',
      usercr: body.usercr ?? 'demo.user@example.com',
      userup: body.usercr ?? 'demo.user@example.com',
      datecr: ts,
      dateup: ts,
      submitted_date: status === 'S' ? ts : null,
      ...pickHeader(body),
    };
    db.bookings.unshift(booking);
    writeChildren(booking.ebookno, body);
    return ok(hydrate(booking), 201);
  }),

  http.put(`${API}/bookings/:ebookno`, async ({ params, request }) => {
    await latency();
    const b = db.bookings.find(x => eq(x.ebookno, params.ebookno));
    if (!b) return notFound(`Booking ${params.ebookno} not found`);
    const body = (await request.json()) as Row;
    Object.assign(b, pickHeader(body), { dateup: nowIso() });
    if (body.saveType === 'submit') { b.ebook_status = 'S'; b.submitted_date = nowIso(); }
    if (['C', 'A'].includes(b.ebook_status) && body.saveType === 'amend') { b.ebook_status = 'M'; b.isamendment = 'Y'; b.version = Number(b.version ?? 1) + 1; }
    removeChildren(b.ebookno);
    writeChildren(b.ebookno, body);
    return ok(hydrate(b));
  }),

  http.post(`${API}/bookings/:ebookno/cancel`, async ({ params, request }) => {
    await latency();
    const b = db.bookings.find(x => eq(x.ebookno, params.ebookno));
    if (!b) return notFound(`Booking ${params.ebookno} not found`);
    const body = (await request.json().catch(() => ({}))) as Row;
    const hasSi = db.shippingInstructions.some(si => eq(si.bookno, b.extBookNo ?? b.ebookno) && ['D', 'S', 'A'].includes(si.status));
    if (hasSi) return badRequest('A shipping instruction exists for this booking. Cancel the SI first.');
    b.ebook_status = 'I';
    b.declined_remarks = body.reason ? `${body.reason}${body.remarks ? ' - ' + body.remarks : ''}` : b.declined_remarks;
    b.dateup = nowIso();
    return ok(summary(b));
  }),

  http.delete(`${API}/bookings/:ebookno`, async ({ params }) => {
    await latency();
    const b = db.bookings.find(x => eq(x.ebookno, params.ebookno));
    if (!b) return notFound(`Booking ${params.ebookno} not found`);
    if (b.ebook_status !== 'T') return badRequest('Only templates can be deleted');
    db.bookings = db.bookings.filter(x => x !== b);
    removeChildren(b.ebookno);
    return ok({ deleted: b.ebookno });
  }),

  http.get(`${API}/bookings/:ebookno/declined-remarks`, async ({ params }) => {
    await latency();
    const b = db.bookings.find(x => eq(x.ebookno, params.ebookno));
    return b ? ok({ ebookno: b.ebookno, remarks: b.declined_remarks ?? '' }) : notFound();
  }),
];
