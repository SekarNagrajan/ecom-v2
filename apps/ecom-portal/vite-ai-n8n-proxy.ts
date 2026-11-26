// Modified by Sekar Nagarajan (2026-10-19)
/**
 * Dev (and preview) proxy: same-origin POST /api/ai/{grammar,transcribe,rewrite}
 * → live n8n webhooks on https://n8n.sedge.ai/webhook:
 *
 *   Groq Grammar Check          → /grammar
 *   Groq Audio Transcription    → /transcribe
 *   Mail_Tone_Rewrite           → /v2/mail/rewrite
 *
 * In VITE_API_MODE=mock, MSW usually intercepts these in the browser first; this
 * middleware only runs if the request reaches Vite (e.g. real mode, or SW bypass).
 *
 * Env (Node / .env.local — not VITE_*):
 *   N8N_BASE_URL | ECOM_N8N_BASE_URL  default https://n8n.sedge.ai/webhook
 *   ECOM_AI_REWRITE_STUB=false        disable local rewrite fallback if upstream fails
 */
import type { IncomingMessage, ServerResponse } from "http";
import type { Plugin } from "vite";

const DEFAULT_N8N_BASE = "https://n8n.sedge.ai/webhook";

/** Browser path → n8n webhook path (under N8N_BASE_URL). */
const AI_ROUTE_TO_WEBHOOK: Record<string, string> = {
  "/api/ai/grammar": "grammar",
  "/api/ai/transcribe": "transcribe",
  "/api/ai/rewrite": "v2/mail/rewrite",
};

function resolveN8nBase(): string {
  const raw =
    process.env.ECOM_N8N_BASE_URL?.trim() ||
    process.env.N8N_BASE_URL?.trim() ||
    DEFAULT_N8N_BASE;
  return raw.replace(/\/$/, "");
}

function rewriteStubEnabled(): boolean {
  return process.env.ECOM_AI_REWRITE_STUB !== "false";
}

function readBodyBuffer(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer | string) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Local fallback when Mail_Tone_Rewrite upstream fails. */
function buildRewriteStub(body: Buffer): { status: number; json: unknown } {
  let contentHtml = "";
  let action = "professional";
  try {
    const parsed = JSON.parse(body.toString("utf8")) as {
      content_html?: string;
      action?: string;
    };
    contentHtml = parsed.content_html ?? "";
    action = parsed.action ?? action;
  } catch {
    /* ignore */
  }
  const plain = stripHtml(contentHtml);
  const rewritten = plain
    ? `[${action}] ${plain.charAt(0).toUpperCase()}${plain.slice(1)}${/[.!?]$/.test(plain) ? "" : "."}`
    : "Thank you for your inquiry. We look forward to supporting your shipment.";
  return {
    status: 200,
    json: {
      ok: true,
      rewritten_html: `<p>${escapeHtml(rewritten)}</p>`,
      stub: true,
    },
  };
}

function sendJson(
  res: ServerResponse,
  status: number,
  body: unknown,
): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

async function proxyToN8n(
  webhookName: string,
  req: IncomingMessage,
  body: Buffer,
): Promise<{ status: number; contentType: string; body: Buffer } | null> {
  const targetUrl = `${resolveN8nBase()}/${webhookName}`;
  const headers: Record<string, string> = {};
  const contentType = req.headers["content-type"];
  if (contentType) headers["Content-Type"] = contentType;
  if (req.headers.accept) headers.Accept = String(req.headers.accept);

  try {
    const upstream = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: body.length ? new Uint8Array(body) : undefined,
    });
    const buf = Buffer.from(await upstream.arrayBuffer());
    return {
      status: upstream.status,
      contentType:
        upstream.headers.get("content-type") || "application/json",
      body: buf,
    };
  } catch (error) {
    console.warn(
      `[ecom-ai-n8n-proxy] Upstream failed for ${webhookName}:`,
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

function attachAiProxy(
  middlewares: {
    use: (
      fn: (
        req: IncomingMessage,
        res: ServerResponse,
        next: (err?: unknown) => void,
      ) => void,
    ) => void;
  },
): void {
  middlewares.use(async (req, res, next) => {
    if (req.method !== "POST") {
      next();
      return;
    }
    const url = req.url?.split("?")[0] ?? "";
    const webhookName = AI_ROUTE_TO_WEBHOOK[url];
    if (!webhookName) {
      next();
      return;
    }

    try {
      const body = await readBodyBuffer(req);
      const upstream = await proxyToN8n(webhookName, req, body);

      if (
        webhookName === "v2/mail/rewrite" &&
        rewriteStubEnabled() &&
        (!upstream || upstream.status === 404 || upstream.status >= 500)
      ) {
        const stub = buildRewriteStub(body);
        sendJson(res, stub.status, stub.json);
        return;
      }

      if (!upstream) {
        sendJson(res, 502, {
          message: `AI upstream unavailable (${webhookName})`,
        });
        return;
      }

      res.statusCode = upstream.status;
      res.setHeader("Content-Type", upstream.contentType);
      res.end(upstream.body);
    } catch (error) {
      console.error("[ecom-ai-n8n-proxy]", error);
      sendJson(res, 500, {
        message:
          error instanceof Error ? error.message : "AI proxy error",
      });
    }
  });
}

/** Vite plugin: proxy /api/ai/* to n8n webhooks (CRM AiService parity, e-com-owned). */
export function ecomAiN8nProxyPlugin(): Plugin {
  return {
    name: "ecom-ai-n8n-proxy",
    configureServer(server) {
      attachAiProxy(server.middlewares);
    },
    configurePreviewServer(server) {
      attachAiProxy(server.middlewares);
    },
  };
}
