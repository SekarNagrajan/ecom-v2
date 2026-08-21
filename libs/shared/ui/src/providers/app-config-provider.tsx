import { StyleProvider } from '@ant-design/cssinjs';
import { ConfigProvider, App } from 'antd';
import enUS from 'antd/locale/en_US';
import { Settings } from 'luxon';
import React, { useEffect, useState } from 'react';

import { useAntdBreakpoint } from '../hooks/use-antd-breakpoint';
import { useSystemTheme } from '../hooks/use-system-theme';
import { getAntdLocale } from '../utils/i18n/locale-config';
import { AppConfigContext } from './app-config-context';
import { buildAntdTheme, resolveThemeMode } from './theme-builder';
import type { AppConfigProviderProps } from './types';

export const AppConfigProvider: React.FC<AppConfigProviderProps> = ({
  children,
  config,
  theme: antdThemeOverrides,
  direction = 'ltr',
}) => {
  const [antdLocale, setAntdLocale] = useState(enUS);

  const systemTheme = useSystemTheme();
  const { isMobile } = useAntdBreakpoint();

  const effectiveThemeMode = resolveThemeMode(config.themeMode, systemTheme);

  const finalAntdTheme = buildAntdTheme({
    config,
    effectiveThemeMode,
    isMobile,
    antdThemeOverrides,
  });

  // Load AntD locale dynamically
  useEffect(() => {
    getAntdLocale(config.locale).then((locale) => {
      setAntdLocale(locale);
    });
  }, [config.locale]);

  // Sync Tailwind 'dark' class
  useEffect(() => {
    const root = window.document.documentElement;
    if (effectiveThemeMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [effectiveThemeMode]);

  // Sync direction attribute
  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute('dir', direction);
  }, [direction]);

  // Sync Luxon default timezone
  useEffect(() => {
    Settings.defaultZone = config.timezone;
    return () => {
      Settings.defaultZone = 'system';
    };
  }, [config.timezone]);

  return (
    <AppConfigContext.Provider value={{ ...config, effectiveThemeMode }}>
      <StyleProvider layer>
        <ConfigProvider
          theme={finalAntdTheme}
          locale={antdLocale}
          direction={direction}
        >
          <App>{children}</App>
        </ConfigProvider>
      </StyleProvider>
    </AppConfigContext.Provider>
  );
};
