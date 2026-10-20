// Modified by Sekar Nagarajan (2026-10-18 23:55)
/**
 * Root Vitest config: the same workspace aliases as apps/ecom-portal/vite.config.ts so tests can import
 * anything the app imports (shared-ui sub-paths, platform, auth…). Environment defaults to node; tests
 * that need a DOM opt in with `// @vitest-environment jsdom`.
 */
import path from "node:path";
import { defineConfig } from "vitest/config";

const r = (p: string) => path.resolve(__dirname, p);

export default defineConfig({
  resolve: {
    alias: {
      "@solverminds/platform": r("libs/platform/src/index.ts"),
      "@solverminds/auth": r("libs/auth/src/index.ts"),
      "@solverminds/theme": r("libs/theme/src/index.ts"),
      "@solverminds/shared-ui/styles.css": r("libs/shared/ui/src/styles.css"),
      "@solverminds/shared-ui/providers": r("libs/shared/ui/src/providers/index.ts"),
      "@solverminds/shared-ui/hooks": r("libs/shared/ui/src/hooks/index.ts"),
      "@solverminds/shared-ui/utils": r("libs/shared/ui/src/utils/index.ts"),
      "@solverminds/shared-ui/schemas": r("libs/shared/ui/src/schemas/index.ts"),
      "@solverminds/shared-ui/data-view/list-view": r("libs/shared/ui/src/components/data-view/list-view/index.ts"),
      "@solverminds/shared-ui/data-view/kanban-view": r("libs/shared/ui/src/components/data-view/kanban-view/index.ts"),
      "@solverminds/shared-ui/data-view/card-view": r("libs/shared/ui/src/components/data-view/card-view/index.ts"),
      "@solverminds/shared-ui/data-view/ag-grid-license": r("libs/shared/ui/src/components/data-view/ag-grid-license.ts"),
      "@solverminds/shared-ui/data-view": r("libs/shared/ui/src/components/data-view/index.ts"),
      "@solverminds/shared-ui/editor": r("libs/shared/ui/src/components/ui/rich-text-editor/index.ts"),
      "@solverminds/shared-ui/form-editor": r("libs/shared/ui/src/components/form-fields/rich-text-editor/index.ts"),
      "@solverminds/shared-ui/email": r("libs/shared/ui/src/components/email/index.ts"),
      "@solverminds/shared-ui/chart": r("libs/shared/ui/src/components/chart/index.ts"),
      "@solverminds/shared-ui": r("libs/shared/ui/src/index.ts"),
      "@solverminds/shared-util": r("libs/shared-util/src/index.ts"),
    },
  },
  test: {
    environment: "node",
    css: false,
    include: ["apps/**/*.{test,spec}.?(c|m)[jt]s?(x)", "libs/**/*.{test,spec}.?(c|m)[jt]s?(x)"],
    // Playwright specs under e2e/ are run by Playwright, never by Vitest.
    exclude: ["**/node_modules/**", "**/dist/**", "**/e2e/**"],
  },
});
