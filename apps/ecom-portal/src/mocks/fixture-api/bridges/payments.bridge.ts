// Modified by Sekar Nagarajan (2026-11-25 15:10)
/**
 * Payment history + checkout from the fixtures:
 *   payments          (Ecom_OnlinePayment)     one row per checkout session
 *   paymentReferences (Ecom_OnlinePaymentRef)  the invoices / bookings / B/Ls paid by that session
 *   users             (eCom_Reg_Details)       payer company name via loginName
 *
 * Checkout mirrors GWFC SecureStripePayment / EcomOnlinePaymentBean:
 *   PENDING → SESSION_CREATED → COMPLETED | FAILED | CANCELLED
 *
 * Mock checkout sessions are also mirrored to sessionStorage so complete/cancel
 * survive a full page navigation (window.location) that reloads the fixture db.
 */
import type { PaymentHistoryRecord } from '../../../features/user-modules/types/user-modules.types';
import { ciRow, db, eq, nowIso, type Row } from '../db';
import { formatYmdHm } from './minute-format';

const CHECKOUT_SESSION_STORAGE_KEY = 'ecom.payments.checkoutSessions.v1';

type StoredCheckoutSession = {
  payment: Row;
  references: Row[];
};

/** Survives fixture `resetDb()` within the same JS runtime (tests + SPA navigations). */
let memoryCheckoutStore: Record<string, StoredCheckoutSession> = {};

function readSessionCheckoutStore(): Record<string, StoredCheckoutSession> {
  if (typeof sessionStorage === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem(CHECKOUT_SESSION_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, StoredCheckoutSession>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function readCheckoutStore(): Record<string, StoredCheckoutSession> {
  // Memory wins over session so in-flight updates are visible immediately.
  return { ...readSessionCheckoutStore(), ...memoryCheckoutStore };
}

function writeCheckoutStore(store: Record<string, StoredCheckoutSession>) {
  memoryCheckoutStore = store;
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(CHECKOUT_SESSION_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Ignore quota / private-mode failures — memory store still covers SPA navigations.
  }
}

function plainRow(row: Row): Row {
  return { ...row };
}

function persistCheckoutSession(requestId: string) {
  const payment = db.payments.find(p => eq(p.requestId, requestId));
  if (!payment) return;
  const references = db.paymentReferences.filter(r => eq(r.requestId, requestId));
  const store = readCheckoutStore();
  store[String(payment.requestId)] = {
    payment: plainRow(payment),
    references: references.map(plainRow),
  };
  writeCheckoutStore(store);
}

/** Rehydrate a checkout session into the in-memory db after a page reload / resetDb. */
function ensureCheckoutInDb(requestId: string): Row | undefined {
  const key = String(requestId ?? '').trim();
  if (!key) return undefined;
  const existing = db.payments.find(p => eq(p.requestId, key));
  if (existing) return existing;

  const stored = readCheckoutStore()[key];
  if (!stored?.payment) return undefined;

  const payment = ciRow({ ...stored.payment });
  db.payments.unshift(payment);
  for (const ref of stored.references ?? []) {
    if (db.paymentReferences.some(r => eq(r.requestId, key) && eq(r.refNo, ref.refNo))) {
      continue;
    }
    db.paymentReferences.unshift(ciRow({ ...ref }));
  }
  return payment;
}

/** Client payment types (secureStripePayment.do body). */
export type CheckoutPaymentType = 'BKG' | 'BL' | 'INV';
export type CheckoutGateway = 'STRIPE' | 'NGENIUS';

export interface CheckoutReferenceInput {
  refNo: string;
  amount: number;
  customerType?: string;
}

export interface CreateCheckoutInput {
  customerCode: string;
  loginName: string;
  paymentType: CheckoutPaymentType;
  customerType: string;
  agencyCode: string;
  totalAmount: number;
  references: CheckoutReferenceInput[];
}

export interface CheckoutSessionResult {
  success: boolean;
  message: string;
  requestId?: string;
  checkoutUrl?: string;
  cancelUrl?: string;
  gateway?: CheckoutGateway;
  status?: string;
  amountUsd?: number;
  currency?: string;
  agencyCode?: string;
  paidAt?: string;
  referenceCount?: number;
}

function sessionDetails(payment: Row, statusOverride?: string): Partial<CheckoutSessionResult> {
  const rid = String(payment.requestId ?? '');
  const refs = db.paymentReferences.filter(r => eq(r.requestId, rid));
  return {
    requestId: rid,
    gateway: paymentGateway(payment) as CheckoutGateway,
    status: statusOverride ?? String(payment.status ?? ''),
    amountUsd: Number(payment.amountUsd ?? 0),
    currency: String(payment.currency ?? 'USD'),
    agencyCode: String(payment.agencyCode ?? ''),
    paidAt: String(payment.updatedAt ?? payment.createdAt ?? ''),
    referenceCount: refs.length,
  };
}

/** BKG/BL advance → DB `A`; invoice → `I` (PaymentHelper.mapPaymentType). */
export function mapDbPaymentType(paymentType: CheckoutPaymentType): 'A' | 'I' {
  return paymentType === 'INV' ? 'I' : 'A';
}

export function getPaymentByRequestId(requestId: string): Row | undefined {
  return ensureCheckoutInDb(requestId);
}

function roundUsd(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Create an online payment + references, then mark SESSION_CREATED with a mock gateway session.
 * Returns a simulated checkout URL (success return) — no live Stripe/N-Genius call.
 */
export function createCheckoutSession(input: CreateCheckoutInput): CheckoutSessionResult {
  const agencyCode = String(input.agencyCode ?? '').trim();
  const references = (input.references ?? []).filter(r => String(r.refNo ?? '').trim() && Number(r.amount) > 0);
  const totalAmount = roundUsd(Number(input.totalAmount) || 0);

  if (!agencyCode) {
    return { success: false, message: 'Agency is required' };
  }
  if (!references.length) {
    return { success: false, message: 'At least one payment reference is required' };
  }
  if (!(totalAmount > 0)) {
    return { success: false, message: 'Amount must be greater than zero' };
  }
  if (!String(input.customerCode ?? '').trim()) {
    return { success: false, message: 'Customer is required' };
  }

  const refSum = roundUsd(references.reduce((s, r) => s + Number(r.amount), 0));
  if (Math.abs(refSum - totalAmount) > 0.02) {
    return { success: false, message: 'Total amount must match the sum of references' };
  }

  const requestId = crypto.randomUUID().toUpperCase();
  const now = nowIso();
  const amountCents = Math.round(totalAmount * 100);
  const gateway = paymentGateway(ciRow({ agencyCode })) as CheckoutGateway;
  const sessionId = `mock_${gateway.toLowerCase()}_${requestId.replace(/-/g, '').slice(0, 12)}`;
  const nextId = String(Math.max(0, ...db.payments.map(p => Number(p.id) || 0)) + 1);

  const payment = ciRow({
    id: nextId,
    requestId,
    customerCode: String(input.customerCode).trim(),
    loginName: String(input.loginName ?? '').trim() || String(input.customerCode).trim(),
    paymentType: mapDbPaymentType(input.paymentType),
    currency: 'USD',
    amountUsd: totalAmount,
    amountCents: String(amountCents),
    status: 'PENDING',
    description: `${input.paymentType} Payment - ${references.length} item${references.length === 1 ? '' : 's'}`,
    errorMessage: null,
    createdAt: now,
    updatedAt: now,
    agencyCode,
    stripeSessionId: null,
  });
  db.payments.unshift(payment);

  let refId = Math.max(0, ...db.paymentReferences.map(r => Number(r.id) || 0));
  for (const ref of references) {
    refId += 1;
    const amount = roundUsd(Number(ref.amount));
    db.paymentReferences.unshift(
      ciRow({
        id: String(refId),
        requestId,
        refType: input.paymentType,
        refNo: String(ref.refNo).trim(),
        custType: String(ref.customerType ?? input.customerType ?? '').trim() || 'IN',
        amountUsd: amount,
        amountCents: String(Math.round(amount * 100)),
        remarks: null,
        createdAt: now,
      }),
    );
  }

  payment.status = 'SESSION_CREATED';
  payment.stripeSessionId = sessionId;
  payment.updatedAt = nowIso();
  persistCheckoutSession(requestId);

  const q = `requestId=${encodeURIComponent(requestId)}`;
  return {
    success: true,
    message: 'Checkout session created',
    requestId,
    checkoutUrl: `/app/payments/checkout/success?${q}`,
    cancelUrl: `/app/payments/checkout/cancel?${q}`,
    gateway,
    status: 'SESSION_CREATED',
  };
}

/** Settle a SESSION_CREATED/PENDING payment; zeros matching open invoice balances for INV refs. */
export function completeCheckout(requestId: string): CheckoutSessionResult {
  const payment = getPaymentByRequestId(requestId);
  if (!payment) {
    return { success: false, message: 'Payment not found' };
  }
  const status = String(payment.status ?? '').toUpperCase();
  if (status === 'COMPLETED') {
    return {
      success: true,
      message: 'Payment already completed',
      ...sessionDetails(payment, 'COMPLETED'),
    };
  }
  if (status !== 'SESSION_CREATED' && status !== 'PENDING' && status !== 'AUTHORISED') {
    return { success: false, message: `Cannot complete payment in status ${status}` };
  }

  const rid = String(payment.requestId);
  payment.status = 'COMPLETED';
  payment.stripePaymentIntentId = `pi_mock_${String(payment.stripeSessionId ?? rid).slice(-10)}`;
  payment.stripeChargeId = `ch_mock_${rid.replace(/-/g, '').slice(0, 10)}`;
  payment.stripeTransactionId = `txn_mock_${rid.replace(/-/g, '').slice(0, 10)}`;
  payment.stripeReceiptUrl = `/api/v1/user/payments/${encodeURIComponent(rid)}/receipt`;
  payment.errorMessage = null;
  payment.updatedAt = nowIso();

  const refs = db.paymentReferences.filter(r => eq(r.requestId, rid));
  for (const ref of refs) {
    if (!eq(ref.refType, 'INV')) continue;
    const inv = (db.invoices ?? []).find(i => eq(i.invno, ref.refNo));
    if (!inv) continue;
    const paid = Number(ref.amountUsd ?? 0);
    const bal = Number(inv.amtbalance ?? 0);
    inv.amtbalance = Math.max(0, roundUsd(bal - paid));
  }

  persistCheckoutSession(rid);

  return {
    success: true,
    message: 'Payment completed',
    ...sessionDetails(payment, 'COMPLETED'),
  };
}

/** Mark an in-flight checkout as CANCELLED (refuse overwrite of COMPLETED). */
export function cancelCheckout(requestId: string): CheckoutSessionResult {
  const payment = getPaymentByRequestId(requestId);
  if (!payment) {
    return { success: false, message: 'Payment not found' };
  }
  const status = String(payment.status ?? '').toUpperCase();
  if (status === 'COMPLETED') {
    return { success: false, message: 'Cannot cancel a completed payment' };
  }
  if (status === 'CANCELLED') {
    return {
      success: true,
      message: 'Payment already cancelled',
      ...sessionDetails(payment, 'CANCELLED'),
    };
  }
  payment.status = 'CANCELLED';
  payment.updatedAt = nowIso();
  persistCheckoutSession(String(payment.requestId));
  return {
    success: true,
    message: 'Payment cancelled',
    ...sessionDetails(payment, 'CANCELLED'),
  };
}

/** Ecom_OnlinePayment.status → portal status. CANCELLED sessions were never paid, so they are shown as failed. */
export const PAYMENT_STATUS: Record<string, PaymentHistoryRecord['status']> = {
  COMPLETED: 'SUCCESSFUL',
  SUCCESS: 'SUCCESSFUL',
  SESSION_CREATED: 'PENDING',
  PENDING: 'PENDING',
  FAILED: 'FAILED',
  CANCELLED: 'FAILED',
  REFUNDED: 'REFUNDED',
};

/**
 * TODO(fixtures): Ecom_OnlinePayment has no gateway column. Deterministic stand-in: UAE agencies
 * (AE*) checked out through N-Genius (Network International), everything else through Stripe.
 */
export function paymentGateway(row: Row): PaymentHistoryRecord['gateway'] {
  return String(row.agencyCode ?? '')
    .toUpperCase()
    .startsWith('AE')
    ? 'NGENIUS'
    : 'STRIPE';
}

const joinRefs = (refs: Row[]) => [...new Set(refs.map(r => String(r.refNo ?? '').trim()).filter(Boolean))].join(', ');

export function mapPayment(row: Row, refs: Row[], payerName: string): PaymentHistoryRecord {
  const status = PAYMENT_STATUS[String(row.status ?? '').toUpperCase()] ?? 'PENDING';
  const blRefs = refs.filter(r => eq(r.refType, 'BL'));
  const otherRefs = refs.filter(r => !eq(r.refType, 'BL')); // INV (invoice) and BKG (booking advance) references
  const record: PaymentHistoryRecord = {
    id: String(row.id ?? row.requestId),
    paymentRefNo: String(row.requestId ?? ''),
    invoiceNo: joinRefs(otherRefs) || '—',
    blNumber: joinRefs(blRefs) || '—',
    gateway: paymentGateway(row),
    amount: Number(row.amountUsd ?? Number(row.amountCents ?? 0) / 100),
    currency: String(row.currency ?? 'USD'),
    paymentDate: formatYmdHm(row.updatedAt ?? row.createdAt),
    status,
    payerName,
  };
  if (status === 'SUCCESSFUL') {
    record.receiptUrl = `/api/v1/user/payments/${encodeURIComponent(record.paymentRefNo)}/receipt`;
  }
  return record;
}

/** Mock PDF body for a successful payment receipt download. */
export function buildPaymentReceiptPdf(record: PaymentHistoryRecord): string {
  return [
    '%PDF-1.4 Mock Payment Receipt',
    `Payment Ref: ${record.paymentRefNo}`,
    `Payer: ${record.payerName}`,
    `Invoice / Booking: ${record.invoiceNo}`,
    `B/L: ${record.blNumber}`,
    `Gateway: ${record.gateway}`,
    `Amount: ${record.currency} ${record.amount.toFixed(2)}`,
    `Paid On: ${record.paymentDate}`,
    `Status: ${record.status}`,
  ].join('\n');
}

/** Resolve a successful payment receipt by requestId (paymentRefNo) or row id. */
export function findSuccessfulPaymentReceipt(
  customerCode: string,
  paymentKey: string,
): PaymentHistoryRecord | undefined {
  const key = String(paymentKey ?? '').trim();
  if (!key) return undefined;
  return fixturePaymentHistory(customerCode).find(
    row => row.status === 'SUCCESSFUL' && (row.paymentRefNo === key || row.id === key),
  );
}

/** Inclusive calendar-date filter on `paymentDate` (`YYYY-MM-DD…`). */
export function filterPaymentsByDateRange(
  records: PaymentHistoryRecord[],
  fromDate?: string,
  toDate?: string,
): PaymentHistoryRecord[] {
  if (!fromDate && !toDate) return records;
  return records.filter(row => {
    const day = row.paymentDate.slice(0, 10);
    if (fromDate && day < fromDate) return false;
    if (toDate && day > toDate) return false;
    return true;
  });
}

/** All payments of a customer, newest first. */
export function fixturePaymentHistory(customerCode: string): PaymentHistoryRecord[] {
  return db.payments
    .filter(p => eq(p.customerCode, customerCode))
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .map(p => {
      const payer = db.users.find(u => eq(u.loginname, p.loginName) || eq(u.User_Email, p.loginName));
      const refs = db.paymentReferences.filter(r => eq(r.requestId, p.requestId));
      return mapPayment(p, refs, String(payer?.Comp_Name || p.customerCode || ''));
    });
}
