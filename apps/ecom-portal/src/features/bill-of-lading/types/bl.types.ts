// Modified by Sekar Nagarajan (2026-08-26 13:04)
import { z } from 'zod';
import type { SIContainer, SIParty } from '../../shipping-instruction/types/si.types';

export type BLRowStatus = 'D' | 'S' | 'C' | 'I';
export type BLPrintType = 'draft' | 'original' | 'nn';

export const BL_STATUS_LABELS: Record<BLRowStatus, string> = {
  D: 'Draft',
  S: 'Submitted',
  C: 'Confirmed',
  I: 'Issued',
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
  printStatus: 'Y' | 'N';
  appVersion: '1' | '2';
  isLocked: boolean;
  paymentEligible?: boolean;
  paymentCompleted?: boolean;
  payAmountUsd?: number;
  fcnNo?: string;
  hasInsurance?: boolean;
  policyNo?: string | null;
}

export interface BLParty extends SIParty {
  printOnBl?: boolean;
}

export interface BLConsigneeParty extends BLParty {
  toOrder: boolean;
}

export interface BLDTO {
  id: string;
  blNo: string;
  siNo: string;
  bookingNo: string;
  status: BLRowStatus;
  blType: 'Original' | 'Seaway';
  releaseType: 'O' | 'T';
  freightOption: 'PREPAID' | 'COLLECT';
  appVersion: '1' | '2';
  printCount: number;
  issuedAt: string | null;
  mcnNo: string | null;
  agencyRefNo: string | null;
  origin: string;
  loadPort: string;
  dischargePort: string;
  delivery: string;
  parties: {
    shipper: BLParty;
    consignee: BLConsigneeParty;
    notify: BLParty;
    notify2?: BLParty;
    notify3?: BLParty;
  };
  containers: SIContainer[];
}

export interface BLChargeLine {
  chargeCode: string;
  description: string;
  amount: number;
  currency: string;
  prepaidCollect: 'PREPAID' | 'COLLECT';
}

export interface BLChargeTotal {
  currency: string;
  prepaid: number;
  collect: number;
  grandTotal: number;
}

export interface BLChargesDTO {
  blNo: string;
  lines: BLChargeLine[];
  totals: BLChargeTotal[];
}

export interface MCNListDTO {
  mcnId: string;
  blNo: string;
  bookingNo: string;
  status: 'Draft' | 'Submitted' | 'Confirmed';
  origin: string;
  delivery: string;
}

export interface MCNDTO {
  mcnId: string;
  blNo: string;
  bookingNo: string;
  status: 'Draft' | 'Submitted' | 'Confirmed';
  vessel: string;
  voyage: string;
  loadPort: string;
  dischargePort: string;
  containerCount: number;
  remarks?: string;
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
});

const cargoLineSchema = z.object({
  id: z.string(),
  marksAndNumbers: z.string().optional(),
  description: z.string().min(1),
  commodityCode: z.string().optional(),
  hsCode: z.string().optional(),
  packageCount: z.number().int().nonnegative(),
  packageType: z.string().min(1),
  grossWeight: z.number().nonnegative(),
  volume: z.number().nonnegative().optional(),
});

const containerSchema = z.object({
  id: z.string(),
  containerNo: z.string().min(1),
  eqpSize: z.string().min(1),
  carrierSeal: z.string().optional(),
  shipperSeal: z.string().optional(),
  cargoLines: z.array(cargoLineSchema).min(1),
});

export const blMasterStepSchema = z.object({
  blType: z.enum(['Original', 'Seaway']),
  releaseType: z.enum(['O', 'T']),
  freightOption: z.enum(['PREPAID', 'COLLECT']),
});

export const blPartiesStepSchema = z.object({
  shipperName: z.string().min(1),
  shipperAddress: z.string().min(1),
  shipperPrint: z.boolean(),
  consigneeName: z.string().min(1),
  consigneeAddress: z.string().min(1),
  consigneePrint: z.boolean(),
  consigneeToOrder: z.boolean(),
  notifyName: z.string().min(1),
  notifyAddress: z.string().min(1),
  notifyPrint: z.boolean(),
});

export const blSchema = z
  .object({
    bookingNo: z.string(),
    siNo: z.string(),
    blType: z.enum(['Original', 'Seaway']),
    releaseType: z.enum(['O', 'T']),
    freightOption: z.enum(['PREPAID', 'COLLECT']),
    parties: z.object({
      shipper: partySchema,
      consignee: partySchema.extend({ toOrder: z.boolean().optional() }),
      notify: partySchema,
    }),
    containers: z.array(containerSchema).min(1),
  })
  .superRefine((data, ctx) => {
    if (data.blType === 'Seaway' && data.parties.consignee.toOrder) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Sea waybill cannot have consignee to order',
        path: ['parties', 'consignee', 'toOrder'],
      });
    }
  });

export type BLMasterStepValues = z.infer<typeof blMasterStepSchema>;
export type BLPartiesStepValues = z.infer<typeof blPartiesStepSchema>;

/** @deprecated Prefer `utils/bl-status` — kept for gradual import migration */
export { getBLStatusColor } from '../utils/bl-status';
