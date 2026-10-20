// Modified by Sekar Nagarajan (2026-10-19 00:10)
/**
 * Delivery Order (import) rows derived from the invoicing fixtures:
 *   invoices (IMPORTINVOICE, status CONFIRM)        → one DO candidate per B/L (invrefno)
 *   invoiceBls (BLNumber ↔ InvoiceNumber)           → extra invoice ↔ B/L links
 *   invoiceCharges (freedays, cntrno)                → free time and container numbers
 *   lrpBl / lrpBlCargo                               → POD terminal, arrival, containers, import free days
 *   telexReleases                                    → B/L release (empty in this sample)
 *   deliveryOrderVersions (delordno, versionNo, cntrno) → print history when the DO number matches
 *
 * Rule: a DO is issuable when the import invoice balance of the B/L is 0 and the B/L is released.
 * Printing a DO mutates the invoice rows (doprintstatus / isprinted / dateprinted) and appends a
 * deliveryOrderVersions row per container, so the list reflects it for the rest of the session.
 */
import type { DOPrintStatus, DOSummaryRow } from '../../../features/delivery-order/types/delivery-order.types';
import { childRows, db, eq, nowIso, type Row } from '../db';
import { toIsoOrNull } from './format';
import { portLabel, terminalName, vesselName } from './masters.bridge';
import { num, str, yes } from './si-common.bridge';

const DAY_MS = 86_400_000;
/** Import free time applied when neither the charges nor the B/L cargo carry free days. */
export const DEFAULT_FREE_DAYS = 7;

export const isImportInvoice = (inv: Row) => eq(inv.invtype, 'IMPORTINVOICE');
export const isConfirmedInvoice = (inv: Row) => eq(inv.status, 'CONFIRM');

const newestInvoiceFirst = (a: Row, b: Row) => +new Date(b.invdate) - +new Date(a.invdate);

/** Invoice numbers linked to a B/L through invoiceBls (BLNumber / hblno). */
function linkedInvoiceNumbers(blNo: string): string[] {
  return db.invoiceBls.filter(l => eq(l.BLNumber, blNo) || eq(l.hblno, blNo)).map(l => str(l.InvoiceNumber));
}

/** Confirmed import invoices of a B/L: invrefno match plus the invoiceBls links, newest first. */
export function importInvoicesFor(blNo: string, invoices: Row[] = db.invoices): Row[] {
  const linked = linkedInvoiceNumbers(blNo);
  return invoices
    .filter(inv => isImportInvoice(inv) && isConfirmedInvoice(inv) && (eq(inv.invrefno, blNo) || linked.some(n => eq(n, inv.invno))))
    .sort(newestInvoiceFirst);
}

/** Distinct B/L numbers that carry at least one import invoice, newest invoice first. */
export function importBlNumbers(invoices: Row[] = db.invoices): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const inv of [...invoices].filter(isImportInvoice).sort(newestInvoiceFirst)) {
    const blNo = str(inv.invrefno);
    if (!blNo || seen.has(blNo.toUpperCase())) continue;
    seen.add(blNo.toUpperCase());
    out.push(blNo);
  }
  return out;
}

export interface DeliveryOrderFacts {
  blNo: string;
  /** Confirmed import invoices of the B/L, newest first. */
  invoices: Row[];
  /** Newest confirmed invoice — carries vessel, ports and the DO columns. */
  primary: Row;
  balance: number;
  released: boolean;
  freeDays: number;
  delOrdNo: string;
  versions: Row[];
}

/** B/L released: telex release, surrendered / seaway B/L, or an LRP B/L that is not void. */
export function blReleased(blNo: string, primary: Row): boolean {
  if (db.telexReleases.some(t => eq(t.blnumber, blNo) || eq(t.bl_no, blNo))) return true;
  if (yes(primary.surrender) || yes(primary.seawaybl)) return true;
  const bl = db.lrpBl.find(b => eq(b.bl_no, blNo));
  if (bl) return !eq(bl.status, 'V');
  // TODO(fixtures): the import B/Ls of the sample are outside lrpBl / telexReleases — treated as released.
  return true;
}

/** Free days: max invoiceCharges.freedays of the invoices, else lrpBlCargo.impfree, else the default. */
export function freeDaysFor(blNo: string, invoices: Row[]): number {
  const fromCharges = invoices.flatMap(inv => childRows('invoiceCharges', 'invno', inv.invno)).map(c => num(c.freedays));
  const charged = Math.max(0, ...fromCharges);
  if (charged > 0) return charged;
  const fromCargo = Math.max(0, ...childRows('lrpBlCargo', 'bl_no', blNo).map(c => num(c.impfree)));
  return fromCargo > 0 ? fromCargo : DEFAULT_FREE_DAYS;
}

/** Facts for one B/L, or null when it has no confirmed import invoice. */
export function deliveryOrderFacts(blNo: string): DeliveryOrderFacts | null {
  const invoices = importInvoicesFor(blNo);
  const primary = invoices[0];
  if (!primary) return null;
  const balance = Math.round(invoices.reduce((sum, inv) => sum + num(inv.amtbalance), 0) * 100) / 100;
  const stored = invoices.map(inv => str(inv.deliveryorderno)).find(Boolean);
  // TODO(fixtures): deliveryorderno is empty for every sampled import invoice — DO-<invno> stands in.
  const delOrdNo = stored || `DO-${str(primary.invno)}`;
  return {
    blNo,
    invoices,
    primary,
    balance,
    released: blReleased(blNo, primary),
    freeDays: freeDaysFor(blNo, invoices),
    delOrdNo,
    versions: childRows('deliveryOrderVersions', 'delordno', delOrdNo),
  };
}

export const isDeliveryOrderIssuable = (facts: DeliveryOrderFacts) => Math.abs(facts.balance) < 0.005 && facts.released;

/** Containers of the DO: LRP B/L cargo, else the container numbers on the invoice charges, else printed versions. */
export function deliveryOrderContainers(facts: DeliveryOrderFacts): string[] {
  const fromCargo = childRows('lrpBlCargo', 'bl_no', facts.blNo).map(c => str(c.eqpId)).filter(Boolean);
  if (fromCargo.length) return [...new Set(fromCargo)];
  const fromCharges = facts.invoices.flatMap(inv => childRows('invoiceCharges', 'invno', inv.invno)).map(c => str(c.cntrno)).filter(Boolean);
  if (fromCharges.length) return [...new Set(fromCharges)];
  return [...new Set(facts.versions.map(v => str(v.cntrno)).filter(Boolean))];
}

function addDays(iso: string, days: number): string {
  return new Date(+new Date(iso) + days * DAY_MS).toISOString();
}

function printStatusOf(facts: DeliveryOrderFacts): DOPrintStatus {
  const printed = facts.invoices.some(inv => yes(inv.doprintstatus) || yes(inv.isprinted));
  return printed || facts.versions.length > 0 ? 'Y' : 'N';
}

/** DOSummaryRow for a B/L's facts. */
export function mapDeliveryOrder(facts: DeliveryOrderFacts): DOSummaryRow {
  const { primary, blNo } = facts;
  const bl = db.lrpBl.find(b => eq(b.bl_no, blNo)) ?? null;
  const notice = db.arrivalNotices.find(a => eq(a.blnumber, blNo)) ?? null;
  const issued = facts.invoices.map(inv => toIsoOrNull(inv.deliveryissdate)).find(Boolean) ?? null;
  const delorddate = issued ?? toIsoOrNull(primary.invdate) ?? nowIso();
  const arrdate = toIsoOrNull(bl?.podAt) ?? toIsoOrNull(primary.shipmentDate) ?? toIsoOrNull(notice?.CrDate) ?? delorddate;
  const validityBase = +new Date(arrdate) > +new Date(delorddate) ? arrdate : delorddate;
  const terminalCode = str(bl?.podTerminal) || str(notice?.terminalcode);
  const consignee = childRows('lrpBlCust', 'bl_no', blNo).find(c => eq(c.custTypeId, 'CN'));
  const printHistory = [...facts.versions]
    .sort((a, b) => num(b.versionNo) - num(a.versionNo) || +new Date(str(b.datecr)) - +new Date(str(a.datecr)))
    .filter((v, i, all) => all.findIndex(x => num(x.versionNo) === num(v.versionNo)) === i)
    .map(v => ({ version: num(v.versionNo), printedAt: toIsoOrNull(v.datecr) ?? '', printedBy: str(v.usercr) }));
  return {
    consignee: str(consignee?.name) || str(primary.custname),
    containers: deliveryOrderContainers(facts),
    freeDays: facts.freeDays,
    invoiceNos: facts.invoices.map(inv => str(inv.invno)).filter(Boolean),
    balanceDue: facts.balance,
    currency: str(primary.invcurrency) || 'USD',
    printHistory,
    delordno: facts.delOrdNo,
    delorddate,
    blnumber: blNo,
    vessel: vesselName(primary.vslcode),
    voyage: str(primary.voycode),
    bound: str(primary.bound),
    loadport: portLabel(primary.pol || primary.originport),
    dischargeport: portLabel(primary.pod || primary.finalport),
    terminal: terminalCode ? terminalName(terminalCode) : '',
    arrdate,
    dovaliditydate: addDays(validityBase, facts.freeDays),
    printstatus: printStatusOf(facts),
    ecomprintstatus: facts.released ? '1' : '0',
  };
}

/** Every issuable DO (balance 0, B/L released), newest DO date first. */
export function deliveryOrderList(): DOSummaryRow[] {
  return importBlNumbers()
    .map(deliveryOrderFacts)
    .filter((f): f is DeliveryOrderFacts => f !== null && isDeliveryOrderIssuable(f))
    .map(mapDeliveryOrder)
    .sort((a, b) => +new Date(b.delorddate) - +new Date(a.delorddate));
}

/** Inclusive YYYY-MM-DD filter on the DO date. */
export function filterDeliveryOrders(rows: DOSummaryRow[], fromDate?: string | null, toDate?: string | null): DOSummaryRow[] {
  const from = fromDate?.trim();
  const to = toDate?.trim();
  return rows.filter(row => {
    const key = row.delorddate.slice(0, 10);
    if (from && key < from) return false;
    if (to && key > to) return false;
    return true;
  });
}

export function findDeliveryOrderFacts(delOrdNo: string): DeliveryOrderFacts | null {
  for (const blNo of importBlNumbers()) {
    const facts = deliveryOrderFacts(blNo);
    if (facts && eq(facts.delOrdNo, delOrdNo)) return facts;
  }
  return null;
}

/**
 * Print side effect: flags the invoices as printed and appends a deliveryOrderVersions row per
 * container. Returns false when the DO does not exist or cannot be printed online (B/L not released).
 */
export function markDeliveryOrderPrinted(delOrdNo: string, user = 'ecom'): boolean {
  const facts = findDeliveryOrderFacts(delOrdNo);
  if (!facts) return false;
  if (!facts.released) return false;
  const now = nowIso();
  for (const inv of facts.invoices) {
    inv.doprintstatus = 'Y';
    inv.isprinted = 'Y';
    inv.dateprinted = now;
    if (!str(inv.deliveryissdate)) inv.deliveryissdate = now;
  }
  const versionNo = Math.max(0, ...facts.versions.map(v => num(v.versionNo))) + 1;
  const containers = deliveryOrderContainers(facts);
  const nextId = Math.max(0, ...db.deliveryOrderVersions.map(v => num(v.id))) + 1;
  (containers.length ? containers : ['']).forEach((cntrno, i) => {
    db.deliveryOrderVersions.push({ id: nextId + i, delordno: facts.delOrdNo, versionNo, usercr: user, datecr: now, cntrno });
  });
  return true;
}

/** Plain-text body of the mock PDF, listing the DO facts and its containers. */
export function deliveryOrderDocument(delOrdNo: string): string {
  const facts = findDeliveryOrderFacts(delOrdNo);
  const lines = [`%PDF-1.4 Mock Delivery Order Document for ${delOrdNo}`];
  if (facts) {
    const versionNo = Math.max(0, ...childRows('deliveryOrderVersions', 'delordno', facts.delOrdNo).map(v => num(v.versionNo)));
    lines.push(`B/L: ${facts.blNo}`, `Version: ${versionNo}`, `Containers: ${deliveryOrderContainers(facts).join(', ') || '-'}`);
  }
  return lines.join('\n');
}
