// Modified by Sekar Nagarajan (2026-10-18 23:30)
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

/**
 * MSW browser service worker.
 * Started from main.tsx before React renders when VITE_API_MODE is mock,
 * including production demo builds. The handler list lives in ./handlers.ts.
 */
export const worker = setupWorker(...handlers);
