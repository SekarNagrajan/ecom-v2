// Created by Antigravity (2026-08-24 11:59)
import type { ApiResponse } from '../../../types/api.types';

export interface VgmContainerDTO {
  containerNo: string;
  eqpType: string;
  tareWeight: number;
  vgmWeight: number | null;
  vgmUnit: 'K' | 'T';
  method: 'SM1' | 'SM2';
  date: string | null; // ISO string
}

export interface VgmReferenceDetailsDTO {
  referenceNo: string;
  type: 'bookno' | 'blno';
  shipperName: string;
  apName: string;
  origin: string;
  delivery: string;
  pol: string;
  pod: string;
}

export interface VgmDeclarationDTO {
  referenceDetails: VgmReferenceDetailsDTO;
  containers: VgmContainerDTO[];
  
  // Party Details
  companyName?: string;
  orderNo?: string;
  addr1?: string;
  addr2?: string;
  obtainDate?: string;
  obtainMethod?: 'SM1' | 'SM2';
  authPerson?: string;
  country?: string;
  city?: string;
  phone?: string;
  email?: string;
  zipcode?: string;
  fax?: string;
}

export interface VgmSubmitPayload {
  referenceNo: string;
  type: 'bookno' | 'blno';
  partyDetails: Omit<VgmDeclarationDTO, 'referenceDetails' | 'containers'>;
  containers: {
    containerNo: string;
    vgmWeight: number;
    vgmUnit: 'K' | 'T';
    method: 'SM1' | 'SM2';
    date: string;
  }[];
  sendEmailId: string;
}
