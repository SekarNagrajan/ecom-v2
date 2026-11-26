// Modified by Sekar Nagarajan (2026-11-25 14:40)
/**
 * Online payment checkout — GWFC secureStripePayment / secureNGeniusPayment parity (fixture mock).
 */
import { http, HttpResponse } from 'msw';

import {
  cancelCheckout,
  completeCheckout,
  createCheckoutSession,
  getPaymentByRequestId,
  paymentGateway,
  type CheckoutPaymentType,
  type CheckoutReferenceInput,
} from './fixture-api/bridges/payments.bridge';
import { currentCustomerCode, currentLogin } from './fixture-api/bridges/user.bridge';

const PAYMENT_TYPES = new Set<CheckoutPaymentType>(['BKG', 'BL', 'INV']);

function badRequest(message: string) {
  return HttpResponse.json({ error: { code: 'VALIDATION_ERROR', message }, success: false, message }, { status: 400 });
}

export const paymentsHandlers = [
  // More-specific checkout routes first so they are not shadowed.
  http.post('*/api/v1/payments/checkout/:requestId/complete', ({ params }) => {
    const result = completeCheckout(decodeURIComponent(String(params.requestId ?? '')));
    if (!result.success) {
      return HttpResponse.json(
        { error: { code: 'COMPLETE_FAILED', message: result.message }, ...result },
        { status: result.message === 'Payment not found' ? 404 : 400 },
      );
    }
    return HttpResponse.json({ data: result, ...result });
  }),

  http.post('*/api/v1/payments/checkout/:requestId/cancel', ({ params }) => {
    const result = cancelCheckout(decodeURIComponent(String(params.requestId ?? '')));
    if (!result.success) {
      return HttpResponse.json(
        { error: { code: 'CANCEL_FAILED', message: result.message }, ...result },
        { status: result.message === 'Payment not found' ? 404 : 400 },
      );
    }
    return HttpResponse.json({ data: result, ...result });
  }),

  http.get('*/api/v1/payments/checkout/:requestId', ({ params }) => {
    const requestId = decodeURIComponent(String(params.requestId ?? ''));
    const payment = getPaymentByRequestId(requestId);
    if (!payment) {
      return HttpResponse.json({ error: { code: 'NOT_FOUND', message: 'Payment not found' } }, { status: 404 });
    }
    const refs = String(payment.requestId ?? '');
    return HttpResponse.json({
      data: {
        success: true,
        message: 'OK',
        requestId: refs,
        status: String(payment.status ?? ''),
        amountUsd: Number(payment.amountUsd ?? 0),
        currency: String(payment.currency ?? 'USD'),
        agencyCode: String(payment.agencyCode ?? ''),
        gateway: paymentGateway(payment),
        paymentType: String(payment.paymentType ?? ''),
        paidAt: String(payment.updatedAt ?? payment.createdAt ?? ''),
      },
    });
  }),

  http.post('*/api/v1/payments/checkout', async ({ request }) => {
    let body: {
      paymentType?: string;
      customerType?: string;
      agencyCode?: string;
      totalAmount?: number;
      references?: CheckoutReferenceInput[];
    };
    try {
      body = (await request.json()) as typeof body;
    } catch {
      return badRequest('Invalid JSON body');
    }

    const paymentType = String(body.paymentType ?? '').toUpperCase() as CheckoutPaymentType;
    if (!PAYMENT_TYPES.has(paymentType)) {
      return badRequest('paymentType must be BKG, BL, or INV');
    }

    const result = createCheckoutSession({
      customerCode: currentCustomerCode(),
      loginName: currentLogin(),
      paymentType,
      customerType: String(body.customerType ?? (paymentType === 'INV' ? 'IN' : 'SH')),
      agencyCode: String(body.agencyCode ?? ''),
      totalAmount: Number(body.totalAmount) || 0,
      references: Array.isArray(body.references) ? body.references : [],
    });

    if (!result.success) {
      return HttpResponse.json(
        { error: { code: 'CHECKOUT_FAILED', message: result.message }, ...result },
        { status: 400 },
      );
    }

    return HttpResponse.json({ data: result, ...result });
  }),
];
