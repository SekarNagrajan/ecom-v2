// Modified by Sekar Nagarajan (2026-08-25 12:10)
export type CROPrintStatus = 'Y' | 'N';

export type CROReleaseStatus = 'Eligible' | 'Blocked' | 'Released' | 'Cancelled';

export interface CROEligibility {
  eligible: boolean;
  reasons: string[];
}

export interface CROContainerRow {
  containerNo: string;
  eqpSize: string;
  sealNo?: string;
}

export interface CROListDTO {
  croNo: string;
  bookingNo: string;
  vessel: string;
  voyage: string;
  loadPort: string;
  dischargePort: string;
  eqpType: string;
  qtyBooked: number;
  qtyReleased: number;
  emptyReleaseDepot: string;
  croDate: string;
  validTo: string;
  printStatus: CROPrintStatus;
  releaseStatus: CROReleaseStatus;
}

export interface CRODTO extends CROListDTO {
  containers: CROContainerRow[];
  eligibility: CROEligibility;
  polArrival?: string;
  polDeparture?: string;
  printCount: number;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: string;
  };
}

export function getCROReleaseStatusColor(status: CROReleaseStatus): string {
  switch (status) {
    case 'Eligible':
      return 'processing';
    case 'Released':
      return 'success';
    case 'Blocked':
      return 'error';
    case 'Cancelled':
      return 'default';
    default:
      return 'default';
  }
}
