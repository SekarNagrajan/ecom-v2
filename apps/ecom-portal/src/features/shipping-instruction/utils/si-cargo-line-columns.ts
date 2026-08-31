// Created by Sekar Nagarajan (2026-08-28 11:15)
import type { TableColumnsType } from "antd";

import type { SICargoLine } from "../types/si.types";

export const SI_CARGO_LINE_COLUMNS: TableColumnsType<SICargoLine> = [
  { title: "Commodity Code", dataIndex: "hsCode", key: "hsCode" },
  { title: "Commodity", dataIndex: "commodityCode", key: "commodityCode" },
  {
    title: "Marks & No.",
    dataIndex: "marksAndNumbers",
    key: "marksAndNumbers",
  },
  {
    title: "Commodity Description",
    dataIndex: "description",
    key: "description",
  },
  {
    title: "Packages",
    key: "packages",
    render: (_, record) => `${record.packageCount} ${record.packageType}`,
  },
  { title: "Weight (kg)", dataIndex: "grossWeight", key: "grossWeight" },
];
