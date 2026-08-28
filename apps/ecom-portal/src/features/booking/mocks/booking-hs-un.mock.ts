// Created by Sekar Nagarajan (2026-08-27 19:12)
/** Commodity code + UN number catalogs for cargo helpers. */

export interface BookingHsCodeOption {
  code: string;
  desc: string;
}

export interface BookingUnNumberOption {
  un: string;
  name: string;
  dgClass: string;
}

export const BOOKING_HS_CODES: BookingHsCodeOption[] = [
  { code: "88847130", desc: "Portable automatic data processing machines" },
  { code: "8870899", desc: "Motor vehicle parts and accessories" },
  { code: "38390110", desc: "Polyethylene having a specific gravity < 0.94" },
  { code: "78720851", desc: "Flat-rolled products of iron or non-alloy steel" },
  { code: "68620342", desc: "Men's or boys' trousers of cotton" },
  { code: "18100630", desc: "Semi-milled or wholly milled rice" },
];

export const BOOKING_UN_NUMBERS: BookingUnNumberOption[] = [
  { un: "1203", name: "Gasoline", dgClass: "3" },
  { un: "1263", name: "Paint", dgClass: "3" },
  { un: "1760", name: "Corrosive liquid, n.o.s.", dgClass: "8" },
  { un: "1950", name: "Aerosols", dgClass: "2.1" },
  { un: "1993", name: "Flammable liquid, n.o.s.", dgClass: "3" },
  {
    un: "3077",
    name: "Environmentally hazardous substance, solid",
    dgClass: "9",
  },
  {
    un: "3082",
    name: "Environmentally hazardous substance, liquid",
    dgClass: "9",
  },
];

export function searchHsCodes(query: string): BookingHsCodeOption[] {
  const q = query.trim().toLowerCase();
  if (!q) return BOOKING_HS_CODES.slice(0, 6);
  return BOOKING_HS_CODES.filter(
    (h) => h.code.toLowerCase().includes(q) || h.desc.toLowerCase().includes(q),
  );
}

export function searchUnNumbers(query: string): BookingUnNumberOption[] {
  const q = query.trim().toLowerCase();
  if (!q) return BOOKING_UN_NUMBERS.slice(0, 6);
  return BOOKING_UN_NUMBERS.filter(
    (u) =>
      u.un.includes(q) ||
      u.name.toLowerCase().includes(q) ||
      u.dgClass.includes(q),
  );
}
