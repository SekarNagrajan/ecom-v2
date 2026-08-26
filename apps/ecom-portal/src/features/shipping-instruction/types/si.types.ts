// Modified by Sekar Nagarajan (2026-08-26 12:19)
import { z } from "zod";

export type SIStatus =
  | "Create SI"
  | "Draft"
  | "Submitted"
  | "Accepted"
  | "Declined";
export type BLStatus = "Draft" | "Confirmed" | "Issued" | "Cancelled";

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
  blType: "Original" | "Seaway";
  releaseType: "O" | "T";
  freightOption: "PREPAID" | "COLLECT";
  parties: {
    shipper: SIParty;
    consignee: SIParty & { toOrder: boolean };
    notify: SIParty;
    notify2?: SIParty;
    notify3?: SIParty;
  };
  containers: SIContainer[];
}

/** Step 1 — Master Details */
export const siMasterDetailsSchema = z.object({
  blType: z.enum(["Original", "Seaway"], {
    message: "B/L Type is required",
  }),
  releaseType: z.enum(["O", "T"], {
    message: "Release Type is required",
  }),
  freightOption: z.enum(["PREPAID", "COLLECT"], {
    message: "Freight Option is required",
  }),
});
export type SiMasterDetailsForm = z.infer<typeof siMasterDetailsSchema>;

/** Step 2 — Parties */
export const siPartiesSchema = z.object({
  shipperName: z.string().min(1, "Shipper name is required"),
  shipperAddress: z.string().min(1, "Shipper address is required"),
  shipperPrint: z.boolean(),
  consigneeName: z.string().min(1, "Consignee name is required"),
  consigneeAddress: z.string().min(1, "Consignee address is required"),
  consigneePrint: z.boolean(),
  consigneeToOrder: z.boolean(),
  notifyName: z.string().min(1, "Notify party name is required"),
  notifyAddress: z.string().min(1, "Notify party address is required"),
  notifyPrint: z.boolean(),
});
export type SiPartiesForm = z.infer<typeof siPartiesSchema>;
