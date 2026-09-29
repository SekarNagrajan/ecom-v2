// Modified by Sekar Nagarajan (2026-08-26 14:42)
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
  ecomprintstatus: string;
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
