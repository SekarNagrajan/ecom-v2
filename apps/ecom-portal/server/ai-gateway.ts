// Created by Sekar Nagarajan (2026-11-13 00:20)
/**
 * Same-origin gateway in front of the n8n text-assist webhooks (grammar / transcribe / rewrite).
 *
 * Until roadmap C1 moves these calls behind the authenticated ai-service, the Vercel rewrites used
 * to expose the public webhooks to anyone. This handler (deployed as `api/ai/[route].ts`) keeps the
 * browser contract unchanged (`POST /api/ai/{grammar|transcribe|rewrite}`) and adds what can be
 * enforced today without a real backend:
 *
 *   - allow-listed routes and POST only
 *   - requests must come from this site (`Sec-Fetch-Site: same-origin`, or a matching `Origin`)
 *   - per-client rate limit (token bucket per IP, best effort per isolate)
 *   - body size caps (audio uploads are larger than text payloads)
 *   - upstream base URL from the environment, never from the client
 *   - optional bearer introspection: when `AI_GATEWAY_INTROSPECT_URL` is set (Spring Boot
 *     `/api/v1/auth/me`), a valid `Authorization: Bearer` header is required and cached briefly
 *
 * The browser-side mock mode (MSW) is unaffected: MSW either stubs these routes or passes them
 * through to this gateway unchanged.
 */

export interface AiGatewayEnv {
  /** Upstream webhook base, e.g. https://n8n.example.com/webhook (no trailing slash needed). */
  N8N_BASE_URL?: string;
  ECOM_N8N_BASE_URL?: string;
  /** When set, every request must carry a bearer token this URL accepts (GET, 2xx = valid). */
  AI_GATEWAY_INTROSPECT_URL?: string;
  /** Requests per minute per client IP (default 30). */
  AI_GATEWAY_RATE_LIMIT?: string;
}

export interface AiGatewayOptions {
  env?: AiGatewayEnv;
  fetchImpl?: typeof fetch;
  now?: () => number;
}

export const DEFAULT_N8N_BASE = "https://n8n.sedge.ai/webhook";

/** Browser route segment → webhook path under the n8n base. */
export const AI_ROUTES: Readonly<Record<string, string>> = {
  grammar: "grammar",
  transcribe: "transcribe",
  rewrite: "v2/mail/rewrite",
};

const TEXT_BODY_LIMIT = 256 * 1024; // grammar / rewrite JSON
const AUDIO_BODY_LIMIT = 25 * 1024 * 1024; // dictation uploads
const INTROSPECT_TTL_MS = 60_000;
const WINDOW_MS = 60_000;

const json = (status: number, body: unknown, extra: Record<string, string> = {}): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...extra },
  });

const clientIp = (req: Request): string =>
  req.headers.get("x-real-ip") ??
  req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
  "unknown";

/** Same-site check. `Sec-Fetch-Site` is set by every current browser; `Origin` is the fallback. */
export function isSameOriginRequest(req: Request): boolean {
  const site = req.headers.get("sec-fetch-site");
  if (site) return site === "same-origin";
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(req.url).origin;
  } catch {
    return false;
  }
}

export function createAiGateway(options: AiGatewayOptions = {}) {
  const env = options.env ?? {};
  const fetchImpl = options.fetchImpl ?? fetch;
  const now = options.now ?? Date.now;
  const limitPerMinute = Math.max(1, Number(env.AI_GATEWAY_RATE_LIMIT) || 30);
  const upstreamBase = (
    env.ECOM_N8N_BASE_URL?.trim() ||
    env.N8N_BASE_URL?.trim() ||
    DEFAULT_N8N_BASE
  ).replace(/\/$/, "");
  const introspectUrl = env.AI_GATEWAY_INTROSPECT_URL?.trim() || "";

  const buckets = new Map<string, { tokens: number; refilledAt: number }>();
  const introspected = new Map<string, number>(); // token → valid-until

  const takeToken = (ip: string): { ok: boolean; retryAfterSeconds: number } => {
    const t = now();
    const bucket = buckets.get(ip) ?? { tokens: limitPerMinute, refilledAt: t };
    const refill = ((t - bucket.refilledAt) / WINDOW_MS) * limitPerMinute;
    bucket.tokens = Math.min(limitPerMinute, bucket.tokens + refill);
    bucket.refilledAt = t;
    if (bucket.tokens < 1) {
      buckets.set(ip, bucket);
      return {
        ok: false,
        retryAfterSeconds: Math.ceil(((1 - bucket.tokens) / limitPerMinute) * 60),
      };
    }
    bucket.tokens -= 1;
    buckets.set(ip, bucket);
    if (buckets.size > 10_000) buckets.clear(); // crude memory guard for long-lived isolates
    return { ok: true, retryAfterSeconds: 0 };
  };

  const assertBearer = async (req: Request): Promise<Response | null> => {
    if (!introspectUrl) return null;
    const auth = req.headers.get("authorization") ?? "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
    if (!token) return json(401, { message: "Sign in to use the AI assistant." });
    const until = introspected.get(token);
    if (until && until > now()) return null;
    try {
      const res = await fetchImpl(introspectUrl, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok)
        return json(401, { message: "Your session is no longer valid. Please sign in again." });
    } catch {
      return json(503, {
        message: "The sign-in service is unavailable. Please try again shortly.",
      });
    }
    introspected.set(token, now() + INTROSPECT_TTL_MS);
    if (introspected.size > 10_000) introspected.clear();
    return null;
  };

  return async function handle(req: Request): Promise<Response> {
    const route = new URL(req.url).pathname.split("/").filter(Boolean).pop() ?? "";
    const webhook = AI_ROUTES[route];
    if (!webhook) return json(404, { message: `Unknown AI route "${route}".` });
    if (req.method !== "POST")
      return json(405, { message: "Method not allowed." }, { Allow: "POST" });
    if (!isSameOriginRequest(req))
      return json(403, { message: "AI assist is only available from the portal." });

    const limit = takeToken(clientIp(req));
    if (!limit.ok) {
      return json(
        429,
        { message: "Too many AI requests. Please wait a moment and try again." },
        { "Retry-After": String(limit.retryAfterSeconds) },
      );
    }

    const declared = Number(req.headers.get("content-length") ?? 0);
    const cap = route === "transcribe" ? AUDIO_BODY_LIMIT : TEXT_BODY_LIMIT;
    if (declared > cap)
      return json(413, { message: "The request is too large for the AI assistant." });

    const denied = await assertBearer(req);
    if (denied) return denied;

    const headers = new Headers();
    const contentType = req.headers.get("content-type");
    if (contentType) headers.set("Content-Type", contentType);
    headers.set("Accept", req.headers.get("accept") ?? "application/json");

    let upstream: Response;
    try {
      upstream = await fetchImpl(`${upstreamBase}/${webhook}`, {
        method: "POST",
        headers,
        body: await req.arrayBuffer(),
      });
    } catch {
      return json(502, { message: "The AI service did not respond. Please try again." });
    }

    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "application/json",
        "Cache-Control": "no-store",
      },
    });
  };
}
