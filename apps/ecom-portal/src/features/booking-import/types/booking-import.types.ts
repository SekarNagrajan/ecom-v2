// Modified by Sekar Nagarajan (2026-09-15 16:45)
import type { BookingPayload } from "../../booking/types/booking.types";

/** Flat Excel / grid values for one booking row (v1: single container + commodity). */
export interface BookingImportValues {
  origin: string;
  delivery: string;
  cargoReadyDate: string;
  shipperName: string;
  agreementParty: string;
  siSubmittingParty: string;
  containerType: string;
  quantity: number | string;
  hsCode: string;
  weight: number | string;
  haulageOriginType: string;
  haulageDestinationType: string;
  carriageContract: string;
  agencyReference: string;
  customerReference: string;
  onlineBookingNo: string;
  shipperContact: string;
  shipperEmail: string;
  consigneeName: string;
  consigneeContact: string;
  consigneeEmail: string;
  notifyPartyName: string;
  notifyPartyContact: string;
  notifyPartyEmail: string;
  commodityDescription: string;
}

/** Commit payload = same shape the wizard posts via submitBooking. */
export type BookingImportPayload = BookingPayload;

export interface BulkBookingImportRowSuccess {
  rowNumber: number;
  bookingReference: string | null;
}

export interface BulkBookingImportRowError {
  rowNumber: number;
  field: string | null;
  message: string;
}

export interface BulkBookingImportResult {
  totalRows: number;
  successCount: number;
  failedCount: number;
  dryRun: boolean;
  created: BulkBookingImportRowSuccess[];
  errors: BulkBookingImportRowError[];
}
