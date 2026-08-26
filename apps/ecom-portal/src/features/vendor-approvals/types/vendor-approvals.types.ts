// Created by Sekar Nagarajan (2026-08-26 16:25)
export type ApprovalRequestType = "BOOKING" | "SI" | "VGM";
export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface VendorApprovalItem {
  id: string;
  referenceNo: string;
  customerName: string;
  submittedDate: string;
  type: ApprovalRequestType;
  originPort: string;
  destPort: string;
  status: ApprovalStatus;
}
