// Created by Sekar Nagarajan (2026-09-03 15:20)
import type { ColDef } from "ag-grid-community";

import type { TranslateFn } from "./booking-cargo-line-columns";

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

/** AG Grid column defs for booking cargo commodities (preview / viewers). */
export function makeBookingCargoLineColDefs(
  t: TranslateFn = defaultT,
): ColDef[] {
  return [
    {
      field: "hsCode",
      headerName: t("wizard.cargo.cols.commodityCode"),
      minWidth: 130,
    },
    {
      field: "commodity",
      headerName: t("wizard.cargo.cols.commodity"),
      minWidth: 120,
    },
    {
      field: "marksAndNumbers",
      headerName: t("wizard.cargo.cols.marksAndNo"),
      minWidth: 140,
    },
    {
      field: "description",
      headerName: t("wizard.cargo.cols.commodityDescription"),
      minWidth: 200,
      flex: 1,
    },
    {
      headerName: t("wizard.cargo.cols.packages"),
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
    {
      field: "weight",
      headerName: t("wizard.cargo.cols.weightKg"),
      minWidth: 110,
    },
    {
      field: "volume",
      headerName: t("wizard.cargo.cols.volumeM3"),
      minWidth: 110,
    },
    {
      headerName: t("wizard.cargo.cols.dg"),
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
        return t("wizard.cargo.cols.dgValue", { un, class: cls });
      },
    },
  ];
}

/** @deprecated Use makeBookingCargoLineColDefs(t) instead. */
export const BOOKING_CARGO_LINE_COL_DEFS: ColDef[] =
  makeBookingCargoLineColDefs();
