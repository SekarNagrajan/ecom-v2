// Modified by Sekar Nagarajan (2026-09-01 16:25)
import type { ColDef } from "ag-grid-community";

type CargoLineColDefsTranslate = (key: string) => string;

/** AG Grid column defs for SI/BL cargo lines (ListView / view drawers). */
export function getSiCargoLineColDefs(t: CargoLineColDefsTranslate): ColDef[] {
  return [
    {
      field: "hsCode",
      headerName: t("cargo.columns.commodityCode"),
      minWidth: 130,
    },
    {
      field: "commodityCode",
      headerName: t("cargo.columns.commodity"),
      minWidth: 120,
    },
    {
      field: "marksAndNumbers",
      headerName: t("cargo.columns.marksAndNo"),
      minWidth: 140,
    },
    {
      field: "description",
      headerName: t("cargo.columns.commodityDescription"),
      minWidth: 200,
      flex: 1,
    },
    {
      field: "packageCount",
      headerName: t("cargo.columns.quantity"),
      minWidth: 100,
    },
    {
      field: "packageType",
      headerName: t("cargo.columns.packageType"),
      minWidth: 130,
    },
    {
      field: "grossWeight",
      headerName: t("cargo.columns.weightKg"),
      minWidth: 110,
    },
  ];
}

/** @deprecated Use `getSiCargoLineColDefs(t)` for localized column headers. */
export const SI_CARGO_LINE_COL_DEFS: ColDef[] = getSiCargoLineColDefs((key) => {
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
