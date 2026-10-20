// Modified by Sekar Nagarajan (2026-10-17 00:20)
/**
 * System-admin configuration tables → the admin DTOs (src/features/admin/types/admin.types.ts):
 * EcomImageUpload → BannerConfig, EcomCustomerAdvisory → CustomerAdvisory, ecom_cutoffconfig → CutoffConfig,
 * EcomEmailTemplate → EmailTemplate, fieldconfigdetails (+ fieldnameconfig) → FieldConfig,
 * globalconfigproduct + EcomConfiguration → GlobalConfig, ecom_service_restrict → ServiceRestriction,
 * ecomhotlinecontacts → HotlineContactsResponse. Pure functions with db.* defaults; the `apply*` /
 * `*Row` helpers write DTO changes back onto the fixture rows so mutations survive within the session.
 */
import type {
  BannerConfig, CustomerAdvisory, CutoffConfig, CutoffPortOption, CutoffTerminalOption, EmailTemplate, FieldConfig,
  GlobalConfig, ServiceRestriction,
} from '../../../features/admin/types/admin.types';
import type { HotlineContact, HotlineContactsResponse } from '../../../features/agency-hotline/types/hotline.types';
import { db, eq, nowIso, type Row } from '../db';
import { toIsoOrNull } from './format';
import { countryName, portName as masterPortName, terminalName as masterTerminalName } from './masters.bridge';

const str = (v: unknown) => String(v ?? '').trim();
const dateOnly = (v: unknown) => (toIsoOrNull(v) ?? '').slice(0, 10);
const nextId = (rows: Row[], column: string) => rows.reduce((max, r) => Math.max(max, Number(r[column]) || 0), 0) + 1;

// ---------------------------------------------------------------------------
// Banners ← EcomImageUpload
// ---------------------------------------------------------------------------
export const mapBanner = (r: Row): BannerConfig => ({
  id: str(r.id),
  title: str(r.imagename),
  imageUrl: str(r.imagepath),
  linkUrl: undefined,
  sortOrder: Number(r.displayorder ?? 0),
  isActive: eq(r.status, 'A'),
});

export const banners = (rows: Row[] = db.loginImages): BannerConfig[] =>
  [...rows].sort((a, b) => Number(a.displayorder ?? 0) - Number(b.displayorder ?? 0)).map(mapBanner);

export function bannerRow(dto: Omit<BannerConfig, 'id'>, rows: Row[] = db.loginImages): Row {
  const row: Row = { id: nextId(rows, 'id'), imagename: dto.title, imagepath: dto.imageUrl, displayorder: dto.sortOrder, status: dto.isActive ? 'A' : 'I' };
  rows.push(row);
  return row;
}

// ---------------------------------------------------------------------------
// Customer advisories ← EcomCustomerAdvisory
// ---------------------------------------------------------------------------
export const mapAdvisory = (r: Row): CustomerAdvisory => ({
  id: str(r.id),
  title: str(r.advisoryname),
  message: str(r.description),
  // TODO(fixtures): EcomCustomerAdvisory has no severity / validity window; INFO and an open-ended period are placeholders.
  severity: 'INFO',
  effectiveFrom: dateOnly(r.createddate),
  effectiveTo: '',
  isActive: eq(r.status, 'A'),
});

export const advisories = (rows: Row[] = db.advisories): CustomerAdvisory[] =>
  [...rows].sort((a, b) => +new Date(b.createddate) - +new Date(a.createddate)).map(mapAdvisory);

export function advisoryRow(dto: Omit<CustomerAdvisory, 'id'>, rows: Row[] = db.advisories): Row {
  const row: Row = { id: nextId(rows, 'id'), advisoryname: dto.title, description: dto.message, createddate: dto.effectiveFrom || nowIso(), status: dto.isActive ? 'A' : 'I' };
  rows.push(row);
  return row;
}

// ---------------------------------------------------------------------------
// Cut-off configuration ← ecom_cutoffconfig (+ port names from the port master / SI headers / booking legs)
// ---------------------------------------------------------------------------
export const ALL_PORT: CutoffPortOption = { portCode: 'All', portName: 'All Port', label: 'All - All Port' };
export const ALL_TERMINAL_NAME = 'All Terminal';

/** Port code → name from the port master when dumped, else the header names ecomSI stores per port. */
export function portNameIndex(ports: Row[] = db.ports, si: Row[] = db.shippingInstructions): Record<string, string> {
  const index: Record<string, string> = {};
  for (const r of si) {
    for (const [code, name] of [[r.pol, r.polHeaderName], [r.pod, r.podHeaderName], [r.pla, r.plaHeaderName], [r.pld, r.pldHeaderName]]) {
      const c = str(code).toUpperCase();
      if (c && str(name) && !index[c]) index[c] = str(name);
    }
  }
  for (const p of ports) {
    const c = str(p.portcode).toUpperCase();
    if (c && str(p.portname)) index[c] = str(p.portname);
  }
  return index;
}

export const portName = (code: unknown, index: Record<string, string>) => {
  const c = str(code);
  if (eq(c, 'All')) return ALL_PORT.portName;
  return index[c.toUpperCase()] ?? c;
};

/** Terminal name from the terminals master (terminalcode → terminalname); the code when unknown. */
export const terminalName = (code: unknown) => (eq(code, 'All') ? ALL_TERMINAL_NAME : masterTerminalName(str(code)));

export const cutoffId = (portCode: string, terminalCode: string) => `${portCode}|${terminalCode}`;

export function mapCutoff(r: Row, index: Record<string, string>): CutoffConfig {
  const portCode = str(r.port);
  const terminalCode = str(r.terminal) || 'All';
  return {
    id: cutoffId(portCode, terminalCode),
    portCode,
    portName: portName(portCode, index),
    terminalCode,
    terminalName: terminalName(terminalCode),
    cfsClosing: Number(r.cfsclosing ?? 0),
    vgmClosing: Number(r.vgmclosing ?? 0),
    documentClosing: Number(r.docclosing ?? 0),
    ediDecClosing: Number(r.ediclosing ?? 0),
    fullCntrGateClosing: Number(r.fullcntrclosing ?? 0),
    excludeWeekends: eq(r.excludeweekend, 'Y'),
  };
}

/** Rows whose status is not explicitly inactive (the dump has NULL status on every live row). */
export const cutoffConfigs = (rows: Row[] = db.cutoffConfig, index = portNameIndex()): CutoffConfig[] =>
  rows.filter(r => !eq(r.status, 'I') && !eq(r.status, 'D')).map(r => mapCutoff(r, index));

export function findCutoffRow(id: string, rows: Row[] = db.cutoffConfig) {
  return rows.find(r => !eq(r.status, 'I') && !eq(r.status, 'D') && cutoffId(str(r.port), str(r.terminal) || 'All') === id);
}

export function cutoffRow(dto: Omit<CutoffConfig, 'id'>, rows: Row[] = db.cutoffConfig, user = 'admin'): Row {
  const now = nowIso();
  const row: Row = {
    id: nextId(rows, 'id'), port: dto.portCode, terminal: dto.terminalCode, cfsclosing: dto.cfsClosing, vgmclosing: dto.vgmClosing,
    docclosing: dto.documentClosing, ediclosing: dto.ediDecClosing, fullcntrclosing: dto.fullCntrGateClosing, status: null,
    cruser: user, crdate: now, chguser: user, chgdate: now, excludeweekend: dto.excludeWeekends ? 'Y' : 'N',
  };
  rows.push(row);
  return row;
}

export function applyCutoff(row: Row, patch: Partial<CutoffConfig>, user = 'admin'): Row {
  if (patch.cfsClosing != null) row.cfsclosing = patch.cfsClosing;
  if (patch.vgmClosing != null) row.vgmclosing = patch.vgmClosing;
  if (patch.documentClosing != null) row.docclosing = patch.documentClosing;
  if (patch.ediDecClosing != null) row.ediclosing = patch.ediDecClosing;
  if (patch.fullCntrGateClosing != null) row.fullcntrclosing = patch.fullCntrGateClosing;
  if (patch.excludeWeekends != null) row.excludeweekend = patch.excludeWeekends ? 'Y' : 'N';
  row.chguser = user;
  row.chgdate = nowIso();
  return row;
}

/** Distinct ports: configured cut-offs + booking origins / destinations + booking legs (+ port master). */
export function cutoffPorts(rows: Row[] = db.cutoffConfig, bookings: Row[] = db.bookings, legs: Row[] = db.bookingLeg, ports: Row[] = db.ports, index = portNameIndex()): CutoffPortOption[] {
  const codes = new Set<string>();
  const add = (v: unknown) => { const c = str(v).toUpperCase(); if (c && !eq(c, 'All')) codes.add(c); };
  rows.forEach(r => add(r.port));
  bookings.forEach(b => { add(b.originPortId); add(b.finalPortId); add(b.loadPortId); add(b.dischargePortId); });
  legs.forEach(l => { add(l.loadPortId); add(l.dischargePortId); });
  ports.forEach(p => add(p.portcode));
  const options = [...codes].sort().map(portCode => ({ portCode, portName: portName(portCode, index), label: `${portCode} - ${portName(portCode, index)}` }));
  return [ALL_PORT, ...options];
}

/** Terminals of a port: 'All' first, then configured cut-off terminals and booking-leg terminals. */
export function cutoffTerminals(portCode: string, rows: Row[] = db.cutoffConfig, legs: Row[] = db.bookingLeg): CutoffTerminalOption[] {
  const codes = new Set<string>();
  const add = (v: unknown) => { const c = str(v); if (c && !eq(c, 'All')) codes.add(c); };
  rows.filter(r => eq(r.port, portCode)).forEach(r => add(r.terminal));
  legs.forEach(l => { if (eq(l.loadPortId, portCode)) add(l.loadTerminal); if (eq(l.dischargePortId, portCode)) add(l.dischargeTerminal); });
  return [
    { portCode, terminalCode: 'All', terminalName: ALL_TERMINAL_NAME },
    ...[...codes].sort().map(terminalCode => ({ portCode, terminalCode, terminalName: terminalName(terminalCode) })),
  ];
}

// ---------------------------------------------------------------------------
// E-mail templates ← EcomEmailTemplate
// ---------------------------------------------------------------------------
/** `{{placeholder}}` and legacy `@token` markers found in the subject / body, in first-seen order. */
export function extractPlaceholders(...texts: unknown[]): string[] {
  const out: string[] = [];
  for (const t of texts) {
    for (const m of str(t).matchAll(/\{\{\s*([A-Za-z0-9_.]+)\s*\}\}|(?<![\w@])@([A-Za-z][A-Za-z0-9_]*)/g)) {
      const token = m[1] ? `{{${m[1]}}}` : `@${m[2]}`;
      if (!out.includes(token)) out.push(token);
    }
  }
  return out;
}

export const mapEmailTemplate = (r: Row): EmailTemplate => ({
  id: str(r.id),
  templateCode: str(r.templateKey),
  subject: str(r.subject),
  bodyHtml: String(r.bodyHtml ?? ''),
  placeholders: extractPlaceholders(r.subject, r.bodyHtml),
  updatedAt: toIsoOrNull(r.updatedAt) ?? toIsoOrNull(r.createdAt) ?? '',
});

export const emailTemplates = (rows: Row[] = db.emailTemplates): EmailTemplate[] =>
  rows.filter(r => !eq(r.status, 'I')).sort((a, b) => Number(a.id) - Number(b.id)).map(mapEmailTemplate);

export function applyEmailTemplate(row: Row, patch: Partial<EmailTemplate>, user = 'admin'): Row {
  if (patch.templateCode != null) row.templateKey = patch.templateCode;
  if (patch.subject != null) row.subject = patch.subject;
  if (patch.bodyHtml != null) row.bodyHtml = patch.bodyHtml;
  row.updatedAt = nowIso();
  row.updatedBy = user;
  return row;
}

// ---------------------------------------------------------------------------
// Field configuration ← fieldconfigdetails + fieldnameconfig
// ---------------------------------------------------------------------------
const MODULE_FORM: Record<string, string> = { BKG: 'Booking Form', SHI: 'SI Form', BOL: 'BL Form', REG: 'Registration Form' };

export function mapFieldConfig(r: Row, names: Row[] = db.fieldnameconfig): FieldConfig {
  const code = str(r.fieldcode);
  const shipment = str(r.shipmenttype).toUpperCase();
  const name = names.find(n => eq(n.fieldcode, code) && eq(n.shipmenttype, shipment)) ?? names.find(n => eq(n.fieldcode, code));
  const module = str(name?.module).toUpperCase();
  const scope = `${eq(r.searchtype, 'P') ? 'Port' : 'Country'} ${str(r.searchvalue)}`;
  const bound = shipment === 'I' ? 'Import' : shipment === 'E' ? 'Export' : shipment;
  return {
    id: str(r.id),
    formName: MODULE_FORM[module] ?? (module || 'Field Configuration'),
    fieldId: code,
    fieldLabel: `${str(name?.fieldname) || code} (${[scope, bound].filter(Boolean).join(', ')})`,
    isVisible: eq(r.status, 'A'),
    // inputtype: M mandatory, E enabled/optional, N not shown
    isRequired: eq(r.inputtype, 'M'),
  };
}

export const fieldConfigs = (rows: Row[] = db.fieldConfig, names: Row[] = db.fieldnameconfig): FieldConfig[] =>
  [...rows].sort((a, b) => Number(a.id) - Number(b.id)).map(r => mapFieldConfig(r, names));

export function applyFieldConfigs(list: FieldConfig[], rows: Row[] = db.fieldConfig): Row[] {
  for (const dto of list) {
    const row = rows.find(r => eq(r.id, dto.id));
    if (!row) continue;
    row.status = dto.isVisible ? 'A' : 'I';
    row.inputtype = dto.isRequired ? 'M' : eq(row.inputtype, 'M') ? 'E' : str(row.inputtype) || 'E';
  }
  return rows;
}

// ---------------------------------------------------------------------------
// Global config ← globalconfigproduct (pathname/pathvalue) + EcomConfiguration (configKey/configValue)
// ---------------------------------------------------------------------------
/** GlobalConfig DTO field → globalconfigproduct.pathname (Y/N flags). */
export const GLOBAL_CONFIG_FLAGS: Record<'enableLoginCaptcha' | 'allowIncompletedRegToLogin' | 'v1DataEnableStatus' | 'dashboardDisplay' | 'enablePasswordValidation', string> = {
  enableLoginCaptcha: 'ENABLE_GOOGLE_CAPTCHA',
  allowIncompletedRegToLogin: 'Enable_Reg_Auto_Process',
  v1DataEnableStatus: 'Enable_NewEcom',
  dashboardDisplay: 'Enable_Enhanced_Dashboard',
  // TODO(fixtures): no password-policy flag in globalconfigproduct; the closest switch is the user OTP flag.
  enablePasswordValidation: 'Enable_User_OTP',
};

const flag = (rows: Row[], pathname: string) => {
  const row = rows.find(r => eq(r.pathname, pathname));
  return row ? eq(row.pathvalue, 'Y') : false;
};

export function globalConfigDto(rows: Row[] = db.globalConfig, configuration: Row[] = db.configuration): GlobalConfig {
  const siteKey = rows.find(r => eq(r.pathname, 'GOOGLE_CAPTCHA_SITE_KEY'))?.pathvalue ?? configuration.find(c => eq(c.configKey, 'CAPTCHA_SITE_KEY'))?.configValue;
  return {
    enableLoginCaptcha: flag(rows, GLOBAL_CONFIG_FLAGS.enableLoginCaptcha),
    // The reCAPTCHA secret was stripped from the dump; the public site key is the only captcha key left.
    captchaSecretKey: str(siteKey),
    // TODO(fixtures): login attempt limit / lock duration are not configured in any extracted table
    // (ecomuserdetails only stores the WrgPassAtmpt counter); defaults kept.
    attemptLimit: 3,
    accountLockDurationMinutes: 30,
    enablePasswordValidation: flag(rows, GLOBAL_CONFIG_FLAGS.enablePasswordValidation),
    allowIncompletedRegToLogin: flag(rows, GLOBAL_CONFIG_FLAGS.allowIncompletedRegToLogin),
    v1DataEnableStatus: flag(rows, GLOBAL_CONFIG_FLAGS.v1DataEnableStatus),
    dashboardDisplay: flag(rows, GLOBAL_CONFIG_FLAGS.dashboardDisplay),
  };
}

/** Writes the Y/N flags (and the captcha key) back onto globalconfigproduct rows, creating missing ones. */
export function applyGlobalConfig(dto: GlobalConfig, rows: Row[] = db.globalConfig): Row[] {
  const set = (pathname: string, pathvalue: string) => {
    const row = rows.find(r => eq(r.pathname, pathname));
    if (row) row.pathvalue = pathvalue;
    else rows.push({ id: nextId(rows, 'id'), pathname, pathvalue, status: 'C' });
  };
  for (const [field, pathname] of Object.entries(GLOBAL_CONFIG_FLAGS) as [keyof typeof GLOBAL_CONFIG_FLAGS, string][]) set(pathname, dto[field] ? 'Y' : 'N');
  if (dto.captchaSecretKey) set('GOOGLE_CAPTCHA_SITE_KEY', dto.captchaSecretKey);
  return rows;
}

// ---------------------------------------------------------------------------
// Service restrictions ← ecom_service_restrict (pla / pld / service)
// ---------------------------------------------------------------------------
export function mapServiceRestriction(r: Row, tenantId: string): ServiceRestriction {
  return {
    id: str(r.id),
    polCode: str(r.pla),
    podCode: str(r.pld),
    serviceLoop: str(r.service),
    tenantId,
    // An active ecom_service_restrict row IS the restriction; inactive rows are kept as released.
    isRestricted: eq(r.status, 'A'),
    reason: undefined,
  };
}

/** Carrier code from EcomConfiguration (ECOM_CARRIER_CODE) stands in for the tenant. */
export const carrierTenantId = (configuration: Row[] = db.configuration) =>
  str(configuration.find(c => eq(c.configKey, 'ECOM_CARRIER_CODE'))?.configValue) || 'TENANT_01';

export const serviceRestrictions = (rows: Row[] = db.serviceRestrictions, tenantId = carrierTenantId()): ServiceRestriction[] =>
  rows.map(r => mapServiceRestriction(r, tenantId));

/** PUT replaces the list: rows are updated / created by id and rows missing from the list are removed. */
export function applyServiceRestrictions(list: ServiceRestriction[], rows: Row[] = db.serviceRestrictions): Row[] {
  const keep = new Set<string>();
  for (const dto of list) {
    let row = rows.find(r => eq(r.id, dto.id));
    if (!row) {
      row = { id: /^\d+$/.test(dto.id) ? Number(dto.id) : nextId(rows, 'id') };
      rows.push(row);
    }
    row.pla = dto.polCode;
    row.pld = dto.podCode;
    row.service = dto.serviceLoop;
    row.status = dto.isRestricted ? 'A' : 'I';
    keep.add(str(row.id));
  }
  for (let i = rows.length - 1; i >= 0; i--) if (!keep.has(str(rows[i].id))) rows.splice(i, 1);
  return rows;
}

// ---------------------------------------------------------------------------
// Agency hotline ← ecomhotlinecontacts (status A), grouped by country like the legacy TreeMap.
// Rows that only carry codes are named through the countries / ports masters (code when unknown).
// ---------------------------------------------------------------------------
export function hotlineContacts(rows: Row[] = db.hotlineContacts): HotlineContactsResponse {
  const groups = new Map<string, { countryName: string; ports: HotlineContact[] }>();
  for (const r of rows) {
    if (!eq(r.status, 'A')) continue;
    const country = str(r.CountryName) || countryName(str(r.countrycode).toUpperCase());
    if (!country) continue;
    const key = country.toLowerCase();
    if (!groups.has(key)) groups.set(key, { countryName: country, ports: [] });
    groups.get(key)?.ports.push({
      portName: str(r.PortName) || masterPortName(str(r.portcode).toUpperCase()),
      contactName: str(r.ContactName),
      phone: str(r.phone),
      email: str(r.email),
    });
  }
  const countries = [...groups.values()]
    .map(g => ({ ...g, ports: g.ports.sort((a, b) => a.portName.localeCompare(b.portName)) }))
    .sort((a, b) => a.countryName.localeCompare(b.countryName));
  return { countries };
}
