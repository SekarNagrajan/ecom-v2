import { type AppCustomConfig } from './types';

export const DEFAULT_APP_CONFIG: AppCustomConfig = {
  timezone: 'UTC',
  dateFormat: 'dd/MM/yyyy',
  timeFormat: 'HH:mm',
  locale: 'en-US',
  formattingRegion: 'en-US',
  currency: 'USD',
  currencyDisplay: 'symbol',

  // Theme
  themeMode: 'light',
  density: 'normal',
  borderRadius: 8,

  // Typography
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  baseFontSize: 14,
  lineHeight: 'normal',

  // Colors - Standard Ant Design Defaults
  primaryColor: '#1677ff', // Ocean Blue
  successColor: '#52c41a',
  warningColor: '#faad14',
  errorColor: '#ff4d4f',
  infoColor: '#1677ff',

  // Colors - Custom
  secondaryColor: '#faad14',
  neutralColor: '#595959',
};
