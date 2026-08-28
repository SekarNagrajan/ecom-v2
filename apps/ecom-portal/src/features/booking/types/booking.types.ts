// Modified by Sekar Nagarajan (2026-08-28 11:15)
import { z } from "zod";
import type { ApiResponse } from "../../../types/api.types";
import type { BookingRateOption } from "../mocks/booking-rates.mock";

/** One sail/move leg — JSP Route row inside a routing option (module details). */
export const bookingRouteLegSchema = z.object({
  id: z.string().min(1),
  legType: z.enum(["Mainline", "Feeder", "Inland", "Vessel"]),
  vesselName: z.string().min(1),
  vesselCode: z.string().optional(),
  voyage: z.string().optional(),
  bound: z.string().optional(),
  serviceName: z.string().optional(),
  serviceCode: z.string().optional(),
  polPortId: z.string().min(1),
  polPortName: z.string().min(1),
  podPortId: z.string().min(1),
  podPortName: z.string().min(1),
  etd: z.string().min(1),
  eta: z.string().min(1),
  terminal: z.string().optional(),
});

export type BookingRouteLeg = z.infer<typeof bookingRouteLegSchema>;

/** Selected vessel/route from ebookRoutingDetails-style popup (JSP parity). */
export const selectedRouteSchema = z.object({
  routeId: z.string().min(1),
  serviceCode: z.string().min(1),
  serviceName: z.string().min(1),
  vesselCode: z.string().min(1),
  vesselName: z.string().min(1),
  voyage: z.string().min(1),
  bound: z.string().min(1),
  polPortId: z.string().min(1),
  polPortName: z.string().min(1),
  podPortId: z.string().min(1),
  podPortName: z.string().min(1),
  polTerminal: z.string().optional(),
  podTerminal: z.string().optional(),
  etd: z.string().min(1),
  eta: z.string().min(1),
  transitTimeDays: z.number(),
  isDirect: z.boolean(),
  isDefaultRoute: z.boolean().optional(),
  transshipmentCount: z.number().optional(),
  shipmentKind: z.enum(["Direct", "Transshipment", "Multimodal"]).optional(),
  gateInCutoff: z.string().optional(),
  siDocCutoff: z.string().optional(),
  vgmCutoff: z.string().optional(),
  /** Module / leg timeline for Transshipment & Multimodal (eBookingRouteDetails parity). */
  legs: z.array(bookingRouteLegSchema).optional(),
});

export type SelectedRoute = z.infer<typeof selectedRouteSchema>;

// Step 1: Master Details (formerly Routing & Schedule)
export const masterDetailsSchema = z.object({
  origin: z.string().min(1, "Origin is required"),
  delivery: z.string().min(1, "Delivery is required"),
  cargoReadyDate: z.string().min(1, "Cargo Ready Date is required"),
  haulageOriginType: z.enum(["Carrier", "Merchant"]).default("Merchant"),
  haulageDestinationType: z.enum(["Carrier", "Merchant"]).default("Merchant"),
  carriageContract: z.string().optional(),
  onlineBookingNo: z.string().optional(),
  agreementParty: z.string().optional(),
  preferredAgency: z.string().optional(),
  additionalInformation: z.string().optional(), // Keep as fallback/general notes

  // Structured Additional Info
  rateReference: z.string().optional(),
  agencyReference: z.string().optional(),
  oceanFreight: z.enum(["Prepaid", "Collect", ""]).optional(),
  placeOfFinalReceipt: z.string().optional(),
  natCode: z.string().optional(),
  haulageType: z
    .enum(["Live Load", "Drop Only", "Pickup only", "Pickup & Drop", ""])
    .optional(),
  pickupDate: z.string().optional(),
  dropDate: z.string().optional(),
  haulerCode: z.string().optional(),
  customerPo: z.string().optional(),
  refType: z.enum(["Normal", "Express", ""]).optional(),
  exportRef: z.string().optional(),
  emptyPickupPoint: z.enum(["Terminal", "Depot", ""]).optional(),
  emptyPickupFacility: z.string().optional(),
  emptyPickupDate: z.string().optional(),
  customerReference: z.string().optional(),
  acid: z.string().optional(),
  dpwShipperType: z.string().optional(),
  dpwShipperCode: z.string().optional(),

  /** Vessel/route chosen via Select Vessel/Route popup (required to leave step 0 in UI). */
  selectedRoute: selectedRouteSchema.nullable().optional(),
  /** Optional rate chosen from Available Rates picker (additive). */
  selectedRate: z
    .object({
      rateNo: z.string(),
      itemNo: z.string(),
      amdNo: z.string(),
      rateType: z.string(),
      eqpType: z.string(),
      amount: z.number(),
      currency: z.string(),
      customer: z.string(),
      customerCode: z.string(),
    })
    .nullable()
    .optional(),
});

// Step 2: Parties
export const partiesSchema = z.object({
  shipperName: z.string().min(3, "Shipper Name is required"),
  shipperReference: z.string().optional(),
  shipperContact: z.string().optional(),
  shipperAddress: z.string().optional(),
  shipperCity: z.string().optional(),
  shipperCountry: z.string().optional(),
  shipperEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  shipperPhone: z.string().optional(),
  consigneeName: z.string().min(3, "Consignee Name is required"),
  consigneeContact: z.string().optional(),
  consigneeAddress: z.string().optional(),
  consigneeCity: z.string().optional(),
  consigneeCountry: z.string().optional(),
  consigneeEmail: z
    .string()
    .email("Invalid email")
    .optional()
    .or(z.literal("")),
  consigneePhone: z.string().optional(),
  notifyPartyName: z.string().optional(),
  notifyPartyContact: z.string().optional(),
  notifyPartyAddress: z.string().optional(),
  notifyPartyCity: z.string().optional(),
  notifyPartyCountry: z.string().optional(),
  notifyPartyEmail: z
    .string()
    .email("Invalid email")
    .optional()
    .or(z.literal("")),
  notifyPartyPhone: z.string().optional(),
  notifyParty2Name: z.string().optional(),
  notifyParty2Contact: z.string().optional(),
  freightForwarder: z.string().optional(),
  freightForwarderContact: z.string().optional(),
  agreementParty: z.string().min(1, "Agreement Party is required"),
  agreementPartyContact: z.string().optional(),
  siSubmittingParty: z.string().min(1, "SI Submitting Party is required"),
  siSubmittingPartyContact: z.string().optional(),
});

// Step 3: Cargo & Equipment — containers[] with nested commodities
const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const commodityItemSchema = z.object({
  id: z.string().min(1),
  commodity: z.string().optional(),
  hsCode: z.string().min(1, "Commodity Code is required"),
  classCode: z.string().optional(),
  weight: z.number().min(1, "Weight is required"),
  volume: z.number().min(0, "Volume is required"),
  packageType: z.string().min(1, "Package Type is required"),
  packageQuantity: z.number().min(1, "Quantity is required"),
  description: z.string().min(1, "Commodity Description is required"),
  marksAndNumbers: z.string().optional(),
  isDangerousGoods: z.boolean().default(false),
  unNumber: z.string().optional(),
  dgClass: z.string().optional(),
  flashPoint: z.string().optional(),
  marinePollutant: z.boolean().default(false),
  shippingName: z.string().optional(),
});

export const containerItemSchema = z.object({
  id: z.string().min(1),
  containerType: z.string().min(1, "Container type is required"),
  quantity: z.number().min(1).max(100),
  eqpStatus: z.enum(["LADEN", "EMPTY"]).default("LADEN"),
  tareWeight: z.number().optional(),
  isSoc: z.boolean().default(false),
  reeferMode: z.enum(["none", "operating", "nor"]).default("none"),
  setTemp: z.number().optional(),
  minTemp: z.number().optional(),
  maxTemp: z.number().optional(),
  tempUnit: z.string().optional(),
  isLcl: z.boolean().default(false),
  isOog: z.boolean().default(false),
  olForward: z.number().optional(),
  olAft: z.number().optional(),
  owLeft: z.number().optional(),
  owRight: z.number().optional(),
  oh: z.number().optional(),
  dimensionUnit: z.string().optional(),
  commodities: z
    .array(commodityItemSchema)
    .min(1, "At least one commodity is required"),
});

export const cargoSchema = z
  .object({
    containers: z
      .array(containerItemSchema)
      .min(1, "At least one container is required"),
  })
  .superRefine((data, ctx) => {
    data.containers.forEach((container, ci) => {
      if (container.reeferMode === "operating") {
        if (container.setTemp === undefined || container.setTemp === null) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Set Temp is required for operating reefer",
            path: ["containers", ci, "setTemp"],
          });
        }
        if (!container.tempUnit || container.tempUnit.trim() === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Temp Unit is required for operating reefer",
            path: ["containers", ci, "tempUnit"],
          });
        }
      }
      if (container.isOog) {
        if (!container.dimensionUnit || container.dimensionUnit.trim() === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Dimension Unit is required for OOG",
            path: ["containers", ci, "dimensionUnit"],
          });
        }
      }
      container.commodities.forEach((c, mi) => {
        if (c.isDangerousGoods) {
          if (!c.unNumber || c.unNumber.trim() === "") {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "UN No is required",
              path: ["containers", ci, "commodities", mi, "unNumber"],
            });
          }
          if (!c.dgClass || c.dgClass.trim() === "") {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "DG Class is required",
              path: ["containers", ci, "commodities", mi, "dgClass"],
            });
          }
        }
      });
    });
  });

export type CommodityItem = z.infer<typeof commodityItemSchema>;
export type ContainerItem = z.infer<typeof containerItemSchema>;

export function createEmptyCommodity(): CommodityItem {
  return {
    id: newId(),
    commodity: "",
    hsCode: "",
    classCode: "",
    weight: 1,
    volume: 0,
    packageType: "",
    packageQuantity: 1,
    description: "",
    marksAndNumbers: "",
    isDangerousGoods: false,
    unNumber: "",
    dgClass: "",
    flashPoint: "",
    marinePollutant: false,
    shippingName: "",
  };
}

export function createEmptyContainer(): ContainerItem {
  return {
    id: newId(),
    // Modified by Sekar Nagarajan (2026-08-28 12:04)
    containerType: "20DC",
    quantity: 1,
    eqpStatus: "LADEN",
    tareWeight: undefined,
    isSoc: false,
    reeferMode: "none",
    setTemp: undefined,
    minTemp: undefined,
    maxTemp: undefined,
    tempUnit: "Celsius",
    isLcl: false,
    isOog: false,
    olForward: undefined,
    olAft: undefined,
    owLeft: undefined,
    owRight: undefined,
    oh: undefined,
    dimensionUnit: "CM",
    commodities: [createEmptyCommodity()],
  };
}

export function defaultCargoData(): CargoData {
  return { containers: [createEmptyContainer()] };
}

/** Migrate legacy flat cargo shape into containers[]. */
export function migrateLegacyCargo(legacy: unknown): CargoData {
  if (!legacy || typeof legacy !== "object") return defaultCargoData();
  const raw = legacy as Record<string, unknown>;
  if (Array.isArray(raw.containers) && raw.containers.length > 0) {
    return {
      containers: (raw.containers as Record<string, unknown>[]).map(
        (containerRaw) => {
          const base = createEmptyContainer();
          const commoditiesRaw = Array.isArray(containerRaw.commodities)
            ? containerRaw.commodities
            : [];
          return {
            ...base,
            ...containerRaw,
            id: String(containerRaw.id ?? base.id),
            commodities:
              commoditiesRaw.length > 0
                ? commoditiesRaw.map((item) => {
                    const row = (item ?? {}) as Record<string, unknown>;
                    const empty = createEmptyCommodity();
                    return {
                      ...empty,
                      ...row,
                      id: String(row.id ?? empty.id),
                      commodity: String(row.commodity ?? ""),
                      hsCode: String(row.hsCode ?? ""),
                      weight: Number(row.weight ?? 1) || 1,
                      volume: typeof row.volume === "number" ? row.volume : 0,
                      packageType: String(row.packageType ?? ""),
                      packageQuantity: Number(row.packageQuantity ?? 1) || 1,
                      description: String(
                        row.description ?? row.commodity ?? "",
                      ),
                      marksAndNumbers: String(row.marksAndNumbers ?? ""),
                    } as CommodityItem;
                  })
                : [createEmptyCommodity()],
          } as ContainerItem;
        },
      ),
    };
  }
  const commodity = createEmptyCommodity();
  commodity.commodity = String(raw.commodity ?? "");
  commodity.hsCode = String(raw.hsCode ?? "");
  commodity.weight = Number(raw.totalWeightKg ?? raw.weight ?? 1) || 1;
  commodity.volume = typeof raw.volume === "number" ? raw.volume : 0;
  commodity.packageType = String(raw.packageType ?? "");
  commodity.packageQuantity = Number(raw.packageQuantity ?? 1) || 1;
  commodity.description = String(raw.description ?? raw.commodity ?? "");
  commodity.marksAndNumbers = String(raw.marksAndNumbers ?? "");
  commodity.isDangerousGoods = Boolean(raw.isDangerousGoods);
  commodity.unNumber = String(raw.unNumber ?? "");
  commodity.dgClass = String(raw.dgClass ?? "");
  commodity.flashPoint = String(raw.flashPoint ?? "");
  commodity.marinePollutant = Boolean(raw.marinePollutant);
  commodity.shippingName = String(raw.shippingName ?? "");

  const container = createEmptyContainer();
  container.containerType = String(raw.containerType ?? "");
  container.quantity = Number(raw.containerCount ?? 1) || 1;
  container.isLcl = Boolean(raw.isLcl);
  container.isOog = Boolean(raw.isOog);
  container.reeferMode = raw.isReefer ? "operating" : "none";
  container.setTemp = typeof raw.setTemp === "number" ? raw.setTemp : undefined;
  container.minTemp = typeof raw.minTemp === "number" ? raw.minTemp : undefined;
  container.maxTemp = typeof raw.maxTemp === "number" ? raw.maxTemp : undefined;
  container.tempUnit = String(raw.tempUnit ?? "Celsius");
  container.olForward =
    typeof raw.olForward === "number" ? raw.olForward : undefined;
  container.olAft = typeof raw.olAft === "number" ? raw.olAft : undefined;
  container.owLeft = typeof raw.owLeft === "number" ? raw.owLeft : undefined;
  container.owRight = typeof raw.owRight === "number" ? raw.owRight : undefined;
  container.oh = typeof raw.oh === "number" ? raw.oh : undefined;
  container.dimensionUnit = String(raw.dimensionUnit ?? "CM");
  container.commodities = [commodity];
  return { containers: [container] };
}

export interface BookingDocument {
  id: string;
  type: string;
  fileName: string;
  uploadedAt: string;
}

export const ensSchema = z.object({
  euCustomsZone: z.boolean().default(false),
  blType: z.enum(["Straight BL", "Master BL"]).default("Straight BL"),
  ensFilingType: z
    .enum(["Single Filing", "Multiple Filing"])
    .default("Single Filing"),
  paymentMethod: z
    .enum(["Wire Transfer", "Not Prepaid"])
    .default("Wire Transfer"),

  // Declarant
  declarantName: z.string().optional(),
  declarantAddress: z.string().optional(),
  declarantCity: z.string().optional(),
  declarantCountry: z.string().optional(),
  declarantEori: z.string().optional(),
  declarantEmail: z
    .string()
    .email("Invalid email")
    .optional()
    .or(z.literal("")),

  // Buyer
  buyerName: z.string().optional(),
  buyerAddress: z.string().optional(),
  buyerCity: z.string().optional(),
  buyerCountry: z.string().optional(),

  // Seller
  sellerName: z.string().optional(),
  sellerAddress: z.string().optional(),
  sellerCity: z.string().optional(),
  sellerCountry: z.string().optional(),
});

// Step 5: Insurance
export const insuranceSchema = z
  .object({
    isInsuranceRequired: z.boolean().default(false),
    currency: z.string().optional(),
    cargoValue: z.number().optional(),
    termsAccepted: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.isInsuranceRequired) {
      if (!data.currency) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Currency is required",
          path: ["currency"],
        });
      }
      if (!data.cargoValue || data.cargoValue <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Cargo value must be greater than 0",
          path: ["cargoValue"],
        });
      }
      if (!data.termsAccepted) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "You must accept the insurance terms",
          path: ["termsAccepted"],
        });
      }
    }
  });

// Complete Booking Payload
export type MasterDetailsData = z.infer<typeof masterDetailsSchema>;
export type PartiesData = z.infer<typeof partiesSchema>;
export type CargoData = z.infer<typeof cargoSchema>;
export type EnsData = z.infer<typeof ensSchema>;
export type InsuranceData = z.infer<typeof insuranceSchema>;

export interface BookingPayload {
  masterDetails: MasterDetailsData | null;
  parties: PartiesData | null;
  cargo: CargoData | null;
  ens: EnsData | null;
  insurance: InsuranceData | null;
  documents?: BookingDocument[];
  /** Soft draft id when saved via Save Draft. */
  draftId?: string;
}

export interface BookingActivityEvent {
  id: string;
  action: string;
  by: string;
  at: string;
  note?: string;
}

export type BookingSelectedRate = BookingRateOption;

// API Response
export interface BookingConfirmation {
  bookingReference: string;
  status: "CONFIRMED" | "PENDING" | "REJECTED";
  submittedAt: string;
}

export type SubmitBookingResponse = ApiResponse<BookingConfirmation>;

export interface BookingTemplate {
  id: string;
  templateName: string;
  origin: string;
  delivery: string;
  payload: BookingPayload;
}

export interface ContractValidationResult {
  valid: boolean;
  message: string;
  contractRef?: string;
  contractId?: string;
  contractName?: string;
}

export interface EoriValidationResult {
  valid: boolean;
  message: string;
  eori?: string;
}
