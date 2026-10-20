// Modified by Sekar Nagarajan (2026-10-17 03:05)
/**
 * In-memory "database" for the fixture-backed MSW handlers.
 *
 * Every fixture in ../fixtures/*.json becomes a table keyed by file name (bookings, siCargo, users, …).
 * The fixtures are written by apps/ecom-portal/mock-data (`npm run dump`): the top rows of every table
 * of the e-commerce database, anonymised. Handlers read and mutate these arrays, so the demo is
 * stateful (create a booking → it shows up in the list). Booking mutations are also mirrored to
 * mock-data/runtime/ via booking-persistence so they survive refresh. resetDb() restores the
 * pristine fixtures; rehydrateBookingDb() re-applies the runtime overlay on mock boot.
 *
 * Column names are exactly what SQL Server returned (`agencyRefNo`, `Datecr`, `eSINo`, …). Rows are
 * wrapped so property access is CASE-INSENSITIVE: `row.AgencyRefNo`, `row.agencyrefno` and
 * `row.agencyRefNo` all read the same column. Spreading a row (`{ ...row }`) yields a plain object
 * with the original keys.
 */

/** Schema-less SQL rows straight from the dump; column names are whatever the SELECT returned. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Row = Record<string, any>;

const modules = import.meta.glob('../fixtures/*.json', { eager: true, import: 'default' }) as Record<string, Row[]>;

function fileName(p: string) {
  return p.replace(/^.*\//, '').replace(/\.json$/, '');
}

const pristine: Record<string, Row[]> = {};
for (const [p, rows] of Object.entries(modules)) {
  const name = fileName(p);
  if (name.startsWith('_')) continue; // _manifest.json
  pristine[name] = Array.isArray(rows) ? rows : [];
}

/**
 * Table names the handlers reference, so they exist (possibly empty) even when the dump skipped them.
 * Any other fixture file is loaded under its own name as well (db['EcommuserlogDetails']).
 */
export const KNOWN_TABLES = [
  // master data, schedules, vessel particulars (extract.masters.config.js → Masters / VSS)
  'ports', 'countries', 'commodities', 'packages', 'services', 'vessels', 'terminals', 'equipments',
  'transportServices', 'depots', 'inTransitPods', 'states', 'portCountryMap', 'carriers', 'shipmentTerms', 'charges',
  'schedules', 'portCalls',
  // LRP documentation for the sampled shipments (Documentation): tracking, B/L facts
  'lrpBookings', 'lrpBookingLegs', 'lrpBookingCargo', 'lrpBookingCust', 'lrpBl', 'lrpBlCargo', 'lrpBlCust', 'telexReleases', 'containerMoves',
  // routing & tariffs (Commercial), invoices & receipts (Accounts), import documentation (Imports)
  'routes', 'tariffs', 'lclTariffs', 'contracts', 'contractLines', 'contractSurcharges', 'contractRouting', 'contractCustomers', 'contractCommodities',
  'invoices', 'invoiceBls', 'invoiceCharges', 'receipts', 'receiptAllocations',
  'arrivalNotices', 'deliveryOrderVersions',
  // portal config & content
  'menus', 'menuTree', 'adminMenus', 'messages', 'messagesLang', 'languages', 'advisories', 'loginImages', 'hotlineContacts',
  'cutoffConfig', 'notices', 'notificationMaster', 'notificationDetails', 'notificationSettings', 'customerNotifications',
  'globalConfig', 'configuration', 'settings', 'lookups', 'fieldConfig', 'emailTemplates', 'statusDescriptions',
  'trackingMovementCodes', 'serviceRestrictions', 'serviceConfig', 'vendorModuleMapping', 'cargoProtectRestrictions',
  'videoHelp', 'activities', 'modules', 'kycConfig',
  // customers & users
  'activeCustomers', 'customerMaster', 'customerMapping', 'customerUsers', 'users', 'userDetails', 'customerMenus',
  'userMenuAccess', 'mailAlerts', 'adminUsers', 'adminUserAccounts',
  // bookings
  'bookings', 'bookingCust', 'bookingCargo', 'bookingCommodity', 'bookingDg', 'bookingOog', 'bookingRefer',
  'bookingLeg', 'bookingHaulage', 'bookingConf', 'bookingFiles', 'bookingIcs', 'bookingCancel', 'bookingReference',
  'bookingSummary', 'insurance', 'insuranceSurvey',
  // shipping instructions & B/L
  'shippingInstructions', 'siCust', 'siCargo', 'siCommodity', 'siDg', 'siOog', 'siReefer', 'siCharges',
  'siFiles', 'siIcs', 'siPayers', 'siReference', 'siRequestMaster', 'siSummary', 'siLocks', 'blSummary',
  // VGM & payments
  'vgm', 'payments', 'paymentReferences',
] as const;

export type KnownTable = (typeof KNOWN_TABLES)[number];
/** A known table, or any other fixture file name. */
export type TableName = KnownTable | (string & {});

export const db = {} as Record<KnownTable, Row[]> & Record<string, Row[]>;

/** Session-only state that is not part of any fixture. */
export const session = {
  readNotifications: new Set<string>(),
};

/**
 * Wraps a row so property access ignores case. The underlying object keeps the original column
 * names, so JSON.stringify / spread / Object.keys behave normally.
 */
export function ciRow(row: Row): Row {
  let index: Record<string, string> | null = null;
  const keyFor = (p: string): string | undefined => {
    if (p in row) return p;
    index ??= Object.fromEntries(Object.keys(row).map(k => [k.toLowerCase(), k]));
    return index[p.toLowerCase()];
  };
  return new Proxy(row, {
    get: (t, p) => (typeof p === 'string' ? t[keyFor(p) ?? p] : (t as Row)[p as never]),
    has: (t, p) => (typeof p === 'string' ? keyFor(p) !== undefined : p in t),
    set: (t, p, v) => {
      if (typeof p === 'string') {
        const k = keyFor(p) ?? p;
        t[k] = v;
        if (index && k === p) index[p.toLowerCase()] = p;
      } else {
        (t as Row)[p as never] = v;
      }
      return true;
    },
    deleteProperty: (t, p) => {
      const k = typeof p === 'string' ? keyFor(p) : undefined;
      if (k !== undefined) { delete t[k]; index = null; }
      return true;
    },
  });
}

export function resetDb() {
  for (const k of Object.keys(db)) delete db[k];
  const names = new Set<string>([...KNOWN_TABLES, ...Object.keys(pristine)]);
  for (const name of names) {
    db[name] = structuredClone(pristine[name] ?? []).map(ciRow);
  }
  session.readNotifications.clear();
}
resetDb();

/** true when the dump produced at least one row for the table. */
export const hasFixtures = (table: TableName) => (db[table]?.length ?? 0) > 0;

/** Names of every table that currently holds rows. */
export const loadedTables = () => Object.keys(db).filter(k => db[k].length > 0).sort();

/** Generates demo reference numbers such as EBK260001, ESI260002, VGM260003. */
const counters: Record<string, number> = {};

/** Snapshot of nextRef counters (for mock-data/runtime persistence). */
export function getRefCounters(): Record<string, number> {
  return { ...counters };
}

/** Restore nextRef counters after rehydrate (max with existing so ids never go backwards). */
export function setRefCounters(next: Record<string, number> | undefined | null) {
  if (!next) return;
  for (const [prefix, value] of Object.entries(next)) {
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0) continue;
    counters[prefix] = Math.max(counters[prefix] ?? 0, Math.floor(n));
  }
}

export function nextRef(prefix: string) {
  counters[prefix] = (counters[prefix] ?? 0) + 1;
  const yy = String(new Date().getFullYear()).slice(-2);
  return `${prefix}${yy}${String(counters[prefix]).padStart(4, '0')}`;
}

/** Case-insensitive equality for codes and reference numbers. */
export const eq = (a: unknown, b: unknown) =>
  String(a ?? '').trim().toLowerCase() === String(b ?? '').trim().toLowerCase();

/** Rows of `table` whose `column` equals `value` (case-insensitive). */
export function childRows(table: TableName, column: string, value: unknown) {
  return (db[table] ?? []).filter(r => eq(r[column], value));
}

/** Newest-first comparator on a date column. */
export const newestFirst = (column: string) => (a: Row, b: Row) => +new Date(b[column]) - +new Date(a[column]);

export const nowIso = () => new Date().toISOString();
