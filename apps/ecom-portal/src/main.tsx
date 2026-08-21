// Modified by sekar nagarajan (2026-08-21)
import { queryClient } from '@solverminds/platform';
import { AppConfigProvider } from '@solverminds/shared-ui/providers';
import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { TenantThemeProvider } from './components/providers/TenantThemeProvider';
import { ThemePreferencesProvider } from './features/theme/providers/theme-preferences-provider';
import { useAppConfigStore } from './features/theme/stores/app-config.store';

// Import shared stylesheet as required by Step 13
import '@solverminds/shared-ui/styles.css';

import { RouterProvider } from '@tanstack/react-router';
import { router } from './app/router';

function AppRoot() {
  const config = useAppConfigStore((state) => state.config);

  return (
    <AppConfigProvider config={config}>
      <ThemePreferencesProvider>
        <TenantThemeProvider>
          <RouterProvider router={router} />
        </TenantThemeProvider>
      </ThemePreferencesProvider>
    </AppConfigProvider>
  );
}

async function bootstrap() {
  // Start MSW in development — intercepts all /api/* calls for the landing page
  if (import.meta.env.DEV) {
    const { worker } = await import('./mocks/browser');
    await worker.start({
      onUnhandledRequest: 'bypass', // Let non-mocked requests through
      serviceWorker: { url: '/mockServiceWorker.js' },
    });
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AppRoot />
      </QueryClientProvider>
    </React.StrictMode>
  );
}

void bootstrap();
