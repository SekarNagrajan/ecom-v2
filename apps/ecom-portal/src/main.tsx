// Modified by Sekar Nagarajan (2026-11-26 19:20)
import { sessionManager, startSessionSync } from "@solverminds/auth";
import { env, queryClient, UNAUTHORIZED_EVENT } from "@solverminds/platform";
import { AppConfigProvider } from "@solverminds/shared-ui/providers";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import React from "react";
import ReactDOM from "react-dom/client";

import { router } from "./app/router";
import { TenantDocumentHead } from "./components/providers/TenantDocumentHead";
import { TenantThemeProvider } from "./components/providers/TenantThemeProvider";
import { logoutServer } from "./features/auth/api/auth.api";
import { wireSessionCleanup } from "./features/auth/api/session-cleanup";
import { SESSION_EXPIRED_SEARCH_REASON } from "./features/auth/api/session-expiry";
import { wireSessionRefresher } from "./features/auth/api/session-refresher";
import { SessionExpiryModal } from "./features/auth/components/SessionExpiryModal";
import { usePostLoginRedirectStore } from "./features/auth/stores/use-post-login-redirect-store";
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
  const detected = (i18n.resolvedLanguage ?? i18n.language ?? "en") as SupportedLanguage;
  const targetLocale = LANG_TO_ANTD_LOCALE[detected];
  if (!targetLocale) return;
  const store = useAppConfigStore.getState();
  if (store.config.locale !== targetLocale) {
    store.setConfig({ ...store.config, locale: targetLocale });
  }
}

function AppRoot() {
  const config = useAppConfigStore((state) => state.config);

  // Temporary: ignore customer/tenant brand accent. User preference → Signal Blue.
  // Contrast / accessibility overrides are applied downstream by AccessibilityEffects.
  const mergedConfig = {
    ...config,
    primaryColor: config.primaryColor || BE_COLOR_MAP.SIGNAL,
  };

  return (
    <AppConfigProvider config={mergedConfig} theme={{ cssVar: { prefix: "ecom" } }}>
      <ThemePreferencesProvider>
        <TenantThemeProvider>
          <TenantDocumentHead primaryColor={mergedConfig.primaryColor} />
          <RouterProvider router={router} />
          <SessionExpiryModal />
        </TenantThemeProvider>
      </ThemePreferencesProvider>
    </AppConfigProvider>
  );
}

/**
 * One path for every way a session can end (idle timeout, absolute cap, refresh rejected, 401):
 * the session manager clears auth state, then this hook sends the user to the login panel.
 */
function wireSessionManager(): void {
  /** Remember where the user was so signing back in resumes there (PublicLayout consumes it). */
  const rememberReturnPath = () => {
    const { pathname, searchStr } = router.state.location;
    if (pathname.startsWith("/app")) {
      usePostLoginRedirectStore.getState().setIntendedPath(`${pathname}${searchStr}`);
    }
  };

  /** Session ended involuntarily: explain why on the login panel, then resume after sign-in. */
  const goToExpiredLogin = () => {
    rememberReturnPath();
    void router.navigate({
      to: "/",
      search: { login: true, reason: SESSION_EXPIRED_SEARCH_REASON } as never,
    });
  };

  sessionManager.configure({
    onExpired: goToExpiredLogin,
    // Revoke the refresh token while the Bearer is still available, before local state is cleared.
    onSignOut: () => logoutServer(),
    onSignedOut: () => void router.navigate({ to: "/" }),
  });
  // 401s that survive refresh+retry arrive as a (debounced) window event from libs/platform.
  window.addEventListener(UNAUTHORIZED_EVENT, () => sessionManager.expire("session-expired"));
  sessionManager.start();

  // Multi-tab: logout / token refresh / activity / "stay signed in" propagate to every open tab.
  startSessionSync({
    manager: sessionManager,
    onRemoteLogout: (reason) => {
      if (reason === "idle" || reason === "session-expired") goToExpiredLogin();
      else void router.navigate({ to: "/" });
    },
  });
}

async function bootstrap() {
  if (env.VITE_API_MODE === "mock") {
    const { worker } = await import("./mocks/browser");
    await worker.start({
      onUnhandledRequest: "bypass",
      serviceWorker: { url: "/mockServiceWorker.js" },
    });
    // Restore booking / SI+BL / VGM / user mutations written to mock-data/runtime/ (survives refresh).
    const { rehydrateBookingDb } = await import("./mocks/fixture-api/booking-persistence");
    const { rehydrateSiDb } = await import("./mocks/fixture-api/si-persistence");
    const { rehydrateVgmDb } = await import("./mocks/fixture-api/vgm-persistence");
    const { rehydrateUserDb } = await import("./mocks/fixture-api/user-persistence");
    await rehydrateBookingDb();
    await rehydrateSiDb();
    await rehydrateVgmDb();
    await rehydrateUserDb();
  }

  wireSessionRefresher();
  wireSessionCleanup();
  wireSessionManager();
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
