// Modified by Sekar Nagarajan (2026-08-27 12:19)
import { useNavigate } from '@tanstack/react-router';
import { Segmented, Typography } from 'antd';

import type { LoginEntryType } from '../types/auth.types';

const { Text } = Typography;

const ENTRY_OPTIONS: {
  label: string;
  value: LoginEntryType;
  path: '/cpanel' | '/eadmin' | '/admin';
}[] = [
  { label: 'Cpanel', value: 'cpanel', path: '/cpanel' },
  { label: 'Eadmin', value: 'eadmin', path: '/eadmin' },
  { label: 'Admin', value: 'admin', path: '/admin' },
];

interface LoginEntrySwitcherProps {
  activeEntry: LoginEntryType;
}

/** Segmented control that navigates between /cpanel, /eadmin, and /admin. */
export function LoginEntrySwitcher({ activeEntry }: LoginEntrySwitcherProps) {
  const navigate = useNavigate();

  return (
    <div className="admin-login-page__switcher">
      <Text className="admin-login-page__switcher-label">Login portal</Text>
      <Segmented
        block
        value={activeEntry}
        options={ENTRY_OPTIONS.map((o) => ({
          label: o.label,
          value: o.value,
        }))}
        onChange={(value) => {
          const next = ENTRY_OPTIONS.find((o) => o.value === value);
          if (next && next.value !== activeEntry) {
            navigate({ to: next.path });
          }
        }}
      />
    </div>
  );
}
