// Modified by Sekar Nagarajan (2026-08-28 11:47)
import { z } from "zod";

/** List / lifecycle — mirrors SISummary.jsp statuses (+ Locked / Create Multiple SI). */
export type SIStatus =
  | "Create SI"
  | "Create Multiple SI"
  | "Draft"
  | "Submitted"
  | "Accepted"
  | "Declined"
  | "Locked";

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
  bookingStatus?: string | null;
}

export interface SIParty {
  name: string;
  address: string;
  address2?: string;
  city: string;
  state?: string;
  country: string;
  zip?: string;
  phone?: string;
  fax?: string;
  email?: string;
  eori?: string;
  personType?: string;
  customerCode?: string;
  printOnBl?: boolean;
  printHeader?: string;
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
  netWeight?: number;
  volume: number;
  buyerName?: string;
  sellerName?: string;
  // Modified by Sekar Nagarajan (2026-08-28 12:22)
  isDangerousGoods?: boolean;
  unNumber?: string;
  dgClass?: string;
  flashPoint?: string;
  marinePollutant?: boolean;
  shippingName?: string;
}

export interface SIContainer {
  id: string;
  containerNo: string;
  eqpSize: string;
  carrierSeal: string;
  shipperSeal: string;
  cargoLines: SICargoLine[];
  /** SOC / reefer / OOG — SIBLCommonCargo.jsp parity */
  isSoc?: boolean;
  tareWeight?: number;
  reeferMode?: "none" | "operating" | "nor";
  setTemp?: number;
  tempUnit?: string;
  ventilation?: string;
  isOog?: boolean;
  olForward?: number;
  olAft?: number;
  owLeft?: number;
  owRight?: number;
  oh?: number;
  dimensionUnit?: string;
}

export type SIPrepaidCollect = "PREPAID" | "COLLECT" | "PAY_AT";

export interface SIChargeLine {
  id: string;
  chargeCode: string;
  description: string;
  amount: number;
  currency: string;
  prepaidCollect: SIPrepaidCollect;
  payByCustType: string;
  prepaidAmount?: number;
  collectAmount?: number;
  payAtAmount?: number;
}

export interface SIRoutingLeg {
  id: string;
  vesselName: string;
  voyage?: string;
  polPortName: string;
  podPortName: string;
  etd: string;
  eta: string;
}

export interface SIRouting {
  originPrint: string;
  polPrint: string;
  podPrint: string;
  deliveryPrint: string;
  vesselVoyage: string;
  scheduleLegs: SIRoutingLeg[];
}

export interface SIInsuranceInfo {
  isInsuranceRequired: boolean;
  currency: string;
  cargoValue?: number;
  termsAccepted: boolean;
  optOut: boolean;
  policyNo?: string;
}

export interface SICargoProtectLine {
  id: string;
  productCode: string;
  description: string;
  amount: number;
  currency: string;
}

export interface SIEnsInfo {
  ensRequired: boolean;
  filingType: "N" | "S" | "P";
  declarantName?: string;
  buyerName?: string;
  sellerName?: string;
  euZone?: string;
}

export interface SIFileItem {
  id: string;
  fileName: string;
  fileType: string;
  uploadedAt: string;
  sizeKb: number;
}

export interface SIPreviewFields {
  declaredValue?: string;
  customerRemarks?: string;
  aesNumber?: string;
  aesDisclaimer?: "provided" | "not_applicable";
  blTypeUae?: "Master BL" | "Direct BL";
  mpciIdUae?: string;
  acidValue?: string;
}

export interface SIDTO {
  id: string;
  bookingNo: string;
  siNo: string | null;
  blNo?: string | null;
  agencyRefNo?: string;
  blType: "Original" | "Seaway";
  releaseType: "O" | "T";
  freightOption: "PREPAID" | "COLLECT";
  nvocc?: boolean;
  t2lFiling?: boolean;
  ensFilingHint?: "N" | "S" | "P";
  origin?: string;
  loadPort?: string;
  dischargePort?: string;
  delivery?: string;
  parties: {
    shipper: SIParty;
    consignee: SIParty & { toOrder: boolean };
    notify: SIParty;
    notify2?: SIParty;
    notify3?: SIParty;
    forwarder?: SIParty;
    warehouse?: SIParty;
    agreementParty?: SIParty;
  };
  routing?: SIRouting;
  containers: SIContainer[];
  charges?: SIChargeLine[];
  insurance?: SIInsuranceInfo | null;
  cargoProtect?: SICargoProtectLine[];
  ens?: SIEnsInfo | null;
  files?: SIFileItem[];
  preview?: SIPreviewFields;
}

/** Step 1 — Master Details (SIBookingDetails.jsp flags) */
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
  nvocc: z.boolean().optional(),
  t2lFiling: z.boolean().optional(),
  ensFilingHint: z.enum(["N", "S", "P"]).optional(),
  agencyRefNo: z.string().optional(),
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

export const siRoutingStepSchema = z.object({
  originPrint: z.string().min(1, "Origin print text is required"),
  polPrint: z.string().min(1, "Load port print text is required"),
  podPrint: z.string().min(1, "Discharge port print text is required"),
  deliveryPrint: z.string().min(1, "Delivery print text is required"),
  vesselVoyage: z.string().optional(),
});
export type SiRoutingStepValues = z.infer<typeof siRoutingStepSchema>;

export const siChargeLineSchema = z.object({
  id: z.string(),
  chargeCode: z.string().min(1, "Charge code is required"),
  description: z.string().min(1, "Description is required"),
  amount: z.number().min(0),
  currency: z.string().min(1),
  prepaidCollect: z.enum(["PREPAID", "COLLECT", "PAY_AT"]),
  payByCustType: z.string().min(1, "Payor is required"),
  prepaidAmount: z.number().optional(),
  collectAmount: z.number().optional(),
  payAtAmount: z.number().optional(),
});

export const siChargesStepSchema = z.object({
  charges: z.array(siChargeLineSchema).min(1, "At least one charge is required"),
});
export type SiChargesStepValues = z.infer<typeof siChargesStepSchema>;

export const siPreviewStepSchema = z.object({
  declaredValue: z.string().optional(),
  customerRemarks: z.string().optional(),
  aesNumber: z.string().optional(),
  aesDisclaimer: z.enum(["provided", "not_applicable"]).optional(),
  blTypeUae: z.enum(["Master BL", "Direct BL"]).optional(),
  mpciIdUae: z.string().max(10).optional(),
  acidValue: z.string().optional(),
});
export type SiPreviewStepValues = z.infer<typeof siPreviewStepSchema>;

const newCargoLineId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `cargo-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const siCargoLineSchema = z.object({
  id: z.string().min(1),
  hsCode: z.string().min(1, "Commodity Code is required"),
  commodityCode: z.string().optional(),
  packageType: z.string().min(1, "Package Type is required"),
  packageCount: z.number().min(1, "Quantity is required"),
  grossWeight: z.number().min(1, "Weight is required"),
  volume: z.number().min(0, "Volume is required"),
  description: z.string().min(1, "Commodity Description is required"),
  marksAndNumbers: z.string().optional(),
  // Modified by Sekar Nagarajan (2026-08-28 12:22)
  isDangerousGoods: z.boolean().optional().default(false),
  unNumber: z.string().optional(),
  dgClass: z.string().optional(),
  flashPoint: z.string().optional(),
  marinePollutant: z.boolean().optional().default(false),
  shippingName: z.string().optional(),
});

export const siContainerCargoSchema = z.object({
  id: z.string(),
  containerNo: z.string(),
  eqpSize: z.string(),
  carrierSeal: z.string().optional(),
  shipperSeal: z.string().optional(),
  cargoLines: z
    .array(siCargoLineSchema)
    .min(1, "At least one commodity is required"),
});

export const siCargoStepSchema = z
  .object({
    containers: z.array(siContainerCargoSchema).min(1),
  })
  .superRefine((data, ctx) => {
    data.containers.forEach((container, ci) => {
      container.cargoLines.forEach((line, mi) => {
        if (!line.isDangerousGoods) return;
        if (!line.unNumber || line.unNumber.trim() === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "UN No is required",
            path: ["containers", ci, "cargoLines", mi, "unNumber"],
          });
        }
        if (!line.dgClass || line.dgClass.trim() === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "DG Class is required",
            path: ["containers", ci, "cargoLines", mi, "dgClass"],
          });
        }
      });
    });
  });
export type SiCargoStepForm = z.infer<typeof siCargoStepSchema>;

export function createEmptyCargoLine(): SICargoLine {
  return {
    id: newCargoLineId(),
    marksAndNumbers: "",
    description: "",
    commodityCode: "",
    hsCode: "",
    packageCount: 1,
    packageType: "",
    grossWeight: 1,
    volume: 0,
    isDangerousGoods: false,
    unNumber: "",
    dgClass: "",
    flashPoint: "",
    marinePollutant: false,
    shippingName: "",
  };
}

/** Shared wizard step contract — all SI steps. */
export interface SIWizardStepProps {
  data: SIDTO;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
  onUpdate: (partial: Partial<SIDTO>) => void;
  onCancel: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isSubmitting: boolean;
}
