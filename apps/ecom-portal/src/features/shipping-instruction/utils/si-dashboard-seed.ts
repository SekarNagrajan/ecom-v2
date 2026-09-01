// Created by Sekar Nagarajan (2026-09-01 12:41)
import type { SIDTO } from "../types/si.types";
import { createEmptyContainer } from "../types/si.types";

/** Search params when opening Create SI from the enhanced dashboard. */
export type SiWizardCreateSearch = {
  fromDashboard?: boolean;
  onlineRefNo?: string;
  origin?: string;
  delivery?: string;
  containerNo?: string;
  blNo?: string;
};

export function parseSiWizardSearch(
  search: Record<string, unknown>,
): SiWizardCreateSearch {
  const asString = (value: unknown) =>
    typeof value === "string" && value.length > 0 ? value : undefined;

  return {
    fromDashboard:
      search.fromDashboard === true || search.fromDashboard === "true",
    onlineRefNo: asString(search.onlineRefNo),
    origin: asString(search.origin),
    delivery: asString(search.delivery),
    containerNo: asString(search.containerNo),
    blNo: asString(search.blNo),
  };
}

/** Merge dashboard shipment fields into SI detail for the create wizard. */
export function applyDashboardSiSeed(
  detail: SIDTO,
  routeId: string,
  seed: SiWizardCreateSearch,
): SIDTO {
  if (!seed.fromDashboard) {
    return detail;
  }

  const origin = seed.origin ?? detail.origin;
  const delivery = seed.delivery ?? detail.delivery;
  const containers = seed.containerNo
    ? [
        {
          ...createEmptyContainer(),
          containerNo: seed.containerNo,
        },
      ]
    : detail.containers;

  return {
    ...detail,
    id: detail.id,
    bookingNo: routeId,
    siNo: null,
    blNo: seed.blNo || null,
    agencyRefNo: seed.onlineRefNo ?? detail.agencyRefNo,
    origin,
    loadPort: origin,
    delivery,
    dischargePort: delivery,
    containers,
  };
}
