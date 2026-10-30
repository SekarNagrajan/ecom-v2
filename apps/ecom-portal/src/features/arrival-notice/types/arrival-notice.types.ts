// Modified by Sekar Nagarajan (2026-09-29 12:35)
import type { TFunction } from "i18next";
import { z } from "zod";

export type ArrivalNoticePrintStatus = "Y" | "N";

export interface ArrivalNoticeContainerRow {
  containerNo: string;
  eqpSize: string;
  sealNo?: string;
}

export interface ArrivalNoticeChargeLine {
  chargeCode: string;
  description: string;
  amount: number;
  currency: string;
}

export interface ArrivalNoticeFreeTime {
  days: number;
  lastFreeDay: string;
}

export interface ArrivalNoticeListDTO {
  anNo: string;
  blNumber: string;
  vessel: string;
  voyage: string;
  dischargePort: string;
  terminal: string;
  etaDate: string;
  arrivalDate: string;
  lastFreeDay?: string;
  chargesDue: number;
  currency: string;
  printStatus: ArrivalNoticePrintStatus;
}

export interface ArrivalNoticeDTO extends ArrivalNoticeListDTO {
  notifyParty: string;
  consignee: string;
  manifestRef?: string;
  igmNo?: string;
  containers: ArrivalNoticeContainerRow[];
  chargeLines: ArrivalNoticeChargeLine[];
  freeTime?: ArrivalNoticeFreeTime;
  demurrageFrom?: string;
}

export interface ArrivalNoticeListFilters {
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
export function createArnSearchSchema(t: TFunction<"arrival-notice">) {
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

export type ArnSearchValues = {
  fromDate: string;
  toDate: string;
};
