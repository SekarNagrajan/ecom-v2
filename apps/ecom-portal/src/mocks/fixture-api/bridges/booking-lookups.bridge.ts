// Modified by Sekar Nagarajan (2026-10-17 00:20)
/**
 * Booking wizard lookups and typeaheads derived from the extracted fixtures:
 *   /api/booking/lookups/:kind   → distinct values of ecombooking_* columns (+ `lookups` table labels)
 *   /api/booking/customers?q=    → parties seen on bookings (ecombooking_cust) + registered companies (users)
 *   /api/booking/hs-codes?q=     → ecombooking_commodity.HSCommodity / descr
 *   /api/booking/un-numbers?q=   → ecombooking_dg.unNo / class
 * The `*FromRows` functions are pure (testable with inline rows); the `fixture*` wrappers read `db`.
 */
import { db, type Row } from '../db';
import { distinctValues, mostCommon, str } from './booking-shared.bridge';
import { codeLabel, commodityName, customerName, equipmentRow, packageName, portLabel, portName, terminalName } from './masters.bridge';

export type BookingLookupOption = { label: string; value: string };

export type BookingLookupKind =
  | 'containerTypes'
  | 'commodities'
  | 'packageTypes'
  | 'dgClasses'
  | 'carriageContracts'
  | 'agencies'
  | 'placesOfReceipt'
  | 'emptyPickupFacilities'
  | 'dpwShipperTypes'
  | 'documentTypes';

export interface BookingCustomerOption {
  customerName: string;
  customerCode: string;
  systemCode: string;
  city: string;
  country: string;
  email?: string;
  phone?: string;
}

export interface BookingHsCodeOption {
  code: string;
  desc: string;
}

export interface BookingUnNumberOption {
  un: string;
  name: string;
  dgClass: string;
}

/** Rows of the generic `lookups` fixture for one lookupType, in display order. */
function lookupRows(lookupType: string, lookups: Row[]): Row[] {
  return lookups
    .filter(l => str(l.lookupType).toUpperCase() === lookupType && str(l.status || 'A').toUpperCase() === 'A')
    .sort((a, b) => Number(a.displayOrder ?? 0) - Number(b.displayOrder ?? 0));
}

/** "Dry Van (DV)" → "Dry Van". */
const stripCode = (text: string) => text.replace(/\s*\([^)]*\)\s*$/, '').trim();

/** Equipment codes in the data are written both ways (RE20 / 20RE / 20DV / DV20). */
export function splitEquipmentCode(code: string): { size: string; type: string } {
  const m = str(code).toUpperCase().match(/^([A-Z]*)(\d{2})([A-Z]*)$/);
  if (!m) return { size: '', type: str(code).toUpperCase() };
  return { size: m[2], type: m[1] || m[3] };
}

/**
 * "REEFER 20 CONTAINER (RE20)": the equipments master description (aliases such as DV20 / 20DC / 20GP resolve
 * to the same row); codes the master does not know fall back to the `lookups` EQUIPMENT_TYPE wording, then the code.
 */
export function equipmentLabel(code: string, lookups: Row[]): string {
  const c = str(code).toUpperCase();
  const desc = stripCode(str(equipmentRow(c)?.equipdesc)); // "STANDARD 20 CONTAINER (DV20)" → without the master's own code suffix
  if (desc) return `${desc} (${c})`;
  const { size, type } = splitEquipmentCode(c);
  const typeRow = lookupRows('EQUIPMENT_TYPE', lookups).find(l => str(l.optionKey).toUpperCase() === type);
  const typeText = typeRow ? stripCode(str(typeRow.optionText)) : type;
  const sizeText = size ? `${size}' ` : '';
  return `${sizeText}${typeText} (${c})`.trim();
}

/** Carriage contract term (CY/CY, CY/DOOR, …) implied by the pre-/on-carriage flags (C = carrier haulage → DOOR). */
export function carriageTerm(preCarriage: unknown, onCarriage: unknown): string {
  const side = (v: unknown) => (str(v).toUpperCase() === 'C' ? 'DOOR' : 'CY');
  return `${side(preCarriage)}/${side(onCarriage)}`;
}

const asOptions = (values: string[], label: (v: string) => string = v => v): BookingLookupOption[] =>
  values.map(v => ({ value: v, label: label(v) }));

export interface LookupSources {
  bookings: Row[];
  cargo: Row[];
  commodities: Row[];
  dg: Row[];
  legs: Row[];
  haulage: Row[];
  files: Row[];
  users: Row[];
  lookups: Row[];
}

/** Options for one lookup kind, derived from the fixture rows passed in. */
export function lookupOptionsFromRows(kind: BookingLookupKind, s: LookupSources): BookingLookupOption[] {
  switch (kind) {
    case 'containerTypes': {
      const codes = [...distinctValues(s.cargo, 'eqpSize'), ...distinctValues(s.haulage, 'eqptypeid')]
        .map(c => c.toUpperCase());
      const unique = [...new Set(codes)].sort((a, b) => {
        const sa = splitEquipmentCode(a); const sb = splitEquipmentCode(b);
        return sa.size.localeCompare(sb.size) || a.localeCompare(b);
      });
      return asOptions(unique, c => equipmentLabel(c, s.lookups));
    }
    case 'commodities': {
      // Commodity names come from the commodities master; codes it does not know keep the booked description.
      const codes = distinctValues(s.commodities, 'commodity');
      return codes.map(code => {
        const master = commodityName(code);
        const desc = master !== code ? master : mostCommon(s.commodities.filter(c => str(c.commodity) === code), 'descr');
        return { value: code, label: desc ? `${code} - ${desc}` : code };
      });
    }
    case 'packageTypes':
      return asOptions(distinctValues(s.commodities, 'package').map(p => p.toUpperCase()).sort(), p => codeLabel(p, packageName(p)));
    case 'dgClasses':
      return asOptions(
        distinctValues(s.dg, 'class').sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
        c => `Class ${c}`,
      );
    case 'carriageContracts': {
      const terms = [...new Set(s.bookings.map(b => carriageTerm(b.preCarriage, b.onCarriage)))].sort();
      return asOptions(terms);
    }
    case 'agencies': {
      const codes = [...new Set([...distinctValues(s.bookings, 'agencyid'), ...distinctValues(s.users, 'agencycode')])];
      return codes.map(code => {
        const location = mostCommon(s.users.filter(u => str(u.agencycode).toUpperCase() === code.toUpperCase()), 'control_location');
        return { value: code, label: location ? `${code} - ${portName(location)}` : code };
      });
    }
    case 'placesOfReceipt': {
      // ecombooking has no place-of-receipt column; carrier-haulage pickup locations + origin ports are the closest source.
      const seen = new Set<string>();
      const out: BookingLookupOption[] = [];
      for (const h of s.haulage) {
        const value = str(h.loadLocation);
        if (!value || seen.has(value)) continue;
        seen.add(value);
        out.push({ value, label: str(h.loadlocationname) ? `${str(h.loadlocationname)} (${value})` : value });
      }
      for (const port of distinctValues(s.bookings, 'originPortId')) {
        if (seen.has(port)) continue;
        seen.add(port);
        out.push({ value: port, label: portLabel(port) });
      }
      return out;
    }
    case 'emptyPickupFacilities': {
      // ecombooking.emptypickup is blank in the sample; the load terminals of the booked legs are the depots/terminals in use.
      const terminals = distinctValues(s.legs, 'loadTerminal').filter(t => t.length > 1).sort();
      return asOptions(terminals, t => codeLabel(t, terminalName(t)));
    }
    case 'dpwShipperTypes': {
      const fromLookups = lookupRows('BUSINESS_TYPE', s.lookups).map(l => str(l.optionKey));
      const fromUsers = distinctValues(s.users, 'Business_Type');
      return asOptions([...new Set([...fromLookups, ...fromUsers])]);
    }
    case 'documentTypes':
      return asOptions(distinctValues(s.files, 'FileCatgeory').map(c => c.toUpperCase()).sort());
    default:
      return [];
  }
}

export function fixtureBookingLookups(kind: BookingLookupKind): BookingLookupOption[] {
  return lookupOptionsFromRows(kind, {
    bookings: db.bookings,
    cargo: db.bookingCargo,
    commodities: db.bookingCommodity,
    dg: db.bookingDg,
    legs: db.bookingLeg,
    haulage: db.bookingHaulage,
    files: db.bookingFiles,
    users: db.users,
    lookups: db.lookups,
  });
}

/** One option per distinct (name, customer code) pair across booking parties and registered companies. */
export function customerOptionsFromRows(parties: Row[], users: Row[]): BookingCustomerOption[] {
  const seen = new Set<string>();
  const out: BookingCustomerOption[] = [];
  const add = (o: BookingCustomerOption) => {
    if (!o.customerName) return;
    const key = `${o.customerName.toLowerCase()}|${o.customerCode.toLowerCase()}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(o);
  };
  for (const p of parties) {
    const code = str(p.custId);
    add({
      customerName: str(p.name) || (code ? customerName(code) : ''),
      customerCode: code,
      systemCode: code,
      city: str(p.city),
      country: str(p.countryId).toUpperCase(),
      email: str(p.email) || undefined,
      phone: str(p.telephone) || undefined,
    });
  }
  for (const u of users) {
    const code = str(u.Cust_Code) || str(u.reg_no);
    add({
      customerName: str(u.Comp_Name),
      customerCode: code,
      systemCode: str(u.Cust_Code) || code,
      city: str(u.City),
      country: str(u.Country).toUpperCase(),
      email: str(u.User_Email) || undefined,
      phone: str(u.Comp_Phone) || str(u.User_Mobile) || undefined,
    });
  }
  return out;
}

export function searchCustomerOptions(options: BookingCustomerOption[], query: string): BookingCustomerOption[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return options.filter(
    c =>
      c.customerName.toLowerCase().includes(q) ||
      c.customerCode.toLowerCase().includes(q) ||
      c.systemCode.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q),
  );
}

export const fixtureBookingCustomers = (query: string) =>
  searchCustomerOptions(customerOptionsFromRows(db.bookingCust, db.users), query);

export function hsCodeOptionsFromRows(commodities: Row[]): BookingHsCodeOption[] {
  return distinctValues(commodities, 'HSCommodity').map(code => ({
    code,
    desc:
      mostCommon(commodities.filter(c => str(c.HSCommodity) === code), 'descr') ||
      commodityName(str(commodities.find(c => str(c.HSCommodity) === code)?.commodity)),
  }));
}

export function searchHsCodeOptions(options: BookingHsCodeOption[], query: string): BookingHsCodeOption[] {
  const q = query.trim().toLowerCase();
  if (!q) return options.slice(0, 6);
  return options.filter(h => h.code.toLowerCase().includes(q) || h.desc.toLowerCase().includes(q));
}

export const fixtureBookingHsCodes = (query: string) => searchHsCodeOptions(hsCodeOptionsFromRows(db.bookingCommodity), query);

/** ecombooking_dg has no proper-shipping-name column, so the name is the IMDG class the UN number was booked under. */
export function unNumberOptionsFromRows(dg: Row[]): BookingUnNumberOption[] {
  return distinctValues(dg, 'unNo')
    .sort()
    .map(un => {
      const dgClass = mostCommon(dg.filter(d => str(d.unNo) === un), 'class');
      return { un, name: dgClass ? `IMDG class ${dgClass}` : '', dgClass };
    });
}

export function searchUnNumberOptions(options: BookingUnNumberOption[], query: string): BookingUnNumberOption[] {
  const q = query.trim().toLowerCase();
  if (!q) return options.slice(0, 6);
  return options.filter(u => u.un.includes(q) || u.name.toLowerCase().includes(q) || u.dgClass.includes(q));
}

export const fixtureBookingUnNumbers = (query: string) => searchUnNumberOptions(unNumberOptionsFromRows(db.bookingDg), query);
