// Modified by Sekar Nagarajan (2026-08-26 14:26)
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

export const doSearchSchema = z
  .object({
    fromDate: z.string().min(1, "From date is required"),
    toDate: z.string().min(1, "To date is required"),
  })
  .refine(
    (values) => values.fromDate <= values.toDate,
    {
      message: "From date must be on or before To date",
      path: ["toDate"],
    },
  );

export type DOSearchValues = z.infer<typeof doSearchSchema>;
