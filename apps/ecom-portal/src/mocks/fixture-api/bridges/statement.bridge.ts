// Modified by Sekar Nagarajan (2026-10-17 00:20)
/**
 * Customer statement (INVOICE engine) derived from the Accounts fixtures:
 *   invoices (invoicemaster)            posted debits / credits, due dates, ROE → USD
 *   invoiceCharges (invoicedetail)      charge lines, B/L + container per charge, itmtotallocalinusd
 *   invoiceBls (invoicedbls)            invoice → B/L numbers
 *   receipts (receiptmaster)            credits; receiptAllocations (receiptdetail) say which invoices they settle
 *   payments + paymentReferences        completed online card payments that never reached receiptmaster
 *   customerMapping / customerMaster    login customer → accounting ("AP") customer codes and their names
 *
 * Everything is a pure function of a `StatementTables` bag (defaults to `db`) and an injectable `now`,
 * so the unit tests feed inline rows and a fixed clock. Nothing here touches MSW.
 *
 * Model
 *  - An account is one (customer code, currency) pair; the login code comes first, then every active
 *    APcustCode mapped to it. Codes without posted documents still get one account in their master
 *    currency (USD when blank) so the picker shows the whole relationship.
 *  - Statement currency USD is the reporting currency: every posted document is converted to USD
 *    (invoice: Σ itmtotallocalinusd, else invamount / invroe; receipt: rectamtinusd). Any other
 *    currency lists only the documents issued in that currency, at face value.
 *  - Debit = positive amount (invoice, debit note, positive adjustment); credit = negative amount
 *    (receipt, credit note, negative adjustment). Opening = Σ before the period, running balance per
 *    line, closing = opening + net. Money is summed in integer cents and emitted as decimal strings.
 *  - Only CONFIRM invoices and receiptstatus A receipts post. The extract holds the newest invoices only,
 *    so a receipt posts for the part allocated (receiptdetail) to invoices that are in the ledger plus
 *    its unapplied ExcessAmt; an online payment posts for its INV references that are in the ledger and
 *    is skipped when receiptmaster already books it (same USD amount within a day).
 *  - Ageing buckets (0-30 / 31-60 / 61-90 / 90+ days past invduedate) over the outstanding amtbalance.
 */
import type {
  AccountOption,
  StatementCriteria,
  StatementDTO,
  StatementDocType,
  StatementLine,
} from '../../../features/customer-statement/types/customer-statement.types';
import { db, eq, type Row } from '../db';
import { chargeName, customerName, customerRow, portLabel, vesselName } from './masters.bridge';
import { currentCustomerCode, currentFixtureUser } from './user.bridge';

export const REPORTING_CURRENCY = 'USD';
export const AGEING_BUCKETS = ['0-30', '31-60', '61-90', '90+'] as const;
export type AgeingBucket = (typeof AGEING_BUCKETS)[number];

export interface StatementTables {
  invoices: Row[];
  invoiceCharges: Row[];
  invoiceBls: Row[];
  receipts: Row[];
  receiptAllocations: Row[];
  payments: Row[];
  paymentReferences: Row[];
  customerMapping: Row[];
  customerMaster: Row[];
  lrpBlCargo: Row[];
}

export const emptyStatementTables = (): StatementTables => ({
  invoices: [], invoiceCharges: [], invoiceBls: [], receipts: [], receiptAllocations: [],
  payments: [], paymentReferences: [], customerMapping: [], customerMaster: [], lrpBlCargo: [],
});

/** Live fixture tables (read at call time so resetDb() is honoured). */
export const statementTables = (): StatementTables => ({
  invoices: db.invoices, invoiceCharges: db.invoiceCharges, invoiceBls: db.invoiceBls, receipts: db.receipts,
  receiptAllocations: db.receiptAllocations, payments: db.payments, paymentReferences: db.paymentReferences,
  customerMapping: db.customerMapping, customerMaster: db.customerMaster, lrpBlCargo: db.lrpBlCargo,
});

// ─── money helpers ───────────────────────────────────────────────────────────

const text = (v: unknown) => String(v ?? '').trim();
const num = (v: unknown) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
export const toCents = (amount: number) => Math.round(amount * 100);

/** 1234567 → "12345.67", -50 → "-0.50" (the decimal-string contract of StatementDTO). */
export function centsToDecimalString(cents: number): string {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  return `${sign}${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, '0')}`;
}

/** ISO instant / SQL date → "YYYY-MM-DD" ('' when not a date). */
export function ymd(value: unknown): string {
  if (value == null || value === '') return '';
  const d = new Date(value as string);
  return Number.isNaN(+d) ? '' : d.toISOString().slice(0, 10);
}

// ─── accounts ────────────────────────────────────────────────────────────────

/** Login customer code + every active APcustCode mapped to it (ecom_customermapping), de-duplicated. */
export function accountCodes(loginCode: string, mapping: Row[]): string[] {
  const codes = [text(loginCode)];
  for (const m of mapping) {
    if (!eq(m.LoginCustCode, loginCode)) continue;
    if (text(m.Status) && !eq(m.Status, 'A')) continue;
    const ap = text(m.APcustCode);
    if (ap && !codes.some(c => eq(c, ap))) codes.push(ap);
  }
  return codes;
}

export const statementAccountId = (code: string, currency: string) => `${code}-${currency.toUpperCase()}`;

/** CustomerMaster name → invoice / receipt custname → portal company name → the code itself. */
export function accountDisplayName(code: string, t: StatementTables, fallbackCompany = ''): string {
  const master = text(t.customerMaster.find(r => eq(r.CustCode, code))?.CustName);
  if (master) return master;
  const onInvoice = text(t.invoices.find(r => eq(r.custcode, code))?.custname);
  if (onInvoice) return onInvoice;
  const onReceipt = text(t.receipts.find(r => eq(r.CustCode, code))?.CustName);
  return onReceipt || text(fallbackCompany) || code;
}

/** Currencies the code has posted documents in — USD first, then by document count; master currency / USD when none. */
export function accountCurrencies(code: string, t: StatementTables): string[] {
  const counts = new Map<string, number>();
  for (const d of postedDocuments(code, t)) counts.set(d.currency, (counts.get(d.currency) ?? 0) + 1);
  if (!counts.size) {
    return [text(t.customerMaster.find(r => eq(r.CustCode, code))?.currency).toUpperCase() || REPORTING_CURRENCY];
  }
  return [...counts.entries()]
    .sort((a, b) => (a[0] === REPORTING_CURRENCY ? -1 : b[0] === REPORTING_CURRENCY ? 1 : b[1] - a[1] || a[0].localeCompare(b[0])))
    .map(([c]) => c);
}

export function statementAccounts(loginCode: string, t: StatementTables, fallbackCompany = ''): AccountOption[] {
  const out: AccountOption[] = [];
  for (const code of accountCodes(loginCode, t.customerMapping)) {
    const name = `${accountDisplayName(code, t, fallbackCompany)} · ${code}`;
    for (const currency of accountCurrencies(code, t)) {
      out.push({ accountId: statementAccountId(code, currency), name, currency });
    }
  }
  return out;
}

export interface ResolvedAccount { code: string; name: string; currency: string }

/** The customer code behind an accountId ("20001374-USD"); null when it is not one of the user's accounts. */
export function resolveStatementAccount(accountId: string, accounts: AccountOption[]): ResolvedAccount | null {
  const match = accounts.find(a => a.accountId === accountId);
  if (!match) return null;
  const code = match.accountId.slice(0, match.accountId.length - match.currency.length - 1);
  return { code, name: match.name, currency: match.currency };
}

// ─── posted documents ────────────────────────────────────────────────────────

export interface LedgerDoc {
  kind: 'invoice' | 'receipt' | 'payment';
  docType: StatementDocType;
  docNo: string;
  /** YYYY-MM-DD posting date. */
  date: string;
  /** YYYY-MM-DD due date (invoices); '' otherwise. */
  dueDate: string;
  reference: string;
  /** Native currency of the document. */
  currency: string;
  /** Signed native amount in cents: + debit, − credit. */
  cents: number;
  /** Signed reporting-currency (USD) amount in cents. */
  usdCents: number;
  /** Still-open native amount in cents (invoices only). */
  outstandingCents: number;
  outstandingUsdCents: number;
}

/** invoicemaster.invtype / amount sign → statement document type. */
export function classifyInvoice(row: Row): StatementDocType {
  const type = text(row.invtype).toUpperCase();
  const amount = num(row.invamount);
  if (type.startsWith('ADJUSTMENT')) return 'Adjustment';
  if (type === 'BOUNCE') return 'DebitNote';
  if (type === 'PRICEREDUCTIONINVOICE' || amount < 0) return 'CreditNote';
  return 'Invoice';
}

/** CONFIRM(ed) invoices only — VOID and DRAFT never post to the customer's ledger. */
export const isPostedInvoice = (row: Row) => eq(row.status, 'CONFIRM');
/** receiptstatus A — V (void) and D rows are excluded. */
export const isPostedReceipt = (row: Row) => eq(row.receiptstatus, 'A') && num(row.ReceiptAmt) !== 0;

/** B/L numbers of an invoice: invoicedbls first, then the distinct blnumber of its charge lines. */
export function invoiceBlNumbers(invno: string, t: StatementTables): string[] {
  const out: string[] = [];
  const add = (v: unknown) => { const s = text(v); if (s && s !== '-' && !out.some(x => eq(x, s))) out.push(s); };
  for (const b of t.invoiceBls) if (eq(b.InvoiceNumber, invno)) add(b.BLNumber);
  if (!out.length) for (const c of t.invoiceCharges) if (eq(c.invno, invno)) add(c.blnumber);
  return out;
}

/**
 * Signed USD value of an invoice: the ledger's own Σ itmtotallocalinusd when charge lines exist,
 * otherwise invamount / invroe (invroe > 0); USD invoices and ROE-less rows keep invamount.
 */
export function invoiceUsdAmount(row: Row, charges: Row[]): number {
  const amount = num(row.invamount);
  if (charges.length) {
    const sum = charges.reduce((s, c) => s + num(c.itmtotallocalinusd), 0);
    if (Math.abs(sum) > 0.004) return sum;
  }
  if (eq(row.invcurrency, REPORTING_CURRENCY)) return amount;
  const roe = num(row.invroe);
  // TODO(fixtures): a non-USD invoice without ROE or charge lines cannot be converted — kept at face value
  return roe > 0 ? amount / roe : amount;
}

function vesselVoyage(row: Row): string {
  const code = text(row.vslcode);
  const voy = text(row.voycode);
  if (!code) return '';
  return [vesselName(code), voy].filter(Boolean).join('/');
}

function routeLabel(pol: unknown, pod: unknown): string {
  const a = text(pol).toUpperCase();
  const b = text(pod).toUpperCase();
  return a && b ? `${a}→${b}` : a || b;
}

export function invoiceReference(row: Row, bls: string[]): string {
  const ref = bls.length ? `B/L ${bls.join(', ')}` : text(row.invrefno) ? `Ref ${text(row.invrefno)}` : '';
  return [text(row.invcategory), ref, vesselVoyage(row), routeLabel(row.pol, row.pod)].filter(Boolean).join(' · ');
}

export function invoiceDoc(row: Row, t: StatementTables): LedgerDoc {
  const invno = text(row.invno);
  const charges = t.invoiceCharges.filter(c => eq(c.invno, invno));
  const amount = num(row.invamount);
  const usd = invoiceUsdAmount(row, charges);
  const outstanding = num(row.amtbalance);
  const share = amount !== 0 ? outstanding / amount : 0;
  return {
    kind: 'invoice',
    docType: classifyInvoice(row),
    docNo: invno,
    date: ymd(row.invdate),
    dueDate: ymd(row.invduedate) || ymd(row.invdate),
    reference: invoiceReference(row, invoiceBlNumbers(invno, t)),
    currency: text(row.invcurrency).toUpperCase() || REPORTING_CURRENCY,
    cents: toCents(amount),
    usdCents: toCents(usd),
    outstandingCents: toCents(outstanding),
    outstandingUsdCents: toCents(usd * share),
  };
}

export function receiptReference(row: Row, allocations: Row[], excessOnly = false): string {
  const settled = allocations.map(a => text(a.InvNo)).filter(Boolean);
  const head = settled.length
    ? `Settles ${settled.join(', ')}`
    : excessOnly ? 'Unapplied receipt balance' : eq(row.receipttype, 'CUS') ? 'On-account receipt' : 'Receipt';
  const bl = text(row.bl_no);
  return [head, bl ? `B/L ${bl}` : '', text(row.remarks) && !eq(row.remarks, row.ReceiptNo) ? text(row.remarks) : ''].filter(Boolean).join(' · ');
}

/** USD value of a receipt (rectamtinusd, or the face value of a USD receipt that has none). */
const receiptUsd = (row: Row) =>
  eq(row.ReceiptCurrency, REPORTING_CURRENCY) && !num(row.rectamtinusd) ? num(row.ReceiptAmt) : num(row.rectamtinusd);

export interface ReceiptPosting { native: number; usd: number; allocations: Row[] }

/**
 * The part of a receipt that belongs in this ledger: its allocations (receiptdetail) to invoices that
 * are posted here plus any unapplied ExcessAmt. The extract holds only the newest invoices, so an
 * allocation to an older invoice has no debit to settle and stays out. A receipt with no detail rows
 * posts in full only when it is an on-account (CUS) receipt.
 */
export function receiptPosting(row: Row, allocations: Row[], postedInvoiceNos: Set<string>): ReceiptPosting {
  const total = num(row.ReceiptAmt);
  const totalUsd = receiptUsd(row);
  if (!allocations.length) {
    // TODO(fixtures): receiptdetail was sampled, so invoice receipts without detail rows cannot be tied to an invoice
    return eq(row.receipttype, 'CUS') ? { native: total, usd: totalUsd, allocations } : { native: 0, usd: 0, allocations };
  }
  const relevant = allocations.filter(a => postedInvoiceNos.has(text(a.InvNo).toLowerCase()));
  const excess = Math.max(0, num(row.ExcessAmt));
  const rate = total !== 0 ? totalUsd / total : 0;
  return {
    native: relevant.reduce((s, a) => s + num(a.ReceiptAmt), 0) + excess,
    usd: relevant.reduce((s, a) => s + num(a.rectamtinusd), 0) + excess * rate,
    allocations: relevant,
  };
}

export function receiptDoc(row: Row, t: StatementTables, postedInvoiceNos: Set<string>): LedgerDoc | null {
  const no = text(row.ReceiptNo);
  const allocations = t.receiptAllocations.filter(a => eq(a.ReceiptNo, no));
  const posting = receiptPosting(row, allocations, postedInvoiceNos);
  if (toCents(posting.native) === 0 && toCents(posting.usd) === 0) return null;
  return {
    kind: 'receipt',
    docType: 'Receipt',
    docNo: no,
    date: ymd(row.ReceiptDate),
    dueDate: '',
    reference: receiptReference(row, posting.allocations, allocations.length > 0 && posting.allocations.length === 0),
    currency: text(row.ReceiptCurrency).toUpperCase() || REPORTING_CURRENCY,
    cents: -toCents(posting.native),
    usdCents: -toCents(posting.usd),
    outstandingCents: 0,
    outstandingUsdCents: 0,
  };
}

/** Deterministic short document number for an online payment session ("OLP-E53B51A5"). */
export const onlinePaymentDocNo = (requestId: unknown) => `OLP-${text(requestId).replace(/-/g, '').slice(0, 8).toUpperCase()}`;

const DAY_MS = 24 * 60 * 60 * 1000;

/** A completed online payment already booked in receiptmaster (same USD amount within a day) must not post twice. */
export function hasMatchingReceipt(payment: Row, receipts: Row[]): boolean {
  const usd = num(payment.amountUsd) || num(payment.amountCents) / 100;
  const at = +new Date(payment.createdAt);
  return receipts.some(r => {
    const rUsd = eq(r.ReceiptCurrency, REPORTING_CURRENCY) ? num(r.ReceiptAmt) : num(r.rectamtinusd);
    return Math.abs(rUsd - usd) < 0.005 && Math.abs(+new Date(r.ReceiptDate) - at) <= DAY_MS;
  });
}

/**
 * A completed online payment posts for the invoice references (Ecom_OnlinePayment_Reference INV rows)
 * that are posted in this ledger; booking / B/L advances belong to the payments module, not the ledger.
 * Online payments are always charged in USD.
 */
export function paymentDoc(row: Row, refs: Row[], postedInvoiceNos: Set<string>): LedgerDoc | null {
  const settled = refs.filter(r => eq(r.refType, 'INV') && postedInvoiceNos.has(text(r.refNo).toLowerCase()));
  if (!settled.length) return null;
  const usd = settled.reduce((s, r) => s + (num(r.amountUsd) || num(r.amountCents) / 100), 0);
  if (toCents(usd) === 0) return null;
  const others = refs.filter(r => !eq(r.refType, 'INV')).map(r => `${text(r.refType)} ${text(r.refNo)}`.trim()).filter(Boolean);
  return {
    kind: 'payment',
    docType: 'Receipt',
    docNo: onlinePaymentDocNo(row.requestId),
    date: ymd(row.createdAt),
    dueDate: '',
    reference: [`Online payment · settles ${settled.map(r => text(r.refNo)).join(', ')}`, ...others].join(' · '),
    currency: text(row.currency).toUpperCase() || REPORTING_CURRENCY,
    cents: -toCents(usd),
    usdCents: -toCents(usd),
    outstandingCents: 0,
    outstandingUsdCents: 0,
  };
}

const KIND_ORDER: Record<LedgerDoc['kind'], number> = { invoice: 0, receipt: 1, payment: 2 };

/** Lower-cased invno of every posted invoice in the extract (any customer). */
export const postedInvoiceNumbers = (t: StatementTables) =>
  new Set(t.invoices.filter(isPostedInvoice).map(r => text(r.invno).toLowerCase()));

/**
 * Every posted document of one customer code: confirmed invoices, the posted part of active receipts,
 * and completed online payments that never reached receiptmaster. Chronological; on the same day the
 * invoices come first, then the receipts that settle them.
 */
export function postedDocuments(code: string, t: StatementTables): LedgerDoc[] {
  const posted = postedInvoiceNumbers(t);
  const docs: LedgerDoc[] = [];
  for (const r of t.invoices) if (eq(r.custcode, code) && isPostedInvoice(r)) docs.push(invoiceDoc(r, t));
  const receipts = t.receipts.filter(r => eq(r.CustCode, code));
  for (const r of receipts) {
    if (!isPostedReceipt(r)) continue;
    const doc = receiptDoc(r, t, posted);
    if (doc) docs.push(doc);
  }
  for (const p of t.payments) {
    if (!eq(p.customerCode, code) || !eq(p.status, 'COMPLETED') || hasMatchingReceipt(p, receipts)) continue;
    const doc = paymentDoc(p, t.paymentReferences.filter(r => eq(r.requestId, p.requestId)), posted);
    if (doc) docs.push(doc);
  }
  return docs
    .filter(d => d.date)
    .sort((a, b) => a.date.localeCompare(b.date) || KIND_ORDER[a.kind] - KIND_ORDER[b.kind] || a.docNo.localeCompare(b.docNo));
}

/** Documents visible in a statement currency, with the signed cents to post. */
export function documentsInCurrency(docs: LedgerDoc[], currency: string): Array<{ doc: LedgerDoc; cents: number; outstandingCents: number }> {
  const cur = currency.toUpperCase();
  if (cur === REPORTING_CURRENCY) {
    return docs.map(doc => ({ doc, cents: doc.usdCents, outstandingCents: doc.outstandingUsdCents }));
  }
  return docs.filter(d => d.currency === cur).map(doc => ({ doc, cents: doc.cents, outstandingCents: doc.outstandingCents }));
}

// ─── statement ───────────────────────────────────────────────────────────────

export function buildStatement(account: ResolvedAccount, criteria: StatementCriteria, t: StatementTables): StatementDTO {
  const currency = criteria.currency.toUpperCase();
  const posted = documentsInCurrency(postedDocuments(account.code, t), currency);

  let opening = 0;
  for (const p of posted) if (p.doc.date < criteria.fromDate) opening += p.cents;

  let running = opening;
  let totalDebit = 0;
  let totalCredit = 0;
  const lines: StatementLine[] = [];
  for (const p of posted) {
    if (p.doc.date < criteria.fromDate || p.doc.date > criteria.toDate) continue;
    running += p.cents;
    const debit = p.cents > 0 ? p.cents : 0;
    const credit = p.cents < 0 ? -p.cents : 0;
    totalDebit += debit;
    totalCredit += credit;
    lines.push({
      date: p.doc.date,
      docType: p.doc.docType,
      docNo: p.doc.docNo,
      reference: p.doc.reference || undefined,
      debit: centsToDecimalString(debit),
      credit: centsToDecimalString(credit),
      runningBalance: centsToDecimalString(running),
      currency,
    });
  }

  return {
    accountId: criteria.accountId,
    accountName: account.name,
    currency,
    period: { from: criteria.fromDate, to: criteria.toDate },
    openingBalance: centsToDecimalString(opening),
    lines,
    closingBalance: centsToDecimalString(running),
    totals: {
      totalDebit: centsToDecimalString(totalDebit),
      totalCredit: centsToDecimalString(totalCredit),
      net: centsToDecimalString(totalDebit - totalCredit),
    },
  };
}

// ─── ageing ──────────────────────────────────────────────────────────────────

export interface AgeingSlot { bucket: AgeingBucket; count: number; amount: string }
export interface StatementAgeing { asOf: string; currency: string; total: string; buckets: AgeingSlot[] }

/** Days past due → bucket; not-yet-due invoices sit in 0-30. */
export function ageingBucket(dueDate: string, now: Date): AgeingBucket {
  const due = new Date(`${dueDate}T00:00:00Z`);
  const days = Number.isNaN(+due) ? 0 : Math.floor((+now - +due) / DAY_MS);
  if (days <= 30) return '0-30';
  if (days <= 60) return '31-60';
  if (days <= 90) return '61-90';
  return '90+';
}

/** Outstanding invoice balances of the account bucketed by age, in the statement currency. */
export function buildAgeing(code: string, currency: string, t: StatementTables, now: Date): StatementAgeing {
  const open = documentsInCurrency(postedDocuments(code, t), currency).filter(p => p.doc.kind === 'invoice' && p.outstandingCents !== 0);
  const cents: Record<AgeingBucket, number> = { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 };
  const counts: Record<AgeingBucket, number> = { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 };
  for (const p of open) {
    const b = ageingBucket(p.doc.dueDate, now);
    cents[b] += p.outstandingCents;
    counts[b] += 1;
  }
  return {
    asOf: ymd(now),
    currency: currency.toUpperCase(),
    total: centsToDecimalString(open.reduce((s, p) => s + p.outstandingCents, 0)),
    buckets: AGEING_BUCKETS.map(bucket => ({ bucket, count: counts[bucket], amount: centsToDecimalString(cents[bucket]) })),
  };
}

// ─── invoice document detail ─────────────────────────────────────────────────

export interface InvoiceChargeDetail {
  chargeCode: string;
  chargeName: string;
  blNumber: string;
  containerNo: string;
  containerType: string;
  quantity: number;
  unit: string;
  currency: string;
  rate: string;
  total: string;
  totalUsd: string;
  tax: string;
  payMode: string;
}

export interface InvoiceDocument {
  invoiceNo: string;
  groupInvoiceNo: string;
  docType: StatementDocType;
  invoiceType: string;
  category: string;
  date: string;
  dueDate: string;
  customerCode: string;
  customerName: string;
  currency: string;
  amount: string;
  amountUsd: string;
  roe: number;
  received: string;
  balance: string;
  vesselCode: string;
  vesselName: string;
  voyage: string;
  service: string;
  bound: string;
  pol: string;
  pod: string;
  shipmentDate: string;
  reference: string;
  blNumbers: string[];
  containers: string[];
  charges: InvoiceChargeDetail[];
}

const dec = (n: number) => centsToDecimalString(toCents(n));

/** Charges, B/Ls, containers and named vessel / ports of one invoice; null when it is not in the fixtures. */
export function invoiceDocument(invno: string, t: StatementTables): InvoiceDocument | null {
  const row = t.invoices.find(r => eq(r.invno, invno));
  if (!row) return null;
  const chargeRows = t.invoiceCharges.filter(c => eq(c.invno, invno));
  const bls = invoiceBlNumbers(invno, t);
  const containers: string[] = [];
  const addCntr = (v: unknown) => { const s = text(v); if (s && !containers.some(x => eq(x, s))) containers.push(s); };
  for (const c of chargeRows) addCntr(c.cntrno);
  if (!containers.length) for (const bl of bls) for (const cargo of t.lrpBlCargo) if (eq(cargo.bl_no, bl)) addCntr(cargo.eqpId);
  const code = text(row.custcode);
  return {
    invoiceNo: invno,
    groupInvoiceNo: text(row.groupinvno),
    docType: classifyInvoice(row),
    invoiceType: text(row.invtype),
    category: text(row.invcategory),
    date: ymd(row.invdate),
    dueDate: ymd(row.invduedate) || ymd(row.invdate),
    customerCode: code,
    customerName: text(customerRow(code)?.CustName) || text(row.custname) || customerName(code),
    currency: text(row.invcurrency).toUpperCase() || REPORTING_CURRENCY,
    amount: dec(num(row.invamount)),
    amountUsd: dec(invoiceUsdAmount(row, chargeRows)),
    roe: num(row.invroe),
    received: dec(num(row.amtreceived)),
    balance: dec(num(row.amtbalance)),
    vesselCode: text(row.vslcode),
    vesselName: text(row.vslcode) ? vesselName(row.vslcode) : '',
    voyage: text(row.voycode),
    service: text(row.sercode),
    bound: text(row.bound),
    pol: portLabel(row.pol),
    pod: portLabel(row.pod),
    shipmentDate: ymd(row.shipmentDate),
    reference: text(row.invrefno),
    blNumbers: bls,
    containers,
    charges: chargeRows.map(c => ({
      chargeCode: text(c.chargecode),
      chargeName: text(c.chargename) || chargeName(c.chargecode),
      blNumber: text(c.blnumber) === '-' ? '' : text(c.blnumber),
      containerNo: text(c.cntrno),
      containerType: text(c.conttype) || text(c.cntrtype),
      quantity: num(c.itmqty),
      unit: text(c.baseunit),
      currency: text(c.itmcurrency).toUpperCase(),
      rate: dec(num(c.itmrate)),
      total: dec(num(c.itmtotal)),
      totalUsd: dec(num(c.itmtotallocalinusd)),
      tax: dec(num(c.taxtot)),
      payMode: text(c.paymode).toUpperCase(),
    })),
  };
}

// ─── export payloads ─────────────────────────────────────────────────────────

/** Tab-separated workbook body for the /export (xlsx) route: header, ledger, period totals, ageing. */
export function buildStatementExport(statement: StatementDTO, ageing: StatementAgeing): string {
  const rows: string[][] = [
    ['Customer Statement', statement.accountName],
    ['Account', statement.accountId, 'Currency', statement.currency],
    ['Period', statement.period.from, statement.period.to],
    ['Opening balance', statement.openingBalance],
    [],
    ['Date', 'Type', 'Document No', 'Reference', 'Debit', 'Credit', 'Balance'],
    ...statement.lines.map(l => [l.date, l.docType, l.docNo, l.reference ?? '', l.debit, l.credit, l.runningBalance]),
    ['Period totals', '', '', '', statement.totals.totalDebit, statement.totals.totalCredit, statement.totals.net],
    ['Closing balance', '', '', '', '', '', statement.closingBalance],
    [],
    [`Ageing as of ${ageing.asOf}`, ...ageing.buckets.map(b => b.bucket), 'Total'],
    ['Outstanding', ...ageing.buckets.map(b => b.amount), ageing.total],
    ['Invoices', ...ageing.buckets.map(b => String(b.count))],
  ];
  return rows.map(r => r.join('\t')).join('\n');
}

/** Text body of the /document (pdf) route: the ledger plus every invoice's charge / B/L / container detail. */
export function buildStatementDocument(statement: StatementDTO, ageing: StatementAgeing, documents: InvoiceDocument[]): string {
  const out: string[] = [
    `%PDF-1.4 Mock Customer Statement for ${statement.accountName}`,
    `Account ${statement.accountId} · ${statement.currency} · ${statement.period.from} to ${statement.period.to}`,
    `Opening ${statement.openingBalance} · Debits ${statement.totals.totalDebit} · Credits ${statement.totals.totalCredit} · Net ${statement.totals.net} · Closing ${statement.closingBalance}`,
    '',
  ];
  for (const l of statement.lines) {
    out.push([l.date, l.docType, l.docNo, l.reference ?? '', l.debit, l.credit, l.runningBalance].join(' | '));
  }
  out.push('', `Ageing as of ${ageing.asOf}: ${ageing.buckets.map(b => `${b.bucket} ${b.amount} (${b.count})`).join(' · ')} · total ${ageing.total}`);
  for (const d of documents) {
    out.push('', `Invoice ${d.invoiceNo} (${d.invoiceType} ${d.category}) ${d.date} due ${d.dueDate} · ${d.currency} ${d.amount} (USD ${d.amountUsd}, ROE ${d.roe}) · balance ${d.balance}`);
    out.push(`  ${[d.vesselName && `${d.vesselName}/${d.voyage}`, d.pol && d.pod && `${d.pol} → ${d.pod}`, d.blNumbers.length && `B/L ${d.blNumbers.join(', ')}`, d.containers.length && `Containers ${d.containers.join(', ')}`].filter(Boolean).join(' · ')}`);
    for (const c of d.charges) {
      out.push(`  ${c.chargeCode} ${c.chargeName} · ${c.quantity} ${c.unit} × ${c.currency} ${c.rate} = ${c.total} (USD ${c.totalUsd}) · ${c.payMode}${c.containerNo ? ` · ${c.containerNo}` : ''}`);
    }
  }
  return out.join('\n');
}

// ─── wired to the current user ───────────────────────────────────────────────

export function fixtureStatementAccounts(t: StatementTables = statementTables()): AccountOption[] {
  return statementAccounts(currentCustomerCode(), t, text(currentFixtureUser()?.user.Comp_Name));
}

export interface FixtureStatement {
  statement: StatementDTO;
  ageing: StatementAgeing;
  /** Detail of every invoice that appears as a line in the period. */
  documents: InvoiceDocument[];
}

/** Statement + ageing + invoice documents for the criteria; null when the account is not the user's. */
export function fixtureStatement(criteria: StatementCriteria, now: Date = new Date(), t: StatementTables = statementTables()): FixtureStatement | null {
  const account = resolveStatementAccount(criteria.accountId, fixtureStatementAccounts(t));
  if (!account) return null;
  const statement = buildStatement(account, criteria, t);
  const ageing = buildAgeing(account.code, criteria.currency, t, now);
  const documents = statement.lines
    .filter(l => l.docType !== 'Receipt')
    .map(l => invoiceDocument(l.docNo, t))
    .filter((d): d is InvoiceDocument => d !== null);
  return { statement, ageing, documents };
}
