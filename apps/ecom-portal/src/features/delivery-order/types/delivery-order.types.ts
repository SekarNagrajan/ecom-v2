// Modified by Sekar Nagarajan (2026-10-19 17:45)
import type { TFunction } from "i18next";
import { z } from "zod";

export type DOPrintStatus = "Y" | "N";

export interface DOSummaryRow {
  delordno: string;
  delorddate: string;
  blnumber: string;
  vessel: string;
  voyage: string;
  bound: string;
  loadport: string;
  dischargeport: string;
  terminal: string;
  arrdate: string;
  dovaliditydate: string;
  printstatus: DOPrintStatus;
  /** "1" once the B/L is released (online print allowed); "0" blocks online print. */
  ecomprintstatus: string;
  /** Optional detail enrichment (view drawer) — absent on legacy summary rows. */
  consignee?: string;
  containers?: string[];
  freeDays?: number;
  invoiceNos?: string[];
  balanceDue?: number;
  currency?: string;
  printHistory?: DOPrintHistoryEntry[];
}

export interface DOPrintHistoryEntry {
  version: number;
  printedAt: string;
  printedBy: string;
}

export interface DOListFilters {
  fromDate?: string;
  toDate?: string;
}

/** DatePicker clears to null — normalize before string checks. */
function requiredCalendarDate(message: string) {
  return z.preprocess(
    (value) => {
      if (value == null) return "";
      if (typeof value === "string") return value.trim();
      return "";
    },
    z.string().min(1, message),
  );
}

/** Build the search schema with localized validation messages. */
export function createDoSearchSchema(t: TFunction<"delivery-order">) {
  return z
    .object({
      fromDate: requiredCalendarDate(t("validation.fromDateRequired")),
      toDate: requiredCalendarDate(t("validation.toDateRequired")),
    })
    .superRefine((values, ctx) => {
      if (!values.fromDate || !values.toDate) return;
      if (values.fromDate > values.toDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("validation.fromBeforeTo"),
          path: ["toDate"],
        });
      }
    });
}

export type DOSearchValues = {
  fromDate: string;
  toDate: string;
};
