// Created by Sekar Nagarajan (2026-10-16 22:31)
import { http } from 'msw';
import { db, eq, nextRef, nowIso, type Row } from '../db';
import { API, latency, ok, notFound, badRequest, paginate, matches, inDateRange, byDateDesc, VGM_STATUS, SI_STATUS, BOOKING_STATUS, label } from '../utils';
import { latestBlVersions } from '../bridges/bl-list.bridge';
import { ensureSiDbReady, persistSiDb } from '../si-persistence';
import { hydrateSi } from './shipping-instructions';

// ─── Bills of lading ─────────────────────────────────────────────────────────
// A B/L in the e-commerce DB is the latest ecomSI row with editbl=1 for a given blno.
// If the usp_GetBLNumbersEcomOn fixture (blSummary) was extracted, it is used for the list screen.
export const blRows = () => latestBlVersions(db.shippingInstructions);

export const billOfLadingHandlers = [
  http.get(`${API}/bills-of-lading`, async ({ request }) => {
    await latency();
    const url = new URL(request.url);
    const sp = url.searchParams;
    let items: Row[];
    if (db.blSummary.length) {
      items = db.blSummary.map(r => ({ ...r, source: 'LRPV1DS' }));
    } else {
      items = blRows().map(si => ({
        blno: si.blno, bookno: si.bookno, pol: si.pol, pod: si.pod, pla: si.pla, pld: si.pld,
        blstatus: si.status, blstatusDesc: label(SI_STATUS, si.status), ecomsino: si.eSINo, blversion: si.blversion,
        shipperName: si.shippername, consigneeName: si.consigeename, vessel: si.Vessel, voyage: si.Voyage,
        custcode: si.custcode, polat: si.ChgDate, source: 'ECOMDB',
      }));
    }
    if (sp.get('custCode')) items = items.filter(r => eq(r.custcode ?? r.custid, sp.get('custCode')));
    items = items
      .filter(r => matches(r, ['blno', 'bookno', 'pol', 'pod', 'shipperName', 'consigneeName'], sp.get('q')))
      .filter(r => inDateRange(r.polat, sp.get('fromDate'), sp.get('toDate')))
      .sort(byDateDesc('polat'));
    return paginate(items, url);
  }),

  http.get(`${API}/bills-of-lading/:blno`, async ({ params }) => {
    await latency();
    const versions = db.shippingInstructions
      .filter(si => eq(si.blno, params.blno))
      .sort((a, b) => Number(b.blversion) - Number(a.blversion));
    if (!versions.length) return notFound(`B/L ${params.blno} not found`);
    return ok({ ...hydrateSi(versions[0]), versions: versions.map(v => ({ eSINo: v.eSINo, blversion: v.blversion, status: v.status, ChgDate: v.ChgDate })) });
  }),

  /** Submit a B/L amendment: clones the latest version with blversion+1 and editbl=1. */
  http.post(`${API}/bills-of-lading/:blno/amend`, async ({ params, request }) => {
    await latency();
    await ensureSiDbReady();
    const latest = db.shippingInstructions.filter(si => eq(si.blno, params.blno)).sort((a, b) => Number(b.blversion) - Number(a.blversion))[0];
    if (!latest) return notFound(`B/L ${params.blno} not found`);
    const body = (await request.json().catch(() => ({}))) as Row;
    const ts = nowIso();
    const draft: Row = { ...latest, ...body, eSINo: nextRef('EBL'), editbl: 1, blversion: Number(latest.blversion ?? 0) + 1, status: 'S', CrDate: ts, ChgDate: ts };
    db.shippingInstructions.unshift(draft);
    for (const t of ['siCust', 'siCargo', 'siCommodity', 'siDg', 'siOog', 'siReefer', 'siCharges', 'siFiles', 'siIcs'] as const) {
      db[t].push(...db[t].filter(r => eq(r.eSINo, latest.eSINo)).map(r => ({ ...r, eSINo: draft.eSINo })));
    }
    persistSiDb();
    return ok(hydrateSi(draft), 201);
  }),

  http.post(`${API}/bills-of-lading/:blno/accept`, async ({ params }) => {
    await latency();
    await ensureSiDbReady();
    const latest = db.shippingInstructions.filter(si => eq(si.blno, params.blno)).sort((a, b) => Number(b.blversion) - Number(a.blversion))[0];
    if (!latest) return notFound(`B/L ${params.blno} not found`);
    latest.status = 'A';
    latest.ChgDate = nowIso();
    persistSiDb();
    return ok({ blno: params.blno, status: 'A', acceptedAt: latest.ChgDate });
  }),
];

// ─── VGM ─────────────────────────────────────────────────────────────────────
export const vgmHandlers = [
  /** GET /api/vgm?bookNo=  or ?blNo= */
  http.get(`${API}/vgm`, async ({ request }) => {
    await latency();
    const sp = new URL(request.url).searchParams;
    const bookNo = sp.get('bookNo');
    const blNo = sp.get('blNo');
    if (!bookNo && !blNo) return badRequest('bookNo or blNo is required');
    const booking = bookNo ? db.bookings.find(b => eq(b.extBookNo, bookNo) || eq(b.ebookno, bookNo)) : null;
    const containers = booking ? db.bookingCargo.filter(c => eq(c.ebookno, booking.ebookno)) : [];
    const submissions = db.vgm
      .filter(v => (bookNo && (eq(v.book_no, bookNo) || (booking && eq(v.book_no, booking.ebookno)))) || (blNo && eq(v.bl_no, blNo)))
      .map((v): Row => ({ ...v, statusDesc: label(VGM_STATUS, v.status) }))
      .sort(byDateDesc('datecr'));
    return ok({
      reference: { bookNo: booking?.extBookNo ?? bookNo, blNo, originPort: booking?.originPortId, loadPort: booking?.loadPortId, custCode: booking?.cust_code },
      containers: containers.map(c => ({
        eqpid: c.containerno, eqptype: c.eqpType, eqpSize: c.eqpSize, tareWeight: c.tareWeight,
        current: submissions.find(s => eq(s.eqpid, c.containerno) && ['A', 'C'].includes(s.status)) ?? null,
      })),
      submissions,
    });
  }),

  /** POST /api/vgm  body: { book_no, bl_no?, containers: [{ eqpid, eqptype, vgm_weight, vgm_unit, vgm_obtained_method, ... }], declarant: {...} } */
  http.post(`${API}/vgm`, async ({ request }) => {
    await latency();
    const body = (await request.json()) as Row;
    if (!body.book_no || !Array.isArray(body.containers) || !body.containers.length) return badRequest('book_no and containers[] are required');
    const ts = nowIso();
    const created = body.containers.map((c: Row) => {
      const previous = db.vgm.filter(v => eq(v.book_no, body.book_no) && eq(v.eqpid, c.eqpid));
      previous.filter(v => ['A', 'C'].includes(v.status)).forEach(v => { v.status = 'I'; v.dateup = ts; });
      const row: Row = {
        book_no: body.book_no, bl_no: body.bl_no ?? null, vgm_source: 'ECOM', vgm_type: body.vgm_type ?? 'S',
        vgm_ref_number: nextRef('VGM'), status: 'A', oprstatus: 'N', version_no: previous.length + 1,
        usercr: body.usercr ?? 'demo.user@example.com', datecr: ts, dateup: ts,
        ...(body.declarant ?? {}), ...c,
      };
      db.vgm.unshift(row);
      return { ...row, statusDesc: label(VGM_STATUS, row.status) };
    });
    return ok(created, 201);
  }),
];

// ─── Schedules ───────────────────────────────────────────────────────────────
// allschedules holds one row per port call. A sailing POL→POD is a pair of calls on the same
// service/vessel/voyage/bound where the POD arrival is after the POL departure (EcomScheduleBean.getScheduleByPortPair).
export const scheduleHandlers = [
  http.get(`${API}/schedules/port-pair`, async ({ request }) => {
    await latency();
    const sp = new URL(request.url).searchParams;
    const pol = sp.get('pol'), pod = sp.get('pod');
    if (!pol || !pod) return badRequest('pol and pod are required');
    const groups = new Map<string, Row[]>();
    for (const r of db.schedules) {
      const key = [r.service, r.vessel, r.voyage, r.bound].join('|');
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(r);
    }
    const sailings: Row[] = [];
    for (const calls of groups.values()) {
      const a = calls.find(c => eq(c.port, pol));
      const b = calls.find(c => eq(c.port, pod) && a && +new Date(c.arrdate) > +new Date(a.depdate));
      if (!a || !b) continue;
      sailings.push({
        service: a.service, vessel: a.vessel, voyage: a.voyage, bound: a.bound, type: a.type,
        pol: a.port, polTerminal: a.terminal, polCallId: a.groupcallid, polArrival: a.arrdate, polDeparture: a.depdate,
        pod: b.port, podTerminal: b.terminal, podCallId: b.groupcallid, podArrival: b.arrdate, podDeparture: b.depdate,
        transitDays: Math.round((+new Date(b.arrdate) - +new Date(a.depdate)) / 864e5),
      });
    }
    return ok(sailings.filter(s => inDateRange(s.polDeparture, sp.get('fromDate'), sp.get('toDate'))).sort((x, y) => +new Date(x.polDeparture) - +new Date(y.polDeparture)));
  }),

  http.get(`${API}/schedules/by-port`, async ({ request }) => {
    await latency();
    const sp = new URL(request.url).searchParams;
    const port = sp.get('port');
    if (!port) return badRequest('port is required');
    return ok(db.schedules.filter(s => eq(s.port, port) && inDateRange(s.arrdate, sp.get('fromDate'), sp.get('toDate'))).sort((a, b) => +new Date(a.arrdate) - +new Date(b.arrdate)));
  }),

  http.get(`${API}/schedules/by-vessel`, async ({ request }) => {
    await latency();
    const sp = new URL(request.url).searchParams;
    const vessel = sp.get('vessel');
    if (!vessel) return badRequest('vessel is required');
    return ok(db.schedules.filter(s => eq(s.vessel, vessel) && inDateRange(s.arrdate, sp.get('fromDate'), sp.get('toDate'))).sort((a, b) => +new Date(a.arrdate) - +new Date(b.arrdate)));
  }),
];

// ─── Dashboard ───────────────────────────────────────────────────────────────
const countBy = (rows: Row[], field: string) =>
  Object.entries(rows.reduce<Record<string, number>>((acc, r) => { const k = String(r[field] ?? ''); acc[k] = (acc[k] ?? 0) + 1; return acc; }, {}))
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);

export const dashboardHandlers = [
  http.get(`${API}/dashboard`, async ({ request }) => {
    await latency();
    const sp = new URL(request.url).searchParams;
    const custCode = sp.get('custCode');
    const bookings = db.bookings.filter(b => b.ebook_status !== 'T' && (!custCode || eq(b.cust_code, custCode)));
    const sis = db.shippingInstructions.filter(s => Number(s.editbl ?? 0) === 0 && (!custCode || eq(s.custcode, custCode)));
    const bls = blRows().filter(s => !custCode || eq(s.custcode, custCode));
    return ok({
      bookings: { total: bookings.length, byStatus: countBy(bookings, 'ebook_status').map(x => ({ status: x.key, label: label(BOOKING_STATUS, x.key), count: x.count })) },
      shippingInstructions: { total: sis.length, byStatus: countBy(sis, 'status').map(x => ({ status: x.key, label: label(SI_STATUS, x.key), count: x.count })) },
      billsOfLading: { total: bls.length, byStatus: countBy(bls, 'status').map(x => ({ status: x.key, label: label(SI_STATUS, x.key), count: x.count })) },
      topDestinations: countBy(bookings, 'finalPortId').slice(0, 5).map(x => ({ port: x.key, count: x.count })),
      topPortPairs: countBy(bookings.map(b => ({ pair: `${b.originPortId}-${b.finalPortId}` })), 'pair').slice(0, 5).map(x => ({ pair: x.key, count: x.count })),
      topDestinationsTeu: countBy(
        db.bookingCargo.filter(c => bookings.some(b => eq(b.ebookno, c.ebookno))).map(c => ({ port: bookings.find(b => eq(b.ebookno, c.ebookno))!.finalPortId, qty: Number(c.quantity ?? 1) })),
        'port',
      ).slice(0, 5).map(x => ({ port: x.key, containers: x.count })),
      recentBookings: [...bookings].sort(byDateDesc('dateup')).slice(0, 5),
    });
  }),
];

// ─── Payments ────────────────────────────────────────────────────────────────
export const paymentHandlers = [
  http.get(`${API}/payments`, async ({ request }) => {
    await latency();
    const url = new URL(request.url);
    const sp = url.searchParams;
    let items = db.payments;
    if (sp.get('custCode')) items = items.filter(p => eq(p.customerCode, sp.get('custCode')));
    items = items.filter(p => inDateRange(p.createdAt, sp.get('fromDate'), sp.get('toDate'))).sort(byDateDesc('createdAt'));
    return paginate(items.map(p => ({ ...p, references: db.paymentReferences.filter(r => eq(r.requestId, p.requestId)) })), url);
  }),

  http.get(`${API}/payments/:requestId`, async ({ params }) => {
    await latency();
    const p = db.payments.find(x => eq(x.requestId, params.requestId));
    return p ? ok({ ...p, references: db.paymentReferences.filter(r => eq(r.requestId, p.requestId)) }) : notFound();
  }),

  /** Creates a payment that completes after a short delay, so the UI can show the pending→completed transition. */
  http.post(`${API}/payments`, async ({ request }) => {
    await latency();
    const body = (await request.json()) as Row;
    if (!Array.isArray(body.references) || !body.references.length) return badRequest('references[] is required');
    const ts = nowIso();
    const amountUsd = body.references.reduce((sum: number, r: Row) => sum + Number(r.amountUsd ?? 0), 0);
    const payment: Row = {
      requestId: crypto.randomUUID(), customerCode: body.customerCode, loginName: body.loginName ?? 'demo.user@example.com',
      paymentType: body.paymentType ?? 'INV', currency: 'USD', amountUsd, amountCents: Math.round(amountUsd * 100),
      status: 'PENDING', description: body.description ?? '', agencyCode: body.agencyCode ?? null, errorMessage: null, createdAt: ts, updatedAt: ts,
    };
    db.payments.unshift(payment);
    db.paymentReferences.push(...body.references.map((r: Row) => ({ ...r, requestId: payment.requestId, createdAt: ts })));
    setTimeout(() => { payment.status = 'COMPLETED'; payment.updatedAt = nowIso(); }, 4000);
    return ok({ ...payment, references: db.paymentReferences.filter(r => eq(r.requestId, payment.requestId)) }, 201);
  }),
];
