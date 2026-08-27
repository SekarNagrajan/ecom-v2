// Modified by Sekar Nagarajan (2026-08-26 18:43)
import { z } from 'zod';
import type { ApiResponse } from '../../../types/api.types';

/** One sail/move leg — JSP Route row inside a routing option (module details). */
export const bookingRouteLegSchema = z.object({
  id: z.string().min(1),
  legType: z.enum(['Mainline', 'Feeder', 'Inland', 'Vessel']),
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
  shipmentKind: z
    .enum(['Direct', 'Transshipment', 'Multimodal'])
    .optional(),
  gateInCutoff: z.string().optional(),
  siDocCutoff: z.string().optional(),
  vgmCutoff: z.string().optional(),
  /** Module / leg timeline for Transshipment & Multimodal (eBookingRouteDetails parity). */
  legs: z.array(bookingRouteLegSchema).optional(),
});

export type SelectedRoute = z.infer<typeof selectedRouteSchema>;

// Step 1: Master Details (formerly Routing & Schedule)
export const masterDetailsSchema = z.object({
  origin: z.string().min(1, 'Origin is required'),
  delivery: z.string().min(1, 'Delivery is required'),
  cargoReadyDate: z.string().min(1, 'Cargo Ready Date is required'),
  haulageOriginType: z.enum(['Carrier', 'Merchant']).default('Merchant'),
  haulageDestinationType: z.enum(['Carrier', 'Merchant']).default('Merchant'),
  carriageContract: z.string().optional(),
  onlineBookingNo: z.string().optional(),
  agreementParty: z.string().optional(),
  preferredAgency: z.string().optional(),
  additionalInformation: z.string().optional(), // Keep as fallback/general notes
  
  // Structured Additional Info
  rateReference: z.string().optional(),
  agencyReference: z.string().optional(),
  oceanFreight: z.enum(['Prepaid', 'Collect', '']).optional(),
  placeOfFinalReceipt: z.string().optional(),
  natCode: z.string().optional(),
  haulageType: z.enum(['Live Load', 'Drop Only', 'Pickup only', 'Pickup & Drop', '']).optional(),
  pickupDate: z.string().optional(),
  dropDate: z.string().optional(),
  haulerCode: z.string().optional(),
  customerPo: z.string().optional(),
  refType: z.enum(['Normal', 'Express', '']).optional(),
  exportRef: z.string().optional(),
  emptyPickupPoint: z.enum(['Terminal', 'Depot', '']).optional(),
  emptyPickupFacility: z.string().optional(),
  emptyPickupDate: z.string().optional(),
  customerReference: z.string().optional(),
  acid: z.string().optional(),
  dpwShipperType: z.string().optional(),
  dpwShipperCode: z.string().optional(),

  /** Vessel/route chosen via Select Vessel/Route popup (required to leave step 0 in UI). */
  selectedRoute: selectedRouteSchema.nullable().optional(),
});

// Step 2: Parties
export const partiesSchema = z.object({
  shipperName: z.string().min(3, 'Shipper Name is required'),
  shipperReference: z.string().optional(),
  consigneeName: z.string().min(3, 'Consignee Name is required'),
  notifyPartyName: z.string().optional(),
  freightForwarder: z.string().optional(),
  agreementParty: z.string().min(1, 'Agreement Party is required'),
  siSubmittingParty: z.string().min(1, 'SI Submitting Party is required'),
});

// Step 3: Cargo & Equipment
export const cargoSchema = z.object({
  commodity: z.string().min(1, 'Commodity is required'),
  containerType: z.string().min(1, 'Equipment Description is required'),
  containerCount: z.number().min(1, 'At least 1 container required').max(100),
  totalWeightKg: z.number().min(100, 'Minimum weight is 100 kg'),
  
  // Package Info
  isLcl: z.boolean().default(false),
  packageType: z.string().optional(),

  // Hazardous
  isDangerousGoods: z.boolean().default(false),
  unNumber: z.string().optional(),
  dgClass: z.string().optional(),
  flashPoint: z.string().optional(),
  marinePollutant: z.boolean().default(false),
  shippingName: z.string().optional(),

  // Reefer
  isReefer: z.boolean().default(false),
  setTemp: z.number().optional(),
  minTemp: z.number().optional(),
  maxTemp: z.number().optional(),
  tempUnit: z.string().optional(),
  volume: z.number().optional(),

  // OOG
  isOog: z.boolean().default(false),
  olForward: z.number().optional(),
  owLeft: z.number().optional(),
  oh: z.number().optional(),
  olAft: z.number().optional(),
  owRight: z.number().optional(),
  dimensionUnit: z.string().optional(),
}).superRefine((data, ctx) => {
  // LCL Validation
  if (data.isLcl && (!data.packageType || data.packageType.trim() === '')) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Package Type is required for LCL', path: ['packageType'] });
  }

  // Dangerous Goods Validation
  if (data.isDangerousGoods) {
    if (!data.unNumber || data.unNumber.trim() === '') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'UN No is required', path: ['unNumber'] });
    }
    if (!data.dgClass || data.dgClass.trim() === '') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'DG Class is required', path: ['dgClass'] });
    }
  }

  // Reefer Validation
  if (data.isReefer) {
    if (data.setTemp === undefined || data.setTemp === null) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Set Temp is required', path: ['setTemp'] });
    }
    if (!data.tempUnit || data.tempUnit.trim() === '') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Temp Unit is required', path: ['tempUnit'] });
    }
  }

  // OOG Validation
  if (data.isOog) {
    if (!data.dimensionUnit || data.dimensionUnit.trim() === '') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Dimension Unit is required', path: ['dimensionUnit'] });
    }
  }
});

// Step 4: ENS Details
export const ensSchema = z.object({
  euCustomsZone: z.boolean().default(false),
  blType: z.enum(['Straight BL', 'Master BL']).default('Straight BL'),
  ensFilingType: z.enum(['Single Filing', 'Multiple Filing']).default('Single Filing'),
  paymentMethod: z.enum(['Wire Transfer', 'Not Prepaid']).default('Wire Transfer'),
  
  // Declarant
  declarantName: z.string().optional(),
  declarantAddress: z.string().optional(),
  declarantCity: z.string().optional(),
  declarantCountry: z.string().optional(),
  declarantEori: z.string().optional(),
  declarantEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  
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
export const insuranceSchema = z.object({
  isInsuranceRequired: z.boolean().default(false),
  currency: z.string().optional(),
  cargoValue: z.number().optional(),
  termsAccepted: z.boolean().default(false),
}).superRefine((data, ctx) => {
  if (data.isInsuranceRequired) {
    if (!data.currency) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Currency is required', path: ['currency'] });
    }
    if (!data.cargoValue || data.cargoValue <= 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Cargo value must be greater than 0', path: ['cargoValue'] });
    }
    if (!data.termsAccepted) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'You must accept the insurance terms', path: ['termsAccepted'] });
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
}

// API Response
export interface BookingConfirmation {
  bookingReference: string;
  status: 'CONFIRMED' | 'PENDING' | 'REJECTED';
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
