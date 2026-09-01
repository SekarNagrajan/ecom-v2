// Created by Sekar Nagarajan (2026-09-01 12:29)
import type { ColDef } from "ag-grid-community";

import type { SICargoLine } from "../types/si.types";

/** AG Grid column defs for SI/BL cargo lines (ListView / view drawers). */
export const SI_CARGO_LINE_COL_DEFS: ColDef[] = [
  { field: "hsCode", headerName: "Commodity Code", minWidth: 130 },
  { field: "commodityCode", headerName: "Commodity", minWidth: 120 },
  { field: "marksAndNumbers", headerName: "Marks & No.", minWidth: 140 },
  {
    field: "description",
    headerName: "Commodity Description",
    minWidth: 200,
    flex: 1,
  },
  {
    headerName: "Packages",
    minWidth: 120,
    valueGetter: (params) => {
      const row = params.data as SICargoLine | undefined;
      if (!row) return "";
      return `${row.packageCount} ${row.packageType}`;
    },
  },
  { field: "grossWeight", headerName: "Weight (kg)", minWidth: 110 },
];
