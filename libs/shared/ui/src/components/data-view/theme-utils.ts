import {
  colorSchemeDark,
  colorSchemeLight,
  iconSetQuartz,
  themeQuartz,
  type Theme,
  type ThemeDefaultParams,
} from "ag-grid-community";
import { theme as antdTheme } from "antd";
import { useMemo } from "react";

import { useAppConfig } from "../../hooks";
import type { DensityLevel } from "../../providers/types";

type AgGridDensityThemeParams = Required<
  Pick<
    ThemeDefaultParams,
    | "spacing"
    | "cellHorizontalPadding"
    | "inputHeight"
    | "listItemHeight"
    | "inputBorderRadius"
    | "rowHeight"
    | "headerHeight"
  >
>;

type AgGridRuntimeSizing = {
  floatingFiltersHeight: number;
  headerHeight: number;
  rowHeight: number;
};

type AgGridDensityConfig = {
  themeParams: AgGridDensityThemeParams;
  runtimeSizing: AgGridRuntimeSizing;
};

type AntdToken = ReturnType<typeof antdTheme.useToken>["token"];
const BASE_AG_GRID_THEME = themeQuartz.withPart(iconSetQuartz);

function getAgGridDensityConfig(
  token: AntdToken,
  density: DensityLevel,
): AgGridDensityConfig {
  const densityParamsMap: Record<DensityLevel, AgGridDensityConfig> = {
    compact: {
      themeParams: {
        spacing: token.paddingXXS,
        cellHorizontalPadding: token.paddingSM,
        inputHeight: token.controlHeightSM,
        listItemHeight: token.controlHeightSM,
        inputBorderRadius: token.borderRadiusXS,
        rowHeight: token.controlHeightSM,
        headerHeight: token.controlHeightSM,
      },
      runtimeSizing: {
        rowHeight: token.controlHeightSM,
        headerHeight: token.controlHeightSM,
        // Bumped one tier above the inner input height (controlHeightSM)
        // so the floating filter input always has vertical breathing room.
        floatingFiltersHeight: token.controlHeight,
      },
    },
    normal: {
      themeParams: {
        spacing: token.paddingXS,
        cellHorizontalPadding: token.paddingMD,
        inputHeight: token.controlHeight,
        listItemHeight: token.controlHeight,
        inputBorderRadius: token.borderRadiusSM,
        rowHeight: token.controlHeight,
        headerHeight: token.controlHeight,
      },
      runtimeSizing: {
        rowHeight: token.controlHeight,
        headerHeight: token.controlHeight,
        floatingFiltersHeight: token.controlHeight,
      },
    },
    comfortable: {
      themeParams: {
        spacing: token.paddingSM,
        cellHorizontalPadding: token.paddingLG,
        inputHeight: token.controlHeightLG,
        listItemHeight: token.controlHeightLG,
        inputBorderRadius: token.borderRadiusLG,
        rowHeight: token.controlHeightLG,
        headerHeight: token.controlHeightLG,
      },
      runtimeSizing: {
        rowHeight: token.controlHeightLG,
        headerHeight: token.controlHeightLG,
        floatingFiltersHeight: token.controlHeightLG,
      },
    },
  };

  return densityParamsMap[density];
}

// Dark-mode hover sits on the same `elevated` step as the AntD Table
// `rowHoverBg` so a row hover reads identically across the two grid
// systems. See `DARK_NEUTRAL` in `providers/theme-builder.ts` for the
// full ramp this color belongs to.
function getAgGridRowHoverColor(isDark: boolean): string {
  return isDark ? "#1F1F1F" : "#e4e8ee";
}

function buildAgGridThemeParams({
  token,
  isDark,
  densityParams,
}: {
  token: ReturnType<typeof antdTheme.useToken>["token"];
  isDark: boolean;
  densityParams: AgGridDensityThemeParams;
}): Partial<ThemeDefaultParams> {
  return {
    // 1. COLORS
    accentColor: token.colorPrimary,
    invalidColor: token.colorError,
    browserColorScheme: isDark ? "dark" : "light",

    // Backgrounds & Text
    backgroundColor: token.colorBgContainer,
    foregroundColor: token.colorText,
    textColor: token.colorText,
    subtleTextColor: token.colorTextTertiary,
    headerBackgroundColor: token.colorBgContainer,
    // Light theme uses the Figma redesign's slate header color so column
    // labels read as deliberate UI affordances rather than secondary text.
    // Dark theme keeps the AntD secondary token for proper contrast.
    headerTextColor: isDark ? token.colorTextSecondary : "#2D3E50",
    // Modified by Sekar Nagarajan (2026-08-31 16:49) — no zebra striping; rows separated by rowBorder only
    //oddRowBackgroundColor: isDark ? '#171717' : '#F6F8FF',
    oddRowBackgroundColor: token.colorBgContainer,
    rowHoverColor: getAgGridRowHoverColor(isDark),
    selectedRowBackgroundColor: token.controlItemBgActive,
    rangeSelectionBackgroundColor: token.controlItemBgHover,

    // Borders
    borderColor: token.colorBorderSecondary,
    checkboxUncheckedBorderColor: token.colorBorder,
    checkboxCheckedBorderColor: token.colorPrimary,
    checkboxCheckedBackgroundColor: token.colorPrimary,
    // Full wrapping border around the entire grid (headers + floating filter
    // row + data rows) so the table reads as a single bordered surface even
    // when its host container provides no border of its own.
    wrapperBorder: {
      color: token.colorBorder,
      style: "solid",
      width: 1,
    },
    rowBorder: true,
    // Drop the vertical inter-column borders for both data and header rows;
    // the table reads as horizontal rows separated only by `rowBorder`.
    columnBorder: false,
    headerColumnBorder: false,
    // Keep a visible divider on the boundary between pinned and non-pinned
    // columns so left-pinned action columns still feel anchored when the
    // user scrolls horizontally.
    pinnedColumnBorder: {
      color: token.colorBorder,
      style: "solid",
      width: 1,
    },
    // Stronger horizontal divider between header / floating-filter / data rows
    // so the filter input row reads as a distinct band even when its
    // background matches the header.
    headerRowBorder: {
      color: token.colorBorder,
      style: "solid",
      width: 1,
    },

    // 2. TYPOGRAPHY
    // Headers and cells render 2px smaller than the AntD body font so the
    // grid feels denser without changing density-driven row/header heights.
    fontFamily: token.fontFamily,
    fontSize: token.fontSize - 2,
    dataFontSize: token.fontSize - 2,
    headerFontFamily: token.fontFamily,
    headerFontSize: token.fontSize - 2,
    // Medium weight (500) — lighter than AntD's `fontWeightStrong` (600) so
    // header labels feel like quiet UI affordances next to the slate color,
    // not bold typographic emphasis competing with the cell values.
    headerFontWeight: 500,

    // 3. SPACING & SHAPE
    // Match the toolbar card above the grid (`borderRadiusSM`) so both
    // surfaces read as part of the same data-view frame.
    borderRadius: token.borderRadiusSM,
    headerColumnResizeHandleWidth: 2,
    ...densityParams,
  };
}

export function useAgGridTheme(): Theme {
  const { token } = antdTheme.useToken();
  const { effectiveThemeMode, density } = useAppConfig();
  const isDark = effectiveThemeMode === "dark";

  return useMemo(() => {
    const densityConfig = getAgGridDensityConfig(token, density);

    return BASE_AG_GRID_THEME.withPart(
      isDark ? colorSchemeDark : colorSchemeLight,
    ).withParams(
      buildAgGridThemeParams({
        token,
        isDark,
        densityParams: densityConfig.themeParams,
      }),
    );
  }, [density, isDark, token]);
}

export function useAgGridRuntimeSizing(): AgGridRuntimeSizing {
  const { token } = antdTheme.useToken();
  const { density } = useAppConfig();

  return useMemo(
    () => getAgGridDensityConfig(token, density).runtimeSizing,
    [density, token],
  );
}
