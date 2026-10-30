// Modified by Sekar Nagarajan (2026-08-26 14:57)
import type { TFunction } from "i18next";
import { z } from "zod";

export type CROPrintStatus = "Y" | "N";

export type CROReleaseStatus =
  | "Eligible"
  | "Blocked"
  | "Released"
  | "Cancelled";

export interface CROEligibility {
  eligible: boolean;
  reasons: string[];
}

export interface CROContainerRow {
  containerNo: string;
  eqpSize: string;
  sealNo?: string;
}

export interface CROListDTO {
  croNo: string;
  bookingNo: string;
  vessel: string;
  voyage: string;
  loadPort: string;
  dischargePort: string;
  eqpType: string;
  qtyBooked: number;
  qtyReleased: number;
  emptyReleaseDepot: string;
  croDate: string;
  validTo: string;
  printStatus: CROPrintStatus;
  releaseStatus: CROReleaseStatus;
}

export interface CRODTO extends CROListDTO {
  containers: CROContainerRow[];
  eligibility: CROEligibility;
  polArrival?: string;
  polDeparture?: string;
  printCount: number;
}

export interface CROListFilters {
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
export function createCroSearchSchema(t: TFunction<"container-release-order">) {
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

export type CroSearchValues = {
  fromDate: string;
  toDate: string;
};
