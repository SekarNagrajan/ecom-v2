// Created by Sekar Nagarajan (2026-09-02 11:27)
import type { FieldErrors } from "react-hook-form";

import type {
  CargoData,
  CommodityItem,
  ContainerItem,
} from "../types/booking.types";

/** True when the selected equipment code is a reefer type (RF / RH / RE). */
export function isReeferContainerType(
  containerType: string | undefined,
): boolean {
  const code = (containerType ?? "").trim().toUpperCase();
  return /RF|RH|RE/.test(code);
}

/** Incomplete-field count aligned with cargoSchema / superRefine. */
export function countContainerIssues(container: ContainerItem): number {
  let n = 0;
  if (!container.containerType?.trim()) n += 1;

  if (container.reeferMode === "operating") {
    if (container.setTemp === undefined || container.setTemp === null) n += 1;
    if (!container.tempUnit?.trim()) n += 1;
  }

  if (container.isOog) {
    if (!container.dimensionUnit?.trim()) n += 1;
  }

  for (const line of container.commodities ?? []) {
    if (!line.hsCode?.trim()) n += 1;
    if (!line.packageType?.trim()) n += 1;
    if (!line.packageQuantity || line.packageQuantity < 1) n += 1;
    if (!line.weight || line.weight < 1) n += 1;
    if (line.volume === undefined || line.volume === null || line.volume < 0) {
      n += 1;
    }
    if (line.isDangerousGoods) {
      if (!line.unNumber?.trim()) n += 1;
      if (!line.dgClass?.trim()) n += 1;
    }
  }
  return n;
}

export function sumContainerCargo(container: ContainerItem) {
  let packages = 0;
  let weight = 0;
  let volume = 0;
  for (const line of container.commodities ?? []) {
    packages += Number(line.packageQuantity || 0);
    weight += Number(line.weight || 0);
    volume += Number(line.volume || 0);
  }
  return { packages, weight, volume };
}

export function matchesCargoSearch(
  container: ContainerItem,
  query: string,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const hay = [
    container.containerNo,
    container.containerType,
    ...(container.commodities ?? []).flatMap((line: CommodityItem) => [
      line.description,
      line.hsCode,
      line.commodity,
      line.unNumber,
      line.shippingName,
    ]),
  ]
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}

export function firstContainerErrorIndex(
  formErrors: FieldErrors<CargoData>,
): number | null {
  const containers = formErrors.containers;
  if (!Array.isArray(containers)) return null;
  const idx = containers.findIndex((entry) => Boolean(entry));
  return idx >= 0 ? idx : null;
}
