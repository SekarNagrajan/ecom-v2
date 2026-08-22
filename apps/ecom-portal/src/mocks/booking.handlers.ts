import { delay, http, HttpResponse } from 'msw';

const mockBookings = [
  {
    id: 'bkg-1',
    bookingNo: 'AE01444000',
    onlineRefNo: 'BKON7045',
    agencyRefNo: '',
    status: 'Confirmed',
    origin: 'AEJEA-JEBEL ALI, UAE',
    delivery: 'SGSIN-SINGAPORE',
    createdDate: '10-Aug-2026 08:32',
    confirmedDate: '11-Aug-2026 00:26',
    dgStatus: 'N',
    teusCount: 5.0,
    submittedDate: '10-Aug-2026 08:32'
  },
  {
    id: 'bkg-2',
    bookingNo: 'AE01443500',
    onlineRefNo: 'BKON7041',
    agencyRefNo: '',
    status: 'Confirmed',
    origin: 'AEJEA-JEBEL ALI, UAE',
    delivery: 'SGSIN-SINGAPORE',
    createdDate: '10-Aug-2026 05:33',
    confirmedDate: '10-Aug-2026 07:05',
    dgStatus: 'N',
    teusCount: 5.0,
    submittedDate: '10-Aug-2026 05:33'
  },
  {
    id: 'bkg-3',
    bookingNo: 'IN01443000',
    onlineRefNo: 'BKON7038',
    agencyRefNo: '',
    status: 'Awaiting Acceptance',
    origin: 'INNSA-NHAVA SHEVA...',
    delivery: 'AEJEA-JEBEL ALI, UAE',
    createdDate: '10-Aug-2026 04:33',
    confirmedDate: '',
    dgStatus: 'N',
    teusCount: 1.0,
    submittedDate: '10-Aug-2026 04:33'
  }
];

export const bookingHandlers = [
  http.get('/api/booking/list', async () => {
    await delay(500);
    return HttpResponse.json({ data: mockBookings });
  }),
  http.post('/api/booking/submit', async ({ request }) => {
    await delay(1500); // Simulate network latency

    const payload = await request.json();

    // Mock response for a successful booking
    return HttpResponse.json({
      data: {
        bookingReference: `BKG-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
        status: 'CONFIRMED',
        submittedAt: new Date().toISOString(),
      },
    });
  }),
  http.put('/api/booking/amend', async ({ request }) => {
    await delay(1500); // Simulate network latency

    const payload = await request.json();

    // Mock response for a successful amendment
    return HttpResponse.json({
      data: {
        bookingReference: `BKG-AMD-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
        status: 'CONFIRMED',
        submittedAt: new Date().toISOString(),
      },
    });
  }),
];
