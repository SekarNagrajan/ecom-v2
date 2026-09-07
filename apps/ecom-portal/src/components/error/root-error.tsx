// Modified by Sekar Nagarajan (2026-09-07 17:24)
/**
 * Root error UI — plain CSS (no AntD) so the error chunk stays light.
 */
export function RootErrorComponent({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100dvh",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "var(--ecom-color-bg-layout, #f5f5f5)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          maxWidth: 420,
        }}
      >
        <div
          style={{
            marginBottom: 16,
            display: "flex",
            height: 64,
            width: 64,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "9999px",
            background: "color-mix(in srgb, #ff4d4f 12%, transparent)",
          }}
        >
          <svg
            width={32}
            height={32}
            fill="none"
            viewBox="0 0 24 24"
            stroke="#cf1322"
            strokeWidth={2}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1
          style={{
            margin: "0 0 8px",
            fontSize: 20,
            fontWeight: 600,
            color: "var(--ecom-color-text, #141414)",
          }}
        >
          Something went wrong
        </h1>
        <p
          style={{
            margin: "0 0 24px",
            fontSize: 14,
            color: "var(--ecom-color-text-secondary, rgba(0,0,0,0.45))",
          }}
        >
          {error.message}
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            type="button"
            onClick={reset}
            style={{
              border: "none",
              borderRadius: 8,
              background: "var(--ecom-color-primary, #1B6DAB)",
              color: "#fff",
              padding: "8px 16px",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
          <button
            type="button"
            onClick={() => {
              window.location.href = "/";
            }}
            style={{
              borderRadius: 8,
              border: "1px solid var(--ecom-color-border, #d9d9d9)",
              background: "var(--ecom-color-bg-container, #fff)",
              color: "var(--ecom-color-text, #141414)",
              padding: "8px 16px",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
