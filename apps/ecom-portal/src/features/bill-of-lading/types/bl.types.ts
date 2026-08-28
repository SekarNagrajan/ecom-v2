// Modified by Sekar Nagarajan (2026-08-28 12:22)
import { z } from "zod";

import type { EnsData, InsuranceData } from "../../booking/types/booking.types";
import type { SIContainer } from "../../shipping-instruction/types/si.types";

export type BLRowStatus = "D" | "S" | "C" | "I";
export type BLPrintType = "draft" | "original" | "nn";
export type BLPrepaidCollect = "PREPAID" | "COLLECT" | "PAY_AT";
export type BLManifestType = "cargo" | "freight";

export const BL_STATUS_LABELS: Record<BLRowStatus, string> = {
  D: "Draft",
  S: "Submitted",
  C: "Confirmed",
  I: "Issued",
};

export interface BLListDTO {
  blNo: string;
  mcnNo: string | null;
  bookingNo: string;
  siNo: string | null;
  status: BLRowStatus;
  statusLabel: string;
  agencyRefNo: string | null;
  origin: string;
  loadPort: string;
  dischargePort: string;
  delivery: string;
  confirmedDate: string | null;
  createdDate: string | null;
  printStatus: "Y" | "N";
  appVersion: "1" | "2";
  isLocked: boolean;
  draftAccepted?: boolean;
  paymentEligible?: boolean;
  paymentCompleted?: boolean;
  payAmountUsd?: number;
  fcnNo?: string;
  hasInsurance?: boolean;
  policyNo?: string | null;
  issueAgency?: string;
}

export interface BLParty {
  name: string;
  address: string;
  city: string;
  country: string;
  printOnBl?: boolean;
  printHeader?: string;
  email?: string;
  phone?: string;
  fax?: string;
  zipCode?: string;
  eori?: string;
  personType?: string;
  state?: string;
}

export interface BLConsigneeParty extends BLParty {
  toOrder: boolean;
}

export interface BLRoutingLeg {
  id: string;
  legType: string;
  vesselName: string;
  voyage?: string;
  polPortName: string;
  podPortName: string;
  etd: string;
  eta: string;
}

export interface BLRouting {
  originPrint: string;
  polPrint: string;
  podPrint: string;
  deliveryPrint: string;
  vesselVoyage: string;
  scheduleLegs: BLRoutingLeg[];
}

export interface BLPreviewFields {
  declaredValue?: string;
  siCustRemarks?: string;
  siAesNumber?: string;
  aesDisclaimer?: "provided" | "not_applicable";
  packingList?: string;
  invoiceUpload?: string;
  blTypeUae?: "Master BL" | "Direct BL";
  mpciIdUae?: string;
  acidValue?: string;
}

export interface BLCargoProtectLine {
  id: string;
  productCode: string;
  description: string;
  amount: number;
  currency: string;
}

export interface BLFileUploadItem {
  id: string;
  category: "VGM" | "DG" | "LOI" | "OTHER";
  fileName: string;
  uploadedAt: string;
}

export interface BLInsuranceInfo extends InsuranceData {
  policyNo?: string;
  optOut?: boolean;
}

export interface BLSubmitResult {
  success: boolean;
  messages: string[];
  insuranceMessage?: string;
  fileRestrictionMessage?: string;
}

export interface BLDTO {
  id: string;
  blNo: string;
  siNo: string;
  bookingNo: string;
  status: BLRowStatus;
  blType: "Original" | "Seaway";
  releaseType: "O" | "T";
  freightOption: "PREPAID" | "COLLECT";
  appVersion: "1" | "2";
  printCount: number;
  issuedAt: string | null;
  mcnNo: string | null;
  agencyRefNo: string | null;
  origin: string;
  loadPort: string;
  dischargePort: string;
  delivery: string;
  loadPortCountry?: string;
  dischargePortCountry?: string;
  t2lFiling?: boolean;
  nvocc?: boolean;
  ensFiling?: "S" | "P" | "N";
  ensDocType?: "S" | "C";
  routing: BLRouting;
  preview: BLPreviewFields;
  parties: {
    shipper: BLParty;
    consignee: BLConsigneeParty;
    notify: BLParty;
    notify2?: BLParty;
    notify3?: BLParty;
    forwarder?: BLParty;
    warehouse?: BLParty;
    notifySameAsConsignee?: boolean;
  };
  containers: SIContainer[];
  charges: BLChargeLine[];
  ens?: EnsData | null;
  insurance?: BLInsuranceInfo | null;
  cargoProtect?: BLCargoProtectLine[];
  files?: BLFileUploadItem[];
  submitResult?: BLSubmitResult;
}

export interface BLChargeLine {
  id: string;
  chargeCode: string;
  description: string;
  amount: number;
  currency: string;
  prepaidCollect: BLPrepaidCollect;
  payByCustType: string;
  prepaidAmount?: number;
  collectAmount?: number;
  payAtAmount?: number;
}

export interface BLChargeTotal {
  currency: string;
  prepaid: number;
  collect: number;
  payAt: number;
  grandTotal: number;
}

export interface BLChargesDTO {
  blNo: string;
  lines: BLChargeLine[];
  totals: BLChargeTotal[];
}

export interface BLInsuranceDTO {
  blNo: string;
  policyNo: string;
  provider: string;
  coverageAmount: number;
  currency: string;
  effectiveDate: string;
}

export interface BLPaymentIntentDTO {
  clientSecret: string;
  amountUsd: number;
  blNos: string[];
}

export interface MCNListDTO {
  mcnId: string;
  blNo: string;
  bookingNo: string;
  status: "Draft" | "Submitted" | "Confirmed";
  origin: string;
  delivery: string;
}

export interface MCNDTO {
  mcnId: string;
  blNo: string;
  bookingNo: string;
  status: "Draft" | "Submitted" | "Confirmed";
  vessel: string;
  voyage: string;
  loadPort: string;
  dischargePort: string;
  containerCount: number;
  remarks?: string;
  cargoDescription?: string;
  freightTerms?: string;
}

export interface BLListFilters {
  startRow?: number;
  endRow?: number;
}

export interface ApiResponse<T> {
  data?: T;
  meta?: { totalCount?: number };
  error?: { code: string; message: string; details?: string };
}

const partySchema = z.object({
  name: z.string().min(1),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  printOnBl: z.boolean().default(true),
  printHeader: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  fax: z.string().optional(),
  zipCode: z.string().optional(),
  eori: z.string().optional(),
  personType: z.string().optional(),
  state: z.string().optional(),
});

const cargoLineSchema = z.object({
  id: z.string(),
  marksAndNumbers: z.string().optional(),
  description: z.string().min(1, "Commodity Description is required"),
  commodityCode: z.string().optional(),
  hsCode: z.string().min(1, "Commodity Code is required"),
  packageCount: z.number().int().min(1, "Quantity is required"),
  packageType: z.string().min(1, "Package Type is required"),
  grossWeight: z.number().min(1, "Weight is required"),
  volume: z.number().min(0, "Volume is required"),
  // Modified by Sekar Nagarajan (2026-08-28 12:22)
  isDangerousGoods: z.boolean().optional(),
  unNumber: z.string().optional(),
  dgClass: z.string().optional(),
  flashPoint: z.string().optional(),
  marinePollutant: z.boolean().optional(),
  shippingName: z.string().optional(),
});

const containerSchema = z.object({
  id: z.string(),
  containerNo: z.string().min(1),
  eqpSize: z.string().min(1),
  carrierSeal: z.string().optional(),
  shipperSeal: z.string().optional(),
  isSoc: z.boolean().optional(),
  tareWeight: z.number().optional(),
  reeferMode: z.enum(["none", "operating", "nor"]).optional(),
  setTemp: z.number().optional(),
  tempUnit: z.string().optional(),
  isOog: z.boolean().optional(),
  olForward: z.number().optional(),
  olAft: z.number().optional(),
  owLeft: z.number().optional(),
  owRight: z.number().optional(),
  oh: z.number().optional(),
  dimensionUnit: z.string().optional(),
  cargoLines: z.array(cargoLineSchema).min(1),
});

export const blMasterStepSchema = z.object({
  blType: z.enum(["Original", "Seaway"]),
  releaseType: z.enum(["O", "T"]),
  freightOption: z.enum(["PREPAID", "COLLECT"]),
  t2lFiling: z.boolean().optional(),
  nvocc: z.boolean().optional(),
  ensFiling: z.enum(["S", "P", "N"]).optional(),
  ensDocType: z.enum(["S", "C"]).optional(),
});

export const blRoutingStepSchema = z.object({
  originPrint: z.string().min(1, "Origin print text is required").max(149),
  polPrint: z.string().min(1, "POL print text is required").max(149),
  podPrint: z.string().min(1, "POD print text is required").max(149),
  deliveryPrint: z.string().min(1, "Delivery print text is required").max(149),
  vesselVoyage: z.string().optional(),
});

export const blPartiesStepSchema = z.object({
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

export const blChargeLineSchema = z.object({
  id: z.string(),
  chargeCode: z.string().min(1),
  description: z.string().min(1),
  amount: z.number().min(0),
  currency: z.string().min(1),
  prepaidCollect: z.enum(["PREPAID", "COLLECT", "PAY_AT"]),
  payByCustType: z.string().min(1, "Freight/Payor is missing"),
  prepaidAmount: z.number().optional(),
  collectAmount: z.number().optional(),
  payAtAmount: z.number().optional(),
});

export const blChargesStepSchema = z.object({
  charges: z
    .array(blChargeLineSchema)
    .min(1, "At least one charge is required"),
});

export const blPreviewStepSchema = z.object({
  declaredValue: z.string().max(50).optional(),
  siCustRemarks: z.string().optional(),
  siAesNumber: z.string().max(50).optional(),
  aesDisclaimer: z.enum(["provided", "not_applicable"]).optional(),
  packingList: z.string().max(30).optional(),
  invoiceUpload: z.string().max(30).optional(),
  blTypeUae: z.enum(["Master BL", "Direct BL"]).optional(),
  mpciIdUae: z
    .string()
    .max(10)
    .regex(/^[a-zA-Z0-9]*$/, "MPCI ID must be alphanumeric")
    .optional(),
  acidValue: z.string().max(20).optional(),
});

export const blSchema = z
  .object({
    bookingNo: z.string(),
    siNo: z.string(),
    blType: z.enum(["Original", "Seaway"]),
    releaseType: z.enum(["O", "T"]),
    freightOption: z.enum(["PREPAID", "COLLECT"]),
    parties: z.object({
      shipper: partySchema,
      consignee: partySchema.extend({ toOrder: z.boolean().optional() }),
      notify: partySchema,
    }),
    containers: z.array(containerSchema).min(1),
  })
  .superRefine((data, ctx) => {
    if (data.blType === "Seaway" && data.parties.consignee.toOrder) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Sea waybill cannot have consignee to order",
        path: ["parties", "consignee", "toOrder"],
      });
    }
  });

export type BLMasterStepValues = z.infer<typeof blMasterStepSchema>;
export type BLRoutingStepValues = z.infer<typeof blRoutingStepSchema>;
export type BLPartiesStepValues = z.infer<typeof blPartiesStepSchema>;
export type BLChargesStepValues = z.infer<typeof blChargesStepSchema>;
export type BLPreviewStepValues = z.infer<typeof blPreviewStepSchema>;

export function createDefaultBlRouting(
  detail: Pick<BLDTO, "origin" | "loadPort" | "dischargePort" | "delivery">,
): BLRouting {
  return {
    originPrint: detail.origin,
    polPrint: detail.loadPort,
    podPrint: detail.dischargePort,
    deliveryPrint: detail.delivery,
    vesselVoyage: "",
    scheduleLegs: [],
  };
}

export function createEmptyBlPreview(): BLPreviewFields {
  return {};
}

/** @deprecated Prefer `utils/bl-status` — kept for gradual import migration */
export { getBLStatusColor } from "../utils/bl-status";
