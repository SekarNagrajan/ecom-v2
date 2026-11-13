// Modified by Sekar Nagarajan (2026-09-01 16:25)
import type { TableColumnsType } from "antd";

import type { SICargoLine } from "../types/si.types";

type CargoLineColumnsTranslate = (key: string) => string;

export function getSiCargoLineColumns(
  t: CargoLineColumnsTranslate,
): TableColumnsType<SICargoLine> {
  return [
    { title: t("cargo.columns.commodityCode"), dataIndex: "hsCode", key: "hsCode" },
    {
      title: t("cargo.columns.commodity"),
      dataIndex: "commodityCode",
      key: "commodityCode",
    },
    {
      title: t("cargo.columns.marksAndNo"),
      dataIndex: "marksAndNumbers",
      key: "marksAndNumbers",
    },
    {
      title: t("cargo.columns.commodityDescription"),
      dataIndex: "description",
      key: "description",
    },
    {
      title: t("cargo.columns.quantity"),
      dataIndex: "packageCount",
      key: "packageCount",
    },
    {
      title: t("cargo.columns.packageType"),
      dataIndex: "packageType",
      key: "packageType",
    },
    {
      title: t("cargo.columns.weightKg"),
      dataIndex: "grossWeight",
      key: "grossWeight",
    },
  ];
}

/** @deprecated Use `getSiCargoLineColumns(t)` for localized column titles. */
export const SI_CARGO_LINE_COLUMNS: TableColumnsType<SICargoLine> =
  getSiCargoLineColumns((key) => {
    const en: Record<string, string> = {
      "cargo.columns.commodityCode": "Commodity Code",
      "cargo.columns.commodity": "Commodity",
      "cargo.columns.marksAndNo": "Marks & No.",
      "cargo.columns.commodityDescription": "Commodity Description",
      "cargo.columns.quantity": "Quantity",
      "cargo.columns.packageType": "Package Type",
      "cargo.columns.weightKg": "Weight (kg)",
    };
    return en[key] ?? key;
  });
