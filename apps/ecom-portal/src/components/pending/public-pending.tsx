// Modified by Sekar Nagarajan (2026-09-07 17:24)
import { env } from "@solverminds/platform";
import type { CSSProperties } from "react";

interface PublicPendingFallbackProps {
  title?: string;
  message?: string;
}

function defaultTitle() {
  return env.VITE_APP_TITLE;
}

const wrapperStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  display: "flex",
  minHeight: "100dvh",
  width: "100vw",
  alignItems: "center",
  justifyContent: "center",
  background:
    "linear-gradient(180deg, var(--ecom-color-bg-container, #ffffff) 0%, color-mix(in srgb, var(--ecom-color-primary, #1B6DAB) 6%, var(--ecom-color-bg-container, #ffffff)) 100%)",
};

const panelStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "12px",
  padding: "24px",
  textAlign: "center",
};

const spinnerStyle: CSSProperties = {
  height: "32px",
  width: "32px",
  borderRadius: "9999px",
  border:
    "2px solid color-mix(in srgb, var(--ecom-color-primary, #1B6DAB) 18%, transparent)",
  borderTopColor: "var(--ecom-color-primary, #1B6DAB)",
  animation: "ecom-pending-spin 0.8s linear infinite",
};

const titleStyle: CSSProperties = {
  margin: 0,
  color: "var(--ecom-color-text, #141414)",
  fontSize: "20px",
  fontWeight: 600,
  lineHeight: 1.2,
};

const messageStyle: CSSProperties = {
  margin: 0,
  color: "var(--ecom-color-text-secondary, rgba(0, 0, 0, 0.45))",
  fontSize: "14px",
  lineHeight: 1.5,
};

export function PublicPendingFallback({
  title = defaultTitle(),
  message = "Verifying your session...",
}: PublicPendingFallbackProps) {
  return (
    <div style={wrapperStyle}>
      <style>{`
        @keyframes ecom-pending-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div style={panelStyle}>
        <div aria-hidden="true" style={spinnerStyle} />
        {title ? <h1 style={titleStyle}>{title}</h1> : null}
        <p style={messageStyle}>{message}</p>
      </div>
    </div>
  );
}
