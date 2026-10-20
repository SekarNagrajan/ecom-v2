// Created by Sekar Nagarajan (2026-09-29)
type TranslateFn = (key: string) => string;

export function getDashboardBlStatusDisplay(
  code: string,
  t: TranslateFn,
): { label: string; color: string } | undefined {
  switch (code) {
    case "C":
      return { label: t("status.confirmed"), color: "success" };
    case "D":
      return { label: t("status.draft"), color: "blue" };
    case "V":
      return { label: t("status.cancelled"), color: "error" };
    case "I":
      return { label: t("status.issued"), color: "warning" };
    default:
      return undefined;
  }
}
