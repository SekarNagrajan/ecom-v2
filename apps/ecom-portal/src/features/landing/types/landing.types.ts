// Modified by Sekar Nagarajan (2026-09-18 10:45)
import type { TFunction } from "i18next";
import { z } from "zod";

import type { TrackingSearchType } from "../../tracking/types/tracking.types";

// --------------------------------------------------------------------------
// Port search
// --------------------------------------------------------------------------
export interface PortOption {
  portCode: string;
  portName: string;
  /** Combined display label: "CNSHA - SHANGHAI HONGQIAO INTERNATIONAL APT" */
  label: string;
}

// --------------------------------------------------------------------------
// Equipment type (for Rates tab)
// --------------------------------------------------------------------------
export interface EquipmentType {
  code: string;
  name: string;
}

// --------------------------------------------------------------------------
// Active tab
// --------------------------------------------------------------------------
export type LandingTab = "schedules" | "tracking" | "rates";

// --------------------------------------------------------------------------
// Tab visibility (parity with JSP menuCategory "P" = requires login)
// --------------------------------------------------------------------------
export interface TabConfig {
  schedules: "public" | "login-required";
  tracking: "public" | "login-required";
  rates: "public" | "login-required";
}

// --------------------------------------------------------------------------
// Zod schemas — parity with JSP jQuery Validate rules (with fallback support)
// --------------------------------------------------------------------------
export const scheduleSearchSchema = z.object({
  pol: z.string().optional(),
  pod: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

/** Security Verification — JSP `ecom.msg.entcapchacode` / `ecom.msg.incorrectcaptcha`. */
function captchaRequiredSchema(t: TFunction<"landing">) {
  return z.string().trim().min(1, t("validation.captchaRequired"));
}

export const trackingSearchTypeSchema = z.enum([
  "CONTAINER",
  "BOOKING",
  "BL",
]);

export function createTrackingSearchSchema(t: TFunction<"landing">) {
  return z.object({
    searchType: trackingSearchTypeSchema,
    trackingNumber: z
      .string()
      .trim()
      .min(3, t("validation.trackingNumberMin")),
    captcha: captchaRequiredSchema(t),
  });
}

export type LandingTrackingSearchType = TrackingSearchType;

export function createRatesSearchSchema(t: TFunction<"landing">) {
  return z.object({
    pol: z.string().optional(),
    pod: z.string().optional(),
    equipmentType: z.string().optional(),
    shipmentDate: z.string().optional(),
    captcha: captchaRequiredSchema(t),
  });
}

export type ScheduleSearchForm = z.infer<typeof scheduleSearchSchema>;
export type TrackingSearchForm = z.infer<
  ReturnType<typeof createTrackingSearchSchema>
>;
export type RatesSearchForm = z.infer<
  ReturnType<typeof createRatesSearchSchema>
>;
