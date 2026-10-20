// Modified by Sekar Nagarajan (2026-10-16 23:40)
/**
 * Payment history from the fixtures:
 *   payments          (Ecom_OnlinePayment)     one row per checkout session
 *   paymentReferences (Ecom_OnlinePaymentRef)  the invoices / bookings / B/Ls paid by that session
 *   users             (eCom_Reg_Details)       payer company name via loginName
 */
import type { PaymentHistoryRecord } from '../../../features/user-modules/types/user-modules.types';
import { db, eq, type Row } from '../db';
import { formatYmdHm } from './minute-format';

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
  return String(row.agencyCode ?? '').toUpperCase().startsWith('AE') ? 'NGENIUS' : 'STRIPE';
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
    (row) =>
      row.status === 'SUCCESSFUL' &&
      (row.paymentRefNo === key || row.id === key),
  );
}

/** Inclusive calendar-date filter on `paymentDate` (`YYYY-MM-DD…`). */
export function filterPaymentsByDateRange(records: PaymentHistoryRecord[], fromDate?: string, toDate?: string): PaymentHistoryRecord[] {
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
