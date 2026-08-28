// Modified by Sekar Nagarajan (2026-08-28 15:07)

export interface TariffDTO {
  id: string;
  loadPort: string;
  loadPortName: string;
  dischPort: string;
  dischPortName: string;
  eqpType: string;
  commodityCode: string;
  commodityName: string;
  currency: string;
  tariffAmount: number;
  localAmount: number;
  effectiveFrom: string;
  effectiveTo: string;
  /** JSP RatesViewNew parity */
  soc?: string;
  nor?: boolean;
  transService?: string;
}

export interface SurchargeDTO {
  id: string;
  chargeCode: string;
  chargeName: string;
  origin: string;
  loadRegion: string;
  dischargeRegion: string;
  delivery: string;
  eqpType: string;
  currency: string;
  amount: number;
  isNor: boolean;
  effectiveFrom: string;
  effectiveTo: string;
}

export interface ContractDTO {
  id: string;
  contractNo: string;
  customerCode: string;
  customerName: string;
  originPort: string;
  originPortName: string;
  deliveryPort: string;
  deliveryPortName: string;
  rateNo: string;
  eqpType: string;
  commodity: string;
  commodityName: string;
  oceanFreight: number;
  currency: string;
  subjectToChargesAmount: number;
  soc: string;
  carrTerms: string;
  effectiveFrom: string;
  effectiveTo: string;
  surcharges: SurchargeDTO[];
  /** JSP RatesContractView parity */
  transService?: string;
  nor?: boolean;
}

export interface QuoteDTO {
  id: string;
  quoteNo: string;
  customerName: string;
  originPort: string;
  originPortName: string;
  deliveryPort: string;
  deliveryPortName: string;
  eqpType: string;
  eqpQuantity: number;
  commodity: string;
  cargoWeightKg: number;
  quotedAmountUsd: number;
  status: "DRAFT" | "PENDING_REVIEW" | "QUOTED" | "ACCEPTED" | "EXPIRED";
  validFrom: string;
  validTo: string;
  createdAt: string;
  comments?: string;
}

export interface TariffFilters {
  loadPort?: string;
  dischPort?: string;
  eqpType?: string;
  commodity?: string;
}

export interface SurchargeFilters {
  origin?: string;
  pol?: string;
  pod?: string;
  delivery?: string;
  eqpType?: string;
}

export interface ContractFilters {
  contractNo?: string;
  customerCode?: string;
  pol?: string;
  pod?: string;
}

export interface CreateQuoteInput {
  originPort: string;
  deliveryPort: string;
  eqpType: string;
  eqpQuantity: number;
  commodity: string;
  cargoWeightKg: number;
  expectedAmountUsd?: number;
  comments?: string;
}
