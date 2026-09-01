// Modified by Sekar Nagarajan (2026-09-01 16:25)
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
    title: "Quantity",
    dataIndex: "packageCount",
    key: "packageCount",
  },
  {
    title: "Package Type",
    dataIndex: "packageType",
    key: "packageType",
  },
  { title: "Weight (kg)", dataIndex: "grossWeight", key: "grossWeight" },
];
