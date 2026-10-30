// Modified by Sekar Nagarajan (2026-10-17 00:32)
/**
 * Arrival Notice rows derived from the import documentation fixtures:
 *   arrivalNotices (status A, newest first)         → the agency's recent notices (location / POD of the demo customer)
 *   invoices + invoiceBls (IMPORTINVOICE, CONFIRM)  → charges due, currency, charge lines
 *   invoiceCharges (freedays, cntrno)               → free time and container numbers
 *   lrpBl / lrpBlCargo / lrpBlCust                  → arrival, containers, consignee / notify party
 *   schedules (vessel + voyage + port)              → ETA when the B/L is not in the sample
 *   vessels / ports / terminals                     → names via masters.bridge
 *
 * The sampled notices reference B/Ls outside the e-commerce slice, so most rows have no invoice
 * or cargo facts: charges due are then 0 and the container list is empty.
 */
import type {
  ArrivalNoticeChargeLine,
  ArrivalNoticeContainerRow,
  ArrivalNoticeDTO,
  ArrivalNoticeListDTO,
} from '../../../features/arrival-notice/types/arrival-notice.types';
import { childRows, db, eq, type Row } from '../db';
import { mostCommon } from './booking-shared.bridge';
import { importInvoicesFor } from './delivery-order.bridge';
import { toIsoOrNull } from './format';
import { chargeName, portLabel, terminalName, vesselName } from './masters.bridge';
import { num, str, yes } from './si-common.bridge';
import { currentCustomerCode } from './user.bridge';

const DAY_MS = 86_400_000;

/** Agency and control port of the demo customer, from its e-commerce bookings (INDMUM / INNSA in the sample). */
export function demoAgency(): { agency: string; port: string } {
  const mine = db.bookings.filter(b => eq(b.cust_code, currentCustomerCode()));
  return { agency: mostCommon(mine, 'agencyid'), port: mostCommon(mine, 'loadPortId') };
}

const newestFirstByCrDate = (a: Row, b: Row) => +new Date(b.CrDate) - +new Date(a.CrDate);

/**
 * Active notices of the agency (locationcode) or discharging at its control port (portcode),
 * one row per arrival notice number (newest CrDate wins), newest first. Falls back to every
 * active notice when the agency filter matches nothing.
 */
export function arrivalNoticeRows(notices: Row[] = db.arrivalNotices, scope = demoAgency()): Row[] {
  const active = notices.filter(n => !eq(n.status, 'I') && str(n.arrivalnoticeno));
  const scoped = active.filter(n => (scope.agency && eq(n.locationcode, scope.agency)) || (scope.port && eq(n.portcode, scope.port)));
  const seen = new Set<string>();
  const out: Row[] = [];
  for (const n of (scoped.length ? scoped : active).sort(newestFirstByCrDate)) {
    const key = str(n.arrivalnoticeno).toUpperCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(n);
  }
  return out;
}

export const findArrivalNoticeRows = (anNo: string): Row[] =>
  db.arrivalNotices.filter(n => eq(n.arrivalnoticeno, anNo)).sort(newestFirstByCrDate);

/** Scheduled arrival of the notice's vessel call at the POD, when the schedule sample carries it. */
function scheduledArrival(notice: Row): string | null {
  const call = db.schedules.find(
    s => eq(s.vessel, notice.vesselcode) && eq(s.voyage, notice.voyage) && eq(s.port, notice.portcode),
  );
  return toIsoOrNull(call?.arrdate);
}

export interface ArrivalFacts {
  invoices: Row[];
  chargesDue: number;
  currency: string;
  etaDate: string;
  arrivalDate: string;
  freeDays: number;
  lastFreeDay?: string;
}

/** Invoice balance, arrival and free time of a notice. */
export function arrivalFacts(notice: Row): ArrivalFacts {
  const blNo = str(notice.blnumber);
  const invoices = importInvoicesFor(blNo);
  const bl = db.lrpBl.find(b => eq(b.bl_no, blNo)) ?? null;
  const chargesDue = Math.round(invoices.reduce((sum, inv) => sum + num(inv.amtbalance), 0) * 100) / 100;
  const owing = [...invoices].sort((a, b) => num(b.amtbalance) - num(a.amtbalance))[0] ?? invoices[0];
  // TODO(fixtures): notices without an invoice in the sample have no currency of their own — USD stands in.
  const currency = str(owing?.invcurrency) || 'USD';
  const noticeDate = toIsoOrNull(notice.CrDate) ?? new Date(0).toISOString();
  const arrivalDate =
    toIsoOrNull(bl?.podAt) ?? scheduledArrival(notice) ?? toIsoOrNull(invoices[0]?.shipmentDate) ?? noticeDate;
  const freeDays = Math.max(
    0,
    ...invoices.flatMap(inv => childRows('invoiceCharges', 'invno', inv.invno)).map(c => num(c.freedays)),
    ...childRows('lrpBlCargo', 'bl_no', blNo).map(c => num(c.impfree)),
  );
  return {
    invoices,
    chargesDue,
    currency,
    etaDate: arrivalDate,
    arrivalDate,
    freeDays,
    lastFreeDay: freeDays > 0 ? new Date(+new Date(arrivalDate) + freeDays * DAY_MS).toISOString() : undefined,
  };
}

export const arrivalNoticePrintStatus = (notice: Row): 'Y' | 'N' =>
  yes(notice.IsPrinted) || yes(notice.ecomprintstatus) ? 'Y' : 'N';

/** ArrivalNoticeListDTO for a notice row. */
export function mapArrivalNotice(notice: Row, facts: ArrivalFacts = arrivalFacts(notice)): ArrivalNoticeListDTO {
  return {
    anNo: str(notice.arrivalnoticeno),
    blNumber: str(notice.blnumber),
    vessel: vesselName(notice.vesselcode),
    voyage: str(notice.voyage),
    dischargePort: portLabel(notice.portcode),
    terminal: str(notice.terminalcode) ? terminalName(notice.terminalcode) : '',
    etaDate: facts.etaDate,
    arrivalDate: facts.arrivalDate,
    lastFreeDay: facts.lastFreeDay,
    chargesDue: facts.chargesDue,
    currency: facts.currency,
    printStatus: arrivalNoticePrintStatus(notice),
  };
}

/** Containers: LRP B/L cargo, else the container numbers on the invoice charges. */
export function arrivalNoticeContainers(blNo: string, invoices: Row[]): ArrivalNoticeContainerRow[] {
  const cargo = childRows('lrpBlCargo', 'bl_no', blNo).filter(c => str(c.eqpId));
  if (cargo.length) {
    return cargo.map(c => ({ containerNo: str(c.eqpId), eqpSize: str(c.eqpTypeId), sealNo: str(c.seal1No) || undefined }));
  }
  const seen = new Map<string, ArrivalNoticeContainerRow>();
  for (const c of invoices.flatMap(inv => childRows('invoiceCharges', 'invno', inv.invno))) {
    const no = str(c.cntrno);
    if (no && !seen.has(no)) seen.set(no, { containerNo: no, eqpSize: str(c.cntrtype) });
  }
  return [...seen.values()];
}

/** Charge lines of the invoices that still carry a balance. */
export function arrivalNoticeChargeLines(invoices: Row[]): ArrivalNoticeChargeLine[] {
  return invoices
    .filter(inv => num(inv.amtbalance) > 0)
    .flatMap(inv => childRows('invoiceCharges', 'invno', inv.invno))
    .map(c => ({
      chargeCode: str(c.chargecode),
      description: str(c.chargename) || chargeName(c.chargecode),
      amount: num(c.itmtotal),
      currency: str(c.itmcurrency),
    }));
}

/** Consignee / notify party: LRP B/L parties, else the invoiced customer. */
export function arrivalNoticeParties(notice: Row, invoices: Row[]): { consignee: string; notifyParty: string } {
  const parties = childRows('lrpBlCust', 'bl_no', notice.blnumber);
  const party = (type: string) => str(parties.find(p => eq(p.custTypeId, type))?.name);
  const consignee = party('CN') || str(invoices[0]?.custname) || str(notice.ArrivalNoticeParty);
  const notifyParty = party('NT') || (yes(notice.NotifyNotice) ? consignee : '');
  return { consignee, notifyParty };
}

/** ArrivalNoticeDTO for an arrival notice number, or null. */
export function arrivalNoticeDetail(anNo: string): ArrivalNoticeDTO | null {
  const notice = findArrivalNoticeRows(anNo)[0];
  if (!notice) return null;
  const facts = arrivalFacts(notice);
  const blNo = str(notice.blnumber);
  return {
    ...mapArrivalNotice(notice, facts),
    ...arrivalNoticeParties(notice, facts.invoices),
    // TODO(fixtures): no manifest / IGM columns in the sample — the port call group id is shown as the manifest reference.
    manifestRef: str(notice.groupcallid) || undefined,
    igmNo: undefined,
    containers: arrivalNoticeContainers(blNo, facts.invoices),
    chargeLines: arrivalNoticeChargeLines(facts.invoices),
    freeTime: facts.lastFreeDay ? { days: facts.freeDays, lastFreeDay: facts.lastFreeDay } : undefined,
    demurrageFrom: facts.lastFreeDay ? new Date(+new Date(facts.lastFreeDay) + DAY_MS).toISOString() : undefined,
  };
}

export const arrivalNoticeList = (): ArrivalNoticeListDTO[] => arrivalNoticeRows().map(n => mapArrivalNotice(n));

/** Inclusive YYYY-MM-DD filter on the arrival (else ETA) date. */
export function filterArrivalNotices(rows: ArrivalNoticeListDTO[], fromDate?: string | null, toDate?: string | null): ArrivalNoticeListDTO[] {
  return rows.filter(row => {
    const day = (row.arrivalDate || row.etaDate).slice(0, 10);
    if (fromDate && day < fromDate) return false;
    if (toDate && day > toDate) return false;
    return true;
  });
}

/** Print side effect: flags every row of the notice as printed. Returns false when unknown. */
export function markArrivalNoticePrinted(anNo: string): boolean {
  const rows = findArrivalNoticeRows(anNo);
  if (!rows.length) return false;
  for (const row of rows) {
    row.IsPrinted = 'Y';
    row.ecomprintstatus = 'Y';
  }
  return true;
}
