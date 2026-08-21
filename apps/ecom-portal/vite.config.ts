import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@solverminds/platform': path.resolve(__dirname, '../../libs/platform/src/index.ts'),
      '@solverminds/auth': path.resolve(__dirname, '../../libs/auth/src/index.ts'),
      '@solverminds/theme': path.resolve(__dirname, '../../libs/theme/src/index.ts'),
      '@solverminds/shared-ui/styles.css': path.resolve(__dirname, '../../libs/shared/ui/src/styles.css'),
      '@solverminds/shared-ui/providers': path.resolve(__dirname, '../../libs/shared/ui/src/providers/index.ts'),
      '@solverminds/shared-ui/hooks': path.resolve(__dirname, '../../libs/shared/ui/src/hooks/index.ts'),
      '@solverminds/shared-ui/utils': path.resolve(__dirname, '../../libs/shared/ui/src/utils/index.ts'),
      '@solverminds/shared-ui/schemas': path.resolve(__dirname, '../../libs/shared/ui/src/schemas/index.ts'),
      '@solverminds/shared-ui/data-view': path.resolve(__dirname, '../../libs/shared/ui/src/components/data-view/index.ts'),
      '@solverminds/shared-ui': path.resolve(__dirname, '../../libs/shared/ui/src/index.ts'),
      '@solverminds/shared-util': path.resolve(__dirname, '../../libs/shared-util/src/index.ts'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
