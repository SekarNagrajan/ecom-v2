import { ThemeConfig, theme } from 'antd';

export interface AppThemeConfig {
  mode?: 'light' | 'dark';
  primaryColor?: string;
}

export function buildAntdTheme(config: AppThemeConfig = {}): ThemeConfig {
  const isDark = config.mode === 'dark';
  const primaryColor = config.primaryColor || '#0072CE'; // Solverminds Ocean Blue

  return {
    algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: primaryColor,
      colorInfo: primaryColor,
      colorSuccess: '#10B981',
      colorWarning: '#F59E0B',
      colorError: '#EF4444',
      borderRadius: 6,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      controlHeight: 38,
      fontSize: 14,
    },
    components: {
      Button: {
        fontWeight: 600,
        borderRadius: 6,
        controlHeight: 38,
      },
      Table: {
        headerBg: isDark ? '#1E293B' : '#F8FAFC',
        headerColor: isDark ? '#E2E8F0' : '#1E293B',
        rowHoverBg: isDark ? '#334155' : '#F1F5F9',
        fontSize: 13,
      },
      Card: {
        borderRadiusLG: 10,
      },
      Modal: {
        borderRadiusLG: 12,
      },
      Drawer: {
        borderRadiusLG: 0,
      },
    },
  };
}
