// Created by Sekar Nagarajan (2026-09-16 17:42)
import type {
  ApprovalRequestType,
  ApprovalStatus,
  VendorApprovalItem,
} from "../types/vendor-approvals.types";

const CUSTOMERS = [
  "Apex Logistics Global",
  "Atlantic Freight LLC",
  "Pacific Maritime Corp",
  "Global Shippers Inc",
  "Blue Ocean Trading",
  "Horizon Cargo Services",
  "Summit Freight Partners",
  "Eastern Seaboard Lines",
  "Nova Intermodal Co.",
  "Crescent Shipping Agency",
  "Harborlink Logistics",
  "TransAsia Cargo Pvt Ltd",
  "Nordic Bulk Carriers",
  "Silver Stream Exports",
  "Unity Freight Solutions",
] as const;

const PORTS = [
  "USNYC",
  "SGSIN",
  "NLRTM",
  "CNSHA",
  "DEHAM",
  "AEJEA",
  "INNSA",
  "LKCMB",
  "HKHKG",
  "KRPUS",
  "JPYOK",
  "GBFXT",
] as const;

const TYPES: ApprovalRequestType[] = ["BOOKING", "SI", "VGM"];

const TYPE_PREFIX: Record<ApprovalRequestType, string> = {
  BOOKING: "BKG",
  SI: "SI",
  VGM: "VGM",
};

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function buildSubmittedDate(index: number): string {
  // Spread across ~3 weeks ending 21 Aug 2026
  const day = 21 - (index % 21);
  const hour = 8 + (index % 10);
  const minute = (index * 7) % 60;
  return `2026-08-${pad2(Math.max(day, 1))} ${pad2(hour)}:${pad2(minute)}`;
}

function buildMockItem(index: number): VendorApprovalItem {
  const n = index + 1;
  const type = TYPES[index % TYPES.length];
  // Mix: mostly pending, then approved, fewer rejected (~50% / 30% / 20%)
  const statusRoll = index % 10;
  const status: ApprovalStatus =
    statusRoll < 5 ? "PENDING" : statusRoll < 8 ? "APPROVED" : "REJECTED";
  const origin = PORTS[index % PORTS.length];
  const dest = PORTS[(index + 3) % PORTS.length];

  return {
    id: String(n),
    referenceNo: `${TYPE_PREFIX[type]}-2026-${String(1000 + n).padStart(4, "0")}`,
    customerName: CUSTOMERS[index % CUSTOMERS.length],
    submittedDate: buildSubmittedDate(index),
    type,
    originPort: origin,
    destPort: dest === origin ? PORTS[(index + 5) % PORTS.length] : dest,
    status,
  };
}

/** In-memory seed — 50 agency approval queue rows for list / pagination demos. */
export const MOCK_VENDOR_APPROVALS: VendorApprovalItem[] = Array.from(
  { length: 50 },
  (_, index) => buildMockItem(index),
);

export const MOCK_VENDOR_APPROVAL_STATUS_COUNTS = MOCK_VENDOR_APPROVALS.reduce(
  (acc, item) => {
    acc[item.status] += 1;
    return acc;
  },
  { PENDING: 0, APPROVED: 0, REJECTED: 0 } as Record<ApprovalStatus, number>,
);
