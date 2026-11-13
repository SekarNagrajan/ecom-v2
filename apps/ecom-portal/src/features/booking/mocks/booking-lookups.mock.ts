// Modified by Sekar Nagarajan (2026-10-16 23:20)
/**
 * Static container / package type options still consumed at module load by the spreadsheet import
 * adapters (booking-import, shipping-instruction). The booking wizard's /api/booking/lookups/:kind
 * endpoint no longer uses this file — it derives every kind from the extracted fixtures in
 * src/mocks/fixture-api/bridges/booking-lookups.bridge.ts, which also owns the option types.
 */
export type {
  BookingLookupKind,
  BookingLookupOption,
} from '../../../mocks/fixture-api/bridges/booking-lookups.bridge';
import type { BookingLookupOption } from '../../../mocks/fixture-api/bridges/booking-lookups.bridge';

export const BOOKING_LOOKUPS: { containerTypes: BookingLookupOption[]; packageTypes: BookingLookupOption[] } = {
  containerTypes: [
    { value: "20DC", label: "20' Standard Dry (20DC)" },
    { value: "40DV", label: "40' Standard Dry (40DV)" },
    { value: "40HC", label: "40' High Cube Dry (40HC)" },
    { value: "45HC", label: "45' High Cube Dry (45HC)" },
    { value: "20RF", label: "20' Reefer (20RF)" },
    { value: "40RH", label: "40' High Cube Reefer (40RH)" },
    { value: "20OT", label: "20' Open Top (20OT)" },
    { value: "40OT", label: "40' Open Top (40OT)" },
    { value: "20FR", label: "20' Flat Rack (20FR)" },
    { value: "40FR", label: "40' Flat Rack (40FR)" },
  ],
  packageTypes: [
    { value: "CTN", label: "Cartons (CTN)" },
    { value: "PLT", label: "Pallets (PLT)" },
    { value: "BAG", label: "Bag, paper, multi-wall (BAG)" },
    { value: "DRM", label: "Drums (DRM)" },
    { value: "BOX", label: "Boxes (BOX)" },
    { value: "CRT", label: "Crates (CRT)" },
    { value: "BDL", label: "Bundles (BDL)" },
    { value: "UNT", label: "Units (UNT)" },
  ],
};
