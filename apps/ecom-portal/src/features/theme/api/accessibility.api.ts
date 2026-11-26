// Created by Sekar Nagarajan (2026-09-28 16:17)
/**
 * User accessibility preferences API.
 *
 * Contract for the external backend (EJB façade):
 * - Identity MUST come from the Bearer JWT / session — never trust a client userId.
 * - GET returns the authenticated user's accessibility preference document.
 * - PATCH deep-merges only provided fields; unrelated theme prefs are untouched.
 *
 * Endpoints:
 * - GET  /api/v1/user/preferences/accessibility
 * - PATCH /api/v1/user/preferences/accessibility
 */
import { apiClient, extractApiError } from "@solverminds/platform";
import type {
  ContrastMode,
  LetterSpacingLevel,
  NotificationPreferences,
  ReadingMaskPreferences,
} from "@solverminds/shared-ui/providers";

export interface AccessibilityPreferencesDto {
  letterSpacing: LetterSpacingLevel;
  contrastEnabled: boolean;
  contrastMode: ContrastMode;
  pageZoom: number;
  readingMask: ReadingMaskPreferences;
  notifications: NotificationPreferences;
}

export type AccessibilityPreferencesPatch = {
  letterSpacing?: LetterSpacingLevel;
  contrastEnabled?: boolean;
  contrastMode?: ContrastMode;
  pageZoom?: number;
  readingMask?: Partial<ReadingMaskPreferences>;
  notifications?: Partial<NotificationPreferences> & {
    success?: Partial<NotificationPreferences["success"]>;
    info?: Partial<NotificationPreferences["info"]>;
    warning?: Partial<NotificationPreferences["warning"]>;
    error?: Partial<NotificationPreferences["error"]>;
  };
};

const ACCESSIBILITY_PATH = "/api/v1/user/preferences/accessibility";

export async function fetchAccessibilityPreferences(): Promise<AccessibilityPreferencesDto> {
  try {
    const response = await apiClient.get<{ data: AccessibilityPreferencesDto }>(
      ACCESSIBILITY_PATH,
    );
    return response.data.data;
  } catch (error) {
    throw new Error(
      extractApiError(error) || "Failed to load accessibility preferences",
    );
  }
}

export async function patchAccessibilityPreferences(
  patch: AccessibilityPreferencesPatch,
): Promise<AccessibilityPreferencesDto> {
  try {
    const response = await apiClient.patch<{
      data: AccessibilityPreferencesDto;
    }>(ACCESSIBILITY_PATH, patch);
    return response.data.data;
  } catch (error) {
    throw new Error(
      extractApiError(error) || "Failed to save accessibility preferences",
    );
  }
}
