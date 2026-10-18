// Created by Sekar Nagarajan (2026-10-16 22:31)
import { http } from 'msw';
import { db, eq, childRows, nextRef, nowIso, type Row } from '../db';
import { API, latency, ok, notFound, badRequest, paginate, matches, inDateRange, byDateDesc, SI_STATUS, label } from '../utils';

const CHILD_TABLES = ['siCust', 'siCargo', 'siCommodity', 'siDg', 'siOog', 'siReefer', 'siCharges', 'siFiles', 'siIcs'] as const;

const summary = (si: Row) => ({ ...si, statusDesc: label(SI_STATUS, si.status) });

/** SI header + parties + containers (each with commodities/DG/OOG/reefer) + charges + files + ENS. */
export function hydrateSi(si: Row) {
  const id = si.eSINo;
  const byContainer = (table: 'siCommodity' | 'siDg' | 'siOog' | 'siReefer', c: Row) =>
    childRows(table, 'eSINo', id).filter(x => eq(x.conId, c.conId) || (c.containerno && eq(x.containerno, c.containerno)));
  return {
    ...summary(si),
    booking: db.bookings.find(b => eq(b.extBookNo, si.bookno) || eq(b.ebookno, si.bookno)) ?? null,
    parties: childRows('siCust', 'eSINo', id),
    containers: childRows('siCargo', 'eSINo', id)
      .sort((a, b) => Number(a.conId) - Number(b.conId))
      .map(c => ({
        ...c,
        commodities: byContainer('siCommodity', c),
        dangerousGoods: byContainer('siDg', c),
        outOfGauge: byContainer('siOog', c),
        reefer: byContainer('siReefer', c)[0] ?? null,
      })),
    charges: childRows('siCharges', 'eSINo', id),
    files: childRows('siFiles', 'eSINo', id),
    ens: childRows('siIcs', 'eSINo', id)[0] ?? null,
    request: db.siRequestMaster.find(r => eq(r.bookno, si.bookno)) ?? null,
  };
}

function removeChildren(eSINo: string) {
  for (const t of CHILD_TABLES) db[t] = db[t].filter(r => !eq(r.eSINo, eSINo));
}

function writeChildren(eSINo: string, body: Row) {
  const push = (table: (typeof CHILD_TABLES)[number], rows?: Row[] | Row) => {
    if (!rows) return;
    const list = Array.isArray(rows) ? rows : [rows];
    db[table].push(...list.map(r => ({ ...r, eSINo })));
  };
  push('siCust', body.parties);
  push('siCharges', body.charges);
  push('siFiles', body.files);
  push('siIcs', body.ens);
  (body.containers ?? []).forEach((c: Row, i: number) => {
    const conId = c.conId ?? i + 1;
    const { commodities, dangerousGoods, outOfGauge, reefer, ...cargo } = c;
    push('siCargo', { ...cargo, conId });
    push('siCommodity', (commodities ?? []).map((x: Row) => ({ ...x, conId, containerno: cargo.containerno })));
    push('siDg', (dangerousGoods ?? []).map((x: Row) => ({ ...x, conId, containerno: cargo.containerno })));
    push('siOog', (outOfGauge ?? []).map((x: Row) => ({ ...x, conId, containerno: cargo.containerno })));
    if (reefer) push('siReefer', { ...reefer, conId, containerno: cargo.containerno });
  });
}

const HEADER_FIELDS = [
  'bookno', 'custcode', 'Vessel', 'Voyage', 'bound', 'pol', 'pod', 'pla', 'pld', 'plaHeaderName', 'polHeaderName', 'podHeaderName',
  'pldHeaderName', 'shipper', 'shippername', 'consigee', 'consigeename', 'notify', 'notifyname', 'AESNumber', 'AESDiscliamer',
  'releasetype', 'declaredvalue', 'blType', 'bltype_UAE', 'Freight', 'ACID', 'cargoprotectid', 't2lfiling', 'packinglst',
  'invoiceupload', 'telexrls', 'enstype', 'mpci_id', 'nvocc', 'custremarks', 'ccmailid',
];
const pickHeader = (body: Row) => Object.fromEntries(HEADER_FIELDS.filter(f => body[f] !== undefined).map(f => [f, body[f]]));

export const shippingInstructionHandlers = [
  /** GET /api/shipping-instructions?custCode=&status=&q=&fromDate=&toDate= */
  http.get(`${API}/shipping-instructions`, async ({ request }) => {
    await latency();
    const url = new URL(request.url);
    const sp = url.searchParams;
    let items = db.shippingInstructions.filter(si => Number(si.editbl ?? 0) === 0);
    if (sp.get('custCode')) items = items.filter(si => eq(si.custcode, sp.get('custCode')));
    if (sp.get('status')) {
      const wanted = sp.get('status')!.split(',').map(s => s.trim().toUpperCase());
      items = items.filter(si => wanted.includes(String(si.status).toUpperCase()));
    }
    items = items
      .filter(si => matches(si, ['eSINo', 'bookno', 'blno', 'Vessel', 'pol', 'pod', 'shippername', 'consigeename'], sp.get('q')))
      .filter(si => inDateRange(si.CrDate, sp.get('fromDate'), sp.get('toDate')))
      .sort(byDateDesc('ChgDate'));
    return paginate(items.map(summary), url);
  }),

  /** Containers from the confirmed booking, pre-filled for a new SI. */
  http.get(`${API}/shipping-instructions/prefill/:bookNo`, async ({ params }) => {
    await latency();
    const b = db.bookings.find(x => eq(x.extBookNo, params.bookNo) || eq(x.ebookno, params.bookNo));
    if (!b) return notFound(`Booking ${params.bookNo} not found`);
    const legs = childRows('bookingLeg', 'ebookno', b.ebookno).sort((x, y) => Number(x.leg_no) - Number(y.leg_no));
    const main = legs.find(l => eq(l.legtypeid, 'M')) ?? legs[0] ?? {};
    return ok({
      bookno: b.extBookNo ?? b.ebookno,
      custcode: b.cust_code,
      Vessel: main.vesselcode ?? null,
      Voyage: main.voyagecode ?? null,
      bound: main.bound ?? null,
      pol: b.loadPortId, pod: b.dischargePortId, pla: b.originPortId, pld: b.finalPortId,
      parties: childRows('bookingCust', 'ebookno', b.ebookno),
      containers: childRows('bookingCargo', 'ebookno', b.ebookno).map(c => ({
        conId: c.conid, eqpType: c.eqpType, eqpSize: c.eqpSize, containerno: c.containerno ?? '',
        shipperOwn: c.soc, tareWeight: c.tareWeight, grossweight: c.grossWeight, cargoWeight: c.cargoWeight,
        weightUnit: c.weightUnit, ref_nor: c.ref_nor, eqpstatus: c.eqpstatus, oog: c.oog, dgflag: c.dgFlag,
        commodities: childRows('bookingCommodity', 'ebookno', b.ebookno).filter(x => eq(x.conid, c.conid)),
      })),
      ccmailid: b.ccmailid,
    });
  }),

  http.get(`${API}/shipping-instructions/:eSINo`, async ({ params }) => {
    await latency();
    const si = db.shippingInstructions.find(x => eq(x.eSINo, params.eSINo));
    return si ? ok(hydrateSi(si)) : notFound(`SI ${params.eSINo} not found`);
  }),

  /** POST /api/shipping-instructions  body: { saveType: 'draft'|'submit', ...header, parties, containers, charges, files, ens } */
  http.post(`${API}/shipping-instructions`, async ({ request }) => {
    await latency();
    const body = (await request.json()) as Row;
    if (!body.bookno) return badRequest('bookno is required');
    const ts = nowIso();
    const si: Row = {
      eSINo: nextRef('ESI'),
      blno: null,
      editbl: 0,
      blversion: 0,
      status: body.saveType === 'submit' ? 'S' : 'D',
      appversion: 'V2',
      CrUser: body.CrUser ?? 'demo.user@example.com',
      CrDate: ts,
      ChgUser: body.CrUser ?? 'demo.user@example.com',
      ChgDate: ts,
      ...pickHeader(body),
    };
    db.shippingInstructions.unshift(si);
    writeChildren(si.eSINo, body);
    const req = db.siRequestMaster.find(r => eq(r.bookno, si.bookno));
    if (req) req.createdSI = Number(req.createdSI ?? 0) + 1;
    return ok(hydrateSi(si), 201);
  }),

  http.put(`${API}/shipping-instructions/:eSINo`, async ({ params, request }) => {
    await latency();
    const si = db.shippingInstructions.find(x => eq(x.eSINo, params.eSINo));
    if (!si) return notFound(`SI ${params.eSINo} not found`);
    const body = (await request.json()) as Row;
    Object.assign(si, pickHeader(body), { ChgDate: nowIso() });
    if (body.saveType === 'submit') si.status = 'S';
    removeChildren(si.eSINo);
    writeChildren(si.eSINo, body);
    return ok(hydrateSi(si));
  }),

  http.post(`${API}/shipping-instructions/:eSINo/cancel`, async ({ params }) => {
    await latency();
    const si = db.shippingInstructions.find(x => eq(x.eSINo, params.eSINo));
    if (!si) return notFound(`SI ${params.eSINo} not found`);
    if (!['D', 'S'].includes(si.status)) return badRequest(`SI in status '${si.status}' cannot be cancelled`);
    si.status = 'I';
    si.ChgDate = nowIso();
    return ok(summary(si));
  }),
];
