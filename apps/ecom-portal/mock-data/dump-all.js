#!/usr/bin/env node
/**
 * Dumps the top N rows of EVERY user table in DB_ECOMDB into ../src/mocks/fixtures/<name>.json.
 *
 *   npm run dump          → writes fixtures + _manifest.json (replaces previous *.json in the folder)
 *   npm run dump:dry      → prints the plan and row counts, writes nothing
 *
 * Rules
 *  - Parent/child families follow their parents (top N bookings → all their cargo, legs, parties, …;
 *    the same for SIs, payments and users) so detail screens stay coherent. Child tables are then
 *    topped up with their own most recent rows so modules such as VGM still have volume.
 *  - Every other table: top N rows, newest first (by the best date column, else by id).
 *  - Credential / token columns are never written (DROP_COLUMNS); token-only tables are skipped.
 *  - Personal data is anonymised deterministically unless ANONYMIZE=false (same input ⇒ same fake).
 *  - Dates are shifted so the newest sampled booking lands on "now" unless SHIFT_DATES_TO_NOW=false.
 *  - Column names are written exactly as SQL Server returns them; the portal's fixture store reads
 *    them case-insensitively.
 */
import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import sql from 'mssql';
import { faker } from '@faker-js/faker';

// ─── settings ────────────────────────────────────────────────────────────────
const TOP = num('DUMP_TOP', 50);
const CHILD_CAP = num('DUMP_CHILD_CAP', 400);
const DRY_RUN = process.env.DRY_RUN === 'true';
const ANONYMIZE = process.env.ANONYMIZE !== 'false';
const SHIFT_DATES = process.env.SHIFT_DATES_TO_NOW !== 'false';
const OUT_DIR = path.resolve(process.env.OUT_DIR ?? '../src/mocks/fixtures');
const connStr = process.env.DB_ECOMDB;
if (!connStr) { console.error('DB_ECOMDB is not set in .env'); process.exit(1); }

function num(key, fallback) {
  const v = Number(process.env[key]);
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

/** Tables that hold only credentials, tokens or webhook payloads. */
const SKIP_TABLES = new Set([
  'Ecom_password_reset_tokens', 'EcomRefreshToken', 'EcomPasswordResetOtp', 'Ecom_OnlinePayment_StripeEvent',
  'ecomapi_users', 'EcomApiUser', 'ecomapi_user_api_permissions', 'EcomApiUserEndpoint',
].map(t => t.toLowerCase()));

/** Columns never written, in any table. */
const DROP_COLUMNS = /^(password|passwordhash|random_number|apptoken|apptokencreatedat|otp|taxid|bank_account_details|bank_name|stripereceipturl|stripesessionid|stripepaymentintentid|stripechargeid|stripetransactionid|secret\w*|\w*token\w*)$/i;

/** Fixture file names the portal's fixture-api already uses. Other tables keep their table name. */
const NAMES = {
  ecombooking: 'bookings', ecombooking_cust: 'bookingCust', ecombooking_cargo: 'bookingCargo',
  ecombooking_commodity: 'bookingCommodity', ecombooking_dg: 'bookingDg', ecombooking_oog: 'bookingOog',
  ecombooking_refer: 'bookingRefer', ecombooking_leg: 'bookingLeg', ecombooking_haulage: 'bookingHaulage',
  ecombooking_conf: 'bookingConf', ecombooking_files: 'bookingFiles', ecombooking_ics_new: 'bookingIcs',
  ecombooking_cancel: 'bookingCancel', ecombooking_reference: 'bookingReference',
  ecombookingsummarygeneration: 'bookingSummary', ecom_insurance: 'insurance', ecom_insurance_survey: 'insuranceSurvey',
  ecomSI: 'shippingInstructions', ecomSI_cust: 'siCust', ecomSI_cargo: 'siCargo', ecomSI_commodity: 'siCommodity',
  ecomSI_dg: 'siDg', ecomSI_oog: 'siOog', ecomSI_reefer: 'siReefer', ecomsi_charges: 'siCharges', ecomSI_files: 'siFiles',
  ecomsi_ics_new: 'siIcs', ecomsi_payers: 'siPayers', ecomsi_reference: 'siReference', ecomSIRequestMaster: 'siRequestMaster',
  ecomSISummaryGeneration: 'siSummary', ECOMSILOCK: 'siLocks',
  ecom_vgmsolas: 'vgm', Ecom_OnlinePayment: 'payments', Ecom_OnlinePayment_Reference: 'paymentReferences',
  MenuRegistration: 'menus', ecom_MessageFormat: 'messages', ecom_messageformatlang: 'messagesLang', ECOM_LANG: 'languages',
  EcomCustomerAdvisory: 'advisories', EcomImageUpload: 'loginImages', ecomhotlinecontacts: 'hotlineContacts',
  ecom_cutoffconfig: 'cutoffConfig', Ecom_Notice: 'notices', EcomNotificationMaster: 'notificationMaster',
  EcomNotificationDetails: 'notificationDetails', globalconfigproduct: 'globalConfig', fieldconfigdetails: 'fieldConfig',
  eCom_Reg_Details: 'users', ecomuserdetails: 'userDetails', SplPrivilegeMenu: 'customerMenus',
  ecom_statusdescription: 'statusDescriptions', ecomtrackingmovementcode: 'trackingMovementCodes',
  EcomEmailTemplate: 'emailTemplates', ecom_service_restrict: 'serviceRestrictions', vendormodulemapping: 'vendorModuleMapping',
  ecom_customer_mapping: 'customerMapping', EcomCustomerUser: 'customerUsers', ecom_reg_kyc_config: 'kycConfig',
  Ecom_CargoProtectRestriction: 'cargoProtectRestrictions', Videohelpdetails: 'videoHelp', ecom_activity: 'activities',
  ecom_mailalert: 'mailAlerts', ecom_modules: 'modules', EcomLookup: 'lookups', EcomSetting: 'settings',
  EcomConfiguration: 'configuration', EcomMenu: 'menuTree', EcomUserMenuAccess: 'userMenuAccess',
  EcomNotificationSetting: 'notificationSettings', EcomCustomerNotification: 'customerNotifications',
  v1v2serviceconfig: 'serviceConfig', adminmenu: 'adminMenus', ecom_adminuser_details: 'adminUsers', EcomAdminUser: 'adminUserAccounts',
};

/**
 * Parent/child families. `children[].column` is matched against the parent key values
 * (plus `altKey` values, e.g. the agency booking number next to the online reference).
 */
const FAMILIES = [
  { parent: 'ecombooking', key: 'ebookno', altKey: 'extBookNo', order: 'dateup desc',
    children: [
      ['ecombooking_cust', 'ebookno'], ['ecombooking_cargo', 'ebookno'], ['ecombooking_commodity', 'ebookno'],
      ['ecombooking_dg', 'ebookno'], ['ecombooking_oog', 'ebookno'], ['ecombooking_refer', 'ebookno'],
      ['ecombooking_leg', 'ebookno'], ['ecombooking_haulage', 'ebookno'], ['ecombooking_conf', 'ebookno'],
      ['ecombooking_files', 'ebookno'], ['ecombooking_ics_new', 'ebookno'], ['ecombooking_cancel', 'eBookNo'],
      ['ecombooking_reference', 'ebookno'], ['ecombookingsummarygeneration', 'book_no'],
      ['ecom_insurance', 'book_no'], ['ecom_insurance_survey', 'book_no'], ['ecom_vgmsolas', 'book_no'],
      ['ecomSIRequestMaster', 'bookno'], ['ECOMSILOCK', 'Book_No'], ['ecomSISummaryGeneration', 'book_no'],
    ] },
  { parent: 'ecomSI', key: 'eSINo', order: 'ChgDate desc',
    // also keep the SIs that belong to the sampled bookings
    alsoWhere: ctx => ctx.inList('ecombooking', 'bookno') ,
    children: [
      ['ecomSI_cust', 'eSINo'], ['ecomSI_cargo', 'eSINo'], ['ecomSI_commodity', 'eSINo'], ['ecomSI_dg', 'eSIno'],
      ['ecomSI_oog', 'eSIno'], ['ecomSI_reefer', 'eSIno'], ['ecomsi_charges', 'esino'], ['ecomSI_files', 'eSINo'],
      ['ecomsi_ics_new', 'eSINo'], ['ecomsi_payers', 'esino'], ['ecomsi_reference', 'esino'],
    ] },
  { parent: 'Ecom_OnlinePayment', key: 'requestId', order: 'createdAt desc',
    children: [['Ecom_OnlinePayment_Reference', 'requestId']] },
  { parent: 'eCom_Reg_Details', key: 'loginname', order: 'Registered_Date desc',
    // also keep the users of the customers that own the sampled bookings
    alsoWhere: ctx => ctx.inList('ecombooking', 'cust_code', 'cust_code'),
    children: [['ecomuserdetails', 'EmailID'], ['ecom_mailalert', 'loginname']] },
];

/** Preferred "newest first" columns, in priority order. */
const DATE_COLUMNS = ['dateup', 'chgdate', 'updatedat', 'updatedate', 'chgedate', 'datecr', 'crdate', 'createdat', 'createddate', 'registered_date', 'polat', 'date'];
const ID_COLUMNS = ['id', 'reqid', 'menuid', 'mdlindex'];

// ─── anonymiser (deterministic) ──────────────────────────────────────────────
function fnv1a(str) {
  let h = 0x811c9dc5;
  for (const ch of String(str)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 0x01000193) >>> 0; }
  return h;
}
const generators = {
  company: () => faker.company.name(),
  firstName: () => faker.person.firstName(),
  lastName: () => faker.person.lastName(),
  fullName: () => faker.person.fullName(),
  email: () => faker.internet.email({ provider: 'example.com' }).toLowerCase(),
  phone: () => faker.phone.number({ style: 'international' }),
  address: () => faker.location.streetAddress(),
  address2: () => faker.location.secondaryAddress(),
  city: () => faker.location.city(),
  zip: () => faker.location.zipCode(),
};
const fakeCache = new Map();
function fakeFor(kind, original) {
  const key = `${kind}|${String(original).trim().toLowerCase()}`;
  if (!fakeCache.has(key)) { faker.seed(fnv1a(key)); fakeCache.set(key, generators[kind]()); }
  return fakeCache.get(key);
}
/** Column name → anonymisation kind. `emailish` columns are only replaced when the value looks like an email. */
const PII_RULES = [
  [/^(user_email|email|emailid|ccmailid|ccemail|primaryemail|contactemail|from_mailid|to_mailid|loginname|username|userid|cruser|usercr|userup|chguser|createuser|updateuser|createdby|updatedby|createduser|actionby|upuser|crUser|chgUser)$/i, 'emailish'],
  [/(phone|mobile|fax|telephone)/i, 'phone'],
  [/^first_?name$/i, 'firstName'],
  [/^last_?name$/i, 'lastName'],
  [/^(contactname|contactperson|vgm_authorized_person|imocontact)$/i, 'fullName'],
  [/^(comp_name|shippername|consigeename|notifyname|name|bpname|apname|vgm_company_name|insuredparty|byname|slname|cust_name|company|invoiceparty)$/i, 'company'],
  [/^(address2|vgm_address2)$/i, 'address2'],
  [/^(address|address1|contactaddress|vgm_address1|addressline1?)$/i, 'address'],
  [/^(city|vgm_city|city_other)$/i, 'city'],
  [/^(zipcode|zip_code|pin_code|vgm_zipcode)$/i, 'zip'],
];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_IN_TEXT_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const INTERNAL_HOST_RE = /https?:\/\/[^/\s"']*(solverminds|\d{1,3}(\.\d{1,3}){3})[^/\s"']*/gi;
/** Config tables: rows whose key looks like a credential, mailbox, URL or server path are dropped entirely. */
const CONFIG_KEY_COLUMNS = ['pathname', 'configKey', 'settingKey'];
const SENSITIVE_KEY_RE = /pass|pwd|secret|token|api_?key|api_?user|url|mail|path|host|server|smtp|ftp/i;
function anonymizeRows(rows) {
  if (!ANONYMIZE || !rows.length) return rows;
  const columns = Object.keys(rows[0]);
  const keyCol = columns.find(c => CONFIG_KEY_COLUMNS.some(k => k.toLowerCase() === c.toLowerCase()));
  if (keyCol) rows = rows.filter(r => !SENSITIVE_KEY_RE.test(String(r[keyCol] ?? '')));
  const plan = columns.map(col => [col, PII_RULES.find(([re]) => re.test(col))?.[1]]).filter(([, kind]) => kind);
  return rows.map(row => {
    const out = { ...row };
    for (const [col, kind] of plan) {
      const v = out[col];
      if (v == null || String(v).trim() === '') continue;
      if (kind === 'emailish') { if (String(v).includes('@')) out[col] = fakeFor('email', v); continue; }
      out[col] = fakeFor(kind, v);
    }
    // Value-based pass: any email-shaped string in any column, and internal host names in URLs.
    for (const [col, v] of Object.entries(out)) {
      if (typeof v !== 'string') continue;
      if (EMAIL_RE.test(v.trim())) out[col] = fakeFor('email', v);
      else {
        // e-mail addresses embedded in free text (address blobs, remarks) and internal host names in URLs
        let next = v.replace(EMAIL_IN_TEXT_RE, m => fakeFor('email', m));
        next = next.replace(INTERNAL_HOST_RE, '');
        if (next !== v) out[col] = next;
      }
    }
    return out;
  });
}

// ─── SQL helpers ─────────────────────────────────────────────────────────────
const pool = await new sql.ConnectionPool(connStr).connect();
const q = async text => (await pool.request().query(text)).recordset ?? [];
const quoteList = vals => '(' + vals.map(v => `'${String(v).replace(/'/g, "''")}'`).join(',') + ')';

const tables = await q(`
  select t.name as [table], max(p.rows) as [rows]
    from sys.tables t join sys.partitions p on p.object_id = t.object_id and p.index_id in (0,1)
   where schema_name(t.schema_id) = 'dbo'
   group by t.name order by t.name`);
const columnsByTable = new Map();
for (const c of await q(`select table_name, column_name from information_schema.columns where table_schema='dbo' order by table_name, ordinal_position`)) {
  const k = c.table_name.toLowerCase();
  if (!columnsByTable.has(k)) columnsByTable.set(k, []);
  columnsByTable.get(k).push(c.column_name);
}
const tableByLower = new Map(tables.map(t => [t.table.toLowerCase(), t.table]));
const realName = t => tableByLower.get(t.toLowerCase());
const cols = t => columnsByTable.get(t.toLowerCase()) ?? [];
const hasCol = (t, c) => cols(t).some(x => x.toLowerCase() === c.toLowerCase());
const colName = (t, c) => cols(t).find(x => x.toLowerCase() === c.toLowerCase()) ?? c;

function selectList(t) {
  return cols(t).filter(c => !DROP_COLUMNS.test(c)).map(c => `[${c}]`).join(', ');
}
function orderClause(t, explicit) {
  if (explicit) return `order by ${explicit}`;
  const lower = cols(t).map(c => c.toLowerCase());
  const d = DATE_COLUMNS.find(c => lower.includes(c));
  if (d) return `order by [${colName(t, d)}] desc`;
  const i = ID_COLUMNS.find(c => lower.includes(c));
  return i ? `order by [${colName(t, i)}] desc` : '';
}
const rowKey = (t, r) => hasCol(t, 'id') ? `id:${r[colName(t, 'id')]}` : JSON.stringify(r);
function union(t, ...lists) {
  const seen = new Set(); const out = [];
  for (const list of lists) for (const r of list) { const k = rowKey(t, r); if (!seen.has(k)) { seen.add(k); out.push(r); } }
  return out;
}

// ─── run ─────────────────────────────────────────────────────────────────────
const results = new Map();   // real table name → rows
const strategy = new Map();  // real table name → description
const values = (t, col) => [...new Set((results.get(t) ?? []).map(r => r[colName(t, col)]).filter(v => v != null && String(v).trim() !== ''))];
const ctx = {
  /** SQL fragment `and [col] in (...)` built from a previously dumped table's key (+ altKey) values. */
  inList(parentTable, col, parentCol) {
    const fam = FAMILIES.find(f => f.parent === parentTable);
    const vals = parentCol ? values(parentTable, parentCol) : [...values(parentTable, fam.key), ...(fam.altKey ? values(parentTable, fam.altKey) : [])];
    return vals.length ? `[${col}] in ${quoteList(vals)}` : null;
  },
};

console.log(`Dumping top ${TOP} rows of ${tables.length} tables${DRY_RUN ? ' (dry run)' : ''}${ANONYMIZE ? ', anonymised' : ', NOT anonymised'}\n`);

const handled = new Set();
for (const fam of FAMILIES) {
  const parent = realName(fam.parent);
  if (!parent) { console.log(`  skip  ${fam.parent.padEnd(32)} table not found`); continue; }
  let rows = await q(`select top ${TOP} ${selectList(parent)} from [${parent}] ${orderClause(parent, fam.order)}`);
  if (fam.alsoWhere) {
    const where = fam.alsoWhere(ctx);
    if (where) rows = union(parent, rows, await q(`select top ${CHILD_CAP} ${selectList(parent)} from [${parent}] where ${where} ${orderClause(parent, fam.order)}`));
  }
  results.set(parent, rows); strategy.set(parent, `top ${TOP} by ${fam.order}${fam.alsoWhere ? ' + rows linked to sampled parents' : ''}`); handled.add(parent.toLowerCase());
  console.log(`  ok    ${parent.padEnd(32)} ${String(rows.length).padStart(5)} rows   (parent)`);
  const keys = [...values(parent, fam.key), ...(fam.altKey ? values(parent, fam.altKey) : [])];
  for (const [childName, column] of fam.children) {
    const child = realName(childName);
    if (!child || !hasCol(child, column)) { console.log(`  skip  ${childName.padEnd(32)} ${child ? `no column ${column}` : 'table not found'}`); continue; }
    const related = keys.length ? await q(`select top ${CHILD_CAP} ${selectList(child)} from [${child}] where [${colName(child, column)}] in ${quoteList(keys)} ${orderClause(child)}`) : [];
    const recent = await q(`select top ${TOP} ${selectList(child)} from [${child}] ${orderClause(child)}`);
    const rows = union(child, related, recent).slice(0, CHILD_CAP);
    results.set(child, rows); strategy.set(child, `rows of sampled ${parent} (${related.length}) + top ${TOP} recent`); handled.add(child.toLowerCase());
    console.log(`  ok    ${child.padEnd(32)} ${String(rows.length).padStart(5)} rows   (${related.length} linked)`);
  }
}
for (const t of tables) {
  const name = t.table;
  if (handled.has(name.toLowerCase())) continue;
  if (SKIP_TABLES.has(name.toLowerCase())) { console.log(`  skip  ${name.padEnd(32)} credentials / tokens`); continue; }
  if (!t.rows) { console.log(`  skip  ${name.padEnd(32)} empty`); continue; }
  const rows = await q(`select top ${TOP} ${selectList(name)} from [${name}] ${orderClause(name)}`);
  results.set(name, rows); strategy.set(name, `top ${TOP}`);
  console.log(`  ok    ${name.padEnd(32)} ${String(rows.length).padStart(5)} rows`);
}
await pool.close();

// ─── anonymise + shift dates ─────────────────────────────────────────────────
for (const [t, rows] of results) results.set(t, anonymizeRows(rows));

let dateShiftMs = 0;
if (SHIFT_DATES) {
  const bookings = results.get(realName('ecombooking')) ?? [];
  const col = colName(realName('ecombooking') ?? 'ecombooking', 'dateup');
  const max = Math.max(...bookings.map(r => +new Date(r[col])).filter(Number.isFinite));
  if (Number.isFinite(max)) {
    dateShiftMs = Date.now() - max;
    let touched = 0;
    for (const rows of results.values()) for (const row of rows) for (const [k, v] of Object.entries(row)) {
      if (v instanceof Date && !Number.isNaN(+v)) { row[k] = new Date(+v + dateShiftMs); touched++; }
    }
    console.log(`\n  shifted ${touched} date values by ${(dateShiftMs / 864e5).toFixed(1)} days so the newest sampled booking = now`);
  }
}

// ─── write ───────────────────────────────────────────────────────────────────
const manifest = { extractedAt: new Date().toISOString(), database: /Database=([^;]+)/i.exec(connStr)?.[1], top: TOP, childCap: CHILD_CAP, anonymized: ANONYMIZE, dateShiftMs, datasets: {} };
for (const [t, rows] of results) manifest.datasets[NAMES[t] ?? t] = { table: t, rows: rows.length, strategy: strategy.get(t) };

if (!DRY_RUN) {
  await fs.mkdir(OUT_DIR, { recursive: true });
  for (const f of await fs.readdir(OUT_DIR)) if (f.endsWith('.json')) await fs.unlink(path.join(OUT_DIR, f));
  for (const [t, rows] of results) await fs.writeFile(path.join(OUT_DIR, `${NAMES[t] ?? t}.json`), JSON.stringify(rows, null, 1));
  await fs.writeFile(path.join(OUT_DIR, '_manifest.json'), JSON.stringify(manifest, null, 2));
  const total = [...results.values()].reduce((n, r) => n + r.length, 0);
  console.log(`\nWrote ${results.size} fixture files (${total} rows) to ${OUT_DIR}`);
}
