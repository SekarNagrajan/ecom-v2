// Created by Sekar Nagarajan (2026-08-28 16:43)
/** Loose cargo shapes for completeness checks (form + DTO). */
interface CargoLineLike {
  description?: string | null;
  hsCode?: string | null;
  packageType?: string | null;
  packageCount?: number | null;
  grossWeight?: number | null;
  volume?: number | null;
  commodityCode?: string | null;
  marksAndNumbers?: string | null;
}

interface ContainerLike {
  containerNo?: string | null;
  eqpSize?: string | null;
  carrierSeal?: string | null;
  shipperSeal?: string | null;
  cargoLines?: CargoLineLike[] | null;
}

/** Incomplete-field count for a container (HTML siIssues parity). */
export function countContainerIssues(container: ContainerLike): number {
  let n = 0;
  if (!container.containerNo?.trim()) n += 1;
  for (const line of container.cargoLines ?? []) {
    if (!line.description?.trim()) n += 1;
    if (!line.hsCode?.trim()) n += 1;
    if (!line.packageType?.trim()) n += 1;
    if (!line.packageCount || line.packageCount < 1) n += 1;
    if (!line.grossWeight || line.grossWeight < 1) n += 1;
  }
  return n;
}

export function sumContainerCargo(container: ContainerLike) {
  let packages = 0;
  let grossWeight = 0;
  let volume = 0;
  for (const line of container.cargoLines ?? []) {
    packages += Number(line.packageCount || 0);
    grossWeight += Number(line.grossWeight || 0);
    volume += Number(line.volume || 0);
  }
  return { packages, grossWeight, volume };
}

export function matchesCargoSearch(
  container: ContainerLike,
  query: string,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const hay = [
    container.containerNo,
    container.eqpSize,
    container.carrierSeal,
    container.shipperSeal,
    ...(container.cargoLines ?? []).flatMap((line) => [
      line.description,
      line.hsCode,
      line.commodityCode,
      line.marksAndNumbers,
    ]),
  ]
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}
