// Modified by Sekar Nagarajan (2026-10-17 00:20)
/**
 * eCom_Reg_Details (db.users) + ecomuserdetails (db.userDetails) + EcomCustomerUser (db.customerUsers)
 * + ecom_adminuser_details (db.adminUsers) / EcomAdminUser (db.adminUserAccounts) → the auth profiles,
 * sub-user DTOs and registration lookups the portal consumes. Pure functions with db.* defaults.
 */
import type { LoginEntryType, SubCustomerAccount, UserProfile } from '@solverminds/auth';
import type { ModuleMappingCustomer } from '../../../features/admin/types/admin.types';
import type { AddressLookupResult, CustomerCodeCheckResult } from '../../../features/registration/types/registration.schema';
import type { CreateSubUserPayload, SubUser, UserLimitResponse } from '../../../features/user-creation/types/user-creation.types';
import { db, eq, nextRef, nowIso, type Row } from '../db';
import { toIsoOrNull } from './format';
import { customerName, customerRow } from './masters.bridge';
import { allCapabilities, capabilitiesForMenuIds, capabilitiesOfRefNo, defaultMenuIds, joinMenuIds, menuCategories, splitMenuIds, vendorMenuKeys } from './menus.bridge';

/** Customer whose bookings / SI / users were sampled by the extractor (see mock-data/README.md). */
export const DEMO_CUSTOMER_CODE = '20001374';
/** Demo credentials that keep working: resolve to the first fixture user of DEMO_CUSTOMER_CODE. */
export const DEMO_LOGIN = 'test';
/**
 * Capabilities the hand-written demo user had. The sampled user's MenuId (44_47_48_52_56) only grants
 * dashboard/booking/SI/BL/CRO (+ the default D menus), so these are unioned in for the `test` login
 * to keep every demo route reachable. Other fixture logins get exactly what their MenuId grants.
 */
export const DEMO_BASELINE_CAPABILITIES = ['VIEW_DASHBOARD', 'CREATE_BOOKING', 'BL', 'SI', 'BKG', 'DO', 'CRO', 'ARN', 'STMT', 'CO2', 'VGM'];
/** Branding tenant the public-tenant handler also defaults to. */
export const DEMO_TENANT_ID = 'TENANT_01';

const str = (v: unknown) => String(v ?? '').trim();
const dateOnly = (v: unknown) => (toIsoOrNull(v) ?? '').slice(0, 10);

export const displayName = (u: Row | undefined, fallback = '') =>
  [str(u?.First_Name), str(u?.Last_Name)].filter(Boolean).join(' ') || fallback;

/** users row by loginname or User_Email. */
export const findUser = (login: string, users: Row[] = db.users) =>
  users.find(u => eq(u.loginname, login) || eq(u.User_Email, login));

export const findUserDetails = (email: unknown, details: Row[] = db.userDetails) =>
  details.find(d => eq(d.EmailID, email));

/** Customer code of a user: eCom_Reg_Details.Cust_Code, else ecomuserdetails.CustomerCode. */
export const customerCodeOf = (user: Row | undefined, details: Row | undefined) =>
  str(user?.Cust_Code) || str(details?.CustomerCode);

/** First ecomuserdetails row of the customer joined to its eCom_Reg_Details row (fixture order). */
export function firstUserOfCustomer(custCode: string, users: Row[] = db.users, details: Row[] = db.userDetails): { user: Row; details?: Row } | null {
  for (const d of details) {
    if (!eq(d.CustomerCode, custCode)) continue;
    const user = findUser(str(d.EmailID), users);
    if (user) return { user, details: d };
  }
  const user = users.find(u => eq(u.Cust_Code, custCode));
  return user ? { user, details: findUserDetails(user.loginname, details) } : null;
}

/** Company name for a customer code: booking AP party, else the registered user's company, else the customer master (CustName), else the code. */
export function companyNameFor(custCode: string, users: Row[] = db.users, bookingCust: Row[] = db.bookingCust): string {
  const party = bookingCust.find(c => eq(c.custId, custCode) && str(c.name));
  if (party) return str(party.name);
  const user = users.find(u => eq(u.Cust_Code, custCode) && eq(u.isValid, 'Y') && str(u.Comp_Name)) ?? users.find(u => eq(u.Cust_Code, custCode) && str(u.Comp_Name));
  return str(user?.Comp_Name) || customerName(custCode);
}

/** Every customer code known to the fixtures (impersonation picker). */
export function customerAccounts(users: Row[] = db.users, details: Row[] = db.userDetails, bookingCust: Row[] = db.bookingCust): SubCustomerAccount[] {
  const codes = new Set<string>();
  for (const u of users) if (str(u.Cust_Code)) codes.add(str(u.Cust_Code));
  for (const d of details) if (str(d.CustomerCode)) codes.add(str(d.CustomerCode));
  return [...codes]
    .map(custCode => ({ custCode, compName: companyNameFor(custCode, users, bookingCust) }))
    .sort((a, b) => a.compName.localeCompare(b.compName) || a.custCode.localeCompare(b.custCode));
}

/** Multi-account access (EcomCustomerMapping): the login customer plus its AP customer codes. */
export function subAccountsOf(custCode: string, mapping: Row[] = db.customerMapping, users: Row[] = db.users, bookingCust: Row[] = db.bookingCust): SubCustomerAccount[] {
  const out: SubCustomerAccount[] = [{ custCode, compName: companyNameFor(custCode, users, bookingCust) }];
  for (const m of mapping) {
    if (!eq(m.LoginCustCode, custCode) || eq(m.Status, 'I')) continue;
    const ap = str(m.APcustCode);
    if (ap && !out.some(a => eq(a.custCode, ap))) out.push({ custCode: ap, compName: companyNameFor(ap, users, bookingCust) });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Customer login profile
// ---------------------------------------------------------------------------
export const customerToken = (user: Row) => `mock-jwt-user-${str(user.id) || str(user.loginname)}`;

export function buildCustomerProfile(user: Row, details: Row | undefined, extraCapabilities: string[] = []): UserProfile {
  const custCode = customerCodeOf(user, details);
  const capabilities = capabilitiesForMenuIds(splitMenuIds(details?.MenuId));
  for (const c of extraCapabilities) if (!capabilities.includes(c)) capabilities.push(c);
  const limit = userLimit(custCode);
  return {
    id: `usr_${str(user.id) || str(user.loginname)}`,
    name: displayName(user, str(user.loginname)),
    email: str(user.User_Email) || str(user.loginname),
    company: str(user.Comp_Name),
    role: 'CUSTOMER',
    capabilities,
    customerCode: custCode || undefined,
    tenantId: DEMO_TENANT_ID,
    loginType: 'U',
    // ecomuserdetails.userRole Y = the customer's own administrator (may create sub-users)
    isSessionAdmin: eq(details?.userRole, 'Y'),
    subCustomerAccounts: custCode ? subAccountsOf(custCode) : undefined,
    activeSubCustomer: custCode || undefined,
    allowedUserCount: limit.allowedUserLimit,
    createdUserCount: limit.currentlyAllocated,
    menuCategories: menuCategories(),
  };
}

/** Resolves a customer login: `test` → first user of the demo customer; any fixture login name otherwise. */
export function resolveCustomerLogin(userName: string): { user: Row; details?: Row; demo: boolean } | null {
  const login = str(userName);
  if (eq(login, DEMO_LOGIN)) {
    const first = firstUserOfCustomer(DEMO_CUSTOMER_CODE);
    return first ? { ...first, demo: true } : null;
  }
  const user = findUser(login);
  return user ? { user, details: findUserDetails(user.loginname) ?? findUserDetails(user.User_Email), demo: false } : null;
}

// ---------------------------------------------------------------------------
// Admin / vendor / impersonation logins
// ---------------------------------------------------------------------------
export interface AdminAccount {
  id: string;
  userId: string;
  name: string;
  email: string;
  /** ecom_adminuser_details.usertype: A system admin, V vendor, C customer impersonation */
  userType: 'A' | 'V' | 'C';
}

export function findAdminAccount(userId: string, adminUsers: Row[] = db.adminUsers, accounts: Row[] = db.adminUserAccounts): AdminAccount | null {
  const login = str(userId);
  if (!login) return null;
  const legacy = adminUsers.find(a => eq(a.userid, login) && !eq(a.status, 'I')) ?? adminUsers.find(a => eq(a.username, login) && !eq(a.status, 'I'));
  if (legacy) {
    const t = str(legacy.usertype).toUpperCase();
    return { id: str(legacy.id), userId: str(legacy.userid), name: str(legacy.username) || str(legacy.userid), email: '', userType: t === 'A' || t === 'C' ? t : 'V' };
  }
  const acc = accounts.find(a => (eq(a.username, login) || eq(a.email, login)) && !eq(a.status, 'I'));
  if (acc) return { id: str(acc.id), userId: str(acc.username), name: str(acc.fullName) || str(acc.username), email: str(acc.email), userType: 'A' };
  return null;
}

export const adminToken = (entryType: LoginEntryType, admin: AdminAccount) => `mock-jwt-${entryType}-${admin.userId.toLowerCase()}`;

/** Profile for POST /api/auth/admin-login; the entry point decides the role, as in the legacy LoginAction. */
export function buildAdminProfile(admin: AdminAccount, entryType: LoginEntryType): UserProfile {
  const customers = customerAccounts();
  const defaultCustomer = customers.find(c => eq(c.custCode, DEMO_CUSTOMER_CODE)) ?? customers[0];
  const base = {
    id: `adm_${admin.id || admin.userId}`,
    name: admin.name,
    email: admin.email || `${admin.userId}@example.com`,
    company: defaultCustomer?.compName ?? '',
    capabilities: allCapabilities(),
    tenantId: DEMO_TENANT_ID,
    loginType: 'V' as const,
    menuCategories: menuCategories(),
  };
  if (entryType === 'eadmin') {
    return { ...base, role: 'VENDOR', adminUserType: 'V', vendorId: admin.userId, vendorMenuList: vendorMenuKeys('vendor') };
  }
  if (entryType === 'admin') {
    return { ...base, role: 'ADMIN', adminUserType: 'C', loginType: 'U', isImpersonating: true };
  }
  return {
    ...base, role: 'ADMIN', adminUserType: 'A',
    customerCode: defaultCustomer?.custCode, activeSubCustomer: defaultCustomer?.custCode, subCustomerAccounts: customers,
    vendorMenuList: vendorMenuKeys('all'),
  };
}

export function buildImpersonatedUser(admin: UserProfile, custCode: string): UserProfile {
  const customer = customerAccounts().find(c => eq(c.custCode, custCode)) ?? { custCode, compName: companyNameFor(custCode) };
  return {
    ...admin,
    company: customer.compName,
    customerCode: customer.custCode,
    loginType: 'U',
    adminUserType: 'C',
    isImpersonating: true,
    impersonatedCustomer: customer,
    activeSubCustomer: customer.custCode,
    subCustomerAccounts: subAccountsOf(customer.custCode),
  };
}

// ---------------------------------------------------------------------------
// User creation (sub-users of a customer)
// ---------------------------------------------------------------------------
/** Hand-written default kept because no fixture table carries the per-customer user allowance. */
export const DEFAULT_USER_LIMIT = 5;

/** Looks for a user-limit key in EcomConfiguration / globalconfigproduct / EcomSetting; null when absent. */
export function configuredUserLimit(configuration: Row[] = db.configuration, globalConfig: Row[] = db.globalConfig, settings: Row[] = db.settings): number | null {
  const isLimitKey = (k: unknown) => /user/i.test(str(k)) && /(limit|max|allow|count)/i.test(str(k));
  const candidates: unknown[] = [
    ...configuration.filter(c => isLimitKey(c.configKey)).map(c => c.configValue),
    ...globalConfig.filter(g => isLimitKey(g.pathname)).map(g => g.pathvalue),
    ...settings.filter(s => isLimitKey(s.settingKey)).map(s => s.isEnabled),
  ];
  for (const v of candidates) {
    const n = Number(v);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}

const subUserId = {
  details: (d: Row) => `ud-${str(d.Id)}`,
  customerUser: (c: Row) => `cu-${str(c.id)}`,
};

export function mapSubUserFromDetails(d: Row, user: Row | undefined): SubUser {
  const prefLang = (str(user?.prefLang) || 'en').toLowerCase();
  return {
    id: subUserId.details(d),
    loginName: str(d.EmailID),
    firstName: str(user?.First_Name),
    lastName: str(user?.Last_Name),
    email: str(user?.User_Email) || str(d.EmailID),
    companyName: str(user?.Comp_Name),
    // Phone numbers are stored as one E.164 string; the DTO's split code fields stay empty.
    custCountryCode: '',
    custPhoneCode: '',
    custPhoneNo: str(user?.Comp_Phone) || str(user?.User_Phone),
    mobileCode: '',
    mobileNo: str(user?.User_Mobile),
    defLanguage: prefLang,
    prefLanguage: prefLang,
    isActive: eq(d.Status, 'A'),
    createdDate: dateOnly(d.AcceptedDate ?? user?.Registered_Date),
    allowedModules: capabilitiesForMenuIds(splitMenuIds(d.MenuId)),
  };
}

export function mapSubUserFromCustomerUser(c: Row, companyName: string): SubUser {
  const prefLang = (str(c.preferredLang) || 'en').toLowerCase();
  return {
    id: subUserId.customerUser(c),
    loginName: str(c.username) || str(c.email),
    firstName: str(c.firstName),
    lastName: str(c.lastName),
    email: str(c.email),
    companyName,
    custCountryCode: '',
    custPhoneCode: '',
    custPhoneNo: str(c.mobile),
    mobileCode: '',
    mobileNo: str(c.mobile),
    defLanguage: prefLang,
    prefLanguage: prefLang,
    isActive: eq(c.status, 'A'),
    createdDate: dateOnly(c.acceptedAt ?? c.createdAt),
    allowedModules: capabilitiesForMenuIds([]),
  };
}

/**
 * Sub-users of a customer: ecomuserdetails rows with userRole N (created by the customer's administrator)
 * plus EcomCustomerUser rows not already listed. Newest first.
 */
export function subUsersOf(custCode: string, details: Row[] = db.userDetails, users: Row[] = db.users, customerUsers: Row[] = db.customerUsers): SubUser[] {
  const out: SubUser[] = [];
  for (const d of details) {
    if (!eq(d.CustomerCode, custCode) || eq(d.userRole, 'Y')) continue;
    out.push(mapSubUserFromDetails(d, findUser(str(d.EmailID), users)));
  }
  const company = companyNameFor(custCode, users);
  for (const c of customerUsers) {
    if (!eq(c.customerCode, custCode) || out.some(s => eq(s.email, c.email))) continue;
    out.push(mapSubUserFromCustomerUser(c, company));
  }
  return out.sort((a, b) => b.createdDate.localeCompare(a.createdDate));
}

/** Active sub-users count against the allowance (deactivating a profile frees its slot). */
export function userLimit(custCode: string, details: Row[] = db.userDetails, users: Row[] = db.users, customerUsers: Row[] = db.customerUsers): UserLimitResponse {
  // TODO(fixtures): no per-customer user allowance exists in the extracted tables (EcomCustomerMaster was not dumped);
  // configuredUserLimit() finds nothing today, so the hand-written default of 5 stays.
  const allowedUserLimit = configuredUserLimit() ?? DEFAULT_USER_LIMIT;
  const currentlyAllocated = subUsersOf(custCode, details, users, customerUsers).filter(s => s.isActive).length;
  const remainingSlots = Math.max(0, allowedUserLimit - currentlyAllocated);
  return { allowedUserLimit, currentlyAllocated, remainingSlots, limitReached: currentlyAllocated >= allowedUserLimit };
}

const nextNumericId = (rows: Row[], column: string) => rows.reduce((max, r) => Math.max(max, Number(r[column]) || 0), 0) + 1;

/** Modules the drawer offers (SCH, TRK, BKG, SI, VGM, BL) → MenuRegistration ids via the RefNo→capability map. */
export function menuIdsForModules(modules: string[], menus: Row[] = db.menus): string[] {
  const wanted = new Set(modules.map(m => m.toUpperCase()));
  const ids: string[] = [];
  for (const m of menus) {
    if (!eq(m.MenuStatus, 'A') || !eq(m.userttype ?? 'U', 'U')) continue;
    const caps = capabilitiesOfRefNo(m.RefNo);
    if (caps.some(c => wanted.has(c))) ids.push(String(m.MenuId));
  }
  for (const id of defaultMenuIds(menus)) if (!ids.includes(id)) ids.push(id);
  return ids;
}

/** POST /user-creation/sub-users: inserts eCom_Reg_Details + ecomuserdetails rows under the customer. */
export function createSubUser(custCode: string, payload: CreateSubUserPayload, parent: Row | undefined, users: Row[] = db.users, details: Row[] = db.userDetails): SubUser {
  const now = nowIso();
  const phone = [payload.custCountryCode, payload.custPhoneCode, payload.custPhoneNo].map(str).filter(Boolean).join('');
  const mobile = [payload.mobileCode, payload.mobileNo].map(str).filter(Boolean).join('');
  const user: Row = {
    id: nextNumericId(users, 'id'), Cust_Code: custCode, Comp_Name: payload.companyName, Address: str(parent?.Address), City: str(parent?.City),
    Pin_Code: str(parent?.Pin_Code), Country: str(parent?.Country), State: str(parent?.State), Comp_Domain: str(parent?.Comp_Domain), Comp_Phone: phone,
    Title: null, First_Name: payload.firstName, Last_Name: payload.lastName, User_Phone: phone, User_Mobile: mobile, User_Fax: null,
    User_Email: payload.email, type: 'N', isValid: 'Y', status: 'A', control_location: str(parent?.control_location), Address2: str(parent?.Address2),
    agencycode: str(parent?.agencycode), Registered_Date: now, ActionBy: str(parent?.loginname) || 'SUPERUSER', ActionDate: now,
    Remarks: 'User Created By Invitation', prefLang: (payload.prefLanguage ?? 'en').toUpperCase(), loginname: payload.loginName, RegType: 'S',
    reg_no: nextRef('REG'), preferredTimezone: str(parent?.preferredTimezone) || null,
  };
  const detail: Row = {
    Id: nextNumericId(details, 'Id'), EmailID: payload.loginName, userRole: 'N', CustomerCode: custCode, Status: 'A', AcceptedDate: now,
    MenuId: joinMenuIds(menuIdsForModules(payload.allowedModules ?? [])), ccmailid: null, preferredTimezone: str(parent?.preferredTimezone) || null,
    lastpwdup: now, logindate: null, logoutdate: null, WrgPassAtmpt: 0, LockedStatus: 'N', LockedTime: null,
  };
  users.push(user);
  details.push(detail);
  return mapSubUserFromDetails(detail, user);
}

/** PATCH /sub-users/:id/status for either id form (ud-<Id> | cu-<id>). */
export function setSubUserActive(id: string, active: boolean, details: Row[] = db.userDetails, users: Row[] = db.users, customerUsers: Row[] = db.customerUsers): SubUser | undefined {
  const d = details.find(r => subUserId.details(r) === id);
  if (d) {
    d.Status = active ? 'A' : 'I';
    return mapSubUserFromDetails(d, findUser(str(d.EmailID), users));
  }
  const c = customerUsers.find(r => subUserId.customerUser(r) === id);
  if (c) {
    c.status = active ? 'A' : 'I';
    return mapSubUserFromCustomerUser(c, companyNameFor(str(c.customerCode), users));
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------
export const emailAvailable = (email: string, users: Row[] = db.users) => !findUser(email, users);

/** GET /api/check-company: a registered customer (users.Cust_Code), a booking party with that code, or the customer master row. */
export function customerCodeLookup(code: string, users: Row[] = db.users, bookingCust: Row[] = db.bookingCust): CustomerCodeCheckResult | null {
  const user = users.find(u => eq(u.Cust_Code, code) && eq(u.isValid, 'Y')) ?? users.find(u => eq(u.Cust_Code, code));
  if (user) return { valid: true, companyName: str(user.Comp_Name), country: str(user.Country), address1: str(user.Address), city: str(user.City) };
  const party = bookingCust.find(c => eq(c.custId, code));
  if (party) return { valid: true, companyName: str(party.name), country: str(party.countryId), address1: str(party.address1), city: str(party.city) };
  const master = customerRow(code);
  if (master) return { valid: true, companyName: str(master.CustName), country: str(master.countryid).toUpperCase(), address1: str(master.Address1), city: str(master.City) };
  return null;
}

/** GET /api/address-lookup: distinct registered companies whose name / city matches. */
export function addressSuggestions(q: string, users: Row[] = db.users, limit = 10): AddressLookupResult[] {
  const needle = str(q).toLowerCase();
  const seen = new Set<string>();
  const out: AddressLookupResult[] = [];
  for (const u of users) {
    const companyName = str(u.Comp_Name);
    if (!companyName || seen.has(companyName.toLowerCase())) continue;
    if (needle && !companyName.toLowerCase().includes(needle) && !str(u.City).toLowerCase().includes(needle)) continue;
    seen.add(companyName.toLowerCase());
    out.push({ companyName, city: str(u.City), country: str(u.Country), address1: str(u.Address) });
    if (out.length >= limit) break;
  }
  return out;
}

/** POST /api/registration: a pending eCom_Reg_Details row (isValid P) + its ECOMRegHistory entry. */
export function registerUser(form: Record<string, string>, users: Row[] = db.users, history: Row[] = db.ECOMRegHistory): Row {
  const now = nowIso();
  const f = (k: string) => str(form[k]);
  const user: Row = {
    id: nextNumericId(users, 'id'), Cust_Code: f('customerCode') || null, Comp_Name: f('companyName'), Address: f('address1'), City: f('city'),
    Pin_Code: f('postalCode'), Country: f('country'), State: f('location'), Comp_Domain: f('companyDomain'),
    Comp_Phone: f('companyPhoneCountryCode') + f('companyPhoneNo'), Title: f('title') || null, First_Name: f('firstName'), Last_Name: f('lastName'),
    User_Phone: f('userPhoneCode') + f('userPhoneNo'), User_Mobile: f('userMobileCode') + f('userMobileNo'), User_Fax: f('userFaxCode') + f('userFaxNo') || null,
    User_Email: f('email'), type: 'N', isValid: 'P', status: 'A', control_location: null, Address2: f('address2') || null, agencycode: null,
    Registered_Date: now, ActionBy: null, ActionDate: null, CodeAdvisedByAgency: null, StatusAdviseByAgency: null, ActualLastLoginDate: null,
    Remarks: null, prefLang: 'EN', city_other: null, loginname: f('email'), RegType: f('customerType') === 'EXISTING' ? 'M' : 'S', reg_no: nextRef('REG'),
    recentbl: f('recentBL') || null, agencyReqType: null, preferredTimezone: f('timezone') || null, Expired_Date: null, transferDoc: null,
    Comp_Mobile: f('companyMobileCode') + f('companyMobileNo') || null, Incorporation_Date: null, Business_Type: null,
  };
  users.push(user);
  history.push({ id: nextNumericId(history, 'id'), Email: f('email'), customercode: f('customerCode'), Remarks: 'Customer Registered', Type: 'C', CrDate: now, CrUser: 'SYSTEM', Status: 'P' });
  return user;
}

/** POST /api/auth/activate: marks the registration valid; false when the token matches no user. */
export function activateUser(token: string, users: Row[] = db.users, details: Row[] = db.userDetails): boolean {
  const user = findUser(token, users) ?? users.find(u => eq(u.reg_no, token));
  if (!user) return false;
  user.isValid = 'Y';
  const d = findUserDetails(user.loginname, details);
  if (d) d.Status = 'A';
  return true;
}

/** Password reset (forgot-password / admin reset): touches ecomuserdetails; false when the login is unknown. */
export function resetUserPassword(login: string, users: Row[] = db.users, details: Row[] = db.userDetails, adminUsers: Row[] = db.adminUsers): boolean {
  const user = findUser(login, users);
  const d = user ? findUserDetails(user.loginname, details) ?? findUserDetails(user.User_Email, details) : findUserDetails(login, details);
  if (d) {
    d.lastpwdup = nowIso();
    d.WrgPassAtmpt = 0;
    d.LockedStatus = 'N';
    d.LockedTime = null;
  }
  return Boolean(user || d || adminUsers.some(a => eq(a.userid, login)));
}

// ---------------------------------------------------------------------------
// Admin › Module Mapping customer picker (users with a customer code + EcomCustomerMapping login codes)
// ---------------------------------------------------------------------------
export function moduleMappingCustomers(q: string, users: Row[] = db.users, mapping: Row[] = db.customerMapping, bookingCust: Row[] = db.bookingCust): ModuleMappingCustomer[] {
  const out: ModuleMappingCustomer[] = [];
  for (const u of users) {
    const custCode = str(u.Cust_Code);
    const webId = str(u.loginname);
    if (!custCode || !webId || out.some(c => eq(c.custCode, custCode) && eq(c.webId, webId))) continue;
    out.push({ custCode, webId, compName: str(u.Comp_Name) || companyNameFor(custCode, users, bookingCust) });
  }
  for (const m of mapping) {
    const custCode = str(m.LoginCustCode);
    if (!custCode || out.some(c => eq(c.custCode, custCode))) continue;
    out.push({ custCode, webId: custCode, compName: companyNameFor(custCode, users, bookingCust) });
  }
  const needle = str(q).toLowerCase();
  return out
    .filter(c => !needle || [c.custCode, c.webId, c.compName].some(v => v.toLowerCase().includes(needle)))
    .sort((a, b) => a.compName.localeCompare(b.compName) || a.webId.localeCompare(b.webId));
}

/** First admin account of the given legacy usertype (else any active one) — used when no bearer token is present. */
export function defaultAdminAccount(userType: AdminAccount['userType'], adminUsers: Row[] = db.adminUsers, accounts: Row[] = db.adminUserAccounts): AdminAccount | null {
  const row = adminUsers.find(a => eq(a.usertype, userType) && !eq(a.status, 'I')) ?? adminUsers.find(a => !eq(a.status, 'I'));
  if (row) return findAdminAccount(str(row.userid), adminUsers, accounts);
  const acc = accounts.find(a => !eq(a.status, 'I'));
  return acc ? findAdminAccount(str(acc.username), adminUsers, accounts) : null;
}
