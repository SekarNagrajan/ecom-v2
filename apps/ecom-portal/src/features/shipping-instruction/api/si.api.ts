import type { SIDTO, SIListDTO } from '../types/si.types';

// MOCK DATA
const mockSIList: SIListDTO[] = [
  {
    id: 'SI1001',
    siNo: 'SIN998283',
    bookingNo: 'BKG-778899',
    blNo: 'BL-998822',
    status: 'Submitted',
    blStatus: 'Draft',
    agencyRefNo: 'AGY-4455',
    origin: 'USNYC - NEW YORK',
    delivery: 'GBFEL - FELIXSTOWE',
    submittedDate: '2026-08-23T10:00:00Z',
    createdDate: '2026-08-20T14:30:00Z',
  },
  {
    id: 'SI1002',
    siNo: null,
    bookingNo: 'BKG-778900',
    blNo: null,
    status: 'Create SI',
    blStatus: null,
    agencyRefNo: 'AGY-4456',
    origin: 'CNSHA - SHANGHAI',
    delivery: 'USLAX - LOS ANGELES',
    submittedDate: null,
    createdDate: '2026-08-22T09:15:00Z',
  },
  {
    id: 'SI1003',
    siNo: 'SIN998285',
    bookingNo: 'BKG-778901',
    blNo: 'BL-998824',
    status: 'Draft',
    blStatus: 'Draft',
    agencyRefNo: 'AGY-4457',
    origin: 'SGSIN - SINGAPORE',
    delivery: 'JPTYO - TOKYO',
    submittedDate: null,
    createdDate: '2026-08-24T08:00:00Z',
  },
  {
    id: 'SI1004',
    siNo: 'SIN998286',
    bookingNo: 'BKG-778902',
    blNo: 'BL-998825',
    status: 'Declined',
    blStatus: null,
    agencyRefNo: 'AGY-4458',
    origin: 'USNYC - NEW YORK',
    delivery: 'GBFEL - FELIXSTOWE',
    submittedDate: '2026-08-21T10:00:00Z',
    createdDate: '2026-08-20T14:30:00Z',
  },
  {
    id: 'SI1005',
    siNo: 'SIN998287',
    bookingNo: 'BKG-778903',
    blNo: 'BL-998826',
    status: 'Accepted',
    blStatus: 'Confirmed',
    agencyRefNo: 'AGY-4459',
    origin: 'CNSHA - SHANGHAI',
    delivery: 'USLAX - LOS ANGELES',
    submittedDate: '2026-08-19T10:00:00Z',
    createdDate: '2026-08-18T14:30:00Z',
  },
  {
    id: 'SI1006',
    siNo: 'SIN998288',
    bookingNo: 'BKG-778904',
    blNo: 'BL-998827',
    status: 'Submitted',
    blStatus: 'Cancelled',
    agencyRefNo: 'AGY-4460',
    origin: 'SGSIN - SINGAPORE',
    delivery: 'JPTYO - TOKYO',
    submittedDate: '2026-08-22T08:00:00Z',
    createdDate: '2026-08-21T08:00:00Z',
  }
];

const mockSI: SIDTO = {
  id: 'SI1003',
  bookingNo: 'BKG-778901',
  siNo: 'SIN998285',
  blType: 'Original',
  releaseType: 'O',
  freightOption: 'PREPAID',
  parties: {
    shipper: {
      name: 'Global Logistics Corp',
      address: '123 Export Ave, Suite 400',
      city: 'Singapore',
      country: 'SG',
      printOnBl: true,
    },
    consignee: {
      name: 'Tokyo Imports Ltd',
      address: '456 Import St, Chiyoda',
      city: 'Tokyo',
      country: 'JP',
      printOnBl: true,
      toOrder: false,
    },
    notify: {
      name: 'Customs Brokers Inc',
      address: '789 Clearance Blvd',
      city: 'Tokyo',
      country: 'JP',
      printOnBl: false,
    }
  },
  containers: [
    {
      id: 'CONT-1',
      containerNo: 'MSKU1234567',
      eqpSize: '40HC',
      carrierSeal: 'SEAL9988',
      shipperSeal: 'SHP1122',
      cargoLines: [
        {
          id: 'CARGO-1',
          marksAndNumbers: 'N/M',
          description: 'ELECTRONICS AND SPARE PARTS',
          commodityCode: 'ELEC',
          hsCode: '8517.12.00',
          packageCount: 120,
          packageType: 'Cartons',
          grossWeight: 4500,
          volume: 24.5,
        }
      ]
    }
  ]
};

export const fetchSIList = async (): Promise<{ data: SIListDTO[] }> => {
  if (import.meta.env.VITE_API_MODE === 'mock' || true) { // Defaulting to mock for now
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: mockSIList });
      }, 800);
    });
  }
  
  // Real API integration would go here
  throw new Error('Real API not implemented yet');
};

export const fetchSIDetails = async (id: string): Promise<{ data: SIDTO }> => {
  if (import.meta.env.VITE_API_MODE === 'mock' || true) { // Defaulting to mock for now
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: { ...mockSI, id } });
      }, 500);
    });
  }
  
  // Real API integration would go here
  throw new Error('Real API not implemented yet');
};
