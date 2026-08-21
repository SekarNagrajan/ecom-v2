// Modified by Sekar Nagarajan (2026-08-21 15:29) - Fix Dynamic Font Family Application
import React, { useEffect } from 'react';
import { ConfigProvider, App as AntdApp, theme as antdTheme } from 'antd';
import { useTenantStore } from '@solverminds/auth';
import { useAppConfigStore } from '../../features/theme/stores/app-config.store';

interface TenantThemeProviderProps {
  children: React.ReactNode;
}

export function TenantThemeProvider({ children }: TenantThemeProviderProps) {
  const activeTenant = useTenantStore((state) => state.activeTenant);
  const appConfig = useAppConfigStore((state) => state.config);

  const primaryColor = appConfig?.primaryColor || activeTenant.primaryColor || '#1890ff';
  const fontFamily = appConfig?.fontFamily || "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

  const isCompact = appConfig?.density === 'compact';
  const isComfortable = appConfig?.density === 'comfortable';

  const fontSize = isCompact ? 13 : isComfortable ? 15 : 14;
  const controlHeight = isCompact ? 32 : isComfortable ? 42 : 36;
  const borderRadius = isCompact ? 4 : isComfortable ? 8 : 6;

  const focusGlowShadow = `0 0 0 2px ${primaryColor}29`;

  useEffect(() => {
    const fontId = 'dynamic-google-fonts';
    if (!document.getElementById(fontId)) {
      const link = document.createElement('link');
      link.id = fontId;
      link.rel = 'stylesheet';
      link.href =
        'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Open+Sans:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&family=Roboto+Flex:wght@300;400;500;600;700&display=swap';
      document.head.appendChild(link);
    }
    document.body.style.fontFamily = fontFamily;

    let styleEl = document.getElementById('dynamic-font-override') as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'dynamic-font-override';
      document.head.appendChild(styleEl);
    }
    styleEl.innerHTML = `body, button, input, select, textarea, .ant-typography, .ant-btn, .ant-input, .ant-select, .ant-menu, .ant-table, .ant-card, .ant-tabs, .ant-modal, .ant-drawer { font-family: ${fontFamily} !important; }`;
  }, [fontFamily]);

  return (
    <ConfigProvider
      theme={{
        cssVar: { prefix: 'ecom' },
        algorithm: isCompact ? antdTheme.compactAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          // Dynamic User & Tenant Brand colors
          colorPrimary: primaryColor,
          colorLink: primaryColor,
          colorLinkHover: primaryColor,
          colorLinkActive: primaryColor,

          // Dynamic Typography & Density
          fontFamily,
          fontSize,
          lineHeight: 1.5,
          borderRadius,
          controlHeight,

          // Global Backgrounds & Borders
          colorBgLayout: '#f5f7fa',
          colorBgContainer: '#ffffff',
          colorBgElevated: '#ffffff',
          colorBorder: '#e5e7eb',
          colorBorderSecondary: '#f0f2f5',

          // Text Hierarchy
          colorText: '#1f2937',
          colorTextSecondary: '#4b5563',
          colorTextTertiary: '#9ca3af',
          colorTextPlaceholder: '#9ca3af',
        },
        components: {
          Menu: {
            itemBg: 'transparent',
            subMenuItemBg: 'transparent',
            itemColor: '#4b5563',
            itemHoverBg: `${primaryColor}0d`,
            itemHoverColor: primaryColor,
            itemSelectedBg: `${primaryColor}18`, // Soft tint matching CRM Figma design
            itemSelectedColor: primaryColor,
            iconSize: 18,
            itemBorderRadius: 6,
            itemHeight: 40,
          },
          Button: {
            colorPrimary: primaryColor,
            colorPrimaryHover: primaryColor,
            colorPrimaryActive: primaryColor,
            borderRadius: 6,
            fontWeight: 500,
          },
          Input: {
            colorBgContainer: '#ffffff',
            colorBorder: '#d1d5db',
            hoverBorderColor: primaryColor,
            activeBorderColor: primaryColor,
            activeShadow: focusGlowShadow,
            borderRadius: 6,
          },
          Select: {
            colorBgContainer: '#ffffff',
            colorBorder: '#d1d5db',
            hoverBorderColor: primaryColor,
            activeBorderColor: primaryColor,
            activeOutlineColor: focusGlowShadow,
            borderRadius: 6,
          },
          DatePicker: {
            colorBgContainer: '#ffffff',
            colorBorder: '#d1d5db',
            hoverBorderColor: primaryColor,
            activeBorderColor: primaryColor,
            activeShadow: focusGlowShadow,
            borderRadius: 6,
          },
          InputNumber: {
            colorBgContainer: '#ffffff',
            colorBorder: '#d1d5db',
            hoverBorderColor: primaryColor,
            activeBorderColor: primaryColor,
            activeShadow: focusGlowShadow,
            borderRadius: 6,
          },
          Tabs: {
            itemSelectedColor: primaryColor,
            inkBarColor: primaryColor,
            itemHoverColor: primaryColor,
          },
          Tag: {
            colorPrimary: primaryColor,
          },
          Badge: {
            colorPrimary: primaryColor,
          },
          Table: {
            headerBg: '#fafafa',
            headerColor: '#374151',
            headerSplitColor: '#f0f0f0',
            rowHoverBg: `${primaryColor}08`,
            borderColor: '#f0f0f0',
            borderRadius: 6,
          },
          Card: {
            colorBgContainer: '#ffffff',
            headerBg: '#ffffff',
            borderRadiusLG: 8,
          },
          Form: {
            labelColor: '#374151',
            labelFontSize: 13,
            labelRequiredMarkColor: '#ef4444',
          },
        },
      }}
    >
      <AntdApp>{children}</AntdApp>
    </ConfigProvider>
  );
}
