// Modified by Sekar Nagarajan (2026-11-12 12:40)
/** Section gating, aliasing and ordering helpers shared by the router, sidebar and tab strip. */
import { describe, expect, it } from 'vitest';

import {
  ADMIN_SECTION_KEY_ALIASES,
  ADMIN_SECTION_LABELS,
  ADMIN_SECTION_META,
  ADMIN_SECTION_ORDER,
  DEFAULT_ADMIN_SECTION,
  LEGACY_ADMIN_MENU_TO_SECTION,
  adminSectionToMenuKey,
  isAdminSectionKey,
  menuKeyToAdminSection,
  normalizeAdminSectionKey,
  resolveAllowedAdminSections,
  resolveDefaultAdminSection,
} from './admin-menu-access';
import {
  buildAdminSectionNavGroups,
  buildAdminSectionNavItems,
} from './admin-section-nav';

describe('admin-menu-access', () => {
  it('shows every section when the vendor menu list is empty or missing (legacy fallback)', () => {
    expect(resolveAllowedAdminSections(undefined)).toEqual(ADMIN_SECTION_ORDER);
    expect(resolveAllowedAdminSections(null)).toEqual(ADMIN_SECTION_ORDER);
    expect(resolveAllowedAdminSections([])).toEqual(ADMIN_SECTION_ORDER);
  });

  it('maps legacy RefNos to sections, ignoring unknown keys and duplicates', () => {
    expect(resolveAllowedAdminSections(['specialprivi', 'emailtemplate', 'specialprivi', 'unknown'])).toEqual([
      'module-mapping',
      'email-templates',
    ]);
  });

  it('covers every section with exactly one legacy RefNo', () => {
    for (const key of ADMIN_SECTION_ORDER) {
      expect(LEGACY_ADMIN_MENU_TO_SECTION[ADMIN_SECTION_META[key].legacyRefNo]).toBe(key);
    }
    expect(Object.keys(LEGACY_ADMIN_MENU_TO_SECTION)).toHaveLength(ADMIN_SECTION_ORDER.length);
  });

  it('prefers Module Mapping, else the first allowed section', () => {
    expect(DEFAULT_ADMIN_SECTION).toBe('module-mapping');
    expect(resolveDefaultAdminSection(['cutoff-config', DEFAULT_ADMIN_SECTION])).toBe(DEFAULT_ADMIN_SECTION);
    expect(resolveDefaultAdminSection(['cutoff-config', 'global-config'])).toBe('cutoff-config');
    expect(resolveDefaultAdminSection([])).toBe(DEFAULT_ADMIN_SECTION);
  });

  it('normalises aliased URL keys to canonical ones and rejects anything else', () => {
    expect(normalizeAdminSectionKey('special-privileges')).toBe('module-mapping');
    expect(normalizeAdminSectionKey('menu-management')).toBe('module-creation');
    expect(normalizeAdminSectionKey('service-restrictions')).toBe('route-restrictions');
    expect(normalizeAdminSectionKey('cutoff-config')).toBe('cutoff-config');
    expect(normalizeAdminSectionKey('nope')).toBeNull();
    expect(normalizeAdminSectionKey(42)).toBeNull();
    // Strict check never accepts aliases (sidebar selected-key logic relies on this).
    for (const alias of Object.keys(ADMIN_SECTION_KEY_ALIASES)) {
      expect(isAdminSectionKey(alias)).toBe(false);
    }
  });

  it('round-trips sidebar menu keys (aliases included) and rejects foreign keys', () => {
    expect(menuKeyToAdminSection(adminSectionToMenuKey('cutoff-config'))).toBe('cutoff-config');
    expect(menuKeyToAdminSection('admin-special-privileges')).toBe('module-mapping');
    expect(menuKeyToAdminSection('admin-nope')).toBeNull();
    expect(menuKeyToAdminSection('booking')).toBeNull();
  });

  it('uses canonical Title Case names with no legacy suffixes', () => {
    for (const title of Object.values(ADMIN_SECTION_LABELS)) {
      expect(title).not.toMatch(/\b(Admin|Editor|Manager|Module)$/);
    }
  });
});

describe('admin-section-nav', () => {
  it('orders tab items canonically regardless of vendorMenuList order and applies translations', () => {
    const items = buildAdminSectionNavItems(['cutoff-config', 'module-mapping'], (key, { defaultValue }) =>
      key === 'sections.module-mapping.title' ? 'Pemetaan Modul' : defaultValue,
    );
    expect(items.map((i) => i.key)).toEqual(['module-mapping', 'cutoff-config']);
    expect(items[0].label).toBe('Pemetaan Modul');
    expect(items[1].label).toBe('Cutoff Configuration');
  });

  it('groups by category and omits empty categories', () => {
    const groups = buildAdminSectionNavGroups(['cutoff-config', 'route-restrictions', 'password-reset']);
    expect(groups.map((g) => g.key)).toEqual(['access', 'operations']);
    expect(groups[1].items.map((i) => i.key)).toEqual(['cutoff-config', 'route-restrictions']);
  });
});
