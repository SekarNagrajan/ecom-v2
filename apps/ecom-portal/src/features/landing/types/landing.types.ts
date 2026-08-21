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
// Zod schemas — parity with JSP jQuery Validate rules
// --------------------------------------------------------------------------
export const scheduleSearchSchema = z.object({
  pol: z.string().min(1, 'Origin port is required'),
  pod: z.string().min(1, 'Destination port is required'),
  fromDate: z.string().min(1, 'From date is required'),
  toDate: z.string().min(1, 'To date is required'),
});

export const trackingSearchSchema = z.object({
  trackingNumber: z.string().min(1, 'BL / Booking number is required'),
  captcha: z.string().optional(),
});

export const ratesSearchSchema = z.object({
  pol: z.string().min(1, 'Origin port is required'),
  pod: z.string().min(1, 'Destination port is required'),
  equipmentType: z.string().min(1, 'Equipment type is required'),
  shipmentDate: z.string().min(1, 'Shipment date is required'),
  captcha: z.string().min(1, 'Captcha is required'),
});

export type ScheduleSearchForm = z.infer<typeof scheduleSearchSchema>;
export type TrackingSearchForm = z.infer<typeof trackingSearchSchema>;
export type RatesSearchForm = z.infer<typeof ratesSearchSchema>;
