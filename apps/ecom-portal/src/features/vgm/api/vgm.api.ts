// Created by Antigravity (2026-08-24 12:00)
import type { ApiResponse } from '../../../types/api.types';
import type { VgmDeclarationDTO, VgmSubmitPayload } from '../types/vgm.types';

// MOCK DATA
const MOCK_VGM_DATA: Record<string, VgmDeclarationDTO> = {
  'BKG-123456': {
    referenceDetails: {
      referenceNo: 'BKG-123456',
      type: 'bookno',
      shipperName: 'GLOBAL EXPORTS LTD',
      apName: 'GLOBAL EXPORTS LTD',
      origin: 'USNYC - NEW YORK',
      delivery: 'GBFEL - FELIXSTOWE',
      pol: 'USNYC - NEW YORK',
      pod: 'GBFEL - FELIXSTOWE',
    },
    containers: [
      { containerNo: 'MSKU1234567', eqpType: '40HC', tareWeight: 3850, vgmWeight: null, vgmUnit: 'K', method: 'SM1', date: null },
      { containerNo: 'MSKU7654321', eqpType: '40HC', tareWeight: 3850, vgmWeight: null, vgmUnit: 'K', method: 'SM1', date: null },
    ],
    companyName: 'GLOBAL EXPORTS LTD',
    obtainMethod: 'SM1'
  },
  'BL-987654': {
    referenceDetails: {
      referenceNo: 'BL-987654',
      type: 'blno',
      shipperName: 'PACIFIC IMPORTS LLC',
      apName: 'PACIFIC IMPORTS LLC',
      origin: 'CNSHA - SHANGHAI',
      delivery: 'USLAX - LOS ANGELES',
      pol: 'CNSHA - SHANGHAI',
      pod: 'USLAX - LOS ANGELES',
    },
    containers: [
      { containerNo: 'CMAU9876543', eqpType: '20ST', tareWeight: 2200, vgmWeight: null, vgmUnit: 'K', method: 'SM1', date: null },
    ],
    companyName: 'PACIFIC IMPORTS LLC',
    obtainMethod: 'SM1'
  }
};

export const searchVgmReference = async (type: 'bookno' | 'blno', referenceNo: string): Promise<ApiResponse<VgmDeclarationDTO>> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const data = MOCK_VGM_DATA[referenceNo];
      if (data && data.referenceDetails.type === type) {
        resolve({ data });
      } else {
        reject({ error: { code: 'NOT_FOUND', message: 'Invalid Booking or BL Number.' } });
      }
    }, 800);
  });
};

export const submitVgm = async (payload: VgmSubmitPayload): Promise<ApiResponse<{ message: string }>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: { message: 'VGM successfully submitted and email sent.' } });
    }, 1000);
  });
};
