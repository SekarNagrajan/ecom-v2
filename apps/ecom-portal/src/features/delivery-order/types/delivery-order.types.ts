// Modified by Sekar Nagarajan (2026-08-26 14:42)
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
function requiredCalendarDate(label: string) {
  return z.preprocess(
    (value) => {
      if (value == null) return "";
      if (typeof value === "string") return value.trim();
      return "";
    },
    z.string().min(1, `${label} is required`),
  );
}

export const doSearchSchema = z
  .object({
    fromDate: requiredCalendarDate("From date"),
    toDate: requiredCalendarDate("To date"),
  })
  .superRefine((values, ctx) => {
    if (!values.fromDate || !values.toDate) return;
    if (values.fromDate > values.toDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "From date must be on or before To date",
        path: ["toDate"],
      });
    }
  });

export type DOSearchValues = {
  fromDate: string;
  toDate: string;
};
