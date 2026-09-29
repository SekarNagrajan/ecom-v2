// Modified by Sekar Nagarajan (2026-09-18 12:26)
import { useAuthStore, useTenantStore } from "@solverminds/auth";
import { queryClient } from "@solverminds/platform";
import { AppConfigProvider } from "@solverminds/shared-ui/providers";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import React from "react";
import ReactDOM from "react-dom/client";

import { router } from "./app/router";
import { TenantThemeProvider } from "./components/providers/TenantThemeProvider";
import { SESSION_EXPIRED_SEARCH_REASON } from "./features/auth/api/session-expiry";
import { ThemePreferencesProvider } from "./features/theme/providers/theme-preferences-provider";
import { useAppConfigStore } from "./features/theme/stores/app-config.store";
import { BE_COLOR_MAP } from "./features/theme/utils/config-mapper";
import i18n, { LANG_TO_ANTD_LOCALE, type SupportedLanguage } from "./i18n/config";
import { installPreloadErrorHandler } from "./utils/preload-error-handler";

import "@solverminds/shared-ui/styles.css";

installPreloadErrorHandler();

/**
 * On first paint, align the antd ConfigProvider locale (driven by
 * `config.locale`) with the language i18next detected/restored from
 * localStorage, so component chrome and UI text match immediately.
 */
function syncInitialLocale(): void {
  const detected = (i18n.resolvedLanguage ??
    i18n.language ??
    "en") as SupportedLanguage;
  const targetLocale = LANG_TO_ANTD_LOCALE[detected];
  if (!targetLocale) return;
  const store = useAppConfigStore.getState();
  if (store.config.locale !== targetLocale) {
    store.setConfig({ ...store.config, locale: targetLocale });
  }
}

function AppRoot() {
  const config = useAppConfigStore((state) => state.config);
  const tenantPrimary = useTenantStore(
    (state) => state.activeTenant.primaryColor,
  );

  const mergedConfig = {
    ...config,
    primaryColor: config.primaryColor || tenantPrimary || BE_COLOR_MAP.SIGNAL,
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
    void router.navigate({
      to: "/",
      search: {
        login: true,
        reason: SESSION_EXPIRED_SEARCH_REASON,
      } as never,
    });
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
  syncInitialLocale();

  // Session + tenant restore run in root beforeLoad so PublicPendingFallback can show.
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AppRoot />
      </QueryClientProvider>
    </React.StrictMode>,
  );
}

void bootstrap();
