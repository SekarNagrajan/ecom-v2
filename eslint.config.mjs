// Created by Sekar Nagarajan (2026-11-12 23:20)
/**
 * Workspace ESLint flat config (ESLint 9). One config for `apps/*` and `libs/*`; run with `pnpm lint`.
 *
 * Policy: rules that catch real bugs are errors. Rules that mostly flag legacy style (`any`,
 * unused vars, React Compiler constraints, a11y) are warnings for now so the gate can be green
 * on day one; roadmap B4 promotes them folder by folder as the baseline is cleaned.
 */
import js from "@eslint/js";
import pluginRouter from "@tanstack/eslint-plugin-router";
import prettier from "eslint-config-prettier";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

/** React Compiler / React 19 rules shipped by eslint-plugin-react-hooks 7 as errors. Warn first. */
const COMPILER_RULES_AS_WARNINGS = Object.fromEntries(
  [
    "static-components",
    "use-memo",
    "void-use-memo",
    "preserve-manual-memoization",
    "incompatible-library",
    "immutability",
    "globals",
    "refs",
    "set-state-in-effect",
    "error-boundaries",
    "purity",
    "set-state-in-render",
    "unsupported-syntax",
    "config",
    "gating",
  ].map((rule) => [`react-hooks/${rule}`, "warn"]),
);

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/storybook-static/**",
      "**/.nx/**",
      "**/.vercel/**",
      "**/.pnpm-store/**",
      "apps/ecom-portal/public/**",
      "apps/ecom-portal/mock-data/**",
      "apps/ecom-portal/src/mocks/fixtures/**",
      "apps/ai-service/**",
      // dead libraries scheduled for deletion (roadmap B4)
      "libs/theme/**",
      "libs/shared-ui/**",
      "libs/shared-util/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  reactHooks.configs.flat["recommended-latest"],
  jsxA11y.flatConfigs.recommended,
  ...pluginRouter.configs["flat/recommended"],
  {
    files: ["**/*.{ts,tsx,js,jsx,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: { ...globals.browser, ...globals.node, ...globals.es2023 },
    },
    rules: {
      ...COMPILER_RULES_AS_WARNINGS,
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrors: "none",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/ban-ts-comment": [
        "warn",
        { "ts-expect-error": "allow-with-description" },
      ],
      "@typescript-eslint/no-empty-object-type": "warn",
      "@typescript-eslint/no-unused-expressions": [
        "error",
        { allowShortCircuit: true, allowTernary: true },
      ],
      "@typescript-eslint/no-require-imports": "off",

      "no-empty": ["error", { allowEmptyCatch: true }],
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],
      "prefer-const": "warn",
      "no-useless-escape": "warn",
    },
  },
  {
    // Accessibility rules stay visible but non-blocking until the F18 pass makes them errors.
    files: ["**/*.{tsx,jsx}"],
    rules: {
      ...Object.fromEntries(
        Object.keys(jsxA11y.flatConfigs.recommended.rules ?? {}).map((rule) => [rule, "warn"]),
      ),
      // deprecated in jsx-a11y; `label-has-associated-control` is the maintained replacement
      "jsx-a11y/label-has-for": "off",
    },
  },
  {
    files: ["**/*.{test,spec}.{ts,tsx}", "**/mocks/**", "**/__tests__/**", "**/*.stories.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "no-console": "off",
    },
  },
  {
    files: [
      "**/*.{js,mjs,cjs}",
      "**/vite.config.*",
      "**/vitest.config.*",
      "**/*.config.*",
      "scripts/**",
    ],
    rules: { "@typescript-eslint/no-require-imports": "off", "no-console": "off" },
  },
  prettier,
);
