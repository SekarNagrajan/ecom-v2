// Created by Sekar Nagarajan (2026-11-13 00:20)
import { describe, expect, it, vi } from "vitest";

import { AI_ROUTES, createAiGateway, isSameOriginRequest } from "./ai-gateway";

const ORIGIN = "https://portal.example.com";
const post = (route: string, init: RequestInit & { headers?: Record<string, string> } = {}) =>
  new Request(`${ORIGIN}/api/ai/${route}`, {
    method: "POST",
    body: init.body ?? JSON.stringify({ grammartext: "helo" }),
    ...init,
    headers: {
      "sec-fetch-site": "same-origin",
      "content-type": "application/json",
      ...(init.headers ?? {}),
    },
  });

const okUpstream = () =>
  vi.fn(
    async () =>
      new Response(JSON.stringify({ data: { correctedText: "hello" } }), {
        headers: { "content-type": "application/json" },
      }),
  );

describe("ai gateway", () => {
  it("maps the three browser routes to their webhooks", () => {
    expect(Object.keys(AI_ROUTES).sort()).toEqual(["grammar", "rewrite", "transcribe"]);
  });

  it("forwards same-origin POSTs to the configured upstream and relays the response", async () => {
    const fetchImpl = okUpstream();
    const handle = createAiGateway({
      env: { N8N_BASE_URL: "https://n8n.internal/webhook/" },
      fetchImpl,
    });
    const res = await handle(
      post("rewrite", { body: JSON.stringify({ content_html: "<p>x</p>", action: "formal" }) }),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ data: { correctedText: "hello" } });
    expect(res.headers.get("cache-control")).toBe("no-store");
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://n8n.internal/webhook/v2/mail/rewrite");
    expect(init.method).toBe("POST");
    expect((init.headers as Headers).get("content-type")).toBe("application/json");
  });

  it("rejects unknown routes, non-POST methods and cross-site callers before contacting upstream", async () => {
    const fetchImpl = okUpstream();
    const handle = createAiGateway({ fetchImpl });
    expect((await handle(post("summarise"))).status).toBe(404);
    expect(
      (
        await handle(
          new Request(`${ORIGIN}/api/ai/grammar`, {
            method: "GET",
            headers: { "sec-fetch-site": "same-origin" },
          }),
        )
      ).status,
    ).toBe(405);
    expect(
      (await handle(post("grammar", { headers: { "sec-fetch-site": "cross-site" } }))).status,
    ).toBe(403);
    expect(
      (await handle(new Request(`${ORIGIN}/api/ai/grammar`, { method: "POST", body: "{}" })))
        .status,
    ).toBe(403);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("accepts a matching Origin header when Sec-Fetch-Site is absent", () => {
    expect(
      isSameOriginRequest(
        new Request(`${ORIGIN}/api/ai/grammar`, { method: "POST", headers: { origin: ORIGIN } }),
      ),
    ).toBe(true);
    expect(
      isSameOriginRequest(
        new Request(`${ORIGIN}/api/ai/grammar`, {
          method: "POST",
          headers: { origin: "https://evil.example" },
        }),
      ),
    ).toBe(false);
  });

  it("rate-limits a client IP and tells it when to retry", async () => {
    let t = 0;
    const handle = createAiGateway({
      fetchImpl: okUpstream(),
      env: { AI_GATEWAY_RATE_LIMIT: "2" },
      now: () => t,
    });
    const req = () => post("grammar", { headers: { "x-forwarded-for": "203.0.113.9, 10.0.0.1" } });
    expect((await handle(req())).status).toBe(200);
    expect((await handle(req())).status).toBe(200);
    const limited = await handle(req());
    expect(limited.status).toBe(429);
    expect(Number(limited.headers.get("retry-after"))).toBeGreaterThan(0);
    t = 61_000;
    expect((await handle(req())).status).toBe(200);
  });

  it("refuses oversized payloads", async () => {
    const handle = createAiGateway({ fetchImpl: okUpstream() });
    const res = await handle(
      post("grammar", { headers: { "content-length": String(10 * 1024 * 1024) } }),
    );
    expect(res.status).toBe(413);
  });

  it("requires and caches a valid bearer when introspection is configured", async () => {
    const fetchImpl = vi.fn(async (url: string | URL | Request) => {
      if (String(url).includes("/auth/me")) {
        return new Response("{}", { status: 200 });
      }
      return new Response("{}", { headers: { "content-type": "application/json" } });
    });
    const handle = createAiGateway({
      fetchImpl,
      env: { AI_GATEWAY_INTROSPECT_URL: "https://api.example.com/api/v1/auth/me" },
    });
    expect((await handle(post("grammar"))).status).toBe(401);
    const authed = () => post("grammar", { headers: { authorization: "Bearer abc" } });
    expect((await handle(authed())).status).toBe(200);
    expect((await handle(authed())).status).toBe(200);
    const introspections = fetchImpl.mock.calls.filter(([url]) =>
      String(url).includes("/auth/me"),
    ).length;
    expect(introspections).toBe(1);
  });

  it("answers 502 when the upstream is unreachable", async () => {
    const handle = createAiGateway({
      fetchImpl: vi.fn(async () => {
        throw new Error("ECONNREFUSED");
      }),
    });
    expect((await handle(post("grammar"))).status).toBe(502);
  });
});
