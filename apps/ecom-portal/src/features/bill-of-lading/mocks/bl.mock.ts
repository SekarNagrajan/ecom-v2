// Modified by Sekar Nagarajan (2026-10-16 23:20)
/**
 * Fixture-backed shim kept only for the DEV fall-backs that api/bl.api.ts loads with dynamic
 * imports (getMockBLDetail, VOYAGE_CLOSED_BL_NOS, mockMCNDetailsSeed). All data comes from the
 * extracted fixtures via src/mocks/fixture-api/bridges — there is no hand-written seed left here.
 */
import {
  fixtureBlDetail,
  fixtureMcnDetail,
  fixtureVoyageClosed,
} from "../../../mocks/fixture-api/bridges/bl-detail.bridge";
import type { BLDTO, MCNDTO } from "../types/bl.types";

export function getMockBLDetail(blNo: string): BLDTO | undefined {
  return fixtureBlDetail(blNo) ?? undefined;
}

/** Set-like view over the voyage guard: closed when the booking's main leg already sailed. */
export const VOYAGE_CLOSED_BL_NOS = {
  has: (blNo: string): boolean => fixtureVoyageClosed(blNo),
};

/** Record-like view over the MCN rows derived from the B/L amendment versions. */
export const mockMCNDetailsSeed: Record<string, MCNDTO> = new Proxy(
  {} as Record<string, MCNDTO>,
  {
    get: (_target, key) =>
      typeof key === "string" ? (fixtureMcnDetail(key) ?? undefined) : undefined,
    has: (_target, key) => typeof key === "string" && fixtureMcnDetail(key) !== null,
  },
);
