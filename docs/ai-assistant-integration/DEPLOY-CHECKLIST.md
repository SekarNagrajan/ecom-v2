<!-- Modified by Sekar Nagarajan (2026-10-20 13:15) -->
# AI Assistant — Deploy checklist (playbook Step 13)

Use with [`apps/ai-service/README.md`](../../apps/ai-service/README.md) Deploy section.

## Pre-flight

- [ ] `apps/ai-service` image builds (`docker build -t ecom-ai-service apps/ai-service`)
- [ ] Redis reachable from the service (`/readyz` returns ok)
- [ ] `AUTH_MODE=backend-introspect` and `BACKEND_BASE_URL` validated against `/api/auth/me`
- [ ] `ANTHROPIC_API_KEY` in secret manager (never in git / chat)
- [ ] Root `vercel.json` `/api/assistant/:path*` rewrite points at real host (or nginx ingress streams SSE with `proxy_buffering off`)

## Rollout

- [ ] Staging: `VITE_ASSISTANT_ENABLED=true`
- [ ] Smoke: chat streams (`text/event-stream`); MSW stub off
- [ ] Pilot 1–2 tenants; kill switch remains `VITE_ASSISTANT_ENABLED`
- [ ] Open PR `feat/ai-assistant` → `ecom-v2`

## Watch

- Time to first token
- Tool error / FORBIDDEN rate
- Token cost
- Thumbs-down via `POST /v1/feedback`
