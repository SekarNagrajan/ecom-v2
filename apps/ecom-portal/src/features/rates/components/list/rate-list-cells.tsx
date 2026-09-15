// Modified by Sekar Nagarajan (2026-09-15 15:35)
import { Tag } from "antd";

import type { CombinedRateItem } from "../../types/rates.types";

export function rateTypeLabel(type: CombinedRateItem["type"]): string {
  switch (type) {
    case "CONTRACT":
      return "Contract";
    case "SURCHARGE":
      return "Surcharge";
    case "QUOTE":
      return "Quote";
    default:
      return "Tariff";
  }
}

export function rateTypeTagColor(type: CombinedRateItem["type"]): string {
  switch (type) {
    case "CONTRACT":
      return "purple";
    case "SURCHARGE":
      return "orange";
    case "QUOTE":
      return "geekblue";
    default:
      return "blue";
  }
}

export function canBookRate(item: CombinedRateItem): boolean {
  return item.type === "TARIFF" || item.type === "CONTRACT";
}

export function canViewRateSurcharges(item: CombinedRateItem): boolean {
  const hasSurcharges = Boolean(item.surcharges && item.surcharges.length > 0);
  return (
    item.type === "TARIFF" ||
    item.type === "CONTRACT" ||
    (item.type === "SURCHARGE" && hasSurcharges)
  );
}

export function RateListTypeCell({ record }: { record: CombinedRateItem }) {
  return (
    <Tag className="module-status-tag" color={rateTypeTagColor(record.type)}>
      {rateTypeLabel(record.type)}
    </Tag>
  );
}

/** Amount only — currency is a separate column. */
export function formatRateAmount(amount: number): string {
  return amount.toFixed(2);
}
