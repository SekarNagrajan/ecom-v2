// Modified by Sekar Nagarajan (2026-08-31 18:52)
export type BookingListStatus =
  | "Draft"
  | "Submitted"
  | "Confirmed"
  | "Awaiting Acceptance"
  | "In Transit"
  | "Completed"
  | "Rejected"
  | "Cancelled";

export interface BookingListDTO {
  id: string;
  bookingNo: string;
  onlineRefNo: string;
  agencyRefNo: string;
  status: BookingListStatus;
  origin: string;
  delivery: string;
  createdDate: string;
  confirmedDate?: string;
  dgStatus: "Y" | "N";
  teusCount: number;
  submittedDate: string;
}

/** Ant Design Tag color for booking list / drawer status badges. */
export function getBookingListStatusColor(status: BookingListStatus): string {
  switch (status) {
    case "Draft":
      return "default";
    case "Submitted":
    case "Awaiting Acceptance":
      return "processing";
    case "Confirmed":
    case "Completed":
      return "success";
    case "In Transit":
      return "cyan";
    case "Cancelled":
      return "error";
    case "Rejected":
      return "error";
    default:
      return "default";
  }
}
