// Modified by Sekar Nagarajan (2026-08-28 12:04)
/** Mock lookup options for booking wizard selects (additive plan). */

export type BookingLookupOption = { label: string; value: string };

export type BookingLookupKind =
  | "containerTypes"
  | "commodities"
  | "packageTypes"
  | "dgClasses"
  | "carriageContracts"
  | "agencies"
  | "placesOfReceipt"
  | "emptyPickupFacilities"
  | "dpwShipperTypes"
  | "documentTypes";

export const BOOKING_LOOKUPS: Record<BookingLookupKind, BookingLookupOption[]> = {
  containerTypes: [
    // Modified by Sekar Nagarajan (2026-08-28 12:04)
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
  commodities: [
    { value: "GEN-CGO", label: "GEN-CGO - General Freight / Merchandise" },
    { value: "AUTO-PARTS", label: "AUTO-PARTS - Automotive Spare Parts & Machinery" },
    { value: "CHEM-NONDG", label: "CHEM-NONDG - Non-Hazardous Chemicals" },
    { value: "FOODSTUFF", label: "FOODSTUFF - Foodstuffs / Perishables" },
    { value: "ELECTRONICS", label: "ELECTRONICS - Consumer Electronics" },
    { value: "TEXTILES", label: "TEXTILES - Textiles & Apparel" },
    { value: "STEEL", label: "STEEL - Steel Products / Coils" },
    { value: "PLASTICS", label: "PLASTICS - Plastic Raw Materials" },
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
  dgClasses: [
    { value: "1", label: "Class 1 - Explosives" },
    { value: "2.1", label: "Class 2.1 - Flammable Gas" },
    { value: "2.2", label: "Class 2.2 - Non-Flammable Gas" },
    { value: "3", label: "Class 3 - Flammable Liquids" },
    { value: "4.1", label: "Class 4.1 - Flammable Solids" },
    { value: "5.1", label: "Class 5.1 - Oxidizing Substances" },
    { value: "6.1", label: "Class 6.1 - Toxic Substances" },
    { value: "8", label: "Class 8 - Corrosives" },
    { value: "9", label: "Class 9 - Miscellaneous" },
  ],
  carriageContracts: [
    { value: "CY/CY", label: "CY/CY - Container Yard to Container Yard" },
    { value: "CY/DOOR", label: "CY/DOOR - Container Yard to Door" },
    { value: "DOOR/CY", label: "DOOR/CY - Door to Container Yard" },
    { value: "DOOR/DOOR", label: "DOOR/DOOR - Door to Door" },
    { value: "CFS/CFS", label: "CFS/CFS - CFS to CFS" },
  ],
  agencies: [
    { value: "AEJEA", label: "AEJEA - Jebel Ali Agency" },
    { value: "SGSIN", label: "SGSIN - Singapore Agency" },
    { value: "NLRTM", label: "NLRTM - Rotterdam Agency" },
    { value: "INNSA", label: "INNSA - Nhava Sheva Agency" },
    { value: "DEHAM", label: "DEHAM - Hamburg Agency" },
  ],
  placesOfReceipt: [
    { value: "AEJEA-CY", label: "Jebel Ali Container Yard" },
    { value: "AEJEA-CFS", label: "Jebel Ali CFS" },
    { value: "DXB-WH", label: "Dubai Warehouse" },
    { value: "SHJ-ICD", label: "Sharjah ICD" },
    { value: "AUH-CY", label: "Abu Dhabi Container Yard" },
  ],
  emptyPickupFacilities: [
    { value: "AEJEA-T1", label: "Jebel Ali Terminal 1" },
    { value: "AEJEA-T2", label: "Jebel Ali Terminal 2" },
    { value: "AEJEA-DEPOT-A", label: "Jebel Ali Empty Depot A" },
    { value: "DXB-DEPOT", label: "Dubai Empty Depot" },
    { value: "SHJ-DEPOT", label: "Sharjah Empty Depot" },
  ],
  dpwShipperTypes: [
    { value: "EXPORTER", label: "Exporter" },
    { value: "FORWARDER", label: "Freight Forwarder" },
    { value: "NVOCC", label: "NVOCC" },
    { value: "MANUFACTURER", label: "Manufacturer" },
  ],
  documentTypes: [
    { value: "MSDS", label: "MSDS / Safety Data Sheet" },
    { value: "VGM", label: "VGM Certificate" },
    { value: "PACKING_LIST", label: "Packing List" },
    { value: "COMMERCIAL_INVOICE", label: "Commercial Invoice" },
    { value: "CERTIFICATE_OF_ORIGIN", label: "Certificate of Origin" },
    { value: "OTHER", label: "Other" },
  ],
};

export function getBookingLookupOptions(kind: BookingLookupKind): BookingLookupOption[] {
  return BOOKING_LOOKUPS[kind] ?? [];
}

export const getLookups = getBookingLookupOptions;
