// Modified by Sekar Nagarajan (2026-09-11 18:25)
import { delay, http, HttpResponse } from "msw";

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

/**
 * MSW mocks for AI text assist — local demo without n8n/backend.
 */
export const aiAssistHandlers = [
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
