// Modified by Sekar Nagarajan (2026-10-20 15:34)
import { useAuthStore, useTenantStore } from "@solverminds/auth";
import { useRouterState } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { useAssistantStore } from "../store/assistant.store";
import type { ClientContext } from "../types/assistant.types";

export function useAssistantContext(): ClientContext {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { i18n } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const activeTenant = useTenantStore((s) => s.activeTenant);
  const includePageContext = useAssistantStore((s) => s.includePageContext);

  return {
    // The screen-context pill in the composer can switch route sharing off.
    route: includePageContext ? pathname || "/" : "",
    locale: i18n.language || "en",
    tenant_code:
      activeTenant?.customerCode ??
      user?.customerCode ??
      user?.tenantId ??
      activeTenant?.id ??
      null,
    capabilities: user?.capabilities ?? [],
  };
}
