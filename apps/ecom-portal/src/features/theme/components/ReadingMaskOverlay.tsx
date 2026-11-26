// Created by Sekar Nagarajan (2026-09-28 16:17)
import { resolveReadingMaskDimensions } from "@solverminds/shared-ui/providers";
import { useEffect, useRef } from "react";

import { useAppConfigStore } from "../stores/app-config.store";

/**
 * Full-viewport reading mask that follows the pointer without capturing events.
 * Positioning uses requestAnimationFrame + CSS variables — no React state per move.
 */
export function ReadingMaskOverlay() {
  const readingMask = useAppConfigStore((s) => s.config.readingMask);
  const overlayRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const pointerRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  const enabled = readingMask.enabled;
  const dimensions = resolveReadingMaskDimensions(readingMask);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay || !enabled) return;

    const finePointer = window.matchMedia("(pointer: fine)");
    if (!finePointer.matches) {
      overlay.style.display = "none";
      return;
    }

    overlay.style.display = "block";
    overlay.style.setProperty("--rm-width", `${dimensions.focusWidth}px`);
    overlay.style.setProperty("--rm-height", `${dimensions.focusHeight}px`);
    overlay.style.setProperty("--rm-opacity", String(dimensions.opacity));

    const applyPosition = () => {
      rafRef.current = null;
      const { x, y } = pointerRef.current;
      overlay.style.setProperty("--rm-x", `${x}px`);
      overlay.style.setProperty("--rm-y", `${y}px`);
    };

    const schedulePosition = () => {
      if (rafRef.current !== null) return;
      rafRef.current = window.requestAnimationFrame(applyPosition);
    };

    const onPointerMove = (event: PointerEvent) => {
      pointerRef.current = { x: event.clientX, y: event.clientY };
      schedulePosition();
    };

    const onPointerCapabilityChange = () => {
      overlay.style.display = finePointer.matches ? "block" : "none";
    };

    applyPosition();
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    finePointer.addEventListener("change", onPointerCapabilityChange);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      finePointer.removeEventListener("change", onPointerCapabilityChange);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [
    enabled,
    dimensions.focusHeight,
    dimensions.focusWidth,
    dimensions.opacity,
  ]);

  if (!enabled) {
    return null;
  }

  return (
    <div
      ref={overlayRef}
      className="reading-mask-overlay"
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9990,
        pointerEvents: "none",
        display: "block",
        // Large box-shadow creates a dimmed surround with a clear cutout.
        boxShadow: `0 0 0 9999px rgba(0, 0, 0, var(--rm-opacity, 0.35))`,
        width: "var(--rm-width, 600px)",
        height: "var(--rm-height, 120px)",
        left: "var(--rm-x, 50%)",
        top: "var(--rm-y, 50%)",
        transform: "translate(-50%, -50%)",
        borderRadius: 4,
        background: "transparent",
      }}
    />
  );
}
