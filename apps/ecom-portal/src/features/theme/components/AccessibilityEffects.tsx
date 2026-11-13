// Modified by Sekar Nagarajan (2026-09-28 16:17)
import type { LetterSpacingLevel } from "@solverminds/shared-ui/providers";
import { useEffect } from "react";

import {
  LETTER_SPACING_EM,
  PAGE_ZOOM_MAX,
  PAGE_ZOOM_MIN,
} from "../constants";
import { useAppConfigStore } from "../stores/app-config.store";
import { ReadingMaskOverlay } from "./ReadingMaskOverlay";

const A11Y_STYLE_ID = "app-accessibility-effects";

function clampZoom(zoom: number): number {
  return Math.min(PAGE_ZOOM_MAX, Math.max(PAGE_ZOOM_MIN, zoom));
}

function resolveLetterSpacingEm(level: LetterSpacingLevel | undefined): number {
  if (level === undefined || level === null) return 0;
  return LETTER_SPACING_EM[level] ?? 0;
}

/**
 * Syncs accessibility Vision preferences to documentElement CSS.
 * Does not alter primary color tokens.
 */
export function AccessibilityEffects() {
  const letterSpacing = useAppConfigStore((s) => s.config.letterSpacing);
  const contrastEnabled = useAppConfigStore((s) => s.config.contrastEnabled);
  const contrastMode = useAppConfigStore((s) => s.config.contrastMode);
  const pageZoom = useAppConfigStore((s) => s.config.pageZoom);

  useEffect(() => {
    const root = document.documentElement;
    const spacingEm = resolveLetterSpacingEm(letterSpacing);
    const zoom = clampZoom(pageZoom ?? 100);

    root.style.setProperty("--app-letter-spacing", `${spacingEm}em`);
    root.style.setProperty("--app-page-zoom", `${zoom}%`);
    root.style.zoom = `${zoom}%`;

    if (contrastEnabled) {
      root.setAttribute("data-contrast", contrastMode || "enhanced");
    } else {
      root.removeAttribute("data-contrast");
    }

    let styleEl = document.getElementById(
      A11Y_STYLE_ID,
    ) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = A11Y_STYLE_ID;
      document.head.appendChild(styleEl);
    }

    styleEl.textContent = `
      body, #root,
      .ant-typography, .ant-btn, .ant-input, .ant-select,
      .ant-menu, .ant-table, .ant-card, .ant-tabs, .ant-drawer,
      .ant-form, .ant-tag, .ant-collapse, .ant-list {
        letter-spacing: var(--app-letter-spacing, 0em);
      }

      html[data-contrast="enhanced"] {
        --app-contrast-text-boost: 0.08;
      }
      html[data-contrast="high"] {
        --app-contrast-text-boost: 0.16;
      }
      html[data-contrast] body {
        -webkit-font-smoothing: antialiased;
      }
      html[data-contrast="enhanced"] .ant-typography,
      html[data-contrast="enhanced"] .ant-btn,
      html[data-contrast="enhanced"] .ant-menu-item,
      html[data-contrast="enhanced"] .app-footer__text,
      html[data-contrast="enhanced"] .app-footer__link {
        color: color-mix(in srgb, currentColor 100%, #000 calc(var(--app-contrast-text-boost) * 100%));
      }
      html[data-contrast="high"] .ant-typography,
      html[data-contrast="high"] .ant-btn,
      html[data-contrast="high"] .ant-menu-item,
      html[data-contrast="high"] .ant-input,
      html[data-contrast="high"] .ant-select-selector,
      html[data-contrast="high"] .app-footer__text,
      html[data-contrast="high"] .app-footer__link {
        color: color-mix(in srgb, currentColor 100%, #000 calc(var(--app-contrast-text-boost) * 100%));
      }
      html[data-contrast="high"] .ant-btn,
      html[data-contrast="high"] .ant-input,
      html[data-contrast="high"] .ant-select-selector,
      html[data-contrast="high"] .ant-card,
      html[data-contrast="high"] .ant-drawer-content {
        border-color: color-mix(in srgb, currentColor 55%, transparent) !important;
      }
    `;

    return () => {
      // Keep styles while app is mounted; cleanup only on unmount of provider tree.
    };
  }, [letterSpacing, contrastEnabled, contrastMode, pageZoom]);

  useEffect(() => {
    return () => {
      const root = document.documentElement;
      root.style.removeProperty("--app-letter-spacing");
      root.style.removeProperty("--app-page-zoom");
      root.style.removeProperty("zoom");
      root.removeAttribute("data-contrast");
      document.getElementById(A11Y_STYLE_ID)?.remove();
    };
  }, []);

  return <ReadingMaskOverlay />;
}
