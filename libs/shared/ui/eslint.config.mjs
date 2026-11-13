// Modified by Sekar Nagarajan (2026-11-12 23:20)
/**
 * The shared-ui library is linted by the workspace config (run `pnpm lint` from the repo root).
 * This file exists so editors and `eslint` invoked from inside the library resolve the same rules.
 */
import baseConfig from '../../../eslint.config.mjs';

export default [
  ...baseConfig,
  { ignores: ['**/dist/**', '**/out-tsc/**', '**/storybook-static/**'] },
];
