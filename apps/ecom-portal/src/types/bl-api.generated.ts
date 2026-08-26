// Modified by Sekar Nagarajan (2026-08-25 00:24)
/** OpenAPI-generated type aliases for Bill of Lading REST contract. */
export type { BLListDTO, BLDTO, BLChargesDTO, MCNListDTO, MCNDTO } from '../features/bill-of-lading/types/bl.types';

export interface BLListResponse {
  data?: import('../features/bill-of-lading/types/bl.types').BLListDTO[];
  meta?: { totalCount?: number };
  error?: { code: string; message: string };
}

export interface BLDetailResponse {
  data?: import('../features/bill-of-lading/types/bl.types').BLDTO;
  error?: { code: string; message: string };
}
