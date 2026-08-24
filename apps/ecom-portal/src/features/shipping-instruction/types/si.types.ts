// Created by Antigravity (2026-08-24 11:18)
export type SIStatus = 'Create SI' | 'Draft' | 'Submitted' | 'Accepted' | 'Declined';
export type BLStatus = 'Draft' | 'Confirmed' | 'Issued' | 'Cancelled';

export interface SIListDTO {
  id: string;
  siNo: string | null;
  bookingNo: string;
  blNo: string | null;
  status: SIStatus;
  blStatus: BLStatus | null;
  agencyRefNo: string;
  origin: string;
  delivery: string;
  submittedDate: string | null;
  createdDate: string | null;
}

export interface SIParty {
  name: string;
  address: string;
  city: string;
  country: string;
  printOnBl?: boolean;
}

export interface SICargoLine {
  id: string;
  marksAndNumbers: string;
  description: string;
  commodityCode: string;
  hsCode: string;
  packageCount: number;
  packageType: string;
  grossWeight: number;
  volume: number;
}

export interface SIContainer {
  id: string;
  containerNo: string;
  eqpSize: string;
  carrierSeal: string;
  shipperSeal: string;
  cargoLines: SICargoLine[];
}

export interface SIDTO {
  id: string;
  bookingNo: string;
  siNo: string | null;
  blType: 'Original' | 'Seaway';
  releaseType: 'O' | 'T'; // Original / Telex
  freightOption: 'PREPAID' | 'COLLECT';
  parties: {
    shipper: SIParty;
    consignee: SIParty & { toOrder: boolean };
    notify: SIParty;
    notify2?: SIParty;
    notify3?: SIParty;
  };
  containers: SIContainer[];
}
