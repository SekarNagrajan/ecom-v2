// Created by Sekar Nagarajan (2026-08-24 14:46)
export interface DOSummaryRow {
  delordno: string;
  delorddate: string; // ISO format
  blnumber: string;
  vessel: string;
  voyage: string;
  bound: string;
  loadport: string;
  dischargeport: string;
  terminal: string;
  arrdate: string; // ISO format
  dovaliditydate: string; // ISO format
  printstatus: 'Y' | 'N';
  ecomprintstatus: string;
}
