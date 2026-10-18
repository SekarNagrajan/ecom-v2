// Modified by Sekar Nagarajan (2026-10-16 23:40)
import { describe, expect, it } from 'vitest';

import { ciRow } from '../db';
import { formatYmdHm } from './minute-format';
import { filterPaymentsByDateRange, fixturePaymentHistory, mapPayment, PAYMENT_STATUS, paymentGateway } from './payments.bridge';

const payment = ciRow({
  id: '139', requestId: 'E53B51A5-5093-4104-A021-73967994CB30', customerCode: '20001374', loginName: 'baylee.howe87@example.com',
  paymentType: 'I', currency: 'USD', amountUsd: 142.99, amountCents: '14299', status: 'COMPLETED', description: 'Invoice Payment - 2 items',
  errorMessage: null, createdAt: '2026-08-13T13:53:09.692Z', updatedAt: '2026-08-13T13:53:34.022Z', agencyCode: 'INDMUM',
});
const refs = [
  ciRow({ requestId: 'E53B51A5-5093-4104-A021-73967994CB30', refType: 'INV', refNo: 'MUMBAIMUMINV1653', amountUsd: 120 }),
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
      receiptUrl: '#',
    });
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
