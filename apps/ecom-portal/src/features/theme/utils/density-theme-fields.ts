import type {
  AppCustomConfig,
  DensityLevel,
  LineHeightLevel,
} from '@solverminds/shared-ui/providers';

export interface DensityThemeFields {
  baseFontSize: number;
  lineHeight: LineHeightLevel;
  borderRadius: number;
}

const DENSITY_THEME_FIELDS: Record<DensityLevel, DensityThemeFields> = {
  compact: {
    baseFontSize: 12,
    lineHeight: 'tight',
    borderRadius: 6,
  },
  normal: {
    baseFontSize: 14,
    lineHeight: 'normal',
    borderRadius: 8,
  },
  comfortable: {
    baseFontSize: 16,
    lineHeight: 'relaxed',
    borderRadius: 10,
  },
};

export function getDensityThemeFields(
  density: DensityLevel
): DensityThemeFields {
  return DENSITY_THEME_FIELDS[density] || DENSITY_THEME_FIELDS.normal;
}

export function applyDensityThemeFields(
  config: AppCustomConfig
): AppCustomConfig {
  const fields = getDensityThemeFields(config.density);

  if (
    config.baseFontSize === fields.baseFontSize &&
    config.lineHeight === fields.lineHeight &&
    config.borderRadius === fields.borderRadius
  ) {
    return config;
  }

  return {
    ...config,
    baseFontSize: fields.baseFontSize,
    lineHeight: fields.lineHeight,
    borderRadius: fields.borderRadius,
  };
}
