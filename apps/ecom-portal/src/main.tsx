// Modified by Sekar Nagarajan (2026-09-07 16:56)
import { useAuthStore, useTenantStore } from "@solverminds/auth";
import { queryClient } from "@solverminds/platform";
import { AppConfigProvider } from "@solverminds/shared-ui/providers";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import React from "react";
import ReactDOM from "react-dom/client";

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

function wireUnauthorizedListener(): void {
  window.addEventListener("ecom:unauthorized", () => {
    useAuthStore.getState().logout();
    router.navigate({ to: "/" });
  });
}

async function bootstrap() {
  if (import.meta.env.DEV) {
    const { worker } = await import("./mocks/browser");
    await worker.start({
      onUnhandledRequest: "bypass",
      serviceWorker: { url: "/mockServiceWorker.js" },
    });
  }

  wireUnauthorizedListener();

  // Session restore runs in root beforeLoad so PublicPendingFallback can show.
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AppRoot />
      </QueryClientProvider>
    </React.StrictMode>,
  );
}

void bootstrap();
