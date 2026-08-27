// Created by Sekar Nagarajan (2026-08-27 13:05)
import type { LucideIcon } from 'lucide-react';

import { Icons } from '../../../components/icons';
import type { AdminSectionKey } from '../utils/admin-menu-access';
import { ADMIN_SECTION_LABELS } from '../utils/admin-menu-access';

export interface AdminSectionNavItem {
  key: AdminSectionKey;
  label: string;
  icon: LucideIcon;
}

const SECTION_ICONS: Record<AdminSectionKey, LucideIcon> = {
  'global-config': Icons.settings,
  'menu-management': Icons.list,
  'special-privileges': Icons.key,
  'email-templates': Icons.mail,
  'password-reset': Icons.lock,
  'field-config': Icons.formInput,
  'service-restrictions': Icons.stopCircle,
  'banner-manager': Icons.image,
  'customer-advisories': Icons.bell,
  'cutoff-config': Icons.clock,
};

/** Canonical display order for admin modules in the app sidebar */
const SECTION_ORDER: AdminSectionKey[] = [
  'special-privileges',
  'email-templates',
  'cutoff-config',
  'menu-management',
  'global-config',
  'password-reset',
  'field-config',
  'service-restrictions',
  'banner-manager',
  'customer-advisories',
];

export function buildAdminSectionNavItems(
  allowedSections: AdminSectionKey[],
): AdminSectionNavItem[] {
  const allowed = new Set(allowedSections);
  return SECTION_ORDER.filter((key) => allowed.has(key)).map((key) => ({
    key,
    label: ADMIN_SECTION_LABELS[key],
    icon: SECTION_ICONS[key],
  }));
}
