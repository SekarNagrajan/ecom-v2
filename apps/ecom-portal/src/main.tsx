// Modified by Sekar Nagarajan (2026-08-25 17:25)
import { queryClient } from "@solverminds/platform";
import { useTenantStore } from "@solverminds/auth";
import { AppConfigProvider } from "@solverminds/shared-ui/providers";
import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";

import { router } from "./app/router";
import { TenantThemeProvider } from "./components/providers/TenantThemeProvider";
import { ThemePreferencesProvider } from "./features/theme/providers/theme-preferences-provider";
import { useAppConfigStore } from "./features/theme/stores/app-config.store";

import "@solverminds/shared-ui/styles.css";

function AppRoot() {
  const config = useAppConfigStore((state) => state.config);
  const tenantPrimary = useTenantStore(
    (state) => state.activeTenant.primaryColor,
  );

  // Single root theme (CRM parity): AppConfigProvider owns light/dark via buildAntdTheme.
  const mergedConfig = {
    ...config,
    primaryColor: config.primaryColor || tenantPrimary || "#1B6DAB",
  };

  return (
    <AppConfigProvider
      config={mergedConfig}
      theme={{ cssVar: { prefix: "ecom" } }}
    >
      <ThemePreferencesProvider>
        <TenantThemeProvider>
          <RouterProvider router={router} />
        </TenantThemeProvider>
      </ThemePreferencesProvider>
    </AppConfigProvider>
  );
}

async function bootstrap() {
  if (import.meta.env.DEV) {
    const { worker } = await import("./mocks/browser");
    await worker.start({
      onUnhandledRequest: "bypass",
      serviceWorker: { url: "/mockServiceWorker.js" },
    });
  }

  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AppRoot />
      </QueryClientProvider>
    </React.StrictMode>,
  );
}

void bootstrap();
