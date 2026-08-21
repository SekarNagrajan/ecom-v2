import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';
/// <reference types='vitest' />
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../../node_modules/.vite/libs/shared/ui',
  plugins: [
    tailwindcss(),
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
    dts({
      entryRoot: 'src',
      tsconfigPath: path.join(import.meta.dirname, 'tsconfig.lib.json'),
    }),
  ],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [],
  // },
  // Configuration for building your library.
  // See: https://vite.dev/guide/build.html#library-mode
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      entry: {
        index: path.join(import.meta.dirname, 'src/index.ts'),
        hooks: path.join(import.meta.dirname, 'src/hooks/index.ts'),
        providers: path.join(import.meta.dirname, 'src/providers/index.ts'),
        utils: path.join(import.meta.dirname, 'src/utils/index.ts'),
        schemas: path.join(import.meta.dirname, 'src/schemas/index.ts'),
        editor: path.join(
          import.meta.dirname,
          'src/components/ui/rich-text-editor/index.ts'
        ),
        'form-editor': path.join(
          import.meta.dirname,
          'src/components/form-fields/rich-text-editor/index.ts'
        ),
        email: path.join(import.meta.dirname, 'src/components/email/index.ts'),
        calendar: path.join(
          import.meta.dirname,
          'src/components/ui/calendar/index.ts'
        ),
        chart: path.join(import.meta.dirname, 'src/components/chart/index.ts'),
        'data-view': path.join(
          import.meta.dirname,
          'src/components/data-view/index.ts'
        ),
        'data-view/list-view': path.join(
          import.meta.dirname,
          'src/components/data-view/list-view/index.ts'
        ),
        'data-view/kanban-view': path.join(
          import.meta.dirname,
          'src/components/data-view/kanban-view/index.ts'
        ),
        'data-view/card-view': path.join(
          import.meta.dirname,
          'src/components/data-view/card-view/index.ts'
        ),
      },
      name: '@solverminds/shared-ui',
      formats: ['es' as const],
    },
    rollupOptions: {
      // This won't be bundled with shared-ui, when we build parent app, used libraries will be bundled with that
      external: [
        /^react/,
        /^react-dom/,
        /^antd/,
        /^@ant-design/,
        /^@rc-component/,
        /^@fullcalendar/,
        /^@tiptap/,
        /^@tanstack/,
        /^@dnd-kit/,
        'ag-grid-community',
        'ag-grid-enterprise',
        'ag-grid-react',
        /^ag-grid-/,
        /^zustand/,
        /^libphonenumber-js/,
        /^dayjs/,
        'react-hook-form',
        'luxon',
        'zod',
        'clsx',
        'tailwind-merge',
        'react-number-format',
        '@hookform/resolvers/zod',
        'turndown',
        'dompurify',
        /^echarts/,
      ],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
      },
    },
  },
  test: {
    name: '@solverminds/shared-ui',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: './test-output/vitest/coverage',
      provider: 'v8' as const,
    },
  },
}));
