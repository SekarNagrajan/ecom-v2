// Created by Sekar Nagarajan (2026-10-16 23:35)
/**
 * MenuRegistration (db.menus) / SplPrivilegeMenu (db.customerMenus) / vendor admin menus → the
 * capability codes, menu-config DTOs and module-mapping DTOs the portal already consumes.
 * Pure functions: every table is a parameter with a db.* default so unit tests can pass sample rows.
 */
import type { MenuConfig, ModuleMappingMenu, SpecialPrivilege } from '../../../features/admin/types/admin.types';
import { db, eq, type Row } from '../db';

/**
 * MenuRegistration.RefNo → capability code(s) checked by src/app/router.tsx / usePermission.
 *
 * | RefNo                  | capability        | note                                              |
 * | DBD                    | VIEW_DASHBOARD    | dashboard (no route gate, kept for the demo user)  |
 * | SCH, BLS, BPS, BVS     | SCH               | schedules + its sub menus                          |
 * | TRK                    | TRK               | tracking                                           |
 * | BKG                    | BKG, CREATE_BOOKING | booking list + create                            |
 * | SHI                    | SI                | shipping instruction                               |
 * | BOL, BBP, BL           | BL                | OBL print, BL batch print, BL                      |
 * | VGM                    | VGM               |                                                    |
 * | CRO                    | CRO               | container release order                            |
 * | ARN                    | ARN               | arrival notice (ROOT and Imports child)            |
 * | DEO                    | DO                | delivery order (Imports child)                     |
 * | CUS                    | STMT              | customer statement                                 |
 * | PAY                    | PAY               | payment history                                    |
 * | CEC                    | CO2               | carbon calculator                                  |
 * RAT/TAR/RTS/SUR/CON/RAQ, USC, NTE, INV, IMO, STR, MCN, INS/CAP/FAQ/CPT, AGC, HEL have no route gate.
 */
export const REFNO_TO_CAPABILITY: Record<string, string[]> = {
  DBD: ['VIEW_DASHBOARD'],
  SCH: ['SCH'], BLS: ['SCH'], BPS: ['SCH'], BVS: ['SCH'],
  TRK: ['TRK'],
  BKG: ['BKG', 'CREATE_BOOKING'],
  SHI: ['SI'],
  BOL: ['BL'], BBP: ['BL'], BL: ['BL'],
  VGM: ['VGM'],
  CRO: ['CRO'],
  ARN: ['ARN'],
  DEO: ['DO'],
  CUS: ['STMT'],
  PAY: ['PAY'],
  CEC: ['CO2'],
};

/** '44_47_48' (ecomuserdetails.MenuId / SplPrivilegeMenu.menuid) → ['44', '47', '48'] */
export const splitMenuIds = (value: unknown): string[] =>
  String(value ?? '').split('_').map(s => s.trim()).filter(Boolean);

export const joinMenuIds = (ids: string[]) => [...new Set(ids.map(String))].join('_');

const isActive = (m: Row) => eq(m.MenuStatus, 'A');
const byOrder = (a: Row, b: Row) => Number(a.menuorder ?? 0) - Number(b.menuorder ?? 0) || Number(a.MenuId) - Number(b.MenuId);

/** Active customer (userttype U) menus, in menuorder. */
export const customerMenus = (menus: Row[] = db.menus) =>
  menus.filter(m => isActive(m) && eq(m.userttype ?? 'U', 'U')).sort(byOrder);

/** Category D menus are the defaults every customer gets; P menus must be in the user's MenuId. */
export const defaultMenuIds = (menus: Row[] = db.menus) =>
  customerMenus(menus).filter(m => eq(m.Category, 'D')).map(m => String(m.MenuId));

export const capabilitiesOfRefNo = (refNo: unknown) => REFNO_TO_CAPABILITY[String(refNo ?? '').trim().toUpperCase()] ?? [];

/** Capability codes for a user's MenuId list (plus the default D menus). Order follows menuorder. */
export function capabilitiesForMenuIds(menuIds: string[], menus: Row[] = db.menus): string[] {
  const wanted = new Set([...menuIds.map(String), ...defaultMenuIds(menus)]);
  const out: string[] = [];
  for (const m of customerMenus(menus)) {
    if (!wanted.has(String(m.MenuId))) continue;
    for (const c of capabilitiesOfRefNo(m.RefNo)) if (!out.includes(c)) out.push(c);
  }
  return out;
}

/** Every capability any active customer menu grants (system admins / vendors). */
export const allCapabilities = (menus: Row[] = db.menus) =>
  capabilitiesForMenuIds(customerMenus(menus).map(m => String(m.MenuId)), menus);

/** GET /api/config/menu-access: capability → D (public/default) | P (privileged). P wins on conflict. */
export function menuCategories(menus: Row[] = db.menus): Record<string, 'D' | 'P'> {
  const out: Record<string, 'D' | 'P'> = {};
  for (const m of customerMenus(menus)) {
    const cat: 'D' | 'P' = eq(m.Category, 'P') ? 'P' : 'D';
    for (const c of capabilitiesOfRefNo(m.RefNo)) out[c] = out[c] === 'P' ? 'P' : cat;
  }
  return out;
}

/** `href="tracking.do"` → `tracking.do`; anything else is returned as-is. */
export function attrRoute(attrValue: unknown): string {
  const raw = String(attrValue ?? '').trim();
  const m = /href\s*=\s*"([^"]*)"/i.exec(raw);
  return m ? m[1] : raw;
}

/** `href="AdminAccess.do?type=specialprivi"` → `specialprivi` (the legacy key AdminLayout maps to a section). */
export function adminAccessType(attrValue: unknown): string | null {
  const m = /[?&]type=([^&"\s]+)/i.exec(String(attrValue ?? ''));
  return m ? m[1] : null;
}

/**
 * vendorMenuList for admin / vendor logins: legacy AdminAccess type keys from ecom_vendor_module_mapping
 * (+ ecom_adminmenu). `scope: 'vendor'` keeps only rows flagged status V; 'all' is the system admin view.
 */
export function vendorMenuKeys(scope: 'all' | 'vendor', mapping: Row[] = db.vendorModuleMapping, adminMenus: Row[] = db.adminMenus): string[] {
  const rows = [
    ...mapping.filter(r => scope === 'all' || eq(r.status, 'V')).sort(byOrder),
    ...(scope === 'all' ? adminMenus.filter(r => eq(r.status ?? 'A', 'A')) : []),
  ];
  const keys: string[] = [];
  for (const r of rows) {
    const key = adminAccessType(r.AttrValue);
    if (key && !keys.includes(key)) keys.push(key);
  }
  return keys;
}

// ---------------------------------------------------------------------------
// Admin › Module Creation (MenuConfig)
// ---------------------------------------------------------------------------
export function mapMenuConfig(m: Row): MenuConfig {
  const userType = String(m.userttype ?? '').toUpperCase();
  return {
    refNo: String(m.RefNo ?? ''),
    labelValue: String(m.LabelValue ?? ''),
    menuName: String(m.MenuName ?? ''),
    category: eq(m.Category, 'P') ? 'P' : 'D',
    classValue: String(m.ClassValue ?? ''),
    attrValue: attrRoute(m.AttrValue),
    orderNo: Number(m.menuorder ?? 0),
    isEnabled: isActive(m),
    userType: userType === 'V' ? 'V' : 'U',
    menuType: String(m.MenuType ?? ''),
    parentMenu: String(m.ParentMenu ?? ''),
    developedBy: String(m.DevelopedBy ?? ''),
    createdBy: String(m.CreatedBy ?? ''),
  };
}

export const menuConfigs = (menus: Row[] = db.menus): MenuConfig[] => [...menus].sort(byOrder).map(mapMenuConfig);

const menuKey = (refNo: unknown, parent: unknown, userType: unknown) =>
  `${String(refNo ?? '').toUpperCase()}|${String(parent ?? '').toUpperCase()}|${String(userType ?? 'U').toUpperCase()}`;

/** Copies the editable MenuConfig fields onto a MenuRegistration row. */
export function applyMenuConfig(row: Row, cfg: MenuConfig): Row {
  row.RefNo = cfg.refNo;
  row.LabelValue = cfg.labelValue;
  row.MenuName = cfg.menuName || cfg.labelValue;
  row.Category = cfg.category;
  row.ClassValue = cfg.classValue;
  row.AttrValue = cfg.attrValue;
  row.menuorder = cfg.orderNo;
  row.MenuStatus = cfg.isEnabled ? 'A' : 'I';
  if (cfg.userType) row.userttype = cfg.userType;
  if (cfg.menuType) row.MenuType = cfg.menuType;
  if (cfg.parentMenu) row.ParentMenu = cfg.parentMenu;
  if (cfg.developedBy) row.DevelopedBy = cfg.developedBy;
  if (cfg.createdBy) row.CreatedBy = cfg.createdBy;
  return row;
}

/** New MenuRegistration row for POST /menu-config (next free MenuId). */
export function menuConfigRow(cfg: MenuConfig, menus: Row[] = db.menus, now = new Date().toISOString()): Row {
  const nextId = menus.reduce((max, m) => Math.max(max, Number(m.MenuId) || 0), 0) + 1;
  const row: Row = {
    MenuId: nextId, MenuName: cfg.menuName || cfg.labelValue, DevelopedBy: cfg.developedBy ?? '', MenuStatus: 'A', Date: now,
    RefNo: cfg.refNo, Category: cfg.category, userttype: cfg.userType ?? 'U', CreatedBy: cfg.createdBy ?? '', ChgDate: now,
    menuorder: cfg.orderNo, ClassValue: cfg.classValue, AttrValue: cfg.attrValue, LabelValue: cfg.labelValue,
    MenuType: cfg.menuType || 'M', ParentMenu: cfg.parentMenu || 'ROOT',
  };
  return applyMenuConfig(row, cfg);
}

/**
 * PUT /menu-config sends the whole list (MenuConfig has no MenuId). Rows are matched on
 * refNo + parentMenu + userType in list order; unmatched entries become new rows.
 */
export function applyMenuConfigs(list: MenuConfig[], menus: Row[] = db.menus): Row[] {
  const pool = new Map<string, Row[]>();
  for (const m of menus) {
    const k = menuKey(m.RefNo, m.ParentMenu, m.userttype);
    pool.set(k, [...(pool.get(k) ?? []), m]);
  }
  for (const cfg of list) {
    const k = menuKey(cfg.refNo, cfg.parentMenu, cfg.userType);
    const row = pool.get(k)?.shift();
    if (row) applyMenuConfig(row, cfg);
    else menus.push(menuConfigRow(cfg, menus));
  }
  return menus;
}

// ---------------------------------------------------------------------------
// Admin › Module Mapping (SpecialPrivilege.jsp): SplPrivilegeMenu.custid is a login e-mail or a customer code
// ---------------------------------------------------------------------------
const forCustomer = (r: Row, custCode: string, webId: string) =>
  (webId && eq(r.custid, webId)) || (custCode && eq(r.custid, custCode));

export function assignedMenuIds(custCode: string, webId: string, rows: Row[] = db.customerMenus): string[] {
  const ids = new Set<string>();
  for (const r of rows) if (forCustomer(r, custCode, webId)) for (const id of splitMenuIds(r.menuid)) ids.add(id);
  return [...ids];
}

export function moduleMappingMenus(custCode: string, webId: string, menus: Row[] = db.menus, rows: Row[] = db.customerMenus): ModuleMappingMenu[] {
  const assigned = new Set(assignedMenuIds(custCode, webId, rows));
  return customerMenus(menus).map(m => {
    const menuId = String(m.MenuId);
    const privileged = eq(m.Category, 'P');
    return {
      menuId,
      menuName: String(m.MenuName ?? m.LabelValue ?? ''),
      refNo: String(m.RefNo ?? ''),
      category: !privileged ? 'D' : assigned.has(menuId) ? 'NP' : 'P',
    };
  });
}

/** Rewrites the customer's SplPrivilegeMenu row (created when missing). */
export function setAssignedMenuIds(custCode: string, webId: string, ids: string[], rows: Row[] = db.customerMenus): Row {
  const existing = rows.find(r => webId && eq(r.custid, webId)) ?? rows.find(r => custCode && eq(r.custid, custCode));
  if (existing) {
    existing.menuid = joinMenuIds(ids);
    return existing;
  }
  const row: Row = { menuid: joinMenuIds(ids), custid: webId || custCode, ID: rows.reduce((max, r) => Math.max(max, Number(r.ID) || 0), 0) + 1 };
  rows.push(row);
  return row;
}

// ---------------------------------------------------------------------------
// Legacy special-privileges matrix: one row per (SplPrivilegeMenu.custid, menu)
// ---------------------------------------------------------------------------
export function specialPrivileges(
  rows: Row[] = db.customerMenus, menus: Row[] = db.menus, users: Row[] = db.users, details: Row[] = db.userDetails,
): SpecialPrivilege[] {
  const byId = new Map(menus.map(m => [String(m.MenuId), m]));
  const seen = new Set<string>();
  const out: SpecialPrivilege[] = [];
  for (const r of [...rows].sort((a, b) => Number(b.ID ?? 0) - Number(a.ID ?? 0))) {
    const roleId = String(r.custid ?? '').trim();
    if (!roleId || seen.has(roleId.toLowerCase())) continue;
    seen.add(roleId.toLowerCase());
    const user = users.find(u => eq(u.loginname, roleId) || eq(u.User_Email, roleId)) ?? users.find(u => eq(u.Cust_Code, roleId));
    const detail = details.find(d => eq(d.EmailID, roleId));
    const roleName = String(user?.Comp_Name || roleId);
    for (const id of splitMenuIds(r.menuid)) {
      const m = byId.get(id);
      if (!m) continue;
      const privileged = eq(m.Category, 'P');
      out.push({
        roleId, roleName, moduleCode: String(m.RefNo ?? id),
        canView: isActive(m), canCreate: privileged, canEdit: privileged, canDelete: false,
        canApprove: eq(detail?.userRole, 'Y'),
      });
    }
  }
  return out;
}

/** PUT /special-privileges: rows with canView keep their menu; others are dropped from the customer's menuid. */
export function applySpecialPrivileges(list: SpecialPrivilege[], rows: Row[] = db.customerMenus, menus: Row[] = db.menus): Row[] {
  const grouped = new Map<string, string[]>();
  for (const p of list) {
    if (!grouped.has(p.roleId)) grouped.set(p.roleId, []);
    if (!p.canView) continue;
    const menu = menus.find(m => eq(m.RefNo, p.moduleCode) && isActive(m)) ?? menus.find(m => eq(m.RefNo, p.moduleCode));
    if (menu) grouped.get(p.roleId)?.push(String(menu.MenuId));
  }
  for (const [roleId, ids] of grouped) setAssignedMenuIds('', roleId, ids, rows);
  return rows;
}
