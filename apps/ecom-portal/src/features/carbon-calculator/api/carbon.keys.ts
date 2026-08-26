// Modified by Sekar Nagarajan (2026-08-25 13:00)
import type { CarbonInput } from '../types/carbon.types';

export const carbonKeys = {
  all: ['carbon-calculator'] as const,
  lookups: () => [...carbonKeys.all, 'lookups'] as const,
  compute: (input: CarbonInput) => [...carbonKeys.all, 'compute', input] as const,
};
