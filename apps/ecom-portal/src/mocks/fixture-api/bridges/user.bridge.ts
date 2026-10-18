// Modified by Sekar Nagarajan (2026-10-17 00:20)
/**
 * Current demo user, profile, alert preferences and alert history derived from the fixtures:
 *   users (eCom_Reg_Details) + userDetails (ecomuserdetails)          → profile
 *   mailAlerts (ecom_mailalert) + activities (ecom_activity)           → per-module alert flags
 *   notificationSettings + customerNotifications + customerUsers       → fallback flags for users without mailAlerts
 *   EcommuserlogDetails                                                → alert history
 *
 * The demo login (`test`/`test`) is mapped to the FIRST user of customer 20001374 in userDetails
 * joined to users on loginname; `currentFixtureUser()` is the single place that decides this so
 * every handler shows the same person.
 */
import type {
  AlertHistoryLog,
  AlertPreference,
  CustomerProfile,
} from '../../../features/user-modules/types/user-modules.types';
import { ciRow, db, eq, nowIso, type Row } from '../db';
import { countryDialCode, dialCodes } from './masters.bridge';
import { formatYmdHm } from './minute-format';

export const DEMO_CUSTOMER_CODE = '20001374';

export interface FixtureUser {
  user: Row;
  details: Row | null;
}

/** First userDetails row of the customer whose EmailID exists in users (pure; used by the tests). */
export function pickCurrentUser(users: Row[], userDetails: Row[], customerCode = DEMO_CUSTOMER_CODE): FixtureUser | null {
  for (const d of userDetails) {
    if (!eq(d.CustomerCode, customerCode)) continue;
    const user = users.find(u => eq(u.loginname, d.EmailID) || eq(u.User_Email, d.EmailID));
    if (user) return { user, details: d };
  }
  const user = users.find(u => eq(u.Cust_Code, customerCode)) ?? users[0];
  if (!user) return null;
  return { user, details: userDetails.find(d => eq(d.EmailID, user.loginname)) ?? null };
}

/** The user the mock session is logged in as. Reusable by every handler. */
export const currentFixtureUser = (): FixtureUser | null => pickCurrentUser(db.users, db.userDetails);

export const currentLogin = (): string => String(currentFixtureUser()?.user.loginname ?? '');

export function currentCustomerCode(): string {
  const cur = currentFixtureUser();
  return String(cur?.details?.CustomerCode ?? cur?.user.Cust_Code ?? DEMO_CUSTOMER_CODE);
}

// ─── Profile ─────────────────────────────────────────────────────────────────

/**
 * Splits "+19385207153" into { code: '+1', number: '9385207153' }. The user's country dial code
 * (countries.isdcode) is preferred, then the longest dial code of the country master that prefixes the number.
 */
export function splitDialCode(phone: unknown, country: unknown): { code: string; number: string } {
  const raw = String(phone ?? '').replace(/\s+/g, '').trim();
  const preferred = countryDialCode(String(country ?? '').toUpperCase()) || undefined;
  if (!raw) return { code: preferred ?? '+1', number: '' };
  if (preferred && raw.startsWith(preferred)) return { code: preferred, number: raw.slice(preferred.length) };
  const known = dialCodes().find(c => raw.startsWith(c));
  if (known) return { code: known, number: raw.slice(known.length) };
  const m = /^(\+\d{1,2})(\d+)$/.exec(raw);
  if (m) return { code: m[1], number: m[2] };
  return { code: preferred ?? '+1', number: raw };
}

/** ecomuserdetails.preferredTimezone ("-05:00~~(GMT-05:00) Indiana (East") → the portal select values. */
const PORTAL_TIMEZONES: Record<string, string> = {
  '-05:00': 'UTC-5 (EST)',
  '+00:00': 'UTC+0 (GMT)',
  '+08:00': 'UTC+8 (SGT)',
  '+01:00': 'UTC+1 (CET)',
};

export function toPortalTimezone(dbValue: unknown): string {
  const raw = String(dbValue ?? '').trim();
  if (!raw) return 'UTC-5 (EST)';
  const offset = raw.split('~~')[0].trim();
  if (PORTAL_TIMEZONES[offset]) return PORTAL_TIMEZONES[offset];
  const m = /^([+-])(\d{2}):(\d{2})$/.exec(offset);
  if (!m) return raw;
  const hours = Number(m[2]) + (m[3] === '30' ? 0.5 : 0);
  return `UTC${m[1]}${hours}`;
}

/** Inverse of toPortalTimezone, so a saved profile round-trips through the fixture column. */
export function toDbTimezone(portalValue: string): string {
  const m = /^UTC([+-])(\d+(?:\.5)?)\s*(.*)$/.exec(portalValue.trim());
  if (!m) return portalValue;
  const h = Number(m[2]);
  const offset = `${m[1]}${String(Math.floor(h)).padStart(2, '0')}:${h % 1 ? '30' : '00'}`;
  return `${offset}~~(GMT${offset}) ${m[3].replace(/[()]/g, '')}`.trim();
}

/**
 * The customer's own party row on its bookings (ecombooking_cust AP/BP/SH with custId = customer code),
 * newest booking first — fills the address when eCom_Reg_Details left it blank.
 */
export function customerParty(customerCode: string, bookingCust: Row[] = db.bookingCust): Row | null {
  return bookingCust
    .filter(c => eq(c.custId, customerCode) && ['AP', 'BP', 'SH'].includes(String(c.custTypeId ?? '').toUpperCase()) && String(c.address1 ?? '').trim())
    .sort((a, b) => Number(b.cid) - Number(a.cid))[0] ?? null;
}

export function mapProfile(user: Row, details: Row | null, party: Row | null = null): CustomerProfile {
  const phone = splitDialCode(user.User_Phone, user.Country);
  const mobile = splitDialCode(user.User_Mobile, user.Country);
  const ownAddress = [user.Address, user.Address2].map(v => String(v ?? '').trim()).filter(Boolean);
  const partyAddress = [party?.address1, party?.address2].map(v => String(v ?? '').trim()).filter(Boolean);
  return {
    loginName: String(user.loginname ?? ''),
    customerCode: String(details?.CustomerCode ?? user.Cust_Code ?? ''),
    companyName: String(user.Comp_Name ?? ''),
    firstName: String(user.First_Name ?? ''),
    lastName: String(user.Last_Name ?? ''),
    email: String(user.User_Email ?? user.loginname ?? ''),
    phoneCode: phone.code,
    phoneNo: phone.number,
    mobileCode: mobile.code,
    mobileNo: mobile.number,
    // TODO(fixtures): no tax / EORI id in eCom_Reg_Details (bookingCust.eori is empty for this customer)
    taxId: '',
    country: String(user.Country ?? ''),
    city: String(user.City || user.city_other || party?.city || ''),
    address: (String(user.Address ?? '').trim() || !partyAddress.length ? ownAddress : partyAddress).join(', '),
    defLanguage: String(user.prefLang || 'EN').toLowerCase(),
    prefTimeZone: toPortalTimezone(details?.preferredTimezone || user.preferredTimezone),
  };
}

/** Writes an edited profile back into the users / userDetails rows (session-only mutation). */
export function applyProfilePatch(target: FixtureUser, patch: Partial<CustomerProfile>, party: Row | null = null): CustomerProfile {
  const { user, details } = target;
  const current = mapProfile(user, details, party);
  const next = { ...current, ...patch };
  user.First_Name = next.firstName;
  user.Last_Name = next.lastName;
  user.User_Email = next.email;
  user.Comp_Name = next.companyName;
  user.User_Phone = next.phoneNo ? `${next.phoneCode}${next.phoneNo}` : user.User_Phone;
  user.User_Mobile = next.mobileNo ? `${next.mobileCode}${next.mobileNo}` : user.User_Mobile;
  user.Country = next.country;
  user.City = next.city ?? '';
  if (patch.address !== undefined) {
    user.Address = patch.address;
    user.Address2 = null;
  }
  user.prefLang = next.defLanguage.toUpperCase();
  const tz = toDbTimezone(next.prefTimeZone);
  user.preferredTimezone = tz;
  if (details) details.preferredTimezone = tz;
  return mapProfile(user, details, party);
}

// ─── Alert preferences ───────────────────────────────────────────────────────

type ModuleKey = 'bookingUpdates' | 'siConfirmation' | 'blRelease';

/** ecom_activity.module → preference flag. */
export const ALERT_KEY_BY_MODULE: Record<string, ModuleKey> = { BKG: 'bookingUpdates', SHI: 'siConfirmation', BOL: 'blRelease' };
/** notificationSettings.category → preference flag. */
export const ALERT_KEY_BY_CATEGORY: Record<string, ModuleKey> = {
  BOOKING: 'bookingUpdates',
  SHIPPING_INSTRUCTION: 'siConfirmation',
  BILL_OF_LADING: 'blRelease',
};

export interface AlertSources {
  login: string;
  customerCode: string;
  mailAlerts: Row[];
  activities: Row[];
  notificationSettings: Row[];
  customerNotifications: Row[];
  customerUsers: Row[];
  payments: Row[];
}

/**
 * Flags with no fixture column (schedule / payment alerts, delivery channels) live here for the session
 * after a PUT; before that they are derived (see mapAlertPreferences).
 */
const sessionAlertOverrides: Partial<AlertPreference> = {};

const activityModule = (activities: Row[], code: unknown) =>
  String(activities.find(a => eq(String(a.activitycode ?? '').trim(), String(code ?? '').trim()))?.module ?? '').toUpperCase();

export function mapAlertPreferences(src: AlertSources, overrides: Partial<AlertPreference> = {}): AlertPreference {
  const flags: Record<ModuleKey, boolean> = { bookingUpdates: false, siConfirmation: false, blRelease: false };
  const mine = src.mailAlerts.filter(r => eq(r.loginname, src.login));
  if (mine.length) {
    for (const r of mine) {
      const key = ALERT_KEY_BY_MODULE[activityModule(src.activities, r.activitycode)];
      if (key && String(r.mail ?? '').toUpperCase() === 'Y') flags[key] = true;
    }
  } else {
    // Newer notification tables: defaults per notificationKey, overridden per customer user.
    const customerUser = src.customerUsers.find(u => eq(u.email, src.login));
    for (const setting of src.notificationSettings) {
      if (String(setting.status ?? 'A').toUpperCase() !== 'A') continue;
      const key = ALERT_KEY_BY_CATEGORY[String(setting.category ?? '').toUpperCase()];
      if (!key) continue;
      const override = customerUser
        ? src.customerNotifications.find(n => eq(n.customerUserId, customerUser.id) && eq(n.notificationId, setting.id))
        : undefined;
      const enabled = override ? Boolean(override.isEnabled) : Boolean(setting.defaultEnabled);
      if (enabled) flags[key] = true;
    }
  }
  const anyModule = flags.bookingUpdates || flags.siConfirmation || flags.blRelease;
  return {
    ...flags,
    // TODO(fixtures): no schedule-delay subscription table — off until the user switches it on
    scheduleDelays: overrides.scheduleDelays ?? false,
    // Payment alerts make sense only for customers that pay online (Ecom_OnlinePayment rows exist)
    paymentInvoices: overrides.paymentInvoices ?? src.payments.some(p => eq(p.customerCode, src.customerCode)),
    channelEmail: overrides.channelEmail ?? anyModule,
    // TODO(fixtures): ecom_mailalert has no SMS column
    channelSms: overrides.channelSms ?? false,
    // TODO(fixtures): portal bell badges are always on (EcomNotificationMaster is customer-wide)
    channelPortal: overrides.channelPortal ?? true,
  };
}

export function fixtureAlertPreferences(): AlertPreference {
  return mapAlertPreferences(
    {
      login: currentLogin(),
      customerCode: currentCustomerCode(),
      mailAlerts: db.mailAlerts,
      activities: db.activities,
      notificationSettings: db.notificationSettings,
      customerNotifications: db.customerNotifications,
      customerUsers: db.customerUsers,
      payments: db.payments,
    },
    sessionAlertOverrides,
  );
}

/** Upserts ecom_mailalert rows (one per activity of the module) and customerNotifications rows. */
export function applyAlertPreferences(prefs: AlertPreference): AlertPreference {
  const login = currentLogin();
  const ts = nowIso();
  const maxId = (rows: Row[]) => rows.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0);
  for (const a of db.activities) {
    const key = ALERT_KEY_BY_MODULE[String(a.module ?? '').toUpperCase()];
    if (!key) continue;
    const code = String(a.activitycode ?? '').trim();
    const mail = prefs[key] ? 'Y' : 'N';
    const existing = db.mailAlerts.find(r => eq(r.loginname, login) && eq(r.activitycode, code));
    if (existing) {
      existing.mail = mail;
      existing.chguser = login;
      existing.chgedate = ts;
    } else {
      db.mailAlerts.push(ciRow({ id: maxId(db.mailAlerts) + 1, loginname: login, activitycode: code, mail, chguser: login, chgedate: ts }));
    }
  }
  const customerUser = db.customerUsers.find(u => eq(u.email, login));
  if (customerUser) {
    for (const setting of db.notificationSettings) {
      const key = ALERT_KEY_BY_CATEGORY[String(setting.category ?? '').toUpperCase()];
      if (!key) continue;
      const existing = db.customerNotifications.find(n => eq(n.customerUserId, customerUser.id) && eq(n.notificationId, setting.id));
      if (existing) {
        existing.isEnabled = prefs[key];
        existing.updatedAt = ts;
        existing.updatedBy = login;
      } else {
        db.customerNotifications.push(ciRow({
          id: String(maxId(db.customerNotifications) + 1), customerUserId: customerUser.id, notificationId: setting.id,
          isEnabled: prefs[key], createdAt: ts, createdBy: login, updatedAt: null, updatedBy: null,
        }));
      }
    }
  }
  for (const k of ['scheduleDelays', 'paymentInvoices', 'channelEmail', 'channelSms', 'channelPortal'] as const) {
    sessionAlertOverrides[k] = prefs[k];
  }
  return fixtureAlertPreferences();
}

// ─── Alert history (EcommuserlogDetails) ─────────────────────────────────────

const LOG_CATEGORY: Record<string, AlertHistoryLog['category']> = {
  BOOKING: 'BOOKING', BKG: 'BOOKING', SI: 'SI', SHI: 'SI', BL: 'BL', BOL: 'BL',
  PAYMENT: 'PAYMENT', PAY: 'PAYMENT', SCHEDULE: 'SCHEDULE', SCH: 'SCHEDULE',
};
const CATEGORY_TITLE: Record<AlertHistoryLog['category'], string> = {
  BOOKING: 'Booking', SI: 'Shipping Instruction', BL: 'Bill of Lading', PAYMENT: 'Payment', SCHEDULE: 'Schedule',
};

/** A user-log row → alert entry; read when it is older than the user's last login. */
export function mapAlertLog(row: Row, lastLogin: unknown): AlertHistoryLog {
  const category = LOG_CATEGORY[String(row.module ?? '').toUpperCase()] ?? 'BOOKING';
  const activity = String(row.activity ?? '').trim();
  const seen = lastLogin ? +new Date(row.Logdate) <= +new Date(lastLogin as string) : false;
  return {
    id: `log-${row.id}`,
    category,
    title: [CATEGORY_TITLE[category], activity].filter(Boolean).join(' · '),
    message: String(row.remarks || activity || ''),
    timestamp: formatYmdHm(row.Logdate),
    isRead: seen,
    referenceNo: String(row.referenceno ?? ''),
  };
}

export function fixtureAlertLogs(): AlertHistoryLog[] {
  const cur = currentFixtureUser();
  const customerCode = currentCustomerCode();
  const lastLogin = cur?.details?.logindate ?? cur?.user.ActualLastLoginDate ?? null;
  return (db.EcommuserlogDetails ?? [])
    .filter(r => eq(r.customercode, customerCode))
    .sort((a, b) => +new Date(b.Logdate) - +new Date(a.Logdate))
    .map(r => mapAlertLog(r, lastLogin));
}
