// Modified by Sekar Nagarajan (2026-09-15 15:35)
import { Tag } from "antd";
import type { TFunction } from "i18next";

import type { CombinedRateItem } from "../../types/rates.types";

type RatesTranslateFn = TFunction<"rates"> | ((key: string) => string);

export function rateTypeLabel(
  type: CombinedRateItem["type"],
  t: RatesTranslateFn,
): string {
  switch (type) {
    case "CONTRACT":
      return t("options.rateType.contract");
    case "SURCHARGE":
      return t("options.rateType.surcharge");
    case "QUOTE":
      return t("options.rateType.quote");
    case "TARIFF":
      return t("options.rateType.tariff");
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
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
    case "TARIFF":
      return "blue";
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
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

export function RateListTypeCell({
  record,
  t,
}: {
  record: CombinedRateItem;
  t: RatesTranslateFn;
}) {
  return (
    <Tag className="module-status-tag" color={rateTypeTagColor(record.type)}>
      {rateTypeLabel(record.type, t)}
    </Tag>
  );
}

/** Amount only — currency is a separate column. */
export function formatRateAmount(amount: number): string {
  return amount.toFixed(2);
}
