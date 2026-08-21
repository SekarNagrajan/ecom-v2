import './top-loading-bar.css';

import { theme } from 'antd';
import type { CSSProperties } from 'react';

interface TopLoadingBarProps {
  /** When true, the bar is mounted and (after `delay`) faded in. */
  active: boolean;
  /**
   * Delay in ms before the bar becomes visible after mount. Avoids a flash
   * for very fast responses. Defaults to 200ms.
   */
  delay?: number;
  /** Optional style overrides for the outer bar wrapper. */
  style?: CSSProperties;
  /** Optional className to compose with the default `top-loading-bar`. */
  className?: string;
}

/**
 * Thin animated indeterminate progress bar that anchors to the top edge of
 * the nearest positioned ancestor (which must set `position: relative` or
 * equivalent).
 *
 * Use as a non-blocking refetch indicator in place of dim overlays — keeps
 * the underlying content fully visible and interactive while a background
 * refresh is in flight. The fade-in delay is handled in CSS so the
 * component stays stateless and re-mounts cleanly across toggles.
 *
 * The CRM `DataView` views (list / card / kanban) render this automatically
 * during refetches, so individual features only need to reach for it
 * directly when they manage their own list state (e.g. activity surfaces).
 */
export function TopLoadingBar({
  active,
  delay = 200, // 200ms — avoids flicker for fast responses
  style,
  className,
}: TopLoadingBarProps) {
  const { token } = theme.useToken();

  if (!active) {
    return null;
  }

  return (
    <div
      className={className ? `top-loading-bar ${className}` : 'top-loading-bar'}
      role="progressbar"
      aria-busy="true"
      aria-label="Loading"
      style={{
        background: token.colorPrimaryBg,
        animationDelay: `${delay}ms`,
        ...style,
      }}
    >
      <div
        className="top-loading-bar__bar"
        style={{ background: token.colorPrimary }}
      />
    </div>
  );
}
