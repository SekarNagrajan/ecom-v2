import { type AppCustomConfig } from './types';

/**
 * Merges multiple configuration objects into a single resolved config.
 *
 * Logic:
 * 1. Starts with an empty object (or the first provided config).
 * 2. Iterates through the arguments in order.
 * 3. Overrides properties ONLY if the new value is not null/undefined.
 *
 * Usage:
 * const finalConfig = resolveAppConfig(defaultConfig, tenantConfig, userConfig);
 */
export const mergeAppConfig = (
  ...configs: (Partial<AppCustomConfig> | undefined | null)[]
): AppCustomConfig => {
  // 1. Start with an empty object
  const result: AppCustomConfig = {} as AppCustomConfig;

  // 2. Iterate over each layer (e.g., Global -> Tenant -> User)
  configs.forEach((config) => {
    if (!config) return;

    // 3. Iterate over keys safely
    (Object.keys(config) as (keyof AppCustomConfig)[]).forEach((key) => {
      const value = config[key];

      // 4. Strict check: Only override if value is defined and not null
      // This allows partial updates (e.g. User only changes 'themeMode', rest stays Tenant)
      if (value !== undefined && value !== null) {
        // Typescript casting is safe here because we iterate known keys
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (result[key] as any) = value;
      }
    });
  });

  return result;
};
