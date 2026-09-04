// Modified by Sekar Nagarajan (2026-09-05 00:25)
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * Dev-only fallback for booking mutations when the MSW service worker
 * does not intercept (e.g. after a long HMR session or SW not claimed).
 * MSW still owns these routes when active; this only runs if the request
 * reaches Vite.
 */
function bookingMockApiPlugin(): Plugin {
  const json = (res: import('http').ServerResponse, body: unknown, status = 200) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(body));
  };

  return {
    name: 'booking-mock-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] ?? '';
        if (req.method === 'POST' && url === '/api/booking/submit') {
          return json(res, {
            data: {
              bookingReference: `BKG-${new Date().getFullYear()}-${Math.floor(
                10000 + Math.random() * 90000,
              )}`,
              status: 'CONFIRMED',
              submittedAt: new Date().toISOString(),
            },
          });
        }
        if (req.method === 'PUT' && url === '/api/booking/amend') {
          return json(res, {
            data: {
              bookingReference: `BKG-AMD-${new Date().getFullYear()}-${Math.floor(
                10000 + Math.random() * 90000,
              )}`,
              status: 'CONFIRMED',
              submittedAt: new Date().toISOString(),
            },
          });
        }
        if (req.method === 'POST' && url === '/api/booking/draft') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            let draftId = `draft-${Date.now()}`;
            try {
              const parsed = JSON.parse(body || '{}') as { draftId?: string };
              if (parsed.draftId) draftId = parsed.draftId;
            } catch {
              /* ignore */
            }
            json(res, { data: { draftId } });
          });
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), bookingMockApiPlugin()],
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
      '@solverminds/shared-ui/data-view/list-view': path.resolve(__dirname, '../../libs/shared/ui/src/components/data-view/list-view/index.ts'),
      '@solverminds/shared-ui/data-view/kanban-view': path.resolve(__dirname, '../../libs/shared/ui/src/components/data-view/kanban-view/index.ts'),
      '@solverminds/shared-ui/data-view/card-view': path.resolve(__dirname, '../../libs/shared/ui/src/components/data-view/card-view/index.ts'),
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
