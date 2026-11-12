// Created by Sekar Nagarajan (2026-11-12 12:20)
/** Section gating helpers shared by the router and the sidebar. */
import { describe, expect, it } from 'vitest';

import {
  ADMIN_SECTION_LABELS,
  DEFAULT_ADMIN_SECTION,
  LEGACY_ADMIN_MENU_TO_SECTION,
  adminSectionToMenuKey,
  isAdminSectionKey,
  menuKeyToAdminSection,
  resolveAllowedAdminSections,
  resolveDefaultAdminSection,
} from './admin-menu-access';

describe('admin-menu-access', () => {
  it('shows every section when the vendor menu list is empty or missing (legacy fallback)', () => {
    const all = Object.keys(ADMIN_SECTION_LABELS);
    expect(resolveAllowedAdminSections(undefined)).toEqual(all);
    expect(resolveAllowedAdminSections(null)).toEqual(all);
    expect(resolveAllowedAdminSections([])).toEqual(all);
  });

  it('maps legacy RefNos to sections, ignoring unknown keys and duplicates', () => {
    expect(resolveAllowedAdminSections(['specialprivi', 'emailtemplate', 'specialprivi', 'unknown'])).toEqual([
      LEGACY_ADMIN_MENU_TO_SECTION.specialprivi,
      LEGACY_ADMIN_MENU_TO_SECTION.emailtemplate,
    ]);
  });

  it('covers every section with at least one legacy RefNo', () => {
    const mapped = new Set(Object.values(LEGACY_ADMIN_MENU_TO_SECTION));
    for (const key of Object.keys(ADMIN_SECTION_LABELS)) {
      expect(mapped.has(key as never)).toBe(true);
    }
  });

  it('prefers the default section, else the first allowed one', () => {
    expect(resolveDefaultAdminSection([DEFAULT_ADMIN_SECTION, 'cutoff-config'])).toBe(DEFAULT_ADMIN_SECTION);
    expect(resolveDefaultAdminSection(['cutoff-config', 'global-config'])).toBe('cutoff-config');
    expect(resolveDefaultAdminSection([])).toBe(DEFAULT_ADMIN_SECTION);
  });

  it('round-trips sidebar menu keys and rejects anything else', () => {
    expect(isAdminSectionKey('cutoff-config')).toBe(true);
    expect(isAdminSectionKey('nope')).toBe(false);
    expect(isAdminSectionKey(42)).toBe(false);
    expect(menuKeyToAdminSection(adminSectionToMenuKey('cutoff-config'))).toBe('cutoff-config');
    expect(menuKeyToAdminSection('admin-nope')).toBeNull();
    expect(menuKeyToAdminSection('booking')).toBeNull();
  });
});
