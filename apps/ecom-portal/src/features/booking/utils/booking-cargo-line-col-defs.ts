// Created by Sekar Nagarajan (2026-09-03 15:20)
import type { ColDef } from "ag-grid-community";

/** AG Grid column defs for booking cargo commodities (preview / viewers). */
export const BOOKING_CARGO_LINE_COL_DEFS: ColDef[] = [
  { field: "hsCode", headerName: "Commodity Code", minWidth: 130 },
  { field: "commodity", headerName: "Commodity", minWidth: 120 },
  { field: "marksAndNumbers", headerName: "Marks & No.", minWidth: 140 },
  {
    field: "description",
    headerName: "Commodity Description",
    minWidth: 200,
    flex: 1,
  },
  {
    headerName: "Packages",
    minWidth: 140,
    valueGetter: (params) => {
      const row = params.data as
        | { packageQuantity?: number; packageType?: string }
        | undefined;
      if (!row) return "—";
      const qty =
        row.packageQuantity === undefined || row.packageQuantity === null
          ? "—"
          : String(row.packageQuantity);
      const type = row.packageType?.trim() ? row.packageType : "—";
      return `${qty} ${type}`;
    },
  },
  { field: "weight", headerName: "Weight (kg)", minWidth: 110 },
  { field: "volume", headerName: "Volume (m³)", minWidth: 110 },
  {
    headerName: "DG",
    minWidth: 160,
    valueGetter: (params) => {
      const row = params.data as
        | {
            isDangerousGoods?: boolean;
            unNumber?: string;
            dgClass?: string;
          }
        | undefined;
      if (!row?.isDangerousGoods) return "—";
      const un = row.unNumber?.trim() ? row.unNumber : "—";
      const cls = row.dgClass?.trim() ? row.dgClass : "—";
      return `UN ${un} / Class ${cls}`;
    },
  },
];
