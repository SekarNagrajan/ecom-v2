// Created by Sekar Nagarajan (2026-09-28 16:17)
import {
  ACCESSIBILITY_DEFAULTS,
  mergeNotificationPreferences,
  mergeReadingMaskPreferences,
  validateAccessibilityPreferences,
  withAccessibilityDefaults,
  type ContrastMode,
  type LetterSpacingLevel,
  type NotificationPreferences,
  type ReadingMaskPreferences,
} from "@solverminds/shared-ui/providers";
import { http, HttpResponse } from "msw";

import type { AccessibilityPreferencesPatch } from "../features/theme/api/accessibility.api";

type AccessibilityStore = {
  letterSpacing: LetterSpacingLevel;
  contrastEnabled: boolean;
  contrastMode: ContrastMode;
  pageZoom: number;
  readingMask: ReadingMaskPreferences;
  notifications: NotificationPreferences;
};

function createDefaultStore(): AccessibilityStore {
  return {
    letterSpacing: ACCESSIBILITY_DEFAULTS.letterSpacing,
    contrastEnabled: ACCESSIBILITY_DEFAULTS.contrastEnabled,
    contrastMode: ACCESSIBILITY_DEFAULTS.contrastMode,
    pageZoom: ACCESSIBILITY_DEFAULTS.pageZoom,
    readingMask: { ...ACCESSIBILITY_DEFAULTS.readingMask },
    notifications: mergeNotificationPreferences(
      ACCESSIBILITY_DEFAULTS.notifications,
    ),
  };
}

/** In-memory preferences keyed by bearer token (mock multi-user). */
const preferencesByToken = new Map<string, AccessibilityStore>();

function resolveToken(request: Request): string {
  const header = request.headers.get("Authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match?.[1]?.trim() || "anonymous";
}

function getStore(token: string): AccessibilityStore {
  let store = preferencesByToken.get(token);
  if (!store) {
    store = createDefaultStore();
    preferencesByToken.set(token, store);
  }
  return store;
}

function applyPatch(
  store: AccessibilityStore,
  patch: AccessibilityPreferencesPatch,
): AccessibilityStore {
  const nextReadingMask = mergeReadingMaskPreferences(
    store.readingMask,
    patch.readingMask,
  );
  const nextNotifications = mergeNotificationPreferences(
    store.notifications,
    patch.notifications,
  );

  const merged = withAccessibilityDefaults({
    letterSpacing: patch.letterSpacing ?? store.letterSpacing,
    contrastEnabled: patch.contrastEnabled ?? store.contrastEnabled,
    contrastMode: patch.contrastMode ?? store.contrastMode,
    pageZoom: patch.pageZoom ?? store.pageZoom,
    readingMask: nextReadingMask,
    notifications: nextNotifications,
  });

  return {
    letterSpacing: merged.letterSpacing,
    contrastEnabled: merged.contrastEnabled,
    contrastMode: merged.contrastMode,
    pageZoom: merged.pageZoom,
    readingMask: merged.readingMask,
    notifications: merged.notifications,
  };
}

export const accessibilityHandlers = [
  http.get("/api/v1/user/preferences/accessibility", ({ request }) => {
    const store = getStore(resolveToken(request));
    return HttpResponse.json({ data: store });
  }),

  http.patch(
    "/api/v1/user/preferences/accessibility",
    async ({ request }) => {
      const token = resolveToken(request);
      let body: AccessibilityPreferencesPatch;

      try {
        body = (await request.json()) as AccessibilityPreferencesPatch;
      } catch {
        return HttpResponse.json(
          {
            status: "ERROR",
            error: {
              code: "INVALID_JSON",
              message: "Malformed accessibility preference payload",
            },
          },
          { status: 400 },
        );
      }

      const validationError = validateAccessibilityPreferences(body);
      if (validationError) {
        console.warn(
          "[accessibility] Invalid preference payload rejected:",
          validationError,
        );
        return HttpResponse.json(
          {
            status: "ERROR",
            error: {
              code: "VALIDATION_ERROR",
              message: validationError,
            },
          },
          { status: 400 },
        );
      }

      const next = applyPatch(getStore(token), body);
      preferencesByToken.set(token, next);
      return HttpResponse.json({ data: next });
    },
  ),
];
