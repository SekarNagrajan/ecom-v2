import { MoonFilled, SunFilled } from '@ant-design/icons';
import { AppSwitch } from '@solverminds/shared-ui';
import { useAppConfig } from '@solverminds/shared-ui/hooks';
import { useTransition } from 'react';

import { useThemePreferences } from '../../features/theme/providers/theme-preferences-provider';

export function HeaderThemeToggle() {
  const { effectiveThemeMode } = useAppConfig();
  const { updatePreference } = useThemePreferences();
  const [, startTransition] = useTransition();

  const isDark = effectiveThemeMode === 'dark';

  const handleChange = (checked: boolean) => {
    startTransition(() => {
      updatePreference('themeMode', checked ? 'dark' : 'light');
    });
  };

  return (
    <AppSwitch
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      checked={isDark}
      onChange={handleChange}
      checkedChildren={<MoonFilled />}
      unCheckedChildren={<SunFilled />}
    />
  );
}
