// Modified by Sekar Nagarajan (2026-10-17 00:20)
/**
 * Lookups for the typeaheads and dropdowns the portal handlers serve, read straight from the
 * extracted master data (Masters / VSS databases, written by `npm run extract:masters`):
 *   /api/ports/search     ← ports       (portcode / portname)
 *   /api/equipment-types  ← equipments  (Equiptype / equipdesc, status A only)
 *   /api/countries        ← countries   (countrycode / countryname)
 *   /api/states?country=  ← states      (statecode / statedesc / countrycode)
 */
import type { CountryOption, StateOption } from '../../../features/contact-us/api/contact-us.api';
import type { EquipmentType, PortOption } from '../../../features/landing/types/landing.types';
import { db, eq, type Row } from '../db';
import { portsMatching } from './masters.bridge';

export const PORT_SEARCH_LIMIT = 50;

const text = (v: unknown) => String(v ?? '').trim();
const byName = <T extends { name: string }>(a: T, b: T) => a.name.localeCompare(b.name);

/** ports row → PortOption with the "CODE - NAME" label the landing typeahead renders. */
export function mapPort(p: Row): PortOption {
  const portCode = text(p.portcode).toUpperCase();
  const portName = text(p.portname) || portCode;
  return { portCode, portName, label: `${portCode} - ${portName}` };
}

/** Ports whose code or name contains `q` (code matches first), capped for the typeahead. */
export function fixturePorts(q: string): PortOption[] {
  return portsMatching(q, PORT_SEARCH_LIMIT).map(mapPort);
}

/** Active equipment types (status A) with the master description as the option label, sorted by code. */
export function fixtureEquipmentTypes(): EquipmentType[] {
  return db.equipments
    .filter(e => eq(e.status, 'A') && text(e.Equiptype))
    .map(e => ({ code: text(e.Equiptype).toUpperCase(), name: text(e.equipdesc) || text(e.Equiptype).toUpperCase() }))
    .sort((a, b) => a.code.localeCompare(b.code));
}

/** ISO-style (two-letter) country rows of the master, de-duplicated and sorted by name. */
export function fixtureCountries(): CountryOption[] {
  const seen = new Set<string>();
  const out: CountryOption[] = [];
  for (const c of db.countries) {
    const code = text(c.countrycode).toUpperCase();
    if (!/^[A-Z]{2}$/.test(code) || seen.has(code)) continue;
    seen.add(code);
    out.push({ code, name: text(c.countryname) || code });
  }
  return out.sort(byName);
}

/** States of a country (all states when `country` is empty), sorted by name. */
export function fixtureStates(country: string | null): StateOption[] {
  return db.states
    .filter(s => text(s.statecode) && (!country || eq(s.countrycode, country)))
    .map(s => ({ code: text(s.statecode).toUpperCase(), name: text(s.statedesc) || text(s.statecode).toUpperCase() }))
    .sort(byName);
}
