// Created by Sekar Nagarajan (2026-11-13 00:20)
/**
 * Vercel Edge Function: POST /api/ai/{grammar|transcribe|rewrite}.
 * Replaces the former public rewrites to the n8n webhooks; see apps/ecom-portal/server/ai-gateway.ts.
 *
 * Environment (Vercel project settings):
 *   ECOM_N8N_BASE_URL | N8N_BASE_URL   upstream webhook base (defaults to the current n8n host)
 *   AI_GATEWAY_INTROSPECT_URL          optional: Spring Boot /api/v1/auth/me to require a valid bearer
 *   AI_GATEWAY_RATE_LIMIT              optional: requests per minute per IP (default 30)
 */
import { createAiGateway } from "../../apps/ecom-portal/server/ai-gateway";

export const config = { runtime: "edge" };

declare const process: { env: Record<string, string | undefined> };

const handle = createAiGateway({
  env: {
    ECOM_N8N_BASE_URL: process.env.ECOM_N8N_BASE_URL,
    N8N_BASE_URL: process.env.N8N_BASE_URL,
    AI_GATEWAY_INTROSPECT_URL: process.env.AI_GATEWAY_INTROSPECT_URL,
    AI_GATEWAY_RATE_LIMIT: process.env.AI_GATEWAY_RATE_LIMIT,
  },
});

export default function handler(request: Request): Promise<Response> {
  return handle(request);
}
