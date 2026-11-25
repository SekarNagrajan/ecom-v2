// Modified by Sekar Nagarajan (2026-11-25 14:40)
import { beforeEach, describe, expect, it } from 'vitest';

import { ciRow, db, eq, resetDb } from '../db';
import { formatYmdHm } from './minute-format';
import {
  buildPaymentReceiptPdf,
  cancelCheckout,
  completeCheckout,
  createCheckoutSession,
  filterPaymentsByDateRange,
  findSuccessfulPaymentReceipt,
  fixturePaymentHistory,
  getPaymentByRequestId,
  mapDbPaymentType,
  mapPayment,
  PAYMENT_STATUS,
  paymentGateway,
} from './payments.bridge';

const payment = ciRow({
  id: '139',
  requestId: 'E53B51A5-5093-4104-A021-73967994CB30',
  customerCode: '20001374',
  loginName: 'baylee.howe87@example.com',
  paymentType: 'I',
  currency: 'USD',
  amountUsd: 142.99,
  amountCents: '14299',
  status: 'COMPLETED',
  description: 'Invoice Payment - 2 items',
  errorMessage: null,
  createdAt: '2026-08-13T13:53:09.692Z',
  updatedAt: '2026-08-13T13:53:34.022Z',
  agencyCode: 'INDMUM',
});
const refs = [
  ciRow({
    requestId: 'E53B51A5-5093-4104-A021-73967994CB30',
    refType: 'INV',
    refNo: 'MUMBAIMUMINV1653',
    amountUsd: 120,
  }),
  ciRow({ requestId: 'E53B51A5-5093-4104-A021-73967994CB30', refType: 'INV', refNo: 'MUMINVLT2160', amountUsd: 22.99 }),
  ciRow({ requestId: 'E53B51A5-5093-4104-A021-73967994CB30', refType: 'BL', refNo: 'EPIRINDMUM69177', amountUsd: 0 }),
];

describe('payments bridge', () => {
  it('maps Ecom_OnlinePayment statuses onto the portal statuses', () => {
    expect(PAYMENT_STATUS.COMPLETED).toBe('SUCCESSFUL');
    expect(PAYMENT_STATUS.SESSION_CREATED).toBe('PENDING');
    expect(PAYMENT_STATUS.CANCELLED).toBe('FAILED');
    expect(PAYMENT_STATUS.FAILED).toBe('FAILED');
  });

  it('derives the gateway deterministically from the agency', () => {
    expect(paymentGateway(ciRow({ agencyCode: 'AEESAD' }))).toBe('NGENIUS');
    expect(paymentGateway(ciRow({ agencyCode: 'INDMUM' }))).toBe('STRIPE');
  });

  it('maps a payment with its references onto PaymentHistoryRecord', () => {
    const rec = mapPayment(payment, refs, 'Schultz - Romaguera');
    expect(rec).toEqual({
      id: '139',
      paymentRefNo: 'E53B51A5-5093-4104-A021-73967994CB30',
      invoiceNo: 'MUMBAIMUMINV1653, MUMINVLT2160',
      blNumber: 'EPIRINDMUM69177',
      gateway: 'STRIPE',
      amount: 142.99,
      currency: 'USD',
      paymentDate: formatYmdHm('2026-08-13T13:53:34.022Z'),
      status: 'SUCCESSFUL',
      payerName: 'Schultz - Romaguera',
      receiptUrl: '/api/v1/user/payments/E53B51A5-5093-4104-A021-73967994CB30/receipt',
    });
  });

  it('builds a mock PDF receipt and resolves successful payments by ref or id', () => {
    const rec = mapPayment(payment, refs, 'Schultz - Romaguera');
    const pdf = buildPaymentReceiptPdf(rec);
    expect(pdf.startsWith('%PDF-1.4 Mock Payment Receipt')).toBe(true);
    expect(pdf).toContain(rec.paymentRefNo);
    expect(pdf).toContain('USD 142.99');

    const rows = fixturePaymentHistory('20001374');
    const successful = rows.find(r => r.status === 'SUCCESSFUL');
    expect(successful).toBeTruthy();
    if (!successful) return;
    expect(findSuccessfulPaymentReceipt('20001374', successful.paymentRefNo)?.id).toBe(successful.id);
    expect(findSuccessfulPaymentReceipt('20001374', successful.id)?.paymentRefNo).toBe(successful.paymentRefNo);
    expect(findSuccessfulPaymentReceipt('20001374', 'missing')).toBeUndefined();
  });

  it('omits the receipt for unpaid sessions and uses a dash for missing references', () => {
    const rec = mapPayment(ciRow({ ...payment, status: 'SESSION_CREATED' }), [], '20001374');
    expect(rec.status).toBe('PENDING');
    expect(rec.receiptUrl).toBeUndefined();
    expect(rec.invoiceNo).toBe('—');
    expect(rec.blNumber).toBe('—');
  });

  it('filters inclusively on the calendar date', () => {
    const rows = [
      mapPayment(ciRow({ ...payment, id: 'a', updatedAt: '2026-08-13T12:00:00' }), [], 'p'),
      mapPayment(ciRow({ ...payment, id: 'b', updatedAt: '2026-08-20T12:00:00' }), [], 'p'),
    ];
    expect(filterPaymentsByDateRange(rows, '2026-08-13', '2026-08-13').map(r => r.id)).toEqual(['a']);
    expect(filterPaymentsByDateRange(rows, undefined, '2026-08-19').map(r => r.id)).toEqual(['a']);
    expect(filterPaymentsByDateRange(rows, '2026-08-14')).toHaveLength(1);
    expect(filterPaymentsByDateRange(rows)).toHaveLength(2);
  });

  it('reads the demo customer payments from the fixtures, newest first', () => {
    const rows = fixturePaymentHistory('20001374');
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every(r => r.currency === 'USD')).toBe(true);
    expect(rows.some(r => r.status === 'SUCCESSFUL')).toBe(true);
    expect(fixturePaymentHistory('NOPE')).toEqual([]);
  });
});

describe('payments checkout status machine', () => {
  beforeEach(() => {
    resetDb();
  });

  it('maps client payment types onto Ecom_OnlinePayment.paymentType', () => {
    expect(mapDbPaymentType('INV')).toBe('I');
    expect(mapDbPaymentType('BKG')).toBe('A');
    expect(mapDbPaymentType('BL')).toBe('A');
  });

  it('creates SESSION_CREATED checkout with references and return URLs', () => {
    const result = createCheckoutSession({
      customerCode: '20001374',
      loginName: 'baylee.howe87@example.com',
      paymentType: 'INV',
      customerType: 'IN',
      agencyCode: 'INDMUM',
      totalAmount: 100,
      references: [{ refNo: 'TESTINV001', amount: 100, customerType: 'IN' }],
    });
    expect(result.success).toBe(true);
    expect(result.requestId).toBeTruthy();
    expect(result.gateway).toBe('STRIPE');
    expect(result.status).toBe('SESSION_CREATED');
    expect(result.checkoutUrl).toContain('/app/payments/checkout/success?requestId=');
    expect(result.cancelUrl).toContain('/app/payments/checkout/cancel?requestId=');

    const payment = getPaymentByRequestId(result.requestId!);
    expect(payment?.status).toBe('SESSION_CREATED');
    expect(payment?.paymentType).toBe('I');
    expect(payment?.stripeSessionId).toMatch(/^mock_stripe_/);
    const refs = db.paymentReferences.filter(r => eq(r.requestId, result.requestId));
    expect(refs).toHaveLength(1);
    expect(refs[0].refType).toBe('INV');
    expect(refs[0].refNo).toBe('TESTINV001');
  });

  it('completes a checkout and zeros matching invoice balances', () => {
    db.invoices.unshift(
      ciRow({
        invno: 'TESTINV-CLEAR',
        status: 'CONFIRM',
        amtbalance: 250,
        invcurrency: 'USD',
        invroe: 1,
        agencycode: 'INDMUM',
        invrefno: 'BKCLEAR1',
      }),
    );
    const created = createCheckoutSession({
      customerCode: '20001374',
      loginName: 'demo@example.com',
      paymentType: 'INV',
      customerType: 'IN',
      agencyCode: 'INDMUM',
      totalAmount: 250,
      references: [{ refNo: 'TESTINV-CLEAR', amount: 250 }],
    });
    expect(created.success).toBe(true);

    const completed = completeCheckout(created.requestId!);
    expect(completed.success).toBe(true);
    expect(completed.status).toBe('COMPLETED');
    expect(getPaymentByRequestId(created.requestId!)?.status).toBe('COMPLETED');
    const inv = db.invoices.find(i => eq(i.invno, 'TESTINV-CLEAR'));
    expect(Number(inv?.amtbalance)).toBe(0);

    const again = completeCheckout(created.requestId!);
    expect(again.success).toBe(true);
    expect(again.message).toMatch(/already completed/i);
  });

  it('cancels an in-flight checkout and refuses cancel after complete', () => {
    const created = createCheckoutSession({
      customerCode: '20001374',
      loginName: 'demo@example.com',
      paymentType: 'BL',
      customerType: 'SH',
      agencyCode: 'AEESAD',
      totalAmount: 50,
      references: [{ refNo: 'BLPAY1', amount: 50 }],
    });
    expect(created.gateway).toBe('NGENIUS');

    const cancelled = cancelCheckout(created.requestId!);
    expect(cancelled.success).toBe(true);
    expect(cancelled.status).toBe('CANCELLED');

    const revive = createCheckoutSession({
      customerCode: '20001374',
      loginName: 'demo@example.com',
      paymentType: 'BL',
      customerType: 'SH',
      agencyCode: 'INDMUM',
      totalAmount: 40,
      references: [{ refNo: 'BLPAY2', amount: 40 }],
    });
    expect(completeCheckout(revive.requestId!).success).toBe(true);
    expect(cancelCheckout(revive.requestId!).success).toBe(false);
  });

  it('rejects invalid checkout payloads', () => {
    expect(
      createCheckoutSession({
        customerCode: '20001374',
        loginName: 'x',
        paymentType: 'INV',
        customerType: 'IN',
        agencyCode: '',
        totalAmount: 10,
        references: [{ refNo: 'A', amount: 10 }],
      }).success,
    ).toBe(false);
    expect(
      createCheckoutSession({
        customerCode: '20001374',
        loginName: 'x',
        paymentType: 'INV',
        customerType: 'IN',
        agencyCode: 'INDMUM',
        totalAmount: 10,
        references: [{ refNo: 'A', amount: 5 }],
      }).message,
    ).toMatch(/match/i);
  });

  it('rehydrates a checkout session after the in-memory db is reset', () => {
    const created = createCheckoutSession({
      customerCode: '20001374',
      loginName: 'demo@example.com',
      paymentType: 'INV',
      customerType: 'IN',
      agencyCode: 'INDMUM',
      totalAmount: 88,
      references: [{ refNo: 'REHYDRATE-INV', amount: 88 }],
    });
    expect(created.success).toBe(true);
    const requestId = created.requestId!;

    // Simulate full page reload: fixture tables are rebuilt, sessionStorage still holds the session.
    resetDb();
    expect(db.payments.find(p => eq(p.requestId, requestId))).toBeUndefined();

    const completed = completeCheckout(requestId);
    expect(completed.success).toBe(true);
    expect(completed.status).toBe('COMPLETED');
    expect(getPaymentByRequestId(requestId)?.status).toBe('COMPLETED');
  });
});
