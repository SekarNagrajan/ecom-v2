// Modified by Sekar Nagarajan (2026-08-25 12:20)
export type ArrivalNoticePrintStatus = 'Y' | 'N';

export interface ArrivalNoticeContainerRow {
  containerNo: string;
  eqpSize: string;
  sealNo?: string;
}

export interface ArrivalNoticeChargeLine {
  chargeCode: string;
  description: string;
  amount: number;
  currency: string;
}

export interface ArrivalNoticeFreeTime {
  days: number;
  lastFreeDay: string;
}

export interface ArrivalNoticeListDTO {
  anNo: string;
  blNumber: string;
  vessel: string;
  voyage: string;
  dischargePort: string;
  terminal: string;
  etaDate: string;
  arrivalDate: string;
  lastFreeDay?: string;
  chargesDue: number;
  currency: string;
  printStatus: ArrivalNoticePrintStatus;
}

export interface ArrivalNoticeDTO extends ArrivalNoticeListDTO {
  notifyParty: string;
  consignee: string;
  manifestRef?: string;
  igmNo?: string;
  containers: ArrivalNoticeContainerRow[];
  chargeLines: ArrivalNoticeChargeLine[];
  freeTime?: ArrivalNoticeFreeTime;
  demurrageFrom?: string;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: string;
  };
}

export const ARN_PRINT_STATUS_LABELS: Record<ArrivalNoticePrintStatus, string> = {
  Y: 'Printed',
  N: 'Not Printed',
};

export function getArrivalNoticePrintStatusColor(
  status: ArrivalNoticePrintStatus
): string {
  return status === 'Y' ? 'success' : 'default';
}

export function formatArrivalNoticeAmount(amount: number, currency: string): string {
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${formatted} ${currency}`;
}
