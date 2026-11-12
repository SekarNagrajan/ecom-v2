// Modified by Sekar Nagarajan (2026-11-12 12:40)
/**
 * Control Panel section registry: URL keys, canonical names, categories and the legacy
 * AdminAccess / VENDOR_MAIN_MENU RefNo mapping (getEcomCpanelMenudetails / getvendormoduleslist).
 * Consumed by the router (validateSearch / beforeLoad), the sidebar and the in-page tab strip.
 */
export type AdminSectionKey =
  | 'module-mapping'
  | 'module-creation'
  | 'password-reset'
  | 'global-config'
  | 'field-config'
  | 'email-templates'
  | 'customer-advisories'
  | 'banner-manager'
  | 'cutoff-config'
  | 'route-restrictions';

export type AdminCategoryKey =
  | 'access'
  | 'platform'
  | 'communications'
  | 'operations';

export const ADMIN_CATEGORY_ORDER: readonly AdminCategoryKey[] = [
  'access',
  'platform',
  'communications',
  'operations',
];

/** English defaults — translated through the `admin` namespace (`categories.<key>`). */
export const ADMIN_CATEGORY_LABELS: Record<AdminCategoryKey, string> = {
  access: 'Access & Security',
  platform: 'Platform Settings',
  communications: 'Communications & Content',
  operations: 'Operations',
};

export interface AdminSectionMeta {
  /** Canonical Title Case name, used identically in the sidebar, tab strip and section header. */
  title: string;
  /** One imperative sentence shown under the section title. */
  subtitle: string;
  category: AdminCategoryKey;
  /** Legacy JSP RefNo that gates the section via `vendorMenuList`. */
  legacyRefNo: string;
}

/** Declared in display order: by category, then within the category. */
export const ADMIN_SECTION_META: Record<AdminSectionKey, AdminSectionMeta> = {
  'module-mapping': {
    title: 'Module Mapping',
    subtitle: 'Assign privileged modules to individual customer accounts.',
    category: 'access',
    legacyRefNo: 'specialprivi',
  },
  'module-creation': {
    title: 'Module Creation',
    subtitle: 'Register portal menus and control their category and visibility rules.',
    category: 'access',
    legacyRefNo: 'registermenu',
  },
  'password-reset': {
    title: 'Password Reset',
    subtitle: 'Force a password reset and issue temporary OTP credentials for a login.',
    category: 'access',
    legacyRefNo: 'adminreset',
  },
  'global-config': {
    title: 'Global Configuration',
    subtitle: 'Manage security policies, captcha rules and portal-wide feature flags.',
    category: 'platform',
    legacyRefNo: 'globalConfigAdmin',
  },
  'field-config': {
    title: 'Field Configuration',
    subtitle: 'Control which form fields are visible and mandatory across the portal.',
    category: 'platform',
    legacyRefNo: 'fieldconfig',
  },
  'email-templates': {
    title: 'Email Templates',
    subtitle: 'Edit transactional notification templates and their dynamic placeholders.',
    category: 'communications',
    legacyRefNo: 'emailtemplate',
  },
  'customer-advisories': {
    title: 'Customer Advisories',
    subtitle: 'Publish operational advisories, port alerts and announcements to customers.',
    category: 'communications',
    legacyRefNo: 'CustomerAdvisoryAdmin',
  },
  'banner-manager': {
    title: 'Banners & Assets',
    subtitle: 'Manage landing hero slides, promotional carousels and media assets.',
    category: 'communications',
    legacyRefNo: 'ImageUploadAdmin',
  },
  'cutoff-config': {
    title: 'Cutoff Configuration',
    subtitle: 'Set port and terminal cutoff hours for CFS, VGM, documentation, EDI and gate-in.',
    category: 'operations',
    legacyRefNo: 'cutoffconfig',
  },
  'route-restrictions': {
    title: 'Route Restrictions',
    subtitle: 'Allow or block origin–destination port pairs per service loop.',
    category: 'operations',
    legacyRefNo: 'svrcrestrict',
  },
};

/** Canonical display order (object key order of ADMIN_SECTION_META). */
export const ADMIN_SECTION_ORDER = Object.keys(ADMIN_SECTION_META) as AdminSectionKey[];

/** Default landing module after cpanel / admin login (legacy parity: Module Mapping). */
export const DEFAULT_ADMIN_SECTION: AdminSectionKey = 'module-mapping';

export const ADMIN_SECTION_LABELS: Record<AdminSectionKey, string> = Object.fromEntries(
  ADMIN_SECTION_ORDER.map((key) => [key, ADMIN_SECTION_META[key].title]),
) as Record<AdminSectionKey, string>;

/**
 * Former URL keys → canonical keys. Old deep links and bookmarks keep working: the route
 * normalises them and redirects (replace) to the canonical key.
 */
export const ADMIN_SECTION_KEY_ALIASES: Record<string, AdminSectionKey> = {
  'special-privileges': 'module-mapping',
  'menu-management': 'module-creation',
  'service-restrictions': 'route-restrictions',
};

export function isAdminSectionKey(value: unknown): value is AdminSectionKey {
  return (
    typeof value === 'string' &&
    Object.prototype.hasOwnProperty.call(ADMIN_SECTION_META, value)
  );
}

/** Canonical key for a canonical or aliased value; `null` for anything else. */
export function normalizeAdminSectionKey(value: unknown): AdminSectionKey | null {
  if (isAdminSectionKey(value)) return value;
  if (typeof value === 'string' && value in ADMIN_SECTION_KEY_ALIASES) {
    return ADMIN_SECTION_KEY_ALIASES[value];
  }
  return null;
}

/** Sidebar / URL menu key prefix — e.g. admin-module-mapping */
export const ADMIN_MENU_KEY_PREFIX = 'admin-';

export function adminSectionToMenuKey(section: AdminSectionKey): string {
  return `${ADMIN_MENU_KEY_PREFIX}${section}`;
}

export function menuKeyToAdminSection(menuKey: string): AdminSectionKey | null {
  if (!menuKey.startsWith(ADMIN_MENU_KEY_PREFIX)) return null;
  return normalizeAdminSectionKey(menuKey.slice(ADMIN_MENU_KEY_PREFIX.length));
}

/** Legacy menu RefNo → section key (derived from ADMIN_SECTION_META). */
export const LEGACY_ADMIN_MENU_TO_SECTION: Record<string, AdminSectionKey> = Object.fromEntries(
  ADMIN_SECTION_ORDER.map((key) => [ADMIN_SECTION_META[key].legacyRefNo, key]),
);

/**
 * Resolve which admin sections the current user may see.
 * Parity with legacy VENDOR_MAIN_MENU filtering after cpanel/eadmin login.
 * When vendorMenuList is empty/undefined, all sections are shown (fallback).
 */
export function resolveAllowedAdminSections(
  vendorMenuList?: string[] | null,
): AdminSectionKey[] {
  if (!vendorMenuList || vendorMenuList.length === 0) {
    return [...ADMIN_SECTION_ORDER];
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
