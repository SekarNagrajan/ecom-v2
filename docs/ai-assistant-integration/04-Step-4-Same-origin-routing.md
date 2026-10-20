# AI Chatbot Integration — Step 4 of 9

# Step 4: Same-origin routing and the MSW stub
**Goal.** `/api/assistant/*` reaches the FastAPI service same-origin in dev, preview and production with the stream unbuffered — and, with the stub on, needs no service at all.

**Files**
```
apps/ecom-portal/src/mocks/assistant.handlers.ts  # new — stub + bypass (Step 3 builds against this)
apps/ecom-portal/src/mocks/handlers.ts            # modified — spread beside aiAssistHandlers (line 44)
apps/ecom-portal/vite-assistant-proxy.ts          # new, modelled on vite-ai-n8n-proxy.ts
apps/ecom-portal/vite-assistant-proxy.test.ts     # new, mirrors vite-ai-n8n-proxy.test.ts
apps/ecom-portal/vite.config.ts                   # register beside ecomAiN8nProxyPlugin (line 426)
vercel.json                                       # add the rewrite
apps/ai-service/compose.yaml                      # portal preview + service + redis
deploy/nginx/assistant.conf                       # new
```

**Tasks**
1. **MSW stub.** `assistant.handlers.ts` mirrors `ai-assist.handlers.ts`, which already does
   exactly this two-mode dance for `/api/ai/*`:
   - `VITE_AI_ASSISTANT_USE_MSW_STUB === 'true'` → stream a scripted
     `meta` → `token`s → `done` with realistic delta timing, built from a
     `ReadableStream` so Step 3's parser sees real chunk boundaries. Include one scripted
     conversation that ends in `error RATE_LIMITED` so the Retry row can be exercised.
   - otherwise → `fetch(bypass(request))`, returning that `Response` object **as-is**. Never
     `await response.text()`; that collapses the stream into the single-JSON fallback path.
   Spread into `handlers.ts` beside `aiAssistHandlers` (line 44) and in all cases **before**
   `fixtureApiHandlers` (line 64), which is registered last so hand-written routes win.
2. **Prefix mapping — state it once and test it.** The browser calls
   `/api/assistant/v1/chat`; the service mounts `/v1/chat`. Every hop strips `/api/assistant`:
   `/api/assistant/<rest>` → `${AI_ASSISTANT_BASE_URL}/<rest>`. Step 1 names the outer path and
   Step 2 the inner one; nothing between them does the strip unless this step does.
3. **Vite middleware.** Match `/api/assistant/`, forward method, body and the `Authorization`
   header, and pipe the response **without** collecting it: set `Content-Type:
   text/event-stream`, `Cache-Control: no-cache, no-transform`, `Connection: keep-alive`,
   `X-Accel-Buffering: no`, call `res.flushHeaders()`, then `response.body.pipe(res)`. Abort
   upstream on client disconnect. Resolve `AI_ASSISTANT_BASE_URL` from `process.env` with the
   `http://localhost:8000` default, exactly as the n8n plugin resolves `ECOM_N8N_BASE_URL` —
   and keep it out of `VITE_*`, so it never reaches the bundle.
4. **Production rewrite.** In `vercel.json`, **ahead of** the `/(.*)` → `/index.html`
   catch-all:
   ```json
   { "source": "/api/assistant/(.*)", "destination": "https://<ai-service-host>/$1" }
   ```
   **Verify the platform streams this unbuffered before relying on it.** If it buffers, in
   order of preference: an edge function proxying with a `ReadableStream`; hosting the service
   behind the same nginx as the portal; or, last resort, the service answering that route with
   a single JSON body — which Step 3's `streamChat` already handles, at the cost of losing
   token-by-token rendering. Decide here, not in Step 9.
5. **nginx** for self-hosted deployments: `proxy_buffering off;`, `proxy_cache off;`,
   `proxy_http_version 1.1;`, `proxy_read_timeout 300s;`.
6. **compose.yaml** runs the portal preview, the service and redis together so one developer
   can reproduce the whole path locally.

**Acceptance criteria**
- Stub on: the drawer streams a scripted reply with no service running, and the Retry row
  appears on the scripted `RATE_LIMITED` conversation.
- Stub off, `pnpm dev`: the drawer streams a **real** model reply, and the Network tab shows
  chunked arrival, not one block.
- The same under `vite preview`.
- A deployed preview streams; a timing log shows first token under 2 s on a warm service.
- `GET /api/assistant/healthz` answers through the proxy.
- No CORS header anywhere in the chain; a cross-origin call from another host is rejected.

**Risk.** Buffering is the classic failure and it is invisible — the feature "works", just
slowly and all at once. Assert on chunk arrival timing in the E2E test, not on the final text.

_See 00-Overview-and-Code-Facts.md for the shared code facts and step dependencies._
