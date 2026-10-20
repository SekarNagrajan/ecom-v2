<!-- Created by Sekar Nagarajan (2026-10-20 12:32) -->
# AI Chatbot Frontend ↔ Backend Integration — Step Plans (ecom-v2)

Nine step plans derived from the approved integration plan. Each step is sized for one
developer and states its goal, dependencies, files, tasks, contracts, acceptance criteria
and estimate. Steps 2 and 3 run in parallel once Step 1 lands.

**Architecture in one paragraph.** A Python FastAPI service at `apps/ai-service/` owns the
model conversation. The portal mounts an assistant module at
`apps/ecom-portal/src/features/assistant/`. Tools execute **in the browser**, not on the
service: in mock mode MSW serves `/api/*` inside the browser, and Schedules and the Dashboard
have no HTTP endpoint at all (`schedulesApi.searchSchedules` and `dashboardApi.getSummary`
call fixture bridges directly). Booking by chat **prefills the existing wizard**; it never
submits.

---

## Index

| Step | Name | Depends on | Estimate | Owner |
|---|---|---|---|---|
| 1 | Contracts and environment | — | 2–3 days | Tech lead |
| 2 | AI service skeleton (backend) | 1 | 4–5 days | Python developer |
| 3 | Assistant UI and streaming (frontend) | 1 | 4–5 days | React developer |
| 4 | Same-origin routing | 2, 3 | 2 days | React developer + DevOps |
| 5 | Browser-executed tools | 4 | 6–8 days | Both |
| 6 | Booking prefill, navigation and citations | 5 | 3–4 days | React developer |
| 7 | Auth hardening and real mode | 4 | 3–4 days | Python developer + backend team |
| 8 | Server-side tools and direct submit (later) | 7 + backend deliverables | 2–3 weeks | Both + backend team |
| 9 | Testing, rollout and deployment | 2–7 (runs alongside) | ongoing; 3 days to harden | QA + DevOps |

---

## Verified code facts the steps rely on

| What | Where |
|---|---|
| Auth token | `localStorage.ecom_auth_token`, attached as `Authorization: Bearer` by the request interceptor in `libs/platform/src/api-client.ts:29-35`. A 401 on a non-auth-probe URL dispatches the `window` event `ecom:unauthorized`, handled at `apps/ecom-portal/src/main.tsx:68` |
| Who-am-I endpoint | `GET /api/auth/me` (`src/features/auth/api/auth.api.ts`) |
| Permission check | `usePermission().can(code)` in `libs/auth/src/usePermission.ts:7-14` — true for `role === 'ADMIN'`, `isSessionAdmin` and `isImpersonating`, else membership in `user.capabilities`. The route guard `assertCapability` in `src/app/router.tsx:87-99` **also** lets `isTenantAdmin` through, so the two differ; the tool gate must pick one deliberately (see Step 5) |
| Capability codes in use | `ARN`, `BKG`, `BL`, `CRO`, `DO`, `PAY`, `SI`, `VGM` (`src/app/router.tsx`) |
| Existing n8n AI pattern to copy | `apps/ecom-portal/vite-ai-n8n-proxy.ts` (registered at `vite.config.ts:426`), `src/mocks/ai-assist.handlers.ts` (stub vs `fetch(bypass(request))` passthrough), spread into `src/mocks/handlers.ts:44` ahead of `fixtureApiHandlers` at line 64, plus the three `/api/ai/*` rewrites in `/vercel.json` |
| Booking prefill pattern to copy | `useSchedulesController.ts:150-169` — `store.resetWizard(); store.updateMasterDetails(buildMasterDetailsFromSchedule(s)); navigate({to:"/app/booking/new"})`. Mappers in `src/features/booking/utils/map-schedule-to-master-details.ts` and `map-quote-to-master-details.ts`. Store `src/features/booking/stores/booking.store.ts` exposes `resetWizard`, `updateMasterDetails`, `updateParties`, `updateCargo` |
| Read APIs for tools | `schedulesApi.searchSchedules(params)` (fixture bridge, 300 ms simulated delay, **no HTTP**); `trackingApi.getTrackingDetails({searchType, searchValue})` (`GET /api/tracking/search`, returns `null` on 404); `bookingApi` (`/api/booking/list`, `/api/booking/:id`); `si.api.ts`, `bl.api.ts`, `vgm.api.ts`, `cro.api.ts`, `customer-statement.api.ts`, `carbon.api.ts`, `rates.api.ts`, `hotline.api.ts`; `dashboardApi.getSummary` (fixture, no HTTP) |
| Booking list refresh | Grids hold client-side row data; refresh with `invalidateQueries({queryKey: bookingKeys.list()})` (`src/features/booking/api/booking.keys.ts`) |
| Where the launcher goes | `src/components/layout/AuthenticatedLayoutHeader.tsx` — `contactUsDrawerOpen` state at line 84, drawer mounted at line 572. Copy that shape |
| Languages | i18next `en`, `zh`, `ms`, `es` (`src/i18n/config.ts`); namespaces are the files under `src/locales/<lng>/`, loaded automatically |
| Env validation | `libs/platform/src/env.ts` validates exactly three keys today (`VITE_API_URL`, `VITE_API_MODE`, `VITE_APP_TITLE`) with a zod schema and a silent fallback. New assistant keys must be added there, not read ad hoc from `import.meta.env` |

All work follows `.cursor/rules/agenct.md`: shared-ui wrappers only, no inline styles or hex
literals, `custom-scroll` on every scrolling surface, `size="large"` inputs, Lucide icons via
`AppIcon`, RHF + Zod for forms, no `memo`/`useCallback`/`useMemo`, and the
`// Modified by Sekar Nagarajan (YYYY-MM-DD HH:mm)` header on every touched file.

---

# Step 1 — Contracts and environment

**Goal.** Freeze the wire contract, the tool manifest shape and the configuration surface so
Steps 2 and 3 can be built in parallel against a written spec instead of against each other.

**Depends on.** Nothing. **Owner.** Tech lead. **Estimate.** 2–3 days.

### Files

- `docs/assistant/CONTRACT.md` — new, the normative document.
- `apps/ecom-portal/src/features/assistant/api/assistant.types.ts` — new, TypeScript mirror.
- `apps/ai-service/app/schemas.py` — new, Pydantic mirror.
- `libs/platform/src/env.ts` — modified, add the assistant keys to `EnvSchema`.
- `apps/ecom-portal/.env.example`, `apps/ai-service/.env.example` — new/modified.

### Tasks

1. **Transport.** One endpoint, `POST /api/assistant/chat`, responding `text/event-stream`.
   SSE, not WebSockets: it survives the existing proxy/rewrite chain, needs no extra infra,
   and the portal only ever streams server → client.
2. **Request body.**
   ```jsonc
   {
     "conversationId": "uuid",      // null on the first turn; the service returns one
     "userMessage": "string|null",  // present on a user turn
     "toolResults": [               // present on a resume turn, never both
       { "toolUseId": "toolu_…", "ok": true, "content": { }, "error": null }
     ],
     "locale": "en|zh|ms|es",
     "context": { "route": "/app/booking", "tenantCode": "…", "capabilities": ["BKG","SI"] }
   }
   ```
   The browser sends **only the new turn**, never the transcript. The service holds the
   canonical message history keyed by `conversationId`. This is a deliberate decision, not an
   optimisation: Claude's preserved-thinking check invalidates thinking blocks when earlier
   turns are edited, and a browser-rebuilt transcript edits history on every reconnect. Keep
   the server history append-only.
3. **SSE event names and payloads.** Fix these now; both sides key off them.

   | Event | Payload | Meaning |
   |---|---|---|
   | `ready` | `{conversationId}` | First event of every stream |
   | `text` | `{delta}` | Token delta for the visible answer |
   | `thinking` | `{delta}` | Progress note, rendered as a muted status line |
   | `tool_call` | `{toolUseId, name, input}` | Browser must run this tool |
   | `tool_wait` | `{toolUseIds:[…]}` | Stream ends; client resumes with results |
   | `citation` | `{kind, id, label, route}` | A record the answer refers to |
   | `done` | `{stopReason, usage}` | Turn complete |
   | `error` | `{code, message, retryable}` | Terminal failure |

   Parallel tool calls are allowed: one assistant turn may emit several `tool_call` events
   followed by a single `tool_wait`. The client must return **all** results in one resume
   request — splitting them trains the model out of parallel calls.
4. **Tool manifest.** One JSON file, `docs/assistant/tools.json`, is the single source of
   truth for tool name, description, JSON Schema and the capability code that gates it. The
   service loads it to build `tools`; the portal loads it to generate the zod validators. Every
   tool definition carries `"strict": true` and `additionalProperties: false`, because forced
   `tool_choice` is rejected on the current models — schema strictness plus prompt steering is
   how we keep arguments valid.
5. **Error taxonomy.** `AUTH_EXPIRED`, `RATE_LIMITED`, `TOOL_DENIED`, `TOOL_FAILED`,
   `TOOL_TIMEOUT`, `UPSTREAM_ERROR`, `CONTENT_REFUSED`. Each maps to one i18n key.
6. **Configuration.**

   | Key | Where | Notes |
   |---|---|---|
   | `VITE_ASSISTANT_ENABLED` | portal, zod `z.coerce.boolean().default(false)` | Kill switch; default off |
   | `VITE_ASSISTANT_PASSTHROUGH` | portal | `true` = MSW bypasses to the real service in mock mode |
   | `ECOM_AI_SERVICE_URL` | Node/Vite only, **not** `VITE_*` | Dev proxy target |
   | `ANTHROPIC_API_KEY` | ai-service only | Never reaches the bundle |
   | `ASSISTANT_MODEL` | ai-service | Default `claude-opus-5-5` |
   | `ASSISTANT_EFFORT` | ai-service | Default `medium` |

   Rule 10 of the repo rules is absolute: no key, no model name that implies a vendor
   contract, and no service URL with credentials in a `VITE_*` variable.
7. Circulate the contract, get sign-off from both developers, then tag it `assistant-contract-v1`.

### Acceptance criteria

- `docs/assistant/CONTRACT.md` is merged and covers every event, field and error code above.
- `assistant.types.ts` and `schemas.py` are generated from, or hand-checked against, the same
  document; a reviewer can diff them field by field.
- `pnpm -w exec tsc -p apps/ecom-portal/tsconfig.app.json --noEmit` passes with the new types
  imported from a throwaway file.
- `grep -r "ANTHROPIC" apps/ecom-portal/src` returns nothing.
- `env.ts` parses the new keys and still falls back cleanly when they are absent.

### Risks

- Getting the resume shape wrong is the one mistake that forces both sides to be rewritten.
  Prototype the round trip on paper — user turn, `tool_call` ×2, `tool_wait`, resume with two
  results, `text`, `done` — before sign-off.

---

# Step 2 — AI service skeleton (backend)

**Goal.** A FastAPI service that streams a Claude conversation over SSE and can suspend a turn
for browser-executed tools.

**Depends on.** Step 1. **Owner.** Python developer. **Estimate.** 4–5 days.

### Files (all new, under `apps/ai-service/`)

```
pyproject.toml                 app/main.py           app/config.py
app/schemas.py                 app/sse.py            app/conversation.py
app/claude.py                  app/tools.py          app/prompts/system.md
tests/test_stream.py           tests/test_resume.py  Dockerfile  .env.example
```

### Tasks

1. **Scaffold.** FastAPI + uvicorn, `anthropic` SDK, pydantic-settings. `GET /healthz`
   returns build SHA and model id. Structured JSON logging with a per-request id echoed in
   the `X-Request-Id` response header.
2. **Conversation store.** `app/conversation.py` keeps `conversationId → list[MessageParam]`.
   Ship an in-memory `dict` behind an interface with a Redis implementation stubbed; TTL 2
   hours, hard cap of 40 turns. **Append-only** — never rewrite or delete an earlier entry.
3. **The model call.** Use `AsyncAnthropic.messages.stream(...)` with
   `model=settings.model` (`claude-opus-5-5`), `max_tokens=16000`,
   `output_config={"effort": settings.effort}` and `tools=` built from the manifest. Notes
   that will otherwise cost a day of debugging:
   - Thinking is always on for this model. Do **not** send `thinking: {"type": "disabled"}`
     or `budget_tokens` — both return 400. Depth is controlled by `effort` alone, whose
     default is `medium`, so set it explicitly.
   - `tool_choice` `any`/`tool` returns 400. Use the default `auto` and steer from the system
     prompt; `strict: true` on each tool keeps the arguments schema-valid.
   - Set `thinking={"type":"adaptive","display":"summarized"}` only if the UI shows progress
     notes; the default is empty thinking text, which looks like a stall.
   - Parse every tool input with `json.loads`; never string-match the serialized input.
4. **The suspend/resume loop.** The SDK tool runner cannot be used here — it executes tools
   in-process, and ours run in the browser. Write the loop by hand:
   - Stream events, mapping `text_delta` → SSE `text` and `thinking_delta` → SSE `thinking`.
   - On `get_final_message()`, check `stop_reason` **before** touching content. On `refusal`
     emit `error` with `CONTENT_REFUSED` and the `stop_details.category`. On `max_tokens`
     with a `tool_use` block present, stop — do not run the tools.
   - On `stop_reason == "tool_use"`: append the assistant message to the stored history, emit
     one `tool_call` per `tool_use` block, then `tool_wait`, then close the stream.
   - A resume request appends a single user message whose content is the `tool_result` blocks
     (one per `toolUseId`, `is_error: true` for failures — never drop one) and re-enters the
     loop. Reject a resume whose `toolUseId` set does not exactly match what was requested.
   - Cap the turn at 4 tool round-trips, then force a text answer.
5. **System prompt** (`app/prompts/system.md`): role, the carrier/tenant framing, the rule
   that booking is only ever prefilled, the instruction to cite record ids it has actually
   retrieved, a refusal-to-invent rule, and a line naming the tools to prefer per intent
   (this replaces forced tool choice). Keep it byte-stable and put it behind a
   `cache_control: {"type": "ephemeral"}` breakpoint — it is the whole prefix cache.
6. **Fake-client tests.** `tests/` drive the loop with a stubbed Anthropic client so CI needs
   no API key: a text-only turn, a single-tool turn, a parallel-two-tool turn, a resume with
   one `is_error` result, and a `refusal` stop reason.
7. **Dockerfile** — slim base, non-root user, `uvicorn --workers 2`.

### Contracts

Implements `POST /api/assistant/chat` and `GET /healthz` exactly as Step 1 specifies.
No CORS configuration: the browser always reaches this service same-origin (Step 4).

### Acceptance criteria

- `curl -N -X POST localhost:8000/api/assistant/chat -d '{"userMessage":"hello","locale":"en","context":{}}'`
  streams `ready`, `text` deltas and `done`.
- A manifest tool forced by prompt produces `tool_call` + `tool_wait`; posting a matching
  resume body continues the same `conversationId` to a `done`.
- `pytest` green, including the refusal and `max_tokens`-with-tool_use cases.
- A second turn on the same `conversationId` reports a non-zero `cache_read_input_tokens`.
- `docker build` succeeds and `/healthz` answers from the container.

### Risks

- Streaming through uvicorn with a buffering reverse proxy in front silently batches the SSE.
  Test with `curl -N` directly **and** through the Step 4 proxy before calling this done.

---

# Step 3 — Assistant UI and streaming (frontend)

**Goal.** A working assistant drawer that streams a reply, in all four languages, with no
backend dependency — mock SSE stands in until Step 4.

**Depends on.** Step 1. **Owner.** React developer. **Estimate.** 4–5 days.

### Files

```
src/features/assistant/
  api/assistant.types.ts          api/assistant.api.ts        api/sse-parser.ts
  stores/assistant.store.ts       hooks/useAssistantController.ts
  components/AssistantLauncher.tsx   components/AssistantDrawer.tsx
  components/AssistantMessageList.tsx components/AssistantComposer.tsx
  components/AssistantStyles.tsx
src/mocks/assistant.handlers.ts   (+ spread into src/mocks/handlers.ts)
src/locales/{en,zh,ms,es}/assistant.json
src/components/layout/AuthenticatedLayoutHeader.tsx   (modified)
```

### Tasks

1. **Transport.** `fetch` with a `ReadableStream` reader — **not** `apiClient`. Axios buffers
   the whole response and cannot surface SSE deltas. That means the Bearer header and the 401
   handling are not inherited from the interceptor and must be written by hand (Step 7).
2. **`sse-parser.ts`.** A standalone, framework-free parser: decode UTF-8 incrementally,
   split on `\n\n`, tolerate `event:`/`data:` in either order, ignore comment lines, and
   buffer a partial frame across chunks. Unit-test it with chunk boundaries deliberately
   placed mid-frame and mid-multi-byte-character. This is the single highest-value test in
   the whole feature.
3. **Store.** Zustand, per the fixed state model: `messages`, `status`
   (`idle|streaming|awaiting_tools|error`), `conversationId`, `pendingToolCalls`,
   `isOpen`. Server state stays out of React Query here — a stream is not a query.
4. **Launcher.** Copy the `contactUsDrawerOpen` pattern in `AuthenticatedLayoutHeader.tsx`
   (state at line 84, mount at line 572). Render nothing when
   `env.VITE_ASSISTANT_ENABLED` is false. Lucide icon added to `icon-map.ts`, used through
   `AppIcon`; no `@ant-design/icons`.
5. **Drawer.** `AppDrawer`, width 420 on desktop and full-width under `useAntdBreakpoint`'s
   mobile breakpoint. Message list is a scrolling region, so it carries `custom-scroll`.
   Composer uses `size="large"`, Enter sends, Shift+Enter newlines, and the send control is
   disabled while `status !== "idle"`. A visible "Stop" control aborts the fetch via
   `AbortController`.
6. **Rendering.** Assistant text renders as constrained markdown — paragraphs, lists, bold,
   inline code, tables. No raw HTML, no link auto-execution. Streaming text appends to the
   last assistant bubble; `thinking` deltas render as one muted status line that is replaced,
   not accumulated.
7. **Styles.** All CSS lives in `AssistantStyles.tsx` as a token-backed style injector using
   `theme.useToken()` and `tokenMix` for tints. Zero `style={{}}`, zero hex literals.
8. **i18n.** New `assistant` namespace in all four locales: launcher label, placeholder,
   empty state, the seven error codes, Stop, and the "assistant can make mistakes" footer.
   `en` is authoritative; the other three get real translations, not copies.
9. **Mock handler.** `src/mocks/assistant.handlers.ts` mirrors `ai-assist.handlers.ts`:
   when `VITE_ASSISTANT_PASSTHROUGH` is on, `fetch(bypass(request))`; otherwise stream a
   canned scripted reply with realistic delta timing. Spread into `handlers.ts` next to
   `aiAssistHandlers`, and in any case **before** `fixtureApiHandlers`.
10. **Accessibility.** `role="log"` + `aria-live="polite"` on the message list, focus moves
    into the composer on open and back to the launcher on close, Escape closes.

### Acceptance criteria

- With `VITE_API_MODE=mock`, opening the drawer and sending a message streams a canned reply
  token by token; Stop halts it mid-stream and leaves the partial text in place.
- Switching language re-renders every assistant chrome string; no English leaks in `zh`,
  `ms` or `es`.
- `sse-parser` tests cover split frames, split multi-byte characters and unknown event names.
- Keyboard-only operation works end to end; the list announces new assistant messages once.
- `tsc --noEmit`, `vitest run` and `vite build` all pass.

---

# Step 4 — Same-origin routing

**Goal.** `/api/assistant/*` reaches the FastAPI service as a same-origin path in dev,
preview, mock mode and production, with the stream arriving unbuffered.

**Depends on.** Steps 2 and 3. **Owner.** React developer + DevOps. **Estimate.** 2 days.

### Files

- `apps/ecom-portal/vite-assistant-proxy.ts` — new, modelled on `vite-ai-n8n-proxy.ts`.
- `apps/ecom-portal/vite.config.ts` — register the plugin beside the existing one (line 426).
- `apps/ecom-portal/src/mocks/assistant.handlers.ts` — flip to passthrough.
- `/vercel.json` — add the rewrite.
- `apps/ai-service/docker-compose.yml`, `deploy/nginx/assistant.conf` — new.

### Tasks

1. **Vite middleware.** Match `/api/assistant/`, forward method, body and the `Authorization`
   header to `ECOM_AI_SERVICE_URL`, and pipe the response **without** collecting it. Set
   `Content-Type: text/event-stream`, `Cache-Control: no-cache, no-transform`,
   `Connection: keep-alive` and `X-Accel-Buffering: no`, call `res.flushHeaders()`, and pipe
   with `response.body.pipe(res)`. Handle client disconnect by aborting upstream. Mirror the
   existing plugin's env resolution (`ECOM_AI_SERVICE_URL` then a default) and its unit test
   file layout (`vite-ai-n8n-proxy.test.ts` is the template).
2. **MSW passthrough.** With `VITE_ASSISTANT_PASSTHROUGH=true` the handler returns
   `fetch(bypass(request))`. Verify the service worker does not buffer the body — MSW passes
   the stream through, but the handler must return the `Response` directly rather than
   reading `await response.text()`.
3. **Production rewrite.** Add to `vercel.json`, ahead of the SPA catch-all:
   ```json
   { "source": "/api/assistant/(.*)", "destination": "https://<ai-service-host>/api/assistant/$1" }
   ```
   **Verify streaming survives the rewrite before relying on it.** If the platform buffers,
   the fallback is an edge function that proxies with a `ReadableStream`, or hosting the
   service behind the same nginx as the portal. Decide this in Step 4, not in Step 9.
4. **nginx config** for self-hosted deployments: `proxy_buffering off;`,
   `proxy_cache off;`, `proxy_read_timeout 300s;`, `proxy_http_version 1.1;`.
5. **Compose file** running the portal preview and the ai-service together so a developer can
   reproduce the full path locally.

### Acceptance criteria

- `pnpm dev` with `VITE_API_MODE=mock` and `VITE_ASSISTANT_PASSTHROUGH=true`: the drawer
  streams a **real** model reply, and the browser Network tab shows the response arriving in
  chunks, not in one block.
- The same in `vite preview`.
- A deployed preview build streams; a timing log proves first-token latency under 2 s on a
  warm service.
- No CORS header appears anywhere in the chain; a cross-origin call from another host is
  rejected.

### Risks

- Buffering is the classic failure and it is invisible — the feature "works", just slowly and
  all at once. Assert on chunk arrival times in the E2E test, not on the final text.

---

# Step 5 — Browser-executed tools

**Goal.** The model can read portal data by asking the browser to run whitelisted,
capability-gated, schema-validated tools.

**Depends on.** Step 4. **Owner.** Python developer + React developer. **Estimate.** 6–8 days.

### Files

```
src/features/assistant/tools/registry.ts        tools/types.ts
tools/schedules.tool.ts   tools/tracking.tool.ts   tools/booking.tool.ts
tools/documents.tool.ts   tools/rates.tool.ts      tools/account.tool.ts
tools/redact.ts           hooks/useToolRunner.ts
docs/assistant/tools.json                      (shared, from Step 1)
apps/ai-service/app/tools.py                   (loads the same manifest)
```

### Tasks

1. **Registry shape.** One entry per tool:
   ```ts
   interface AssistantTool<TArgs> {
     name: string;
     schema: ZodType<TArgs>;        // mirrors the manifest's JSON Schema
     capability: string | null;      // null = no gate (schedules, rates, tracking are public)
     maxRows: number;
     run(args: TArgs, ctx: ToolContext): Promise<unknown>;
   }
   ```
2. **Tool set for v1 — read only.**

   | Tool | Calls | Capability |
   |---|---|---|
   | `search_schedules` | `schedulesApi.searchSchedules` | — |
   | `track_shipment` | `trackingApi.getTrackingDetails` | — |
   | `get_rates` | `ratesApi` | — |
   | `list_bookings` / `get_booking` | `bookingApi` | `BKG` |
   | `list_shipping_instructions` | `si.api.ts` | `SI` |
   | `list_bills_of_lading` | `bl.api.ts` | `BL` |
   | `list_vgm` | `vgm.api.ts` | `VGM` |
   | `list_cro` | `cro.api.ts` | `CRO` |
   | `list_delivery_orders` | `deliveryOrder api` | `DO` |
   | `list_arrival_notices` | `arrival-notice api` | `ARN` |
   | `get_customer_statement` | `customer-statement.api.ts` | `PAY` |
   | `estimate_carbon` | `carbon.api.ts` | — |
   | `get_dashboard_summary` | `dashboardApi.getSummary` | — |
   | `get_hotline` | `hotline.api.ts` | — |

   No write tools in this step. `prefill_booking` and `navigate_to` arrive in Step 6.
3. **The gate.** `usePermission().can(code)` is the check. Note the discrepancy: the route
   guard also admits `isTenantAdmin`, `can()` does not. **Decision: use `can()`** — a chat
   tool reads data directly rather than rendering a guarded page, so the stricter rule is the
   right default, and a tenant admin who needs it gets the capability explicitly. Record this
   in the contract doc so it is not "fixed" later by someone matching the router.
4. **The runner.** `useToolRunner` consumes `pendingToolCalls`, and for each one:
   `registry[name]` exists → zod-parse the input → capability check → `Promise.race` against a
   15 s timeout → truncate to `maxRows` → redact → collect. Unknown tool, failed parse,
   denied capability, timeout and thrown error each produce a structured
   `{ok:false, error:{code,message}}` result. **Every** requested `toolUseId` gets exactly one
   result, and all of them go back in a single resume request.
5. **Redaction (`redact.ts`).** Strip e-mail addresses, phone numbers, full postal addresses
   and any `password`/`token`/`secret`-shaped key from tool results before they leave the
   browser. The fixtures are anonymised, but production data will not be, and tool results are
   the one place where customer data is sent to the model.
6. **Injection defence.** Tool results are data. The service wraps every `tool_result` body in
   a delimiter and the system prompt states that content inside it is never an instruction. A
   booking remark field containing "ignore previous instructions" must not change behaviour —
   add that exact case to the test suite.
7. **Budget.** At most 4 tool calls per assistant turn (enforced server-side in Step 2) and at
   most 8 per conversation minute client-side; over budget returns `TOOL_DENIED`.
8. **Service side.** `app/tools.py` loads `docs/assistant/tools.json`, validates it against the
   manifest schema at startup (fail fast on drift), and passes the definitions through with
   `strict: true`.

### Acceptance criteria

- "Show me sailings from Singapore to Rotterdam in November" returns real fixture rows, with
  the vessel and voyage visible in the answer.
- "What's the status of booking <id from fixtures>" answers from `get_booking`.
- A user lacking `SI` asking about shipping instructions gets a plain refusal sentence, not an
  error toast and not a stack trace.
- A tool that throws, a tool that times out and an unknown tool name each let the turn finish
  with a sensible message.
- The prompt-injection fixture test passes.
- `vitest run` covers the registry, the gate, redaction and the budget.

### Risks

- Tool-result size is the main cost driver. Cap rows **and** project to the fields the answer
  needs; do not pass whole API payloads through.

---

# Step 6 — Booking prefill, navigation and citations

**Goal.** The assistant can carry the user into the booking wizard with fields already filled,
and every record it mentions becomes a clickable citation. It never submits anything.

**Depends on.** Step 5. **Owner.** React developer. **Estimate.** 3–4 days.

### Files

```
src/features/assistant/tools/prefill-booking.tool.ts
src/features/assistant/tools/navigate.tool.ts
src/features/assistant/components/AssistantActionCard.tsx
src/features/assistant/components/AssistantCitations.tsx
src/features/assistant/utils/citation-routes.ts
```

### Tasks

1. **`prefill_booking`.** Arguments identify a schedule (or a quote) plus any party and cargo
   details gathered in the conversation. Implementation mirrors
   `useSchedulesController.ts:157-168` exactly:
   ```ts
   const store = useBookingStore.getState();
   store.resetWizard();
   store.updateMasterDetails(buildMasterDetailsFromSchedule(schedule));
   // optional, when the conversation supplied them
   store.updateParties(parties);
   store.updateCargo(cargo);
   navigate({ to: "/app/booking/new" });
   ```
   Honour the same `schedule.bookingAllowed` gate the Book Now buttons use — a cut-off or
   sailed voyage refuses with the existing `bookingNotAllowedToast` message.
2. **Confirmation before navigation.** The tool does **not** navigate on its own. It renders
   an `AssistantActionCard` summarising vessel, voyage, POL, POD, ETD and the fields it will
   fill, with Confirm and Cancel. Only Confirm mutates the store and navigates. This is the
   line between "the assistant helped" and "the assistant did something I did not ask for",
   and it is the single most important UX decision in the feature.
3. **Drawer behaviour on navigate.** Close the drawer, keep the conversation in the store, and
   show the launcher in an "active conversation" state so the user can reopen mid-wizard
   without losing context.
4. **`navigate_to`.** A whitelisted map of intent → route (`tracking`, `booking list`, `SI`,
   `BL`, `VGM`, `CRO`, `DO`, `arrival notice`, `rates`, `payment history`, `carbon`,
   `dashboard`). Capability-gated identically to Step 5; unknown targets are refused.
5. **Citations.** `citation-routes.ts` maps `{kind, id}` → a route and a label. Render as
   `AppButton` chips under the message, each navigating to the record. Only ids that came back
   from a tool in this conversation are eligible — a model-invented id must not render as a
   citation.
6. **Cache invalidation.** After navigating away from the wizard or completing a booking,
   `invalidateQueries({queryKey: bookingKeys.list()})` so the grid reflects reality.
7. **Guardrail test.** Assert that no assistant code path calls a booking *submit* mutation.
   A grep-based test is acceptable and cheap.

### Acceptance criteria

- "Book the MSC sailing on the 12th from Singapore to Rotterdam" shows the confirmation card;
  Confirm lands on `/app/booking/new` step 1 with master details populated and **nothing
  submitted**; Cancel leaves the user in the chat.
- A cut-off sailing refuses with the existing wording.
- Citation chips navigate to the right record; an id the model invented does not render.
- Reopening the drawer after navigation restores the conversation.

---

# Step 7 — Auth hardening and real mode

**Goal.** Every assistant request is authenticated, the service trusts nothing the browser
claims, and expiry behaves like the rest of the portal.

**Depends on.** Step 4. **Owner.** Python developer + backend team. **Estimate.** 3–4 days.

### Files

- `src/features/assistant/api/assistant.api.ts` — attach the token, handle 401.
- `apps/ai-service/app/auth.py`, `app/ratelimit.py` — new.
- `apps/ai-service/app/main.py` — dependency wiring.

### Tasks

1. **Client.** Read `localStorage.ecom_auth_token` and set `Authorization: Bearer` manually on
   the streaming fetch — the axios interceptor at `api-client.ts:29-35` does not cover
   `fetch`. On a 401, dispatch the same event the interceptor dispatches:
   ```ts
   window.dispatchEvent(new CustomEvent("ecom:unauthorized", { detail: { reason: "session-expired" } }));
   ```
   so `main.tsx:68` handles it exactly as it does for every other module. Close the drawer and
   clear `pendingToolCalls`.
2. **Service, phase 1.** Verify the bearer by calling `GET /api/auth/me` on the portal API,
   with a 60 s positive cache keyed by a hash of the token. Reject anything else with 401 and
   the `AUTH_EXPIRED` code. Bind `conversationId` to the verified user id: a different user
   presenting a known `conversationId` gets a fresh conversation, never the other user's
   history.
3. **Service, phase 2 (when the Spring Boot backend issues JWTs).** Verify the signature
   locally against the published JWKS, check `exp`, `iss`, `aud` and the tenant claim, and
   drop the `/api/auth/me` round trip. This lines up with the approved backend re-platform
   plan (stateless JWT access + rotating refresh cookie); coordinate the claim names with that
   team rather than inventing them.
4. **Capabilities are advisory from the client.** The `context.capabilities` array in the
   request is a hint for prompting only. Once tools move server-side (Step 8) the service must
   re-derive capabilities from the verified identity. Write that down now so nobody later
   treats the client array as authorisation.
5. **Rate limiting.** Per-user token bucket — 20 turns per 10 minutes, 200 per day — plus a
   global concurrency cap. Over limit returns `RATE_LIMITED` with a retry hint.
6. **Privacy.** Log request ids, token counts and latency; never log message bodies or tool
   results by default. Put body logging behind `ASSISTANT_DEBUG_LOG`, off in every deployed
   environment. Transcripts expire with the conversation TTL and are not persisted.
7. **Abuse.** Cap input length, reject non-UTF-8, and strip control characters.

### Acceptance criteria

- An expired token mid-conversation produces the standard session-expired login flow, not a
  console error.
- A forged or absent token is refused with 401 before any model call is made — verify from the
  service logs that no Anthropic request was issued.
- Two users cannot share a `conversationId`; a test proves it.
- Rate limiting trips at the configured threshold and recovers.
- A log scrape over a full session contains no message text, no e-mail address and no token.

---

# Step 8 — Server-side tools and direct submit (later)

**Goal.** Move tool execution to the service once real REST endpoints exist, and allow
confirmed write actions.

**Depends on.** Step 7 **and** backend deliverables — the Spring Boot modules for Booking, SI,
VGM and BL, plus resolution of the open decisions D1–D8 in the re-platform plan.
**Owner.** Python developer + React developer + backend team. **Estimate.** 2–3 weeks.

### Tasks

1. **Port read tools server-side**, one module at a time, behind a per-tool switch so each can
   fall back to browser execution. Schedules and the Dashboard stay browser-side until they
   have real endpoints — they have none today.
2. **Server-side authorisation.** Re-derive capabilities from the JWT; the client's
   `context.capabilities` becomes diagnostic only.
3. **Write tools** (`submit_booking`, `submit_si`, `submit_vgm`) with, without exception:
   an explicit user confirmation step in the UI carrying the full payload; an idempotency key
   per confirmed action; an audit record of actor, tool, arguments and result; and a dry-run
   validation call before the real one.
4. **Rollback story.** Every write tool documents how a user undoes it, and the assistant says
   so in the confirmation.
5. **Cost control.** Prompt caching on the stable prefix, effort tuned per route (`low` for
   routing-style turns), and a per-tenant monthly budget with alerting. Measure cost per
   completed task, not per request.

### Acceptance criteria

- A read tool behaves identically browser-side and server-side; switching the flag changes
  nothing a user can see.
- No write tool can execute without a recorded confirmation.
- Replaying a confirmation does not double-submit.
- The audit log reconstructs every write action end to end.

---

# Step 9 — Testing, rollout and deployment

**Goal.** Enough automated coverage and operational control to turn the feature on for one
tenant and watch it.

**Depends on.** Runs alongside Steps 2–7. **Owner.** QA + DevOps.
**Estimate.** Ongoing; 3 days to harden at the end.

### Tasks

1. **Frontend unit (vitest).** `sse-parser` chunk boundaries; tool registry dispatch;
   capability gate; redaction; the budget; store transitions.
2. **Frontend integration (MSW).** Scripted SSE fixtures covering a text turn, a tool turn, a
   parallel-tool turn, a denied tool, a timeout, and an auth expiry.
3. **E2E (Playwright).** Open drawer → ask for schedules → assert rows; ask to book → confirm
   → assert the wizard is populated and unsubmitted; assert chunked arrival timing to catch
   proxy buffering; run the suite in each of the four languages for chrome strings.
4. **Backend (pytest).** The loop cases from Step 2 plus auth, rate limiting and the injection
   fixture. Contract tests assert the SSE event names against the Step 1 document so a rename
   breaks CI on both sides.
5. **CI.** Add the ai-service job (ruff + pytest + docker build) to the existing pipeline.
   Keep the portal gate as it is today: `tsc --noEmit`, `vitest run`, `vite build`.
6. **Rollout.** `VITE_ASSISTANT_ENABLED` defaults false. Enable per tenant through the same
   switch mechanism the re-platform plan uses (`ecomv2_module_switch` surfaced via
   `/api/public/tenant`), so turning it off is a config change, not a redeploy — repo rule 13.
   Order: internal → one pilot carrier → general availability.
7. **Observability.** Dashboard for first-token latency, turn duration, tool call counts and
   failure rates by code, token spend per tenant, and refusal rate. Alert on `UPSTREAM_ERROR`
   rate and on p95 first-token latency.
8. **Docs.** A short runbook (how to disable, how to rotate the API key, how to read the
   request id through the proxy chain) and a one-page user-facing note on what the assistant
   can and cannot do.

### Acceptance criteria

- Full suite green in CI, including the ai-service job.
- The feature can be disabled for a tenant and verified off within one minute, no deploy.
- Dashboards show live data from a pilot tenant.
- The runbook is tested by someone who did not write it.

---

## Cross-cutting risks

| Risk | Mitigation |
|---|---|
| SSE buffered somewhere in the chain | Assert on chunk arrival timing in E2E, not final text (Steps 4, 9) |
| Browser-rebuilt transcripts invalidate thinking blocks | Server owns the history, append-only; the client sends only the new turn (Step 1) |
| Tool results carry customer PII to the model | Redaction layer in the browser before results leave (Step 5) |
| Prompt injection via free-text record fields | Delimited tool results + system prompt rule + fixture test (Step 5) |
| The assistant submits something the user did not confirm | No write tools before Step 8; confirmation card mandatory (Steps 6, 8) |
| Token spend grows unnoticed | Row caps, field projection, prompt caching, per-tenant budget and alerting (Steps 5, 8, 9) |
| Capability gate drifts from the route guard | Decision recorded in the contract: tools use `can()` (Step 5) |

## Open decisions to close during Step 1

1. Conversation persistence beyond the 2-hour TTL — none in v1; confirm legal is content.
2. Where the ai-service is hosted in production, and whether the platform rewrite streams.
3. Whether the drawer shows summarised thinking (`display: "summarized"`) or only a spinner.
4. Which pilot carrier goes first, and who owns the kill switch.
