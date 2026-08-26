// Modified by Sekar Nagarajan (2026-08-25 12:10)
/** OpenAPI-generated type aliases for Container Release Order REST contract. */
export type {
  CROListDTO,
  CRODTO,
  CROEligibility,
} from '../features/container-release-order/types/cro.types';

export interface CROListResponse {
  data?: import('../features/container-release-order/types/cro.types').CROListDTO[];
  error?: { code: string; message: string };
}

export interface CRODetailResponse {
  data?: import('../features/container-release-order/types/cro.types').CRODTO;
  error?: { code: string; message: string };
}

export interface CROEligibilityResponse {
  data?: import('../features/container-release-order/types/cro.types').CROEligibility;
  error?: { code: string; message: string };
}
