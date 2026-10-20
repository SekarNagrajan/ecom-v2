// Created for Phase 4 — one place that turns a module status code into a
// human label + a meaningful Ant Design Tag colour.
//
// The maps are NOT invented here: each case delegates to the module's own
// existing status helpers (the source of truth used by that module's list
// cards). Unknown codes fall back to the raw code with a default colour and
// a one-time dev warning so missing mappings are reported, not hidden.
import i18n from "../../../i18n/config";
import { getBookingStatusLabel } from "../../booking/utils/booking-status";
import {
  getBookingListStatusColor,
  type BookingListStatus,
} from "../../booking/types/booking-list.types";
import {
  getBLStatusColor,
  getBLStatusLabel,
} from "../../bill-of-lading/utils/bl-status";
import type { BLRowStatus } from "../../bill-of-lading/types/bl.types";
import {
  getCroReleaseStatusColor,
  getCroReleaseStatusLabel,
} from "../../container-release-order/utils/cro-status";
import type { CROReleaseStatus } from "../../container-release-order/types/cro.types";
import {
  getSiStatusLabel,
  getSiStatusTagColor,
} from "../../shipping-instruction/utils/si-status";
import type { SIStatus } from "../../shipping-instruction/types/si.types";

/** Tool/module a status belongs to (matches the tool names in registry.ts). */
export type StatusModule =
  | "list_bookings"
  | "get_booking"
  | "list_shipping_instructions"
  | "list_bills_of_lading"
  | "list_cro"
  | "list_vgm"
  | "list_delivery_orders"
  | "list_arrival_notices"
  | "track_shipment";

export interface StatusDisplay {
  label: string;
  color: string;
}

const BOOKING_STATUSES: readonly string[] = [
  "Draft",
  "Submitted",
  "Confirmed",
  "Awaiting Acceptance",
  "In Transit",
  "Completed",
  "Rejected",
  "Cancelled",
];
const SI_STATUSES: readonly string[] = [
  "Create SI",
  "Create Multiple SI",
  "Draft",
  "Submitted",
  "Accepted",
  "Declined",
  "Locked",
];
const BL_STATUSES: readonly string[] = ["D", "S", "C", "I"];
const CRO_STATUSES: readonly string[] = [
  "Eligible",
  "Blocked",
  "Released",
  "Cancelled",
];

const warned = new Set<string>();
function reportUnknown(module: string, code: string): void {
  const key = `${module}:${code}`;
  const isDev =
    typeof import.meta !== "undefined" && Boolean(import.meta.env?.DEV);
  if (isDev && !warned.has(key)) {
    warned.add(key);
    // eslint-disable-next-line no-console
    console.warn(
      `[assistant] No status mapping for module "${module}" code "${code}".`,
    );
  }
}

/** Translator fixed to a module's i18n namespace in the active language. */
function nsT(namespace: string) {
  return i18n.getFixedT(i18n.language || "en", namespace);
}

/**
 * Resolve a raw status code into a display label + Tag colour, reusing the
 * owning module's own helpers. Unknown codes return the raw value with a
 * default colour and are reported once in dev.
 */
export function getStatusDisplay(
  module: StatusModule,
  code: string | null | undefined,
): StatusDisplay {
  const raw = (code ?? "").toString().trim();
  if (!raw) return { label: "", color: "default" };

  switch (module) {
    case "list_bookings":
    case "get_booking":
      if (BOOKING_STATUSES.includes(raw)) {
        return {
          label: getBookingStatusLabel(raw as BookingListStatus, nsT("booking")),
          color: getBookingListStatusColor(raw as BookingListStatus),
        };
      }
      break;
    case "list_shipping_instructions":
      if (SI_STATUSES.includes(raw)) {
        return {
          label: getSiStatusLabel(raw as SIStatus, nsT("shipping-instruction")),
          color: getSiStatusTagColor(raw as SIStatus),
        };
      }
      break;
    case "list_bills_of_lading":
      if (BL_STATUSES.includes(raw)) {
        return {
          label: getBLStatusLabel(raw as BLRowStatus, nsT("bill-of-lading")),
          color: getBLStatusColor(raw as BLRowStatus),
        };
      }
      break;
    case "list_cro":
      if (CRO_STATUSES.includes(raw)) {
        return {
          label: getCroReleaseStatusLabel(
            raw as CROReleaseStatus,
            nsT("container-release-order"),
          ),
          color: getCroReleaseStatusColor(raw as CROReleaseStatus),
        };
      }
      break;
    case "track_shipment":
      // Tracking statuses are already human-readable activity text; keep the
      // in-progress blue the tracking card has always used.
      return { label: raw, color: "processing" };
    case "list_vgm":
    case "list_delivery_orders":
    case "list_arrival_notices":
      // No shared status-code map exists for these record statuses yet.
      break;
    default: {
      const _exhaustive: never = module;
      void _exhaustive;
      break;
    }
  }

  reportUnknown(module, raw);
  return { label: raw, color: "default" };
}
