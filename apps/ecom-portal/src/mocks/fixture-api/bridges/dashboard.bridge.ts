// Modified by Sekar Nagarajan (2026-10-18 20:30)
/**
 * Dashboard figures computed from the extracted fixtures (ecombooking + children, ecomSI,
 * ecom_vgmsolas, Ecom_OnlinePayment(_Reference), Ecom_Notice, EcomCustomerAdvisory,
 * EcomNotificationMaster, ecom_cutoffconfig, ecomRouteSearchLog).
 *
 * Everything is a pure function of a `DashboardTables` bag (defaults to `db`) and a `now`
 * instant, so the unit tests feed inline rows and a fixed clock. Nothing here touches MSW.
 *
 * Model: one "fact" per non-template booking — cargo TEUs, main leg (ETD/ETA → lifecycle),
 * the latest live SI (by agency booking no), pending online payments referencing the booking
 * or its B/L, VGM coverage, commodities and consignee. Every section is an aggregation of it.
 */
import type { BookingListDTO } from '../../../features/booking/types/booking-list.types';
import type {
  BookingStatusChartItem,
  CalendarDayCell,
  CalendarWeek,
  CalendarWeekday,
  ContractedLane,
  DashboardBreakdownTone,
  DashboardCounts,
  DashboardIntelligence,
  DashboardLanes,
  DashboardPlanning,
  DashboardQuickAction,
  DashboardShipment,
  DashboardStatCard,
  DashboardSummaryResponse,
  IntelligenceBreakdown,
  IntelligenceBreakdowns,
  LastUsedLane,
  NoticeItem,
  OpportunityLane,
  PlanningBookingDTO,
  PortPairChartItem,
  RecentBookingRow,
  RecentBookingStatus,
  ShipmentIntelligenceStats,
  TopConsignee,
  TopDestinationItem,
  TopLane,
  UnclearedCargoItem,
  UpcomingScheduleItem,
  VolumeAnalyticsResponse,
  VolumeAnalyticsStage,
  VolumeKpi,
  VolumeTrendPeriod,
  VolumeTrendPoint,
  VolumeTrendRecord,
} from '../../../features/dashboard/api/dashboard.api';
import type { DashboardReport } from '../../../features/dashboard/types/dashboard-export.types';
import {
  filterDashboardShipments,
  getDashboardFilterLabel,
} from '../../../features/dashboard/utils/filter-dashboard-shipments';
import { db, type Row } from '../db';
import { SI_STATUS, label } from '../status-maps';
import { BOOKING_LIST_STATUS, groupBy, mapBookingRow } from './booking-list.bridge';
import { mapPort } from './lookups.bridge';
import { equipmentTeus, serviceName, vesselName } from './masters.bridge';

// ─── Inputs ──────────────────────────────────────────────────────
export interface DashboardTables {
  bookings: Row[];
  bookingCargo: Row[];
  bookingLeg: Row[];
  bookingCommodity: Row[];
  bookingCust: Row[];
  shippingInstructions: Row[];
  vgm: Row[];
  payments: Row[];
  paymentReferences: Row[];
  /** LRP documentation (Documentation DB) and accounting (Accounts DB) facts — optional, default empty. */
  lrpBookings?: Row[];
  lrpBookingLegs?: Row[];
  lrpBl?: Row[];
  invoices?: Row[];
  invoiceBls?: Row[];
  notices: Row[];
  advisories: Row[];
  notificationMaster: Row[];
  cutoffConfig: Row[];
  routeSearchLog: Row[];
  ports: Row[];
}

/** Every table empty — the starting point for unit tests. */
export function emptyTables(): DashboardTables {
  return {
    bookings: [], bookingCargo: [], bookingLeg: [], bookingCommodity: [], bookingCust: [],
    shippingInstructions: [], vgm: [], payments: [], paymentReferences: [],
    lrpBookings: [], lrpBookingLegs: [], lrpBl: [], invoices: [], invoiceBls: [],
    notices: [], advisories: [], notificationMaster: [], cutoffConfig: [], routeSearchLog: [], ports: [],
  };
}

/** The live fixture tables. */
export function dashboardTables(): DashboardTables {
  return {
    bookings: db.bookings,
    bookingCargo: db.bookingCargo,
    bookingLeg: db.bookingLeg,
    bookingCommodity: db.bookingCommodity,
    bookingCust: db.bookingCust,
    shippingInstructions: db.shippingInstructions,
    vgm: db.vgm,
    payments: db.payments,
    paymentReferences: db.paymentReferences,
    lrpBookings: db.lrpBookings,
    lrpBookingLegs: db.lrpBookingLegs,
    lrpBl: db.lrpBl,
    invoices: db.invoices,
    invoiceBls: db.invoiceBls,
    notices: db.notices,
    advisories: db.advisories,
    notificationMaster: db.notificationMaster,
    cutoffConfig: db.cutoffConfig,
    routeSearchLog: db.ecomRouteSearchLog ?? [],
    ports: db.ports,
  };
}

export interface DashboardOptions {
  tables?: DashboardTables;
  now?: Date;
  /** Static quick-action tiles (UI config); the bridge only adds the counts. */
  quickActions?: ReadonlyArray<DashboardQuickAction>;
}

// ─── Small helpers ───────────────────────────────────────────────
const DAY_MS = 86_400_000;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS: CalendarWeekday[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const TONES: DashboardBreakdownTone[] = ['primary', 'success', 'warning', 'error', 'purple'];
const PENDING_PAYMENT_STATUSES = new Set(['SESSION_CREATED', 'FAILED']);

const str = (v: unknown) => String(v ?? '').trim();
const up = (v: unknown) => str(v).toUpperCase();
const key = (v: unknown) => str(v).toLowerCase();
const num = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const round1 = (n: number) => Math.round(n * 10) / 10;
const pad = (n: number) => String(n).padStart(2, '0');

function asDate(v: unknown): Date | null {
  if (v == null || v === '') return null;
  const d = v instanceof Date ? v : new Date(v as string);
  return Number.isNaN(+d) ? null : d;
}
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, d.getHours(), d.getMinutes());
/** Monday 00:00 of the week containing d. */
const mondayOf = (d: Date) => addDays(startOfDay(d), -((d.getDay() + 6) % 7));

/** ISO-8601 week number and week-based year. */
export function isoWeek(d: Date): { week: number; year: number } {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const yearStart = Date.UTC(t.getUTCFullYear(), 0, 1);
  return { week: Math.ceil(((+t - yearStart) / DAY_MS + 1) / 7), year: t.getUTCFullYear() };
}

/** "25 Aug 2026" */
export const fmtDay = (d: Date) => `${pad(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
/** "May 25, 2025" */
const fmtLong = (d: Date) => `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
/** "2026-08-28" (local) */
const fmtIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
/** "19–25 May" / "26 May–1 Jun" — the planning calendar's week range. */
export function fmtWeekRange(mon: Date, sun: Date): string {
  return mon.getMonth() === sun.getMonth()
    ? `${mon.getDate()}–${sun.getDate()} ${MONTHS[sun.getMonth()]}`
    : `${mon.getDate()} ${MONTHS[mon.getMonth()]}–${sun.getDate()} ${MONTHS[sun.getMonth()]}`;
}

/** "NHAVA SHEVA,MUMBAI" → "Nhava Sheva, Mumbai" */
export function titleCase(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s*,\s*/g, ', ')
    .split(/\s+/)
    .map(w => (w.length <= 2 && !/[a-z]{2}/.test(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ')
    .trim();
}

/** TEUs per cargo line from the equipments master (Teus); sizes come as RE20, 20DC, DV40, 45RF… (unknown 20' = 1, else 2). */
export function teuOf(cargo: Row): number {
  const size = up(cargo.eqpSize);
  const qty = Math.max(1, num(cargo.quantity) || 1);
  return qty * (size ? equipmentTeus(size) : 1);
}
const isReefer = (cargo: Row) => up(cargo.eqpType) === 'R' || /RE|RF/.test(up(cargo.eqpSize));
const containersOf = (cargo: Row) => Math.max(1, num(cargo.quantity) || 1);

/** Port code → display name: the ports master when extracted, else the SI header names. */
export function portNameIndex(tables: DashboardTables): Map<string, string> {
  const names = new Map<string, string>();
  for (const p of tables.ports) {
    const { portCode, portName } = mapPort(p);
    if (portCode && portName) names.set(portCode, titleCase(portName));
  }
  const pairs: [string, string][] = [['pol', 'polHeaderName'], ['pod', 'podHeaderName'], ['pla', 'plaHeaderName'], ['pld', 'pldHeaderName']];
  for (const si of tables.shippingInstructions) {
    for (const [codeCol, nameCol] of pairs) {
      const code = up(si[codeCol]);
      const name = str(si[nameCol]);
      if (code && name && !names.has(code)) names.set(code, titleCase(name));
    }
  }
  return names;
}

// ─── Facts ───────────────────────────────────────────────────────
type Lifecycle = 'origin' | 'inTransit' | 'delivered';

interface PendingPayment { amount: number; refNo: string; agency: string }

export interface BookingFact {
  row: Row;
  ebookno: string;
  /** Agency booking number (extBookNo); '' until the agency accepted the booking. */
  bookNo: string;
  code: string;
  confirmed: boolean;
  cancelled: boolean;
  /** Draft / submitted / confirmed — everything that is not cancelled or rejected. */
  active: boolean;
  cargo: Row[];
  teus: number;
  containers: number;
  dg: boolean;
  reefer: boolean;
  leg: Row | null;
  etd: Date | null;
  eta: Date | null;
  lifecycle: Lifecycle | null;
  si: Row | null;
  blNo: string;
  blIssued: boolean;
  payments: PendingPayment[];
  amtBal: number;
  commodities: { name: string; teus: number }[];
  consignee: string;
  vgmPending: number;
  created: Date;
  updated: Date;
  /** Sailing date when known, else creation date — the axis for volume analytics. */
  volumeDate: Date;
}

/** Live SIs (no B/L amendments, not cancelled) keyed by booking number, newest first. */
function liveSiIndex(rows: Row[]): Map<string, Row> {
  const out = new Map<string, Row>();
  const live = rows
    .filter(si => num(si.editbl) === 0 && up(si.status) !== 'I')
    .sort((a, b) => +(asDate(b.ChgDate) ?? 0) - +(asDate(a.ChgDate) ?? 0));
  for (const si of live) {
    const k = key(si.bookno);
    if (k && !out.has(k)) out.set(k, si);
  }
  return out;
}

/** Pending (session created / failed) online payments by the reference they were raised for. */
function pendingPaymentIndex(tables: DashboardTables): Map<string, PendingPayment[]> {
  const pending = new Map<string, Row>();
  for (const p of tables.payments) {
    if (PENDING_PAYMENT_STATUSES.has(up(p.status))) pending.set(key(p.requestId), p);
  }
  const out = new Map<string, PendingPayment[]>();
  for (const ref of tables.paymentReferences) {
    const payment = pending.get(key(ref.requestId));
    const refNo = key(ref.refNo);
    if (!payment || !refNo) continue;
    const list = out.get(refNo) ?? [];
    list.push({ amount: num(ref.amountUsd) || num(payment.amountUsd), refNo: str(ref.refNo), agency: str(payment.agencyCode) });
    out.set(refNo, list);
  }
  return out;
}

/** Open (confirmed, unpaid) invoice balances in USD by B/L / booking reference — Accounts.invoicemaster + invoicedbls. */
function openInvoiceIndex(tables: DashboardTables): Map<string, PendingPayment[]> {
  const out = new Map<string, PendingPayment[]>();
  const blsByInvoice = new Map<string, string[]>();
  for (const r of tables.invoiceBls ?? []) {
    const k = key(r.InvoiceNumber);
    if (!k) continue;
    const list = blsByInvoice.get(k) ?? [];
    list.push(str(r.BLNumber));
    blsByInvoice.set(k, list);
  }
  for (const inv of tables.invoices ?? []) {
    const balance = num(inv.amtbalance);
    if (up(inv.status) !== 'CONFIRM' || !(balance > 0)) continue;
    const roe = num(inv.invroe);
    const usd = up(inv.invcurrency) === 'USD' || !(roe > 0) ? balance : balance / roe;
    const refs = new Set([str(inv.invrefno), ...(blsByInvoice.get(key(inv.invno)) ?? [])].filter(Boolean));
    for (const ref of refs) {
      const list = out.get(key(ref)) ?? [];
      list.push({ amount: Math.round(usd * 100) / 100, refNo: str(inv.invno), agency: str(inv.agencycode) });
      out.set(key(ref), list);
    }
  }
  return out;
}

/** LRP sailing facts for a booking: first ETD / last ETA of booking_leg, else booking polAt / podAt. */
function lrpSailing(tables: DashboardTables, bookNo: string): { etd: Date | null; eta: Date | null } {
  if (!bookNo) return { etd: null, eta: null };
  const legs = (tables.lrpBookingLegs ?? []).filter(l => key(l.book_no) === key(bookNo)).sort((a, b) => num(a.leg_no) - num(b.leg_no));
  if (legs.length) {
    const etds = legs.map(l => asDate(l.etdDate)).filter((d): d is Date => Boolean(d));
    const etas = legs.map(l => asDate(l.etaDate)).filter((d): d is Date => Boolean(d));
    return { etd: etds.length ? new Date(Math.min(...etds.map(Number))) : null, eta: etas.length ? new Date(Math.max(...etas.map(Number))) : null };
  }
  const header = (tables.lrpBookings ?? []).find(b => key(b.book_no) === key(bookNo));
  return { etd: header ? asDate(header.polAt) : null, eta: header ? asDate(header.podAt) : null };
}

/** Shipped-on-board date of the booking's B/L (Documentation.bl.OnboardDate), when a B/L exists. */
function onBoardDate(tables: DashboardTables, bookNo: string, blNo: string): Date | null {
  const bl = (tables.lrpBl ?? []).find(r => (blNo && key(r.bl_no) === key(blNo)) || (bookNo && key(r.book_no) === key(bookNo)));
  return bl ? asDate(bl.OnboardDate) : null;
}

/** Days after arrival without any release evidence after which a shipment is assumed delivered. */
export const DELIVERY_GRACE_DAYS = 30;

/**
 * Has the cargo been released to the consignee? Evidence (enhancedDashboard.jsp "delivered" parity):
 * original B/Ls printed / B/L released (Documentation.bl), a telex release, or a delivery order on an
 * invoice of the B/L (Accounts.invoicemaster.deliveryorderno via invoicedbls).
 */
function isReleased(tables: DashboardTables, bookNo: string, blNo: string): boolean {
  const bl = (tables.lrpBl ?? []).find(r => (blNo && key(r.bl_no) === key(blNo)) || (bookNo && key(r.book_no) === key(bookNo)));
  if (bl && (num(bl.printedOriginals) > 0 || asDate(bl.PrintedDate) || up(bl.isvoyageclosed) === 'Y' || ['I', 'C'].includes(up(bl.status)))) return true;
  const refs = new Set([blNo, str(bl?.bl_no)].filter(Boolean).map(key));
  if (!refs.size) return false;
  const invoiceNos = new Set((tables.invoiceBls ?? []).filter(r => refs.has(key(r.BLNumber))).map(r => key(r.InvoiceNumber)));
  return (tables.invoices ?? []).some(i => (invoiceNos.has(key(i.invno)) || refs.has(key(i.invrefno))) && str(i.deliveryorderno));
}

/** Commodity lines with the TEUs of the container line they belong to (1 TEU when the line is unknown). */
function commodityTeus(commodities: Row[], cargo: Row[]): { name: string; teus: number }[] {
  const cargoByCon = new Map(cargo.map(c => [key(c.conid), c]));
  return commodities
    .map(c => ({ name: str(c.descr), line: cargoByCon.get(key(c.conid)) }))
    .filter(c => c.name)
    .map(c => ({ name: c.name, teus: c.line ? teuOf(c.line) : 1 }));
}

export function buildFacts(tables: DashboardTables, now: Date): BookingFact[] {
  const cargoBy = groupBy(tables.bookingCargo, 'ebookno');
  const legBy = groupBy(tables.bookingLeg, 'ebookno');
  const commodityBy = groupBy(tables.bookingCommodity, 'ebookno');
  const custBy = groupBy(tables.bookingCust, 'ebookno');
  const siBy = liveSiIndex(tables.shippingInstructions);
  const vgmBy = groupBy(tables.vgm.filter(v => ['A', 'C'].includes(up(v.status))), 'book_no');
  const paymentsBy = pendingPaymentIndex(tables);
  const invoicesBy = openInvoiceIndex(tables);

  return tables.bookings
    .filter(b => up(b.ebook_status) !== 'T')
    .map((b): BookingFact => {
      const ebookno = str(b.ebookno);
      const bookNo = str(b.extBookNo);
      const code = up(b.ebook_status);
      const confirmed = code === 'A' || code === 'C';
      const cancelled = code === 'I' || code === 'V';
      const cargo = cargoBy.get(key(ebookno)) ?? [];
      const legs = (legBy.get(key(ebookno)) ?? []).slice().sort((a, c) => num(a.leg_no) - num(c.leg_no));
      const leg = legs[0] ?? null;
      const si = (bookNo ? siBy.get(key(bookNo)) : undefined) ?? siBy.get(key(ebookno)) ?? null;
      const blNo = str(si?.blno);
      const blIssued = Boolean(blNo) && ['A', 'C'].includes(up(si?.status));
      // Sailing dates: e-commerce legs, else the LRP legs / booking header; "shipped on board" from the B/L.
      const lrp = lrpSailing(tables, bookNo);
      const etd = (leg ? asDate(leg.etdDate) : null) ?? lrp.etd;
      const eta = (leg ? asDate(leg.etaDate) : null) ?? lrp.eta;
      const onBoard = onBoardDate(tables, bookNo, blNo);
      const sailed = (onBoard && onBoard <= now) || (etd ? etd <= now : false);
      const arrived = eta ? eta <= now : false;
      // Delivered = arrived and released (B/L printed / released, telex, delivery order), or arrived long ago;
      // arrived but not yet released still counts as in transit (cargo at the discharge port).
      const delivered = arrived && (isReleased(tables, bookNo, blNo) || (+now - +eta!) / DAY_MS > DELIVERY_GRACE_DAYS);
      const lifecycle: Lifecycle | null = !etd && !onBoard ? null : delivered ? 'delivered' : sailed ? 'inTransit' : 'origin';
      // Money due on the shipment: pending online payments plus open invoice balances (by booking / B/L number).
      const payments = [bookNo, ebookno, blNo].filter(Boolean)
        .flatMap(ref => [...(paymentsBy.get(key(ref)) ?? []), ...(invoicesBy.get(key(ref)) ?? [])])
        .filter((p, i, all) => all.findIndex(q => q.refNo === p.refNo && q.amount === p.amount) === i);
      const containers = cargo.reduce((s, c) => s + containersOf(c), 0);
      const vgmOk = bookNo ? (vgmBy.get(key(bookNo)) ?? []).length : 0;
      const created = asDate(b.datecr) ?? now;
      const consignee = (custBy.get(key(ebookno)) ?? []).find(c => up(c.custTypeId) === 'CN');
      return {
        row: b,
        ebookno,
        bookNo,
        code,
        confirmed,
        cancelled,
        active: !cancelled,
        cargo,
        teus: cargo.reduce((s, c) => s + teuOf(c), 0),
        containers,
        dg: cargo.some(c => up(c.dgFlag) === 'Y'),
        reefer: cargo.some(isReefer),
        leg,
        etd,
        eta,
        lifecycle,
        si,
        blNo,
        blIssued,
        payments,
        amtBal: Math.round(payments.reduce((s, p) => s + p.amount, 0) * 100) / 100,
        commodities: commodityTeus(commodityBy.get(key(ebookno)) ?? [], cargo),
        consignee: str(consignee?.name),
        vgmPending: confirmed ? Math.max(0, containers - vgmOk) : 0,
        created,
        updated: asDate(b.dateup) ?? created,
        volumeDate: etd ?? created,
      };
    });
}

// ─── Ongoing transactions + KPI counts (enhancedDashboard.jsp) ───
/** B/L-status column of the ongoing table: V cancelled · D not (re)accepted · I B/L issued · C confirmed. */
function shipmentStatus(f: BookingFact): DashboardShipment['status'] {
  if (f.cancelled) return 'V';
  if (!f.confirmed) return 'D';
  return f.blIssued ? 'I' : 'C';
}

export function buildShipments(facts: BookingFact[], portNames: Map<string, string>): DashboardShipment[] {
  const portDesc = (code: string) => portNames.get(code) ?? code;
  return facts
    .filter(f => f.bookNo)
    .sort((a, b) => +b.updated - +a.updated)
    .map((f): DashboardShipment => {
      const originPortId = up(f.row.originPortId);
      const finalPortId = up(f.row.finalPortId);
      const containerNo = f.cargo.map(c => str(c.containerno)).find(Boolean) ?? '';
      return {
        id: f.ebookno,
        bookNo: f.bookNo,
        blNo: f.blNo,
        onlineRefNo: f.ebookno,
        originPortId,
        originPortDesc: portDesc(originPortId),
        finalPortId,
        finalPortDesc: portDesc(finalPortId),
        polAt: f.etd ? fmtIso(f.etd) : '',
        status: shipmentStatus(f),
        siNo: str(f.si?.eSINo),
        containerNo,
        teus: String(f.teus),
        amtBal: f.amtBal,
        invNo: f.payments[0]?.refNo ?? '',
        invAgency: f.payments[0]?.agency ?? '',
        filterKey: f.cancelled ? 'cancelled' : f.confirmed && f.lifecycle ? f.lifecycle : 'pending',
      };
    });
}

/** Each KPI equals the size of the slice its card filters the table down to. */
export function buildCounts(shipments: DashboardShipment[]): DashboardCounts {
  const byFilter = (k: string) => filterDashboardShipments(shipments, k).length;
  return {
    totCou: shipments.length,
    bkConfirmed: byFilter('bkConfirmed'),
    siPending: byFilter('siPending'),
    payPending: byFilter('payPending'),
    pendingAmount: Math.round(shipments.reduce((s, r) => s + r.amtBal, 0) * 100) / 100,
    orgCou: byFilter('origin'),
    inTransitCou: byFilter('inTransit'),
    delCou: byFilter('delivered'),
  };
}

function countBy<T>(items: T[], keyFn: (item: T) => string): Map<string, number> {
  const out = new Map<string, number>();
  for (const item of items) {
    const k = keyFn(item);
    if (k) out.set(k, (out.get(k) ?? 0) + 1);
  }
  return out;
}
const sortedEntries = (m: Map<string, number>) => [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

/** Status distribution; colour is resolved from theme tokens at render time. */
function statusChart(rows: Row[], column: string, labels: Record<string, string>): BookingStatusChartItem[] {
  return sortedEntries(countBy(rows, r => up(r[column]))).map(([status, count]) => ({
    name: label(labels, status),
    value: count,
    status: label(labels, status),
    count,
    color: '',
  }));
}

// ─── Upcoming shipment planning ──────────────────────────────────
function planningBooking(f: BookingFact, portNames: Map<string, string>): PlanningBookingDTO {
  const port = (code: unknown) => {
    const c = up(code);
    const name = portNames.get(c);
    return name ? `${c} - ${name}` : c;
  };
  const base: BookingListDTO = mapBookingRow(f.row, f.cargo);
  return {
    ...base,
    bookingNo: base.bookingNo || f.ebookno,
    origin: port(f.row.originPortId),
    delivery: port(f.row.finalPortId),
    teusCount: f.teus,
    missingSIFlag: f.confirmed && !f.si,
    pendingPaymentFlag: f.amtBal > 0,
  };
}

function dayCell(bookings: PlanningBookingDTO[]): CalendarDayCell {
  return {
    count: bookings.length,
    missingSI: bookings.filter(b => b.missingSIFlag).length,
    pendingPayment: bookings.filter(b => b.pendingPaymentFlag).length,
    bookings,
  };
}

/** Three calendar weeks from the Monday of the current week; bookings are placed on their ETD day. */
export function buildPlanning(facts: BookingFact[], portNames: Map<string, string>, now: Date, weeks = 3): DashboardPlanning {
  const sailing = facts.filter(f => f.active && f.etd);
  const byDay = new Map<string, PlanningBookingDTO[]>();
  for (const f of sailing.sort((a, b) => +a.etd! - +b.etd!)) {
    const k = fmtIso(f.etd!);
    byDay.set(k, [...(byDay.get(k) ?? []), planningBooking(f, portNames)]);
  }

  const monday = mondayOf(now);
  const calendar: CalendarWeek[] = [];
  let missingSI = 0;
  let atRisk = 0;
  for (let w = 0; w < weeks; w += 1) {
    const start = addDays(monday, w * 7);
    const days = {} as Record<CalendarWeekday, CalendarDayCell>;
    let total = 0;
    let totalMissingSI = 0;
    let totalPendingPayment = 0;
    WEEKDAYS.forEach((day, i) => {
      const cell = dayCell(byDay.get(fmtIso(addDays(start, i))) ?? []);
      days[day] = cell;
      total += cell.count;
      totalMissingSI += cell.missingSI;
      totalPendingPayment += cell.pendingPayment;
    });
    missingSI += totalMissingSI;
    atRisk += totalPendingPayment;
    calendar.push({
      week: `W${isoWeek(start).week}`,
      dateRange: fmtWeekRange(start, addDays(start, 6)),
      days: { ...days, total, totalMissingSI, totalPendingPayment },
    });
  }

  const today = startOfDay(now);
  const horizon = addDays(today, 7);
  const next7 = sailing.filter(f => f.etd! >= today && f.etd! < horizon);
  return {
    kpis: {
      bookingsNext7Days: next7.length,
      feusNext7Days: next7.reduce((s, f) => s + f.teus, 0),
      missingSI,
      atRisk,
    },
    calendar,
  };
}

// ─── Volume analytics ────────────────────────────────────────────
type Granularity = 'week' | 'month' | 'quarter' | 'year';

function periodStart(d: Date, g: Granularity): Date {
  switch (g) {
    case 'week': return mondayOf(d);
    case 'month': return new Date(d.getFullYear(), d.getMonth(), 1);
    case 'quarter': return new Date(d.getFullYear(), Math.floor(d.getMonth() / 3) * 3, 1);
    case 'year': return new Date(d.getFullYear(), 0, 1);
  }
}
function shiftPeriod(start: Date, g: Granularity, n: number): Date {
  switch (g) {
    case 'week': return addDays(start, 7 * n);
    case 'month': return new Date(start.getFullYear(), start.getMonth() + n, 1);
    case 'quarter': return new Date(start.getFullYear(), start.getMonth() + 3 * n, 1);
    case 'year': return new Date(start.getFullYear() + n, 0, 1);
  }
}
function periodLabel(start: Date, g: Granularity): string {
  switch (g) {
    case 'week': return `W${isoWeek(start).week}`;
    case 'month': return `${MONTHS[start.getMonth()]} ${start.getFullYear()}`;
    case 'quarter': return `Q${Math.floor(start.getMonth() / 3) + 1} ${start.getFullYear()}`;
    case 'year': return String(start.getFullYear());
  }
}
const sumTeus = (facts: BookingFact[], from: Date, to: Date) =>
  facts.reduce((s, f) => (f.volumeDate >= from && f.volumeDate < to ? s + f.teus : s), 0);

function stageFacts(facts: BookingFact[], stage: VolumeAnalyticsStage): BookingFact[] {
  switch (stage) {
    case 'all': return facts.filter(f => f.active);
    case 'booking': return facts.filter(f => f.active && f.code !== 'D');
    case 'si': return facts.filter(f => f.active && f.si);
    case 'bl': return facts.filter(f => f.active && f.blNo);
    case 'inTransit': return facts.filter(f => f.active && f.lifecycle === 'inTransit');
  }
}

function volumeKpi(facts: BookingFact[], now: Date, g: Granularity, kpiLabel: string, period: string): VolumeKpi {
  const cur = periodStart(now, g);
  const value = sumTeus(facts, cur, shiftPeriod(cur, g, 1));
  const changePrev = sumTeus(facts, shiftPeriod(cur, g, -1), cur);
  const change = changePrev > 0 ? Math.round(((value - changePrev) / changePrev) * 100) : value > 0 ? 100 : 0;
  const sparkline = Array.from({ length: 10 }, (_, i) => {
    const s = shiftPeriod(cur, g, i - 9);
    return sumTeus(facts, s, shiftPeriod(s, g, 1));
  });
  return { label: kpiLabel, period, value, unit: 'TEUs', change, changePrev, sparkline };
}

function volumeTrend(facts: BookingFact[], now: Date, g: Granularity, points: number): VolumeTrendPoint[] {
  const cur = periodStart(now, g);
  return Array.from({ length: points }, (_, i) => {
    const s = shiftPeriod(cur, g, i - (points - 1));
    return {
      month: periodLabel(s, g),
      feus: sumTeus(facts, s, shiftPeriod(s, g, 1)),
      periodKey: fmtIso(s),
    };
  });
}

function parseIsoLocal(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(+d) ? null : d;
}

function volumeTrendRecords(
  facts: BookingFact[],
  portNames: Map<string, string>,
  g: Granularity,
  periodKey: string,
): VolumeTrendRecord[] {
  const from = parseIsoLocal(periodKey);
  if (!from) return [];
  const to = shiftPeriod(from, g, 1);
  const port = (code: unknown) => {
    const c = up(code);
    if (!c) return '—';
    const name = portNames.get(c);
    return name ? `${c} – ${name}` : c;
  };
  return facts
    .filter((f) => f.volumeDate >= from && f.volumeDate < to)
    .sort((a, b) => +b.volumeDate - +a.volumeDate)
    .map((f) => ({
      id: f.ebookno || f.bookNo || `${f.volumeDate.toISOString()}-${f.teus}`,
      bookingNo: f.bookNo || f.ebookno || '—',
      blNo: f.blNo || '',
      origin: port(f.row.originPortId),
      destination: port(f.row.finalPortId),
      teus: f.teus,
      volumeDate: fmtDay(f.volumeDate),
      status: label(BOOKING_LIST_STATUS, f.code) || f.code || '—',
      consignee: f.consignee || '—',
    }));
}

const TREND_SPEC: Record<VolumeTrendPeriod, { g: Granularity; points: number }> = {
  Weekly: { g: 'week', points: 12 },
  Monthly: { g: 'month', points: 12 },
  Quarterly: { g: 'quarter', points: 8 },
};

export function buildVolumeAnalytics(
  facts: BookingFact[],
  stage: VolumeAnalyticsStage,
  period: VolumeTrendPeriod,
  now: Date,
): VolumeAnalyticsResponse {
  const slice = stageFacts(facts, stage);
  const { week, year } = isoWeek(now);
  const q = Math.floor(now.getMonth() / 3) + 1;
  const spec = TREND_SPEC[period];
  return {
    stage,
    period,
    kpis: [
      volumeKpi(slice, now, 'week', 'This Week', `W${week}, ${year}`),
      volumeKpi(slice, now, 'month', 'This Month', `Month (${MONTHS[now.getMonth()]} ${now.getFullYear()})`),
      volumeKpi(slice, now, 'quarter', 'This Quarter', `Q${q}, ${now.getFullYear()}`),
      volumeKpi(slice, now, 'year', 'This Year', `Year (${now.getFullYear()})`),
    ],
    trend: volumeTrend(slice, now, spec.g, spec.points),
  };
}

/** Volume KPIs + trend for a stage / granularity from the fixtures. */
export function fixtureVolumeAnalytics(
  stage: VolumeAnalyticsStage = 'all',
  period: VolumeTrendPeriod = 'Monthly',
  options: DashboardOptions = {},
): VolumeAnalyticsResponse {
  const tables = options.tables ?? dashboardTables();
  const now = options.now ?? new Date();
  return buildVolumeAnalytics(buildFacts(tables, now), stage, period, now);
}

/** Shipment TEU rows for one volume-trend point (periodKey = local YYYY-MM-DD start). */
export function fixtureVolumeTrendRecords(
  stage: VolumeAnalyticsStage = 'all',
  period: VolumeTrendPeriod = 'Monthly',
  periodKey: string,
  options: DashboardOptions = {},
): VolumeTrendRecord[] {
  const tables = options.tables ?? dashboardTables();
  const now = options.now ?? new Date();
  const facts = stageFacts(buildFacts(tables, now), stage);
  return volumeTrendRecords(
    facts,
    portNameIndex(tables),
    TREND_SPEC[period].g,
    periodKey,
  );
}

// ─── Lanes ───────────────────────────────────────────────────────
const laneKey = (pol: unknown, pod: unknown) => `${up(pol)}|${up(pod)}`;
const splitLane = (k: string) => {
  const [pol, pod] = k.split('|');
  return { pol, pod };
};

export function buildLanes(facts: BookingFact[], tables: DashboardTables): DashboardLanes {
  const active = facts.filter(f => f.active);
  const teusByLane = new Map<string, number>();
  const lastByLane = new Map<string, Date>();
  for (const f of active) {
    const k = laneKey(f.row.originPortId, f.row.finalPortId);
    teusByLane.set(k, (teusByLane.get(k) ?? 0) + f.teus);
    if (!lastByLane.has(k) || lastByLane.get(k)! < f.updated) lastByLane.set(k, f.updated);
  }
  const totalTeus = [...teusByLane.values()].reduce((s, v) => s + v, 0);
  // Full ranked list for View All; cards preview the first rows.
  const top: TopLane[] = sortedEntries(teusByLane).filter(([, v]) => v > 0).map(([k, feus], i) => ({
    rank: i + 1,
    ...splitLane(k),
    feus,
    pctOfTotal: totalTeus ? round1((feus / totalTeus) * 100) : 0,
  }));
  const lastUsed: LastUsedLane[] = [...lastByLane.entries()]
    .sort((a, b) => +b[1] - +a[1])
    .map(([k, d]) => ({ ...splitLane(k), date: fmtLong(d) }));

  // Lanes the customer priced (route searches) but never booked = quiet lanes.
  const booked = new Set(teusByLane.keys());
  const searched = countBy(tables.routeSearchLog, r => laneKey(r.originport, r.destport));
  const contracted: ContractedLane[] = sortedEntries(searched)
    .filter(([k]) => !booked.has(k) && !k.startsWith('|') && !k.endsWith('|'))
    .map(([k]) => ({ ...splitLane(k), lastActivity: null }));
  const quiet = new Set(contracted.map(l => laneKey(l.pol, l.pod)));

  // Lanes carried on the agency's SIs that this customer does not book yet.
  const siLanes = countBy(tables.shippingInstructions, si => laneKey(si.pol, si.pod));
  const opportunities: OpportunityLane[] = sortedEntries(siLanes)
    .filter(([k]) => !booked.has(k) && !quiet.has(k) && !k.startsWith('|') && !k.endsWith('|'))
    .map(([k, n]) => ({ ...splitLane(k), suggestion: n >= 2 ? 'High Potential' : 'Medium Potential' }));

  return { top, lastUsed, contracted, opportunities };
}

// ─── Shipment intelligence ───────────────────────────────────────
function breakdown(facts: BookingFact[], nameOf: (f: BookingFact) => string, top = 50): IntelligenceBreakdown[] {
  const teusBy = new Map<string, number>();
  for (const f of facts) {
    const name = nameOf(f);
    if (name) teusBy.set(name, (teusBy.get(name) ?? 0) + f.teus);
  }
  const total = [...teusBy.values()].reduce((s, v) => s + v, 0);
  const pct = (v: number) => (total ? round1((v / total) * 100) : 0);
  const entries = sortedEntries(teusBy).filter(([, v]) => v > 0);
  const head = entries.slice(0, top).map(([name, feus], i): IntelligenceBreakdown => ({ name, feus, pctOfTotal: pct(feus), tone: TONES[i % TONES.length] }));
  const rest = entries.slice(top).reduce((s, [, v]) => s + v, 0);
  return rest > 0 ? [...head, { name: 'Others', feus: rest, pctOfTotal: pct(rest), tone: 'neutral' }] : head;
}

export function buildIntelligence(facts: BookingFact[], portNames: Map<string, string>): DashboardIntelligence {
  const active = facts.filter(f => f.active);
  const port = (code: unknown) => {
    const c = up(code);
    if (!c) return '';
    const name = portNames.get(c);
    return name ? `${c} – ${name}` : c;
  };
  const breakdowns: IntelligenceBreakdowns = {
    origin: breakdown(active, f => port(f.row.originPortId)),
    pol: breakdown(active, f => port(f.leg?.loadPortId ?? f.row.loadPortId)),
    pod: breakdown(active, f => port(f.leg?.dischargePortId ?? f.row.dischargePortId)),
    pickup: breakdown(active, f => str(f.leg?.loadTerminal) || port(f.row.loadPortId)),
    consignee: breakdown(active, f => f.consignee),
    destination: breakdown(active, f => port(f.row.finalPortId)),
  };
  const consignees: TopConsignee[] = breakdown(active, f => f.consignee)
    .filter(b => b.tone !== 'neutral')
    .map((b, i) => ({ ...b, tone: (['primary', 'success', 'warning', 'purple', 'error'] as DashboardBreakdownTone[])[i % 5] }));

  const confirmed = active.filter(f => f.confirmed);
  const transit = confirmed.filter(f => f.etd && f.eta).map(f => (+f.eta! - +f.etd!) / DAY_MS);
  const teus = active.reduce((s, f) => s + f.teus, 0);
  const share = (pick: (f: BookingFact) => boolean) => (teus ? round1((active.filter(pick).reduce((s, f) => s + f.teus, 0) / teus) * 100) : 0);
  const teusByCommodity = new Map<string, number>();
  for (const f of active) {
    for (const c of f.commodities) {
      const k = key(c.name);
      teusByCommodity.set(k, (teusByCommodity.get(k) ?? 0) + c.teus);
    }
  }
  const stats: ShipmentIntelligenceStats = {
    shipments: active.length,
    containers: active.reduce((s, f) => s + f.containers, 0),
    teus,
    avgTransitDays: transit.length ? round1(transit.reduce((s, d) => s + d, 0) / transit.length) : 0,
    dgSharePct: share(f => f.dg),
    reeferSharePct: share(f => f.reefer),
    vgmPending: active.reduce((s, f) => s + f.vgmPending, 0),
    topCommodities: sortedEntries(teusByCommodity).slice(0, 5).map(([name, t]) => ({ name: titleCase(name), teus: t })),
  };
  return { breakdowns, consignees, stats };
}

// ─── Rocket layout data ──────────────────────────────────────────
const usd = (n: number) => `USD ${Math.round(n).toLocaleString('en-US')}`;

export function buildStatCards(facts: BookingFact[], tables: DashboardTables, now: Date): DashboardStatCard[] {
  const active = facts.filter(f => f.active);
  const weekAgo = addDays(now, -7);
  const weekAhead = addDays(now, 7);
  const openBookings = active.filter(f => f.lifecycle !== 'delivered');
  const inTransit = active.filter(f => f.lifecycle === 'inTransit');
  const arriving = inTransit.filter(f => f.eta && f.eta <= weekAhead);
  const siPending = active.filter(f => f.confirmed && !f.si);
  const blPending = active.filter(f => f.si && !f.blIssued);
  const vgmPending = active.reduce((s, f) => s + f.vgmPending, 0);
  const pending = tables.payments.filter(p => PENDING_PAYMENT_STATUSES.has(up(p.status)));
  const outstanding = pending.reduce((s, p) => s + num(p.amountUsd), 0);
  return [
    {
      key: 'activeBookings',
      label: 'Active Bookings',
      value: String(openBookings.length),
      subtitle: `+${active.filter(f => f.created >= weekAgo).length} this week`,
    },
    {
      key: 'inTransit',
      label: 'Shipments In Transit',
      value: String(inTransit.length),
      subtitle: `${arriving.length} arriving this week`,
    },
    {
      key: 'pendingSiBl',
      label: 'Pending SI / BL',
      value: String(siPending.length + blPending.length),
      subtitle: `${vgmPending} VGM pending`,
    },
    {
      key: 'outstanding',
      label: 'Outstanding Invoices',
      value: usd(outstanding),
      subtitle: `${pending.length} payments pending`,
    },
  ];
}

export function quickActionCounts(facts: BookingFact[], tables: DashboardTables, now: Date): Record<string, number> {
  const active = facts.filter(f => f.active);
  const monthAgo = addDays(now, -30);
  return {
    newBooking: active.filter(f => f.code === 'D').length,
    trackShipment: active.filter(f => f.lifecycle === 'inTransit').length,
    requestRate: tables.routeSearchLog.filter(r => (asDate(r.crDate) ?? monthAgo) >= monthAgo).length,
    submitSi: active.filter(f => f.confirmed && !f.si).length,
  };
}

function recentStatus(f: BookingFact): RecentBookingStatus {
  if (!f.confirmed) return 'Pending';
  if (f.lifecycle === 'delivered') return 'Completed';
  if (f.lifecycle === 'inTransit') return 'In Transit';
  if (f.blIssued) return 'B/L Issued';
  return f.si ? 'Confirmed' : 'SI Pending';
}

/** Newest live bookings; cancelled / rejected ones have no status in the row model and are left out. */
export function buildRecentBookings(facts: BookingFact[], portNames: Map<string, string>, limit = 7): RecentBookingRow[] {
  return facts
    .filter(f => f.active)
    .sort((a, b) => +b.updated - +a.updated)
    .slice(0, limit)
    .map((f): RecentBookingRow => {
      const pol = up(f.leg?.loadPortId ?? f.row.loadPortId ?? f.row.originPortId);
      const pod = up(f.leg?.dischargePortId ?? f.row.dischargePortId ?? f.row.finalPortId);
      return {
        id: f.ebookno,
        bookingNo: f.bookNo || f.ebookno,
        vessel: vesselName(str(f.leg?.vesselCode)) || '—',
        voyage: str(f.leg?.voyageCode) || '—',
        pol,
        polName: portNames.get(pol) ?? pol,
        pod,
        podName: portNames.get(pod) ?? pod,
        etd: f.etd ? fmtDay(f.etd) : '—',
        status: recentStatus(f),
      };
    });
}

// TODO(fixtures): no DB source — the port/terminal cut-off defaults to 48h when ecom_cutoffconfig has no row.
const DEFAULT_CUTOFF_HOURS = 48;

function cutoffHours(tables: DashboardTables, port: string, terminal: string): number {
  const rows = tables.cutoffConfig.filter(c => up(c.port) === port);
  const match = rows.find(c => up(c.terminal) === terminal) ?? rows.find(c => up(c.terminal) === 'ALL');
  return num(match?.docclosing) || DEFAULT_CUTOFF_HOURS;
}

/**
 * Distinct vessel calls the customer's live bookings sail on, from today onwards. Vessel / service / port
 * codes are shown as their master names (ScheduleItem-style labels); the code stays when the master lacks it.
 */
export function buildUpcomingSchedules(facts: BookingFact[], tables: DashboardTables, now: Date, limit = 5, portNames: Map<string, string> = portNameIndex(tables)): UpcomingScheduleItem[] {
  const today = startOfDay(now);
  const seen = new Set<string>();
  return facts
    .filter(f => f.active && f.leg && f.etd && f.etd >= today)
    .sort((a, b) => +a.etd! - +b.etd!)
    .flatMap((f): UpcomingScheduleItem[] => {
      const leg = f.leg!;
      const pol = up(leg.loadPortId);
      const pod = up(leg.dischargePortId);
      const id = [str(leg.vesselCode), str(leg.voyageCode), pol, pod, fmtIso(f.etd!)].join('|');
      if (seen.has(id)) return [];
      seen.add(id);
      const cutoff = new Date(+f.etd! - cutoffHours(tables, pol, up(leg.loadTerminal)) * 3_600_000);
      return [{
        id,
        vessel: vesselName(str(leg.vesselCode)) || '—',
        voyage: str(leg.voyageCode) || '—',
        service: serviceName(str(leg.serviceCode)) || '—',
        pol: portNames.get(pol) ?? pol,
        pod: portNames.get(pod) ?? pod,
        etd: fmtDay(f.etd!),
        cutoff: fmtDay(cutoff),
        cutoffOverdue: cutoff < now,
      }];
    })
    .slice(0, limit);
}

/** Notices (Ecom_Notice), customer advisories and broadcast notifications merged newest first. */
export function buildNotices(tables: DashboardTables, limit = 6): NoticeItem[] {
  const firstLine = (v: unknown) => str(v).split(/\r?\n/).find(Boolean) ?? '';
  const items: (NoticeItem & { at: Date })[] = [
    ...tables.notices.map(n => ({
      id: `notice-${n.id}`,
      title: str(n.Title),
      body: str(n.FileName) ? `Attachment: ${str(n.FileName).replace(/^\d+~/, '')}` : '',
      at: asDate(n.CrDate) ?? new Date(0),
    })),
    ...tables.advisories.filter(a => up(a.status) !== 'I').map(a => ({
      id: `advisory-${a.id}`,
      title: str(a.advisoryname),
      body: firstLine(a.description),
      at: asDate(a.createddate) ?? new Date(0),
    })),
    ...tables.notificationMaster.filter(n => up(n.status) !== 'I').map(n => ({
      id: `notification-${n.id}`,
      title: `Notification ${str(n.msgid)}`,
      body: str(n.message),
      at: asDate(n.crdate) ?? new Date(0),
    })),
  ].map(i => ({ ...i, date: fmtDay(i.at) }));
  return items
    .filter(i => i.title)
    .sort((a, b) => +b.at - +a.at)
    .slice(0, limit)
    .map(({ at: _at, ...item }) => item);
}

// ─── Summary ─────────────────────────────────────────────────────
export function fixtureDashboardSummary(options: DashboardOptions = {}): DashboardSummaryResponse {
  const tables = options.tables ?? dashboardTables();
  const now = options.now ?? new Date();
  const facts = buildFacts(tables, now);
  const portNames = portNameIndex(tables);
  const shipments = buildShipments(facts, portNames);
  const active = facts.filter(f => f.active);
  const confirmedShipments = shipments.filter(s => s.status === 'C' || s.status === 'I');
  const arrived = confirmedShipments.filter(s => s.filterKey === 'delivered');
  const liveSis = tables.shippingInstructions.filter(si => num(si.editbl) === 0);
  const counts = quickActionCounts(facts, tables, now);
  const pendingTotal = tables.payments
    .filter(p => PENDING_PAYMENT_STATUSES.has(up(p.status)))
    .reduce((s, p) => s + num(p.amountUsd), 0);

  return {
    counts: buildCounts(shipments),
    shipments,
    bookingChart: statusChart(tables.bookings.filter(b => up(b.ebook_status) !== 'T'), 'ebook_status', BOOKING_LIST_STATUS),
    siChart: statusChart(liveSis, 'status', SI_STATUS),
    blChart: statusChart(liveSis.filter(si => str(si.blno)), 'status', SI_STATUS),
    topDestinations: sortedEntries(countBy(active, f => up(f.row.finalPortId))).slice(0, 5)
      .map(([port, count]): TopDestinationItem => ({ port, count })),
    portPairs: sortedEntries(countBy(active, f => laneKey(f.row.originPortId, f.row.finalPortId))).slice(0, 5)
      .map(([k, count]): PortPairChartItem => ({ ...splitLane(k), count })),
    unclearedCargo: sortedEntries(countBy(arrived, s => s.finalPortId))
      .map(([port, count]): UnclearedCargoItem => ({ port, count })),
    unclearedDelivered: arrived.filter(s => s.status === 'I').length,
    unclearedRemaining: arrived.filter(s => s.status !== 'I').length,
    outstandingBalance: Math.round(pendingTotal * 100) / 100,
    planning: buildPlanning(facts, portNames, now),
    lanes: buildLanes(facts, tables),
    intelligence: buildIntelligence(facts, portNames),
    stats: buildStatCards(facts, tables, now),
    quickActions: (options.quickActions ?? []).map(a => ({ ...a, count: counts[a.key] ?? 0 })),
    recentBookings: buildRecentBookings(facts, portNames),
    upcomingSchedules: buildUpcomingSchedules(facts, tables, now, 5, portNames),
    notices: buildNotices(tables),
  };
}

// ─── Export report (POST /api/v1/dashboard/export) ───────────────
export interface DashboardReportArgs {
  reportTitle: string;
  activeFilter?: string | null;
  generatedBy?: string;
  tenantName?: string;
}

function shipmentStatusLabel(status: DashboardShipment['status']): string {
  switch (status) {
    case 'C': return 'Confirmed';
    case 'I': return 'B/L Issued';
    case 'D': return 'Draft';
    case 'V': return 'Cancelled';
    default: return status;
  }
}

const pctText = (n: number) => `${n.toFixed(1)}%`;

/** Assembles a DashboardReport from the same fixture-derived summary + KPI filter. */
export function fixtureDashboardReport(
  { reportTitle, activeFilter = 'all', generatedBy = 'Portal User', tenantName = 'E-com Portal' }: DashboardReportArgs,
  options: DashboardOptions = {},
): DashboardReport {
  const tables = options.tables ?? dashboardTables();
  const now = options.now ?? new Date();
  const summary = fixtureDashboardSummary({ ...options, tables, now });
  const volume = fixtureVolumeAnalytics('all', 'Monthly', { tables, now });
  const filterKey = activeFilter || 'all';
  const filtered = filterDashboardShipments(summary.shipments, filterKey);
  const filterLabel = getDashboardFilterLabel(filterKey);
  const { counts, lanes, intelligence } = summary;
  const { stats } = intelligence;

  return {
    title: reportTitle.trim() || 'Dashboard Report',
    generatedAt: now.toISOString(),
    generatedBy,
    tenantName,
    appliedFilters: [
      { label: 'KPI filter', value: filterLabel },
      { label: 'Shipments', value: `${filtered.length} of ${summary.shipments.length}` },
    ],
    sections: [
      {
        id: 'shipmentKpis',
        type: 'KPI',
        title: 'Shipment overview',
        description: 'Key operational counts from the enhanced dashboard.',
        items: [
          { label: 'Total shipments', value: String(counts.totCou) },
          { label: 'Booking confirmed', value: String(counts.bkConfirmed) },
          { label: 'SI pending', value: String(counts.siPending) },
          { label: 'Payment pending', value: String(counts.payPending) },
          { label: 'At origin', value: String(counts.orgCou) },
          { label: 'In transit', value: String(counts.inTransitCou) },
          { label: 'Delivered', value: String(counts.delCou) },
          { label: 'Pending amount', value: `$${counts.pendingAmount.toLocaleString()}` },
        ],
      },
      {
        id: 'ongoingTransactions',
        type: 'TABLE',
        title: 'Ongoing transactions',
        description: filterKey === 'all' ? 'All ongoing shipments.' : `Filtered by: ${filterLabel}.`,
        columns: [
          { key: 'bookNo', label: 'Booking' },
          { key: 'blNo', label: 'B/L' },
          { key: 'route', label: 'Route' },
          { key: 'polAt', label: 'Departure' },
          { key: 'status', label: 'Status' },
          { key: 'teus', label: 'TEUs', align: 'RIGHT' },
          { key: 'amtBal', label: 'Balance', align: 'RIGHT' },
        ],
        rows: filtered.map(row => ({
          bookNo: row.bookNo,
          blNo: row.blNo || '—',
          route: `${row.originPortId} → ${row.finalPortId}`,
          polAt: row.polAt || '—',
          status: shipmentStatusLabel(row.status),
          teus: row.teus,
          amtBal: row.amtBal > 0 ? `$${row.amtBal.toLocaleString()}` : '—',
        })),
        footnote: filtered.length === 0 ? 'No shipments match the current filter.' : null,
      },
      {
        id: 'volumeKpis',
        type: 'KPI',
        title: 'Volume (TEUs)',
        items: volume.kpis.map(kpi => ({
          label: kpi.label,
          value: `${kpi.value} ${kpi.unit}`,
          delta: `${kpi.change > 0 ? '+' : ''}${kpi.change}%`,
          deltaDirection: kpi.change > 0 ? 'UP' : kpi.change < 0 ? 'DOWN' : 'FLAT',
        })),
      },
      {
        id: 'volumeTrend',
        type: 'CHART',
        title: 'Volume trend',
        description: 'Monthly TEU volume.',
        chartType: 'LINE',
        categories: volume.trend.map(p => p.month),
        series: [{ name: 'TEUs', data: volume.trend.map(p => p.feus) }],
        valueSuffix: null,
      },
      {
        id: 'topLanes',
        type: 'TABLE',
        title: 'Top active lanes',
        columns: [
          { key: 'rank', label: '#', align: 'RIGHT' },
          { key: 'lane', label: 'Lane' },
          { key: 'feus', label: 'TEUs', align: 'RIGHT' },
          { key: 'pct', label: '% of total', align: 'RIGHT' },
        ],
        rows: lanes.top.map(lane => ({
          rank: lane.rank,
          lane: `${lane.pol} → ${lane.pod}`,
          feus: lane.feus,
          pct: pctText(lane.pctOfTotal),
        })),
      },
      {
        id: 'topConsignees',
        type: 'TABLE',
        title: 'Top consignees',
        columns: [
          { key: 'name', label: 'Consignee' },
          { key: 'feus', label: 'TEUs', align: 'RIGHT' },
          { key: 'pct', label: '% of total', align: 'RIGHT' },
        ],
        rows: intelligence.consignees.map(c => ({ name: c.name, feus: c.feus, pct: pctText(c.pctOfTotal) })),
      },
      {
        id: 'lanesChart',
        type: 'CHART',
        title: 'Top lanes by TEU',
        chartType: 'BAR',
        categories: lanes.top.map(l => `${l.pol}-${l.pod}`),
        series: [{ name: 'TEUs', data: lanes.top.map(l => l.feus) }],
      },
      {
        id: 'shipmentIntelligence',
        type: 'KPI',
        title: 'Shipment intelligence',
        description: 'Derived from booking legs, cargo and commodities.',
        items: [
          { label: 'Average transit', value: `${stats.avgTransitDays} days` },
          { label: 'DG share', value: pctText(stats.dgSharePct) },
          { label: 'Reefer share', value: pctText(stats.reeferSharePct) },
          { label: 'VGM pending', value: String(stats.vgmPending) },
          { label: 'Top commodity', value: stats.topCommodities[0]?.name ?? '—' },
        ],
      },
    ],
  };
}
