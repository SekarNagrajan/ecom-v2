import { type ThemeConfig, theme as antdTheme } from 'antd';

import { SPACING, BREAKPOINTS } from './constants';
import type {
  AppCustomConfig,
  DensityLevel,
  LineHeightLevel,
  ThemeMode,
} from './types';

// =============================================================================
// Density scaling — single multiplier per level.
// To adjust a density, change ONE number in DENSITY_SCALES.
// =============================================================================

const DENSITY_SCALES: Record<DensityLevel, number> = {
  compact: 0.85,
  normal: 1.0,
  comfortable: 1.15,
};

const DENSITY_COMPONENT_SIZE: Record<
  DensityLevel,
  'small' | 'middle' | 'large'
> = {
  compact: 'small',
  normal: 'middle',
  comfortable: 'large',
};

const SEGMENTED_TRACK_PADDING: Record<DensityLevel, number> = {
  compact: 2,
  normal: 2,
  comfortable: 3,
};

const BASE_CONTROL_HEIGHTS = {
  SM: 28,
  MD: 32,
  LG: 40,
} as const;

const BASE_CONTROL_PADDINGS = {
  SM: SPACING.SM,
  MD: SPACING.MD,
} as const;

function roundToEven(value: number): number {
  return Math.max(2, Math.round(value / 2) * 2);
}

function resolveDensityScale(density: DensityLevel, isMobile: boolean): number {
  const base = DENSITY_SCALES[density];
  if (isMobile && density !== 'compact') {
    return base * 0.85;
  }
  return base;
}

function resolveControlPaddingBlock(
  controlHeight: number,
  fontHeight: number,
  lineWidth = 1
): number {
  return Math.max((controlHeight - fontHeight) / 2 - lineWidth, 0);
}

// =============================================================================
// Pure helper functions for constructing the AntD theme from AppCustomConfig.
// Kept as plain functions so React Compiler can memoize call-sites automatically.
// =============================================================================

/** Resolve the effective theme mode when 'auto' is used. */
export function resolveThemeMode(
  themeMode: ThemeMode,
  systemTheme: 'light' | 'dark'
): 'light' | 'dark' {
  return themeMode === 'auto' ? systemTheme : themeMode;
}

/** Map the lineHeight level string to a numeric value. */
export function resolveLineHeight(level: LineHeightLevel): number {
  switch (level) {
    case 'tight':
      return 1.25;
    case 'relaxed':
      return 1.75;
    default:
      return 1.5;
  }
}

/** Map density level to AntD componentSize. */
export function resolveComponentSize(
  density: DensityLevel
): 'small' | 'middle' | 'large' {
  return DENSITY_COMPONENT_SIZE[density];
}

// =============================================================================
// Color palette — single source of truth for every mode-dependent color.
//
// Both palettes share the exact same shape (`Palette`), so:
//   - TypeScript catches any token added to one mode but missed in the other.
//   - Component overrides below read `palette.X` instead of writing
//     `isDark ? a : b` inline — adjusting a color is a one-place edit.
//
// To retune the whole app's color story, change values in `LIGHT_PALETTE`
// or `DARK_PALETTE`. To add a new mode-dependent token, add it once to
// the `Palette` interface and the compiler will require it in both maps.
// =============================================================================

interface Palette {
  // ---------- Surfaces (progressive elevation) ----------
  /** Cards, sidebar, modals, drawers — the primary content surface. */
  surface: string;
  /** Body wash sitting behind surfaces. */
  layout: string;
  /** Popovers, dropdowns, tooltips — floating above any surface. */
  elevated: string;
  /** Recessed control wells: input bg, segmented control track. */
  inputBg: string;
  segmentedTrackBg: string;
  /** Selected segmented item — lifted out of the track. */
  segmentedSelectedBg: string;

  // ---------- Borders ----------
  border: string;
  borderSubtle: string;
  /** Form-control borders. Kept separate so light can stay softer than `border`. */
  fieldBorder: string;

  // ---------- Text + icons ----------
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textPlaceholder: string;
  iconDefault: string;
  iconHover: string;

  // ---------- Disabled state (global) ----------
  /**
   * Fill behind disabled controls (Input, Select, TextArea, InputNumber,
   * DatePicker, Button, Checkbox, Radio, Switch, Pagination, etc.). One
   * ramp step "off" from `inputBg` so disabled controls read as recessed
   * / inert instead of editable. AntD wires this to the global
   * `colorBgContainerDisabled` semantic token.
   */
  disabledBg: string;
  /**
   * Text, label, icon and placeholder color inside any disabled control.
   * Also drives `Empty.description`, disabled menu items, disabled tab
   * labels and disabled pagination chevrons. AntD wires this to the
   * global `colorTextDisabled` semantic token.
   */
  disabledText: string;

  // ---------- Inline field chrome ----------
  /**
   * Background of decorations *inside* a field — `Input.Group` addons
   * (a `$` prefix box, search button on the right of an input, etc.) and
   * the chip background for `Select mode="multiple"` tags. One ramp step
   * lifted/recessed from `inputBg` so the chrome reads as distinct from
   * the editable body. Wires to the `Input.addonBg` and
   * `Select.multipleItemBg` component tokens.
   */
  inputAddonBg: string;

  // ---------- Tooltip ----------
  /**
   * Background of Tooltip / spotlight surfaces. Tooltips intentionally
   * sit *outside* the regular surface ramp so they always pop:
   *   - Light: a deep near-black (`textPrimary`) with white text — the
   *     classic inverted-tooltip pattern.
   *   - Dark: one step *brighter* than every other surface in the dark
   *     ramp so tooltips stand off the deepest card / popover layers.
   * Wires to the global `colorBgSpotlight` semantic token.
   */
  tooltipBg: string;

  // ---------- Component-specific (couldn't be derived without losing fidelity) ----------
  /** Sidebar (Menu) row hover. Selected row uses `config.primaryColor`. */
  menuItemHoverBg: string;
  /** Resting + selected label colors inside a Segmented control. */
  segmentedItemColor: string;
  segmentedItemSelectedColor: string;
  /** Table header tint (one notch off the card surface). */
  tableHeaderBg: string;
  /** Table row hover tint. */
  tableRowHoverBg: string;
  /**
   * Color of text/icons drawn on top of `config.primaryColor` (selected
   * sidebar pill, primary buttons, etc.). Pure white in both modes today
   * because every supported brand primary is dark enough — lives in the
   * palette so a future high-contrast brand can flip it without hunting
   * for hardcoded `'#FFFFFF'` strings.
   */
  onPrimary: string;
}

/**
 * Light-mode palette (Figma redesign): neutral grey app wash (#F5F5F5)
 * for the header + body around floating white surfaces (sidebar,
 * toolbar, grid, drawers).
 */
const LIGHT_PALETTE: Palette = {
  surface: '#FFFFFF',
  layout: '#F5F5F5',
  elevated: '#FFFFFF',
  inputBg: '#FFFFFF',
  segmentedTrackBg: '#EFF1F4',
  segmentedSelectedBg: '#FFFFFF',

  border: '#E5E7EB',
  borderSubtle: '#EFF1F4',
  fieldBorder: '#D5D9E0',

  textPrimary: '#1A1A1A',
  textSecondary: '#5C5F66',
  textTertiary: '#9CA0A8',
  textPlaceholder: '#B0B4BC',
  iconDefault: '#5C5F66',
  iconHover: '#1A1A1A',

  // Disabled fill is the `layout` step (#F5F5F5) — one shade darker than
  // the white `inputBg` so disabled controls visibly recess. Disabled
  // text reuses `textTertiary` so we don't introduce a new gray rung
  // (still ~3.5:1 against `disabledBg` — sufficient for inert affordances
  // per WCAG non-text-control guidance).
  disabledBg: '#F5F5F5',
  disabledText: '#9CA0A8',

  // Addon strips and multi-select chips share `layout` — one step darker
  // than the white input/selector body so they read as distinct chrome
  // attached to the field rather than part of the editable surface.
  inputAddonBg: '#F5F5F5',

  // Inverted dark tooltip (white text) — same near-black as primary text
  // so the popup pops off every light surface in the app.
  tooltipBg: '#1A1A1A',

  menuItemHoverBg: '#F1F2F4',
  segmentedItemColor: '#475569',
  segmentedItemSelectedColor: '#0f172a',
  tableHeaderBg: '#F8F9FB',
  tableRowHoverBg: '#F5F6F8',
  onPrimary: '#FFFFFF',
};

/**
 * Dark-mode palette anchored to the two Figma-supplied base colors:
 *
 *   surface  #0D0D0D  ← cards, sidebar, modals, drawers (Figma anchor)
 *   layout   #171717  ← body wash, input bg, segmented track, table header
 *                       (Figma anchor)
 *   elevated #1F1F1F  ← popovers/dropdowns, menu+row hover, subtle divider
 *   raised   #262626  ← selected segmented item, strongest hover
 *   border   #2E2E2E  ← default border — visible on both surface AND layout
 *
 * Note the inversion vs light: in light, cards are LIGHTER than the body
 * wash (white on grey); in dark, cards are DARKER than the body wash
 * (deep-black on near-black). Inputs and segmented tracks borrow the
 * lighter `layout` color so they read as lifted "wells" on top of the
 * deeper card surface — the dark-mode mirror of the light-mode pattern
 * where input bg matches card bg and only the border distinguishes them.
 */
const DARK_PALETTE: Palette = {
  surface: '#0D0D0D',
  layout: '#171717',
  elevated: '#1F1F1F',
  inputBg: '#171717',
  segmentedTrackBg: '#171717',
  segmentedSelectedBg: '#262626',

  border: '#2E2E2E',
  borderSubtle: '#1F1F1F',
  fieldBorder: '#2E2E2E',

  textPrimary: '#F5F5F5',
  textSecondary: '#A3A3A3',
  textTertiary: '#737373',
  textPlaceholder: '#525252',
  iconDefault: '#A3A3A3',
  iconHover: '#F5F5F5',

  // Disabled fill is the `surface` step (#0D0D0D) — one shade DARKER than
  // the `inputBg` (#171717) so disabled controls visibly recess into the
  // card behind them (mirror of the light-mode pattern where disabled
  // pulls toward `layout`). Disabled text reuses `textTertiary` so we
  // don't introduce a new gray rung.
  disabledBg: '#0D0D0D',
  disabledText: '#737373',

  // Addon strips and multi-select chips ride the `elevated` step
  // (#1F1F1F) — one shade *lighter* than the `inputBg` (#171717), the
  // dark-mode mirror of the light pattern. Also stays visibly distinct
  // from `disabledBg` (#0D0D0D), so disabled multi-select tags don't
  // dissolve into the disabled wrapper.
  inputAddonBg: '#1F1F1F',

  // Tooltip rides the highest gray rung (#262626) — brighter than every
  // surface in the dark ramp (`surface` / `layout` / `elevated`) so the
  // popup reads as floating above whatever it's anchored to. White text
  // on this gray hits ~13:1 contrast (WCAG AAA).
  tooltipBg: '#262626',

  menuItemHoverBg: '#1F1F1F',
  segmentedItemColor: '#A3A3A3',
  segmentedItemSelectedColor: '#F5F5F5',
  tableHeaderBg: '#171717',
  tableRowHoverBg: '#1F1F1F',
  onPrimary: '#FFFFFF',
};

function getPalette(isDark: boolean): Palette {
  return isDark ? DARK_PALETTE : LIGHT_PALETTE;
}

// -----------------------------------------------------------------------------
// Main theme builder
// -----------------------------------------------------------------------------

interface BuildThemeParams {
  config: AppCustomConfig;
  effectiveThemeMode: 'light' | 'dark';
  isMobile: boolean;
  antdThemeOverrides?: ThemeConfig;
}

/**
 * Build the full AntD ThemeConfig from application config.
 * Pure function — no hooks, no side effects.
 */
export function buildAntdTheme({
  config,
  effectiveThemeMode,
  isMobile,
  antdThemeOverrides,
}: BuildThemeParams): ThemeConfig {
  // Density — single scale factor drives all spatial values
  const scale = resolveDensityScale(config.density, isMobile);
  const adjust = (value: number) => Math.round(value * scale);
  const adjustEven = (value: number) => roundToEven(value * scale);

  const controlHeightSM = adjustEven(BASE_CONTROL_HEIGHTS.SM);
  const controlHeight = adjustEven(BASE_CONTROL_HEIGHTS.MD);
  const selectHeight = adjustEven(BASE_CONTROL_HEIGHTS.MD);
  const controlHeightLG = adjustEven(BASE_CONTROL_HEIGHTS.LG);
  const controlPaddingHorizontalSM = adjustEven(BASE_CONTROL_PADDINGS.SM);
  const controlPaddingHorizontal = adjustEven(BASE_CONTROL_PADDINGS.MD);
  const fieldPaddingHorizontalSM = controlPaddingHorizontalSM;
  const fieldPaddingHorizontal = controlPaddingHorizontalSM;
  const fieldPaddingHorizontalLG = controlPaddingHorizontal;
  const segmentedTrackPadding = SEGMENTED_TRACK_PADDING[config.density];

  // Algorithms
  const algorithms = [];
  if (effectiveThemeMode === 'dark') {
    algorithms.push(antdTheme.darkAlgorithm);
  } else {
    algorithms.push(antdTheme.defaultAlgorithm);
  }

  // Typography & layout — read directly from config. Consumer apps decide
  // whether to expose these as user-facing controls or to derive them from
  // their own knobs (e.g. crm-portal derives them from `density`).
  const effectiveFontSize = isMobile
    ? config.baseFontSize - 1
    : config.baseFontSize;
  const effectiveBorderRadius = isMobile
    ? Math.round(config.borderRadius * 0.8)
    : config.borderRadius;
  const lineHeight = resolveLineHeight(config.lineHeight);
  const fieldFontSize = effectiveFontSize;
  const fieldFontSizeLG = effectiveFontSize + 2;
  const fieldFontHeight = Math.round(fieldFontSize * lineHeight);
  const fieldFontHeightLG = Math.round(fieldFontSizeLG * lineHeight);

  // Colors — every mode-dependent value is read from `palette`, never an
  // inline `isDark ? ... : ...` ternary. Add new color tokens to the
  // `Palette` interface above so both modes are forced to define them.
  const isDark = effectiveThemeMode === 'dark';
  const palette = getPalette(isDark);
  const inputHoverBorderColor = config.primaryColor;
  const inputActiveBorderColor = config.primaryColor;
  // 16% alpha primary ring; AntD multiplies this against `controlOutlineWidth`.
  const inputActiveShadow = `0 0 0 2px ${config.primaryColor}29`;
  // Form controls (input/select/number/date) sit on a tighter radius than
  // surface containers to match the Figma redesign — keep ~75% of the global
  // radius so dense rows of fields don't feel pill-y.
  const inputBorderRadius = Math.max(
    Math.round(effectiveBorderRadius * 0.75),
    4
  );
  // Custom tokens for non-AntD-Input form controls (e.g. AppCombobox's button
  // trigger, rich-text editor wrapper) so they share the same surface
  // treatment as native Input/Select/InputNumber/DatePicker fields.
  const fieldSurfaceTokens = {
    colorFieldBg: palette.inputBg,
    colorFieldBorder: palette.fieldBorder,
    colorFieldBorderHover: inputHoverBorderColor,
    colorFieldBorderActive: inputActiveBorderColor,
    fieldActiveShadow: inputActiveShadow,
  } as Record<string, string>;
  const fieldRadiusTokens = {
    borderRadiusField: inputBorderRadius,
  } as Record<string, number>;
  const cardPadding = adjust(SPACING.MD);
  const cardPaddingSM = adjust(SPACING.SM);
  const cardHeaderHeight = Math.round(
    (effectiveFontSize + 2) * lineHeight + adjust(SPACING.MD) * 2
  );
  const formItemMarginBottom = adjust(SPACING.MD);
  const inlineItemMarginBottom = adjust(SPACING.SM);
  const verticalLabelSpacing = adjust(SPACING.XS);
  const buttonFontSizeSM = Math.max(effectiveFontSize - 1, 12);
  const buttonFontSize = effectiveFontSize;
  const buttonFontSizeLG =
    config.density === 'comfortable'
      ? effectiveFontSize + 2
      : effectiveFontSize + 1;
  const buttonLineHeight = 1.5;
  const buttonPaddingBlockSM = Math.max(
    Math.round((controlHeightSM - buttonFontSizeSM * buttonLineHeight) / 2 - 1),
    0
  );
  const buttonPaddingBlock = Math.max(
    Math.round((controlHeight - buttonFontSize * buttonLineHeight) / 2 - 1),
    0
  );
  const buttonPaddingBlockLG = Math.max(
    Math.round((controlHeightLG - buttonFontSizeLG * buttonLineHeight) / 2 - 1),
    0
  );
  const selectOptionVerticalPadding = Math.max(
    adjust(SPACING.XS),
    Math.round((controlHeight - effectiveFontSize * lineHeight) / 2)
  );
  const selectTypographyAliasTokens = {
    fontHeight: fieldFontHeight,
    fontHeightSM: fieldFontHeight,
    fontHeightLG: fieldFontHeightLG,
  } as Record<string, number>;

  return {
    ...antdThemeOverrides,
    algorithm: algorithms,
    cssVar: {
      prefix: 'sm',
      ...antdThemeOverrides?.cssVar,
    },
    token: {
      ...antdThemeOverrides?.token,
      ...fieldSurfaceTokens,
      ...fieldRadiusTokens,

      // Brand colors
      colorPrimary: config.primaryColor,
      colorSuccess: config.successColor,
      colorWarning: config.warningColor,
      colorError: config.errorColor,
      colorInfo: config.infoColor,

      // Backgrounds
      colorBgLayout: palette.layout,
      colorBgContainer: palette.surface,
      colorBgElevated: palette.elevated,
      // Single source of truth for every disabled control fill (Input,
      // Select, TextArea, InputNumber, DatePicker, Button, Checkbox,
      // Radio, Switch, Pagination, Segmented item, etc.). Without this,
      // AntD's algorithm default (`rgba(0,0,0,0.04)` light /
      // `rgba(255,255,255,0.08)` dark) is too faint to read against our
      // customized `inputBg`, so disabled fields look identical to enabled.
      colorBgContainerDisabled: palette.disabledBg,
      // Tooltip / Popconfirm spotlight bg. Without this, AntD falls back
      // to `rgba(0,0,0,0.85)` in both modes — readable in light but
      // barely distinguishable from a `surface` (#0D0D0D) card in dark.
      colorBgSpotlight: palette.tooltipBg,

      // Text hierarchy
      colorText: palette.textPrimary,
      colorTextSecondary: palette.textSecondary,
      colorTextTertiary: palette.textTertiary,
      colorTextPlaceholder: palette.textPlaceholder,
      // Drives disabled labels, disabled menu items, disabled tab titles,
      // disabled pagination chevrons, and the `Empty` description text.
      colorTextDisabled: palette.disabledText,
      colorIcon: palette.iconDefault,
      colorIconHover: palette.iconHover,

      // Borders
      colorBorder: palette.border,
      colorBorderSecondary: palette.borderSubtle,

      // Layout
      borderRadius: effectiveBorderRadius,

      // Typography
      fontFamily: config.fontFamily,
      fontSize: effectiveFontSize,
      lineHeight,
      lineHeightSM: lineHeight,
      lineHeightLG: lineHeight,
      ...selectTypographyAliasTokens,

      // Density-driven controls
      controlHeightSM,
      controlHeight,
      controlHeightLG,



      // Control padding
      controlPaddingHorizontal,
      controlPaddingHorizontalSM,

      // Padding system
      padding: adjust(SPACING.MD),
      paddingMD: adjust(SPACING.MD),
      paddingLG: adjust(SPACING.LG),
      paddingXL: adjust(SPACING.XL),
      paddingSM: adjust(SPACING.SM),
      paddingXS: adjust(SPACING.XS),
      paddingXXS: adjust(SPACING.XXS),

      // Content padding
      paddingContentHorizontal: adjust(SPACING.MD),
      paddingContentHorizontalLG: adjust(SPACING.LG),
      paddingContentHorizontalSM: adjust(SPACING.SM),
      paddingContentVertical: adjust(SPACING.MD),
      paddingContentVerticalLG: adjust(SPACING.LG),
      paddingContentVerticalSM: adjust(SPACING.SM),

      // Margin system
      margin: adjust(SPACING.MD),
      marginMD: adjust(SPACING.MD),
      marginLG: adjust(SPACING.LG),
      marginXL: adjust(SPACING.XL),
      marginSM: adjust(SPACING.SM),
      marginXS: adjust(SPACING.XS),
      marginXXS: adjust(SPACING.XXS),
      marginXXL: adjust(SPACING.XXL),
    },
    components: {
      Menu: {
        // Icon-only sidebar — match the Figma look: transparent default
        // rows, soft hover, and a square primary pill (onPrimary icon on
        // solid primary) for the active route. Geometry is tuned to the
        // 72px sidebar so the pill renders as a ~40x40 square.
        itemBg: 'transparent',
        subMenuItemBg: 'transparent',
        itemColor: palette.textSecondary,
        itemHoverBg: palette.menuItemHoverBg,
        itemHoverColor: palette.textPrimary,
        itemSelectedBg: config.primaryColor,
        itemSelectedColor: palette.onPrimary,
        iconSize: effectiveFontSize + 6,
        iconMarginInlineEnd: adjust(SPACING.SM),
        itemBorderRadius: 10,
        itemMarginInline: adjust(SPACING.MD),
        itemMarginBlock: 12,
        itemHeight: 40,
      },
      Button: {
        contentFontSize: buttonFontSize,
        contentFontSizeSM: buttonFontSizeSM,
        contentFontSizeLG: buttonFontSizeLG,
        contentLineHeight: buttonLineHeight,
        contentLineHeightSM: buttonLineHeight,
        contentLineHeightLG: buttonLineHeight,
        paddingInline: controlPaddingHorizontal,
        paddingInlineSM: controlPaddingHorizontalSM,
        paddingInlineLG: controlPaddingHorizontal,
        paddingBlock: buttonPaddingBlock,
        paddingBlockSM: buttonPaddingBlockSM,
        paddingBlockLG: buttonPaddingBlockLG,
      },
      Card: {
        extraColor: palette.textPrimary,
        headerHeight: cardHeaderHeight,
        headerHeightSM: cardHeaderHeight,
        headerPadding: cardPadding,
        bodyPadding: cardPadding,
        headerPaddingSM: cardPaddingSM,
        bodyPaddingSM: cardPaddingSM,
        // Card surface = palette.surface (white in light, deep-black in dark).
        colorBgContainer: palette.surface,
        headerBg: palette.surface,
      },
      Form: {
        itemMarginBottom: formItemMarginBottom,
        inlineItemMarginBottom,
        verticalLabelPadding: `0 0 ${verticalLabelSpacing}px`,
        verticalLabelMargin: 0,
        // Figma redesign: labels match the secondary text ramp at a slightly
        // smaller size with a strong weight so fields read as form rows
        // rather than headings.
        labelColor: palette.textSecondary,
        labelFontSize: Math.max(effectiveFontSize - 1, 12),
        labelHeight: Math.round(effectiveFontSize * lineHeight),
        labelRequiredMarkColor: config.errorColor,
      },
      Segmented: {
        trackPadding: segmentedTrackPadding,
        trackBg: palette.segmentedTrackBg,
        itemSelectedBg: palette.segmentedSelectedBg,
        itemColor: palette.segmentedItemColor,
        itemSelectedColor: palette.segmentedItemSelectedColor,
        fontWeightStrong: 600,
      },
      Input: {
        colorBgContainer: palette.inputBg,
        colorBorder: palette.fieldBorder,
        hoverBorderColor: inputHoverBorderColor,
        activeBorderColor: inputActiveBorderColor,
        activeShadow: inputActiveShadow,
        borderRadius: inputBorderRadius,
        borderRadiusSM: inputBorderRadius,
        borderRadiusLG: inputBorderRadius,
        inputFontSize: fieldFontSize,
        inputFontSizeSM: fieldFontSize,
        inputFontSizeLG: fieldFontSizeLG,
        paddingBlock: resolveControlPaddingBlock(
          controlHeight,
          fieldFontHeight
        ),
        paddingBlockSM: resolveControlPaddingBlock(
          controlHeightSM,
          fieldFontHeight
        ),
        paddingBlockLG: resolveControlPaddingBlock(
          controlHeightLG,
          fieldFontHeightLG
        ),
        paddingInline: fieldPaddingHorizontal,
        paddingInlineSM: fieldPaddingHorizontalSM,
        paddingInlineLG: fieldPaddingHorizontalLG,
        // `Input.Group` addon strips (prefix `$`, trailing search button,
        // etc.) sit one ramp step off from the editable body so they read
        // as attached chrome rather than blending into the input.
        addonBg: palette.inputAddonBg,
      },
      Select: {
        controlHeight: selectHeight,
        colorBgContainer: palette.inputBg,
        colorBorder: palette.fieldBorder,
        hoverBorderColor: inputHoverBorderColor,
        activeBorderColor: inputActiveBorderColor,
        activeOutlineColor: inputActiveShadow,
        borderRadius: inputBorderRadius,
        borderRadiusSM: inputBorderRadius,
        borderRadiusLG: inputBorderRadius,
        optionHeight: controlHeight,
        optionPadding: `${selectOptionVerticalPadding}px ${fieldPaddingHorizontalLG}px`,
        singleItemHeightLG: controlHeightLG,
        multipleItemHeightSM: Math.max(
          controlHeightSM - adjust(SPACING.XXS),
          16
        ),
        multipleItemHeight: Math.max(controlHeight - adjust(SPACING.XXS), 20),
        multipleItemHeightLG: Math.max(
          controlHeightLG - adjust(SPACING.XXS),
          24
        ),
        // Tag chips in multi-mode selectors share the same off-ramp color
        // as Input addons so the two "inline chrome" surfaces stay in sync.
        // Dark uses a distinctly *lighter* color than `disabledBg`, so
        // disabled multi-select tags stay visible against their disabled
        // wrapper (light mode relies on `multipleItemBorderColor` for the
        // same visual separation since both colors share the `layout` step).
        multipleItemBg: palette.inputAddonBg,
      },
      InputNumber: {
        colorBgContainer: palette.inputBg,
        colorBorder: palette.fieldBorder,
        hoverBorderColor: inputHoverBorderColor,
        activeBorderColor: inputActiveBorderColor,
        activeShadow: inputActiveShadow,
        borderRadius: inputBorderRadius,
        borderRadiusSM: inputBorderRadius,
        borderRadiusLG: inputBorderRadius,
        paddingInline: fieldPaddingHorizontal,
        paddingInlineSM: fieldPaddingHorizontalSM,
        paddingInlineLG: fieldPaddingHorizontalLG,
      },
      DatePicker: {
        colorBgContainer: palette.inputBg,
        colorBorder: palette.fieldBorder,
        hoverBorderColor: inputHoverBorderColor,
        activeBorderColor: inputActiveBorderColor,
        activeShadow: inputActiveShadow,
        borderRadius: inputBorderRadius,
        borderRadiusSM: inputBorderRadius,
        borderRadiusLG: inputBorderRadius,
        paddingInline: fieldPaddingHorizontal,
        paddingInlineSM: fieldPaddingHorizontalSM,
        paddingInlineLG: fieldPaddingHorizontalLG,
      },
      Tabs: {
        horizontalItemPadding: `${adjust(SPACING.SM)}px 0`,
        horizontalItemPaddingSM: `${adjust(SPACING.SM)}px 0`,
        horizontalItemPaddingLG: `${adjust(SPACING.SM)}px 0`,
        horizontalMargin: `0 0 ${adjust(SPACING.MD)}px 0`,
        cardPadding: `${adjust(SPACING.XS)}px ${adjust(SPACING.MD)}px`,
        cardPaddingSM: `${adjust(SPACING.XS)}px ${adjust(SPACING.SM)}px`,
        cardPaddingLG: `${adjust(SPACING.XS)}px ${adjust(SPACING.MD)}px`,
      },
      Drawer: {
        colorBgElevated: palette.surface,
        colorBorderSecondary: palette.borderSubtle,
        footerPaddingBlock: adjust(SPACING.SM),
        footerPaddingInline: adjust(SPACING.MD),
        padding: adjust(SPACING.MD),
      },
      Modal: {
        headerBg: palette.surface,
        contentBg: palette.surface,
        footerBg: palette.surface,
      },
      Table: {
        cellPaddingBlock: adjust(SPACING.SM),
        cellPaddingBlockSM: adjust(SPACING.XS),
        cellPaddingBlockMD: adjust(SPACING.SM),
        cellPaddingInline: adjust(SPACING.SM),
        cellPaddingInlineSM: adjust(SPACING.XS),
        cellPaddingInlineMD: adjust(SPACING.SM),
        headerBorderRadius: effectiveBorderRadius,
        // List surface treatment (Figma): very subtle header tint over the
        // card, soft row hover, tight divider.
        headerBg: palette.tableHeaderBg,
        headerColor: palette.textSecondary,
        headerSplitColor: palette.borderSubtle,
        rowHoverBg: palette.tableRowHoverBg,
        borderColor: palette.borderSubtle,
      },
      Collapse: {
        contentPadding: `${adjust(SPACING.MD)}px ${adjust(SPACING.MD)}px`,
        headerPadding: `${adjust(SPACING.SM)}px ${adjust(SPACING.MD)}px`,
      },
    },
  };
}
