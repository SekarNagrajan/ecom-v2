// Modified by Sekar Nagarajan (2026-10-19)
import { bypass, delay, http, HttpResponse } from "msw";

/**
 * Live AI (default): pass `/api/ai/*` through MSW so Vite's `ecomAiN8nProxyPlugin`
 * can forward to n8n (grammar / transcribe / v2/mail/rewrite).
 *
 * Offline stubs: set `VITE_AI_USE_MSW_STUB=true` before starting Vite.
 */

function lightlyImprove(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;
  const capped = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  return /[.!?]$/.test(capped) ? capped : `${capped}.`;
}

function wrapAsHtml(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `<p>${escaped}</p>`;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

const useMswStub =
  String(import.meta.env.VITE_AI_USE_MSW_STUB ?? "").toLowerCase() === "true";

/** Offline demo handlers (only when VITE_AI_USE_MSW_STUB=true). */
export const aiAssistStubHandlers = [
  http.post("/api/ai/grammar", async ({ request }) => {
    await delay(450);
    const body = (await request.json()) as { grammartext?: string };
    const source = body.grammartext ?? "";
    return HttpResponse.json({
      data: {
        correctedText: lightlyImprove(source),
      },
    });
  }),

  http.post("/api/ai/transcribe", async () => {
    await delay(700);
    return HttpResponse.json({
      data: {
        text: "Demo transcript: please confirm the shipment details and special handling notes.",
      },
    });
  }),

  http.post("/api/ai/rewrite", async ({ request }) => {
    await delay(550);
    const body = (await request.json()) as {
      content_html?: string;
      action?: string;
    };
    const plain = stripHtml(body.content_html ?? "");
    const action = body.action ?? "professional";
    const rewritten = lightlyImprove(
      plain
        ? `[${action}] ${plain}`
        : "Thank you for your inquiry. We look forward to supporting your shipment.",
    );
    return HttpResponse.json({
      ok: true,
      rewritten_html: wrapAsHtml(rewritten),
    });
  }),
];

/** Passthrough so Vite → n8n handles AI while the rest of the portal stays on MSW. */
export const aiAssistPassthroughHandlers = [
  http.post("/api/ai/grammar", ({ request }) => fetch(bypass(request))),
  http.post("/api/ai/transcribe", ({ request }) => fetch(bypass(request))),
  http.post("/api/ai/rewrite", ({ request }) => fetch(bypass(request))),
];

export const aiAssistHandlers = useMswStub
  ? aiAssistStubHandlers
  : aiAssistPassthroughHandlers;
