// Modified by Sekar Nagarajan (2026-08-22 00:06)
import { z } from 'zod';

// --------------------------------------------------------------------------
// Port search
// --------------------------------------------------------------------------
export interface PortOption {
  portCode: string;
  portName: string;
  /** Combined display label: "SGSIN - Singapore" */
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
export type LandingTab = 'schedules' | 'tracking' | 'rates';

// --------------------------------------------------------------------------
// Tab visibility (parity with JSP menuCategory "P" = requires login)
// --------------------------------------------------------------------------
export interface TabConfig {
  schedules: 'public' | 'login-required';
  tracking: 'public' | 'login-required';
  rates: 'public' | 'login-required';
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

export const trackingSearchSchema = z.object({
  trackingNumber: z.string().optional(),
  captcha: z.string().optional(),
});

export const ratesSearchSchema = z.object({
  pol: z.string().optional(),
  pod: z.string().optional(),
  equipmentType: z.string().optional(),
  shipmentDate: z.string().optional(),
  captcha: z.string().optional(),
});

export type ScheduleSearchForm = z.infer<typeof scheduleSearchSchema>;
export type TrackingSearchForm = z.infer<typeof trackingSearchSchema>;
export type RatesSearchForm = z.infer<typeof ratesSearchSchema>;
