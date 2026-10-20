// Modified by Sekar Nagarajan (2026-10-20 22:15)
/**
 * Dev + preview proxy: same-origin `/api/assistant/*` → AI service.
 * Strips `/api/assistant` so `/api/assistant/v1/chat` → `${base}/v1/chat`.
 * Streams (pipes) — never buffers the SSE body.
 *
 * Env (Node / .env.local — not VITE_*):
 *   AI_ASSISTANT_BASE_URL | ECOM_AI_SERVICE_URL  default http://localhost:8000
 */
import http from "http";
import https from "https";
import type { IncomingMessage, ServerResponse } from "http";
import type { Plugin } from "vite";

const ASSISTANT_PREFIX = "/api/assistant";
const DEFAULT_BASE = "http://localhost:8000";

export function resolveAssistantBaseUrl(
  env: NodeJS.ProcessEnv = process.env,
): string {
  const raw =
    env.AI_ASSISTANT_BASE_URL?.trim() ||
    env.ECOM_AI_SERVICE_URL?.trim() ||
    DEFAULT_BASE;
  return raw.replace(/\/$/, "");
}

export function stripAssistantPrefix(urlPath: string): string {
  const pathOnly = urlPath.split("?")[0] ?? "";
  const query = urlPath.includes("?")
    ? urlPath.slice(urlPath.indexOf("?"))
    : "";
  if (!pathOnly.startsWith(ASSISTANT_PREFIX)) {
    return urlPath;
  }
  const rest = pathOnly.slice(ASSISTANT_PREFIX.length) || "/";
  return `${rest.startsWith("/") ? rest : `/${rest}`}${query}`;
}

function sendUnavailable(res: ServerResponse): void {
  res.statusCode = 502;
  res.setHeader("Content-Type", "application/json");
  res.end(
    JSON.stringify({
      error: {
        code: "ASSISTANT_UNAVAILABLE",
        message: "Assistant upstream unavailable",
      },
    }),
  );
}

function pipeUpstream(
  targetBase: string,
  req: IncomingMessage,
  res: ServerResponse,
): void {
  const incomingUrl = req.url ?? ASSISTANT_PREFIX;
  const forwardedPath = stripAssistantPrefix(incomingUrl);
  const target = new URL(forwardedPath, `${targetBase}/`);
  const isHttps = target.protocol === "https:";
  const transport = isHttps ? https : http;

  const headers: http.OutgoingHttpHeaders = { ...req.headers };
  delete headers.host;
  headers.host = target.host;
  // Avoid intermediary buffering of SSE.
  headers["accept-encoding"] = "identity";

  const upstream = transport.request(
    {
      protocol: target.protocol,
      hostname: target.hostname,
      port: target.port || (isHttps ? 443 : 80),
      path: `${target.pathname}${target.search}`,
      method: req.method,
      headers,
      // Local LLM streams can idle between tokens for a long time.
      timeout: 0,
    },
    (upstreamRes) => {
      res.statusCode = upstreamRes.statusCode ?? 502;
      for (const [key, value] of Object.entries(upstreamRes.headers)) {
        if (value !== undefined && key.toLowerCase() !== "transfer-encoding") {
          res.setHeader(key, value);
        }
      }
      res.setHeader("Cache-Control", "no-cache, no-transform");
      res.setHeader("X-Accel-Buffering", "no");
      res.setHeader("Connection", "keep-alive");
      if (
        typeof (res as ServerResponse & { flushHeaders?: () => void })
          .flushHeaders === "function"
      ) {
        (res as ServerResponse & { flushHeaders: () => void }).flushHeaders();
      }
      upstreamRes.pipe(res);
      upstreamRes.on("error", () => {
        if (!res.writableEnded) {
          res.end();
        }
      });
    },
  );

  upstream.setTimeout(0);
  upstream.on("socket", (socket) => {
    socket.setTimeout(0);
    socket.setNoDelay(true);
    socket.setKeepAlive(true, 60_000);
  });

  upstream.on("error", (err) => {
    console.warn(
      "[ecom-assistant-proxy] Upstream failed:",
      err instanceof Error ? err.message : err,
    );
    if (!res.headersSent) {
      sendUnavailable(res);
    } else if (!res.writableEnded) {
      res.end();
    }
  });

  // Only tear down upstream when the *client* aborts mid-stream.
  // Do not destroy on res "close" after a normal end — that race cuts SSE
  // short and surfaces as "Connection lost" in the portal.
  const abortUpstream = () => {
    if (!upstream.destroyed) {
      upstream.destroy();
    }
  };
  req.on("aborted", abortUpstream);
  req.on("close", () => {
    if (!req.complete) {
      abortUpstream();
    }
  });
  res.on("error", abortUpstream);

  req.pipe(upstream);
}

function attachAssistantProxy(
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
  const base = resolveAssistantBaseUrl();
  middlewares.use((req, res, next) => {
    const url = req.url?.split("?")[0] ?? "";
    if (!url.startsWith(ASSISTANT_PREFIX)) {
      next();
      return;
    }
    try {
      pipeUpstream(base, req, res);
    } catch (error) {
      console.error("[ecom-assistant-proxy]", error);
      if (!res.headersSent) {
        sendUnavailable(res);
      }
    }
  });
}

/** Vite plugin: stream-proxy `/api/assistant/*` to the AI service. */
export function ecomAssistantProxyPlugin(): Plugin {
  return {
    name: "ecom-assistant-proxy",
    configureServer(server) {
      attachAssistantProxy(server.middlewares);
    },
    configurePreviewServer(server) {
      attachAssistantProxy(server.middlewares);
    },
  };
}
