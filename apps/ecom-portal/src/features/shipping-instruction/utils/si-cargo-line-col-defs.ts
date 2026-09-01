// Modified by Sekar Nagarajan (2026-09-01 16:25)
import type { ColDef } from "ag-grid-community";

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
  { field: "packageCount", headerName: "Quantity", minWidth: 100 },
  { field: "packageType", headerName: "Package Type", minWidth: 130 },
  { field: "grossWeight", headerName: "Weight (kg)", minWidth: 110 },
];
