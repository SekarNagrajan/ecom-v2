import { theme } from 'antd';
import { useMemo } from 'react';

import type { ChartTokens } from './chart-types';

/**
 * djb2-style hash collapsed to a base-36 string. Produces a deterministic,
 * short identifier for the current token set so we can name and re-register
 * the ECharts theme when AntD tokens change.
 */
function hashTokens(parts: ReadonlyArray<string | number>): string {
  const joined = parts.join('|');
  let hash = 5381;
  for (let i = 0; i < joined.length; i += 1) {
    hash = ((hash << 5) + hash + joined.charCodeAt(i)) | 0;
  }
  return (hash >>> 0).toString(36);
}

/**
 * Reads AntD design tokens via `theme.useToken()` and projects them into a
 * chart-flavored token bundle. Option factories accept these tokens directly
 * so all axes, tooltips, legends, and series colors track the AntD theme
 * without relying solely on `echarts.registerTheme`.
 *
 * Identity stability is intentional and load-bearing — ECharts is an
 * imperative library where chart-option object identity drives extra
 * `setOption` calls. By memoizing on a hash of the visually-meaningful
 * primitives, every consumer that depends on `[tokens]` (or
 * `[tokens.themeName]`) gets a stable reference across renders that don't
 * change the visible theme. This is the imperative-library exception
 * called out in the workspace coding directives.
 */
export function useChartTokens(): ChartTokens {
  const { token } = theme.useToken();

  const themeName = `solverminds-${hashTokens([
    token.colorPrimary,
    token.colorBgContainer,
    token.colorText,
    token.colorBorder,
    token.fontFamily,
  ])}`;

  return useMemo<ChartTokens>(
    () => ({
      colorText: token.colorText,
      colorTextSecondary: token.colorTextSecondary,
      colorTextTertiary: token.colorTextTertiary,
      colorBorder: token.colorBorder,
      colorBorderSecondary: token.colorBorderSecondary,
      colorBgContainer: token.colorBgContainer,
      colorBgElevated: token.colorBgElevated,
      colorBgLayout: token.colorBgLayout,
      colorPrimary: token.colorPrimary,
      colorSuccess: token.colorSuccess,
      colorWarning: token.colorWarning,
      colorError: token.colorError,
      colorInfo: token.colorInfo,
      colorPurple: token.purple,
      colorCyan: token.cyan,
      fontFamily: token.fontFamily,
      fontSize: token.fontSize,
      fontSizeSM: token.fontSizeSM,
      borderRadius: token.borderRadius,
      themeName,
      palette: [
        token.colorPrimary,
        token.colorSuccess,
        token.colorWarning,
        token.colorError,
        token.purple,
        token.cyan,
        token.colorPrimaryActive,
        token.colorSuccessActive,
        token.colorWarningActive,
        token.colorErrorActive,
      ],
    }),
    // `themeName` is a hash of every visually-meaningful primitive — when it
    // doesn't change, the returned tokens object is identity-stable across
    // renders so every downstream `useMemo([..., tokens])` skips its work.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [themeName]
  );
}
