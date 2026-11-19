// Modified by Sekar Nagarajan (2026-11-12 12:40)
import type { LucideIcon } from 'lucide-react';

import { Icons } from '../../../components/icons';
import {
  ADMIN_CATEGORY_LABELS,
  ADMIN_CATEGORY_ORDER,
  ADMIN_SECTION_META,
  ADMIN_SECTION_ORDER,
  type AdminCategoryKey,
  type AdminSectionKey,
} from './admin-menu-access';

/** `t(key, { defaultValue })` — the shape react-i18next's `t` already satisfies. */
export type AdminLabelTranslator = (
  key: string,
  options: { defaultValue: string },
) => string;

export interface AdminSectionNavItem {
  key: AdminSectionKey;
  label: string;
  subtitle: string;
  icon: LucideIcon;
  category: AdminCategoryKey;
}

export interface AdminSectionNavGroup {
  key: AdminCategoryKey;
  label: string;
  items: AdminSectionNavItem[];
}

export const SECTION_ICONS: Record<AdminSectionKey, LucideIcon> = {
  'module-mapping': Icons.key,
  'module-creation': Icons.blocks,
  'password-reset': Icons.lock,
  'global-config': Icons.slidersHorizontal,
  'field-config': Icons.formInput,
  'email-templates': Icons.mail,
  'customer-advisories': Icons.megaphone,
  'banner-manager': Icons.image,
  'cutoff-config': Icons.clock,
  'route-restrictions': Icons.routeOff,
};

const identity: AdminLabelTranslator = (_key, { defaultValue }) => defaultValue;

export function sectionTitle(key: AdminSectionKey, t: AdminLabelTranslator = identity) {
  return t(`sections.${key}.title`, { defaultValue: ADMIN_SECTION_META[key].title });
}

export function sectionSubtitle(key: AdminSectionKey, t: AdminLabelTranslator = identity) {
  return t(`sections.${key}.subtitle`, { defaultValue: ADMIN_SECTION_META[key].subtitle });
}

export function categoryLabel(key: AdminCategoryKey, t: AdminLabelTranslator = identity) {
  return t(`categories.${key}`, { defaultValue: ADMIN_CATEGORY_LABELS[key] });
}

/** Allowed sections in canonical (category) order — feeds the in-page tab strip. */
export function buildAdminSectionNavItems(
  allowedSections: AdminSectionKey[],
  t: AdminLabelTranslator = identity,
): AdminSectionNavItem[] {
  const allowed = new Set(allowedSections);
  return ADMIN_SECTION_ORDER.filter((key) => allowed.has(key)).map((key) => ({
    key,
    label: sectionTitle(key, t),
    subtitle: sectionSubtitle(key, t),
    icon: SECTION_ICONS[key],
    category: ADMIN_SECTION_META[key].category,
  }));
}

/** Same items grouped by category; empty categories are omitted. */
export function buildAdminSectionNavGroups(
  allowedSections: AdminSectionKey[],
  t: AdminLabelTranslator = identity,
): AdminSectionNavGroup[] {
  const items = buildAdminSectionNavItems(allowedSections, t);
  return ADMIN_CATEGORY_ORDER.map((category) => ({
    key: category,
    label: categoryLabel(category, t),
    items: items.filter((item) => item.category === category),
  })).filter((group) => group.items.length > 0);
}
