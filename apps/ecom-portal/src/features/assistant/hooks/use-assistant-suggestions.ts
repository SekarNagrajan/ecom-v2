// Modified by Sekar Nagarajan (2026-10-20 16:40)
import { useAuthStore, usePermission } from "@solverminds/auth";
import { useRouterState } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import type { AssistantMode } from "../modes/assistant-modes";
import { useAssistantStore } from "../store/assistant.store";
import { routeToModule } from "../utils/route-module";

const MODULE_CAPABILITY: Record<string, string | null> = {
  booking: "BKG",
  "shipping-instruction": "SI",
  bl: "BL",
  vgm: "VGM",
  rates: null,
  schedules: null,
  tracking: null,
  carbon: null,
  default: null,
};

export interface AssistantSuggestions {
  module: string;
  mode: AssistantMode;
  items: string[];
}

function asStringList(value: unknown): string[] | null {
  if (Array.isArray(value) && value.every((x) => typeof x === "string")) {
    return value as string[];
  }
  return null;
}

export function useAssistantSuggestions(): AssistantSuggestions {
  const { t } = useTranslation("assistant");
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { can } = usePermission();
  const isAuthenticated = useAuthStore((s) => Boolean(s.token && s.user));
  const mode = useAssistantStore((s) => s.mode);
  const module = routeToModule(pathname);
  const capability = MODULE_CAPABILITY[module] ?? null;

  const modeDefault = asStringList(
    t(`modes.${mode}.suggestions`, { returnObjects: true }),
  );
  const fallbackItems =
    modeDefault ??
    (asStringList(t("suggestions.default", { returnObjects: true })) ?? []).slice(
      0,
      4,
    );

  const fallback: AssistantSuggestions = {
    module: "default",
    mode,
    items: fallbackItems.slice(0, 4),
  };

  // Non-assistant modes use mode-specific suggestions only.
  if (mode !== "assistant") {
    return fallback;
  }

  if (!isAuthenticated) return fallback;
  if (capability && !can(capability)) return fallback;

  const items = asStringList(
    t(`suggestions.${module}`, { returnObjects: true }),
  );
  if (items) {
    return { module, mode, items: items.slice(0, 4) };
  }
  return fallback;
}
