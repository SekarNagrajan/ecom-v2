// Created by Sekar Nagarajan (2026-08-24 14:46)
import { http, HttpResponse } from 'msw';
import type { DOSummaryRow } from '../features/delivery-order/types/delivery-order.types';

// In-memory mock store
let mockDeliveryOrders: DOSummaryRow[] = [
  {
    delordno: 'DO0007742',
    delorddate: '2026-08-18T00:00:00',
    blnumber: 'ESLSIN123456',
    vessel: 'MSC ELARA',
    voyage: 'EL042N',
    bound: 'N',
    loadport: 'SGSIN',
    dischargeport: 'INNSA',
    terminal: 'NSICT',
    arrdate: '2026-08-22T00:00:00',
    dovaliditydate: '2026-08-29T00:00:00',
    printstatus: 'N',
    ecomprintstatus: '1',
  },
  {
    delordno: 'DO0007743',
    delorddate: '2026-08-19T00:00:00',
    blnumber: 'ESLSIN123457',
    vessel: 'EVER GIVEN',
    voyage: 'EV001E',
    bound: 'N',
    loadport: 'CNSHG',
    dischargeport: 'USLAX',
    terminal: 'APM',
    arrdate: '2026-08-24T00:00:00',
    dovaliditydate: '2026-08-31T00:00:00',
    printstatus: 'Y',
    ecomprintstatus: '1',
  },
];

export const deliveryOrderHandlers = [
  // GET /api/ecom/imp/delivery-orders
  http.get('/api/ecom/imp/delivery-orders', async () => {
    // The REST controller handles falling back to default dates, so we just return the in-memory array
    return HttpResponse.json({ data: mockDeliveryOrders });
  }),

  // GET /api/ecom/imp/delivery-orders/:delOrdNo/document
  http.get('/api/ecom/imp/delivery-orders/:delOrdNo/document', async ({ params }) => {
    const delOrdNo = params.delOrdNo as string;
    
    // Simulate updating the print status on the server
    const doIndex = mockDeliveryOrders.findIndex(d => d.delordno === delOrdNo);
    if (doIndex !== -1) {
      if (mockDeliveryOrders[doIndex].printstatus === 'N' && mockDeliveryOrders[doIndex].ecomprintstatus === '1') {
        mockDeliveryOrders[doIndex].printstatus = 'Y';
      }
    }

    const content = `%PDF-1.4 Mock Delivery Order Document for ${delOrdNo}`;
    const blob = new Blob([content], { type: 'application/pdf' });

    return new HttpResponse(blob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${delOrdNo}.pdf"`,
      },
    });
  }),
];
