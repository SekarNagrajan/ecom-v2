// Created by Sekar Nagarajan (2026-09-01 16:19)
import type { TableColumnsType } from "antd";

import type { CommodityItem } from "../types/booking.types";

export type TranslateFn = (key: string, opts?: Record<string, unknown>) => string;

function dash(value?: string | number | null): string {
  if (value === undefined || value === null || value === "") return "—";
  return String(value);
}

const englishFallback: Record<string, string> = {
  "wizard.cargo.cols.commodityCode": "Commodity Code",
  "wizard.cargo.cols.commodity": "Commodity",
  "wizard.cargo.cols.marksAndNo": "Marks & No.",
  "wizard.cargo.cols.commodityDescription": "Commodity Description",
  "wizard.cargo.cols.packages": "Packages",
  "wizard.cargo.cols.weightKg": "Weight (kg)",
  "wizard.cargo.cols.volumeM3": "Volume (m³)",
  "wizard.cargo.cols.dg": "DG",
  "wizard.cargo.cols.dgValue": "UN {{un}} / Class {{class}}",
};

function defaultT(key: string, opts?: Record<string, unknown>): string {
  let val = englishFallback[key] ?? key;
  if (opts) {
    for (const [k, v] of Object.entries(opts)) {
      val = val.replace(`{{${k}}}`, String(v ?? ""));
    }
  }
  return val;
}

export function makeBookingCargoLineColumns(
  t: TranslateFn = defaultT,
): TableColumnsType<CommodityItem> {
  return [
    {
      title: t("wizard.cargo.cols.commodityCode"),
      dataIndex: "hsCode",
      key: "hsCode",
      render: (value: string) => dash(value),
    },
    {
      title: t("wizard.cargo.cols.commodity"),
      dataIndex: "commodity",
      key: "commodity",
      render: (value: string | undefined) => dash(value),
    },
    {
      title: t("wizard.cargo.cols.marksAndNo"),
      dataIndex: "marksAndNumbers",
      key: "marksAndNumbers",
      render: (value: string | undefined) => dash(value),
    },
    {
      title: t("wizard.cargo.cols.commodityDescription"),
      dataIndex: "description",
      key: "description",
      render: (value: string) => dash(value),
    },
    {
      title: t("wizard.cargo.cols.packages"),
      key: "packages",
      render: (_, record) =>
        `${dash(record.packageQuantity)} ${dash(record.packageType)}`,
    },
    {
      title: t("wizard.cargo.cols.weightKg"),
      dataIndex: "weight",
      key: "weight",
      render: (value: number) => dash(value),
    },
    {
      title: t("wizard.cargo.cols.volumeM3"),
      dataIndex: "volume",
      key: "volume",
      render: (value: number) => dash(value),
    },
    {
      title: t("wizard.cargo.cols.dg"),
      key: "dg",
      render: (_, record) =>
        record.isDangerousGoods
          ? t("wizard.cargo.cols.dgValue", {
              un: dash(record.unNumber),
              class: dash(record.dgClass),
            })
          : "—",
    },
  ];
}

/** @deprecated Use makeBookingCargoLineColumns(t) instead. */
export const BOOKING_CARGO_LINE_COLUMNS: TableColumnsType<CommodityItem> =
  makeBookingCargoLineColumns();
