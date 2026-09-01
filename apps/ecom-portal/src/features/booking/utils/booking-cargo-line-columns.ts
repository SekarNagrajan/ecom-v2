// Created by Sekar Nagarajan (2026-09-01 16:19)
import type { TableColumnsType } from "antd";

import type { CommodityItem } from "../types/booking.types";

function dash(value?: string | number | null): string {
  if (value === undefined || value === null || value === "") return "—";
  return String(value);
}

export const BOOKING_CARGO_LINE_COLUMNS: TableColumnsType<CommodityItem> = [
  {
    title: "Commodity Code",
    dataIndex: "hsCode",
    key: "hsCode",
    render: (value: string) => dash(value),
  },
  {
    title: "Commodity",
    dataIndex: "commodity",
    key: "commodity",
    render: (value: string | undefined) => dash(value),
  },
  {
    title: "Marks & No.",
    dataIndex: "marksAndNumbers",
    key: "marksAndNumbers",
    render: (value: string | undefined) => dash(value),
  },
  {
    title: "Commodity Description",
    dataIndex: "description",
    key: "description",
    render: (value: string) => dash(value),
  },
  {
    title: "Packages",
    key: "packages",
    render: (_, record) =>
      `${dash(record.packageQuantity)} ${dash(record.packageType)}`,
  },
  {
    title: "Weight (kg)",
    dataIndex: "weight",
    key: "weight",
    render: (value: number) => dash(value),
  },
  {
    title: "Volume (m³)",
    dataIndex: "volume",
    key: "volume",
    render: (value: number) => dash(value),
  },
  {
    title: "DG",
    key: "dg",
    render: (_, record) =>
      record.isDangerousGoods
        ? `UN ${dash(record.unNumber)} / Class ${dash(record.dgClass)}`
        : "—",
  },
];
