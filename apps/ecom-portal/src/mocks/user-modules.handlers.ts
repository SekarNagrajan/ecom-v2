// Modified by sekar nagarajan (2026-08-21)
import { http, HttpResponse } from 'msw';
import type {
  AlertHistoryLog,
  AlertPreference,
  CustomerProfile,
  PaymentHistoryRecord,
  QuoteItem,
} from '../features/user-modules/types/user-modules.types';

let mockProfile: CustomerProfile = {
  loginName: 'APEX_GLOBAL_USER',
  customerCode: 'CUST-001',
  companyName: 'Apex Logistics Global',
  firstName: 'Sekar',
  lastName: 'Nagarajan',
  email: 'sekar.n@apexlogistics.com',
  phoneCode: '+1',
  phoneNo: '555-0199',
  mobileCode: '+1',
  mobileNo: '555-0122',
  taxId: 'US-TAX-884190',
  country: 'United States',
  city: 'New York',
  address: '100 Wall Street, Suite 1400, NY 10005',
  defLanguage: 'en',
  prefTimeZone: 'UTC-5 (EST)',
};

let mockQuotes: QuoteItem[] = [
  {
    id: 'q-101',
    quoteNo: 'QT-2026-8801',
    polCode: 'USNYC',
    polName: 'Port of New York (USNYC)',
    podCode: 'SGSIN',
    podName: 'Port of Singapore (SGSIN)',
    equipmentType: '40ft High Cube Container (40HC)',
    commodity: 'General Cargo & Electronics',
    validFrom: '2026-08-01',
    validTo: '2026-09-15',
    oceanFreightUSD: 1850.0,
    thcUSD: 320.0,
    totalAmountUSD: 2170.0,
    status: 'QUOTED',
    createdAt: '2026-08-10',
  },
  {
    id: 'q-102',
    quoteNo: 'QT-2026-8802',
    polCode: 'NLRTM',
    polName: 'Port of Rotterdam (NLRTM)',
    podCode: 'CNSHA',
    podName: 'Shanghai Port (CNSHA)',
    equipmentType: '20ft Standard Container (20GP)',
    commodity: 'Industrial Machinery',
    validFrom: '2026-08-05',
    validTo: '2026-09-30',
    oceanFreightUSD: 1420.0,
    thcUSD: 280.0,
    totalAmountUSD: 1700.0,
    status: 'ACCEPTED',
    createdAt: '2026-08-12',
  },
  {
    id: 'q-103',
    quoteNo: 'QT-2026-8803',
    polCode: 'DEHAM',
    polName: 'Hamburg Port (DEHAM)',
    podCode: 'USNYC',
    podName: 'Port of New York (USNYC)',
    equipmentType: '40ft Reefer Container (40RF)',
    commodity: 'Chilled Produce & Pharmaceuticals',
    validFrom: '2026-07-01',
    validTo: '2026-08-01',
    oceanFreightUSD: 2600.0,
    thcUSD: 450.0,
    totalAmountUSD: 3050.0,
    status: 'EXPIRED',
    createdAt: '2026-07-05',
  },
];

let mockAlertPreferences: AlertPreference = {
  bookingUpdates: true,
  siConfirmation: true,
  blRelease: true,
  scheduleDelays: true,
  paymentInvoices: true,
  channelEmail: true,
  channelSms: false,
  channelPortal: true,
};

const mockAlertLogs: AlertHistoryLog[] = [
  {
    id: 'alt-1',
    category: 'BOOKING',
    title: 'Booking Confirmed',
    message: 'Booking BKG-2026-0991 has been confirmed by carrier Apex Global Line.',
    timestamp: '2026-08-21 09:30',
    isRead: false,
    referenceNo: 'BKG-2026-0991',
  },
  {
    id: 'alt-2',
    category: 'SI',
    title: 'Shipping Instructions Accepted',
    message: 'SI-2026-8812 verified successfully. Draft Bill of Lading generated.',
    timestamp: '2026-08-21 10:15',
    isRead: true,
    referenceNo: 'SI-2026-8812',
  },
  {
    id: 'alt-3',
    category: 'PAYMENT',
    title: 'Payment Invoice Generated',
    message: 'Invoice INV-2026-4410 issued for container shipment BKG-2026-0988 ($2,170.00 USD).',
    timestamp: '2026-08-20 16:45',
    isRead: true,
    referenceNo: 'INV-2026-4410',
  },
];

const mockPaymentHistory: PaymentHistoryRecord[] = [
  {
    id: 'pay-1',
    paymentRefNo: 'PAY-2026-9910',
    invoiceNo: 'INV-2026-4410',
    blNumber: 'BL-USNYC-88912',
    gateway: 'STRIPE',
    amount: 2170.0,
    currency: 'USD',
    paymentDate: '2026-08-20 16:50',
    status: 'SUCCESSFUL',
    payerName: 'Apex Logistics Global',
    receiptUrl: '#',
  },
  {
    id: 'pay-2',
    paymentRefNo: 'PAY-2026-9911',
    invoiceNo: 'INV-2026-4411',
    blNumber: 'BL-NLRTM-77123',
    gateway: 'NGENIUS',
    amount: 1700.0,
    currency: 'USD',
    paymentDate: '2026-08-15 11:20',
    status: 'SUCCESSFUL',
    payerName: 'Apex Logistics Global',
    receiptUrl: '#',
  },
  {
    id: 'pay-3',
    paymentRefNo: 'PAY-2026-9912',
    invoiceNo: 'INV-2026-4412',
    blNumber: 'BL-DEHAM-99410',
    gateway: 'BANK_TRANSFER',
    amount: 3050.0,
    currency: 'USD',
    paymentDate: '2026-08-10 14:10',
    status: 'PENDING',
    payerName: 'Apex Logistics Global',
  },
];

export const userModulesHandlers = [
  // 1. Profile
  http.get('/api/v1/user/profile', () => {
    return HttpResponse.json(mockProfile);
  }),
  http.put('/api/v1/user/profile', async ({ request }) => {
    const body = (await request.json()) as Partial<CustomerProfile>;
    mockProfile = { ...mockProfile, ...body };
    return HttpResponse.json(mockProfile);
  }),

  // 2. Change Password
  http.post('/api/v1/user/change-password', async ({ request }) => {
    const body = (await request.json()) as { oldPassword?: string; newPassword?: string };
    if (!body.oldPassword) {
      return HttpResponse.json(
        { success: false, message: 'Current password is required' },
        { status: 400 }
      );
    }
    return HttpResponse.json({
      success: true,
      message: 'Password updated successfully',
    });
  }),

  // 3. Quotes
  http.get('/api/v1/user/quotes', () => {
    return HttpResponse.json(mockQuotes);
  }),
  http.post('/api/v1/user/quotes', async ({ request }) => {
    const body = (await request.json()) as {
      polPort?: string;
      podPort?: string;
      equipmentType?: string;
      commodity?: string;
    };
    const newQuote: QuoteItem = {
      id: `q-${Date.now()}`,
      quoteNo: `QT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      polCode: body.polPort?.slice(0, 5) || 'USNYC',
      polName: body.polPort || 'Port of New York (USNYC)',
      podCode: body.podPort?.slice(0, 5) || 'SGSIN',
      podName: body.podPort || 'Port of Singapore (SGSIN)',
      equipmentType: body.equipmentType || '40ft High Cube Container (40HC)',
      commodity: body.commodity || 'General Cargo',
      validFrom: new Date().toISOString().split('T')[0],
      validTo: '2026-10-31',
      oceanFreightUSD: 1950.0,
      thcUSD: 300.0,
      totalAmountUSD: 2250.0,
      status: 'QUOTED',
      createdAt: new Date().toISOString().split('T')[0],
    };
    mockQuotes.unshift(newQuote);
    return HttpResponse.json(newQuote);
  }),

  // 4. Alerts
  http.get('/api/v1/user/alerts/preferences', () => {
    return HttpResponse.json(mockAlertPreferences);
  }),
  http.put('/api/v1/user/alerts/preferences', async ({ request }) => {
    const body = (await request.json()) as AlertPreference;
    mockAlertPreferences = { ...body };
    return HttpResponse.json(mockAlertPreferences);
  }),
  http.get('/api/v1/user/alerts/logs', () => {
    return HttpResponse.json(mockAlertLogs);
  }),

  // 5. Payments
  http.get('/api/v1/user/payments', () => {
    return HttpResponse.json(mockPaymentHistory);
  }),
];
