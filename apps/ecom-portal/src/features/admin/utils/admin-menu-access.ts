// Modified by Sekar Nagarajan (2026-08-27 13:05)
/**
 * Maps legacy AdminAccess / VENDOR_MAIN_MENU RefNo keys (from
 * getEcomCpanelMenudetails / getvendormoduleslist) to React admin section keys.
 */
export type AdminSectionKey =
  | 'global-config'
  | 'menu-management'
  | 'special-privileges'
  | 'email-templates'
  | 'password-reset'
  | 'field-config'
  | 'service-restrictions'
  | 'banner-manager'
  | 'customer-advisories'
  | 'cutoff-config';

/** Default landing module after cpanel / admin login */
export const DEFAULT_ADMIN_SECTION: AdminSectionKey = 'special-privileges';

export const ADMIN_SECTION_LABELS: Record<AdminSectionKey, string> = {
  'global-config': 'Global Config',
  'menu-management': 'Module Creation',
  'special-privileges': 'Module Mapping',
  'email-templates': 'Email Config',
  'password-reset': 'Password Reset',
  'field-config': 'Field Config',
  'service-restrictions': 'Route Restrictions',
  'banner-manager': 'Banners & Assets',
  'customer-advisories': 'Advisories',
  'cutoff-config': 'Cutoff Module',
};

/** Sidebar / URL menu key prefix — e.g. admin-special-privileges */
export const ADMIN_MENU_KEY_PREFIX = 'admin-';

export function adminSectionToMenuKey(section: AdminSectionKey): string {
  return `${ADMIN_MENU_KEY_PREFIX}${section}`;
}

export function menuKeyToAdminSection(
  menuKey: string,
): AdminSectionKey | null {
  if (!menuKey.startsWith(ADMIN_MENU_KEY_PREFIX)) return null;
  const section = menuKey.slice(ADMIN_MENU_KEY_PREFIX.length);
  return isAdminSectionKey(section) ? section : null;
}

export function isAdminSectionKey(value: unknown): value is AdminSectionKey {
  return (
    typeof value === 'string' &&
    Object.prototype.hasOwnProperty.call(ADMIN_SECTION_LABELS, value)
  );
}

/** Legacy menu RefNo → React AdminLayout section key */
export const LEGACY_ADMIN_MENU_TO_SECTION: Record<string, AdminSectionKey> = {
  registermenu: 'menu-management',
  specialprivi: 'special-privileges',
  emailtemplate: 'email-templates',
  adminreset: 'password-reset',
  globalConfigAdmin: 'global-config',
  fieldconfig: 'field-config',
  svrcrestrict: 'service-restrictions',
  ImageUploadAdmin: 'banner-manager',
  CustomerAdvisoryAdmin: 'customer-advisories',
  cutoffconfig: 'cutoff-config',
};

/**
 * Resolve which admin sections the current user may see.
 * Parity with legacy VENDOR_MAIN_MENU filtering after cpanel/eadmin login.
 * When vendorMenuList is empty/undefined, all sections are shown (fallback).
 */
export function resolveAllowedAdminSections(
  vendorMenuList?: string[] | null,
): AdminSectionKey[] {
  if (!vendorMenuList || vendorMenuList.length === 0) {
    return Object.keys(ADMIN_SECTION_LABELS) as AdminSectionKey[];
  }

  const sections: AdminSectionKey[] = [];
  for (const legacyKey of vendorMenuList) {
    const section = LEGACY_ADMIN_MENU_TO_SECTION[legacyKey];
    if (section && !sections.includes(section)) {
      sections.push(section);
    }
  }
  return sections;
}

/** Prefer Module Mapping; otherwise first allowed section. */
export function resolveDefaultAdminSection(
  allowedSections: AdminSectionKey[],
): AdminSectionKey {
  if (allowedSections.includes(DEFAULT_ADMIN_SECTION)) {
    return DEFAULT_ADMIN_SECTION;
  }
  return allowedSections[0] ?? DEFAULT_ADMIN_SECTION;
}
