import { theme } from 'antd';

import type { UseCalendarThemeReturn } from '../calendar-types';

export const useCalendarTheme = (): UseCalendarThemeReturn => {
  const { token } = theme.useToken();

  const calendarStyles: React.CSSProperties = {
    // Standard FullCalendar v6 Variables
    '--fc-border-color': token.colorBorderSecondary,
    '--fc-page-bg-color': token.colorBgContainer,
    '--fc-neutral-bg-color': token.colorBgContainer,
    '--fc-neutral-text-color': token.colorText,
    '--fc-today-bg-color': token.colorPrimaryBg,
    '--fc-highlight-color': token.colorPrimaryBg,
    '--fc-non-business-color': token.colorFillQuaternary,
    '--fc-small-font-size': `${token.fontSizeSM}px`,

    // Custom Variables for overrides.css
    '--fc-header-bg': token.colorFillAlter,
    '--fc-header-padding': `${token.paddingSM}px 0`,
    '--fc-header-border-bottom': `${token.lineWidthBold}px solid ${token.colorBorder}`,
    '--fc-today-text-color': token.colorPrimary,
    '--fc-day-number-padding': `${token.paddingXS}px`,
    '--fc-day-number-opacity': '1',
    '--fc-grid-border': 'none',
    '--fc-day-number-font-size': `${token.fontSize}px`,

    // Week numbers
    '--fc-week-number-bg': token.colorFillAlter,
    '--fc-week-number-color': token.colorTextDescription,
    '--fc-week-number-font-size': `${token.fontSizeSM - 2}px`,

    // Tooltip
    '--fc-tooltip-z-index': `${token.zIndexPopupBase + 100}`,

    // Events - Backgrounds & Colors (Defaults)
    '--fc-event-border-color': token.colorPrimary,
    '--fc-event-text-color': token.colorWhite,
    '--fc-bg-event-color': token.colorPrimary,
    '--fc-bg-event-opacity': 0.1,

    // More Link (DayGrid)
    '--fc-more-link-text-color': token.colorPrimary,
    '--fc-more-link-bg-color': 'transparent',

    // List View specific
    '--fc-list-event-hover-bg-color': token.colorFillAlter,
    '--fc-list-event-dot-width': '8px',
  } as React.CSSProperties;

  return {
    calendarStyles,
  };
};
