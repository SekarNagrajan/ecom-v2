import './segmented-button-tabs.css';

import { theme } from 'antd';
import {
  useId,
  type CSSProperties,
  type ChangeEvent,
  type ReactNode,
} from 'react';

// Modified by Sekar Nagarajan (2026-07-28 13:00)
export interface AppSegmentedButtonTabItem {
  key: string;
  label: ReactNode;
  children?: ReactNode;
  disabled?: boolean;
  /**
   * Accessible name for the underlying radio input. Required when `label`
   * is icon-only (no visible text) so screen readers still announce the
   * option's purpose.
   */
  ariaLabel?: string;
}

export type AppSegmentedButtonTabsSize = 'sm' | 'md' | 'lg';

export interface AppSegmentedButtonTabsProps {
  items: AppSegmentedButtonTabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  /** Stretch each tab to share the available width equally. */
  fullWidth?: boolean;
  /**
   * Visual sizing of each tab.
   * - `lg`: roomy, page-level switcher
   * - `md`: compact toolbar switcher (default)
   * - `sm`: dense, inline filter chip
   * @default 'md'
   */
  size?: AppSegmentedButtonTabsSize;
  /** Inline styles for the outer wrapper. */
  style?: CSSProperties;
  /** Inline styles for the tab bar (button row) wrapper. */
  tabBarStyle?: CSSProperties;
  /** Inline styles for the active panel content wrapper. */
  contentStyle?: CSSProperties;
  className?: string;
  ariaLabel?: string;
}

/**
 * Card-button style tab strip backed by a native `radiogroup` of `<label>`s
 * wrapping hidden `<input type="radio">`s. Behaves like a tablist visually
 * while delegating keyboard navigation, focus management, and ARIA semantics
 * to the browser's native radio-group behavior.
 *
 * Implementation note: the trigger is a `<label>` per option (not a
 * `<button>`), so labels can safely render their own interactive children
 * (e.g. tab labels with their own toggle button) without nesting buttons.
 * Per the HTML spec, clicking an interactive descendant of a `<label>` does
 * not re-dispatch the click to the labelled input, so inner buttons fire
 * normally instead of toggling the tab.
 */
export function AppSegmentedButtonTabs({
  items,
  activeKey,
  onChange,
  fullWidth = false,
  size = 'md',
  style,
  tabBarStyle,
  contentStyle,
  className,
  ariaLabel,
}: AppSegmentedButtonTabsProps) {
  const { token } = theme.useToken();
  const groupName = useId();
  const activeItem = items.find((item) => item.key === activeKey);

  const sizeTokens = getSegmentedSizeTokens(size, token);

  const cssVars = {
    '--seg-tabs-gap': `${token.paddingXS}px`,
    '--seg-tabs-bg': token.colorBgContainer,
    '--seg-tabs-border': token.colorBorderSecondary,
    '--seg-tabs-text': token.colorText,
    '--seg-tabs-radius': `${token.borderRadiusSM}px`,
    '--seg-tabs-padding-block': `${sizeTokens.paddingBlock}px`,
    '--seg-tabs-padding-inline': `${sizeTokens.paddingInline}px`,
    '--seg-tabs-font-size': `${sizeTokens.fontSize}px`,
    '--seg-tabs-font-weight': `${sizeTokens.fontWeight}`,
    '--seg-tabs-active-bg': token.colorPrimaryBg,
    '--seg-tabs-active-text': token.colorPrimary,
    '--seg-tabs-active-border': token.colorPrimaryBg,
    '--seg-tabs-active-hover-bg': token.colorPrimaryBgHover,
    '--seg-tabs-active-font-weight': `${sizeTokens.activeFontWeight}`,
    '--seg-tabs-hover-bg': token.colorFillQuaternary,
    '--seg-tabs-disabled-bg': token.colorBgContainerDisabled,
    '--seg-tabs-disabled-text': token.colorTextDisabled,
    '--seg-tabs-disabled-border': token.colorBorderSecondary,
    '--seg-tabs-focus-color': token.colorPrimary,
    '--seg-tabs-line-height': `${sizeTokens.lineHeight}`,
    '--seg-tabs-transition': `${token.motionDurationMid} ${token.motionEaseInOut}`,
  } as CSSProperties;

  const handleChange =
    (key: string) => (event: ChangeEvent<HTMLInputElement>) => {
      if (event.target.checked) {
        onChange(key);
      }
    };

  return (
    <div className={className} style={style}>
      <div
        role="radiogroup"
        aria-label={ariaLabel}
        className="segmented-button-tabs__bar"
        data-size={size}
        style={{ ...cssVars, ...tabBarStyle }}
      >
        {items.map((item) => {
          const isActive = item.key === activeKey;
          const itemClassName = [
            'segmented-button-tabs__item',
            isActive && 'segmented-button-tabs__item--active',
            item.disabled && 'segmented-button-tabs__item--disabled',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <label
              key={item.key}
              className={itemClassName}
              style={fullWidth ? { flex: 1 } : undefined}
            >
              <input
                type="radio"
                name={groupName}
                value={item.key}
                checked={isActive}
                disabled={item.disabled}
                onChange={handleChange(item.key)}
                aria-label={item.ariaLabel}
                className="segmented-button-tabs__input"
              />
              <span className="segmented-button-tabs__label">{item.label}</span>
            </label>
          );
        })}
      </div>

      {activeItem ? (
        <div style={contentStyle}>{activeItem.children}</div>
      ) : null}
    </div>
  );
}

interface SizeTokens {
  paddingBlock: number;
  paddingInline: number;
  fontSize: number;
  lineHeight: number;
  fontWeight: number;
  activeFontWeight: number;
}

function getSegmentedSizeTokens(
  size: AppSegmentedButtonTabsSize,
  token: ReturnType<typeof theme.useToken>['token']
): SizeTokens {
  // Inactive tabs use regular weight; active tabs use medium so the selection
  // reads as emphasized without leaning on a heavy semibold.
  const regularFontWeight = token.fontWeightStrong - 200;
  const mediumFontWeight = token.fontWeightStrong - 100;
  const strongFontWeight = token.fontWeightStrong;

  if (size === 'sm') {
    return {
      paddingBlock: token.paddingXXS,
      paddingInline: token.paddingSM,
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM,
      fontWeight: regularFontWeight,
      activeFontWeight: mediumFontWeight,
    };
  }

  if (size === 'lg') {
    return {
      paddingBlock: token.paddingSM,
      paddingInline: token.paddingLG,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      fontWeight: mediumFontWeight,
      activeFontWeight: strongFontWeight,
    };
  }

  return {
    paddingBlock: token.paddingXS,
    paddingInline: token.padding,
    fontSize: token.fontSizeSM,
    lineHeight: token.lineHeightSM,
    fontWeight: regularFontWeight,
    activeFontWeight: mediumFontWeight,
  };
}
