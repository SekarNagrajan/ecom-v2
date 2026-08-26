// Created by Antigravity (2026-08-22 09:50)

export interface BookingListDTO {
  id: string;
  bookingNo: string;
  onlineRefNo: string;
  agencyRefNo: string;
  status: "Confirmed" | "Awaiting Acceptance" | "Rejected";
  origin: string;
  delivery: string;
  createdDate: string;
  confirmedDate?: string;
  dgStatus: "Y" | "N";
  teusCount: number;
  submittedDate: string;
}

// ... existing schema ...
