<!-- Modified by Sekar Nagarajan (2026-10-20 16:53) -->
# AI Assistant Wire Contract (normative)

Version: `assistant-contract-v1`  
Source of truth for `apps/ai-service` and `apps/ecom-portal/src/features/assistant`.  
Field names on the wire are **snake_case**. Do not invent fields.

Browser always calls same-origin `/api/assistant/*`. Proxies **strip** `/api/assistant` and
forward to this service (`/v1/...`).

---

## Assistant modes

| `mode` | Purpose | Notes |
|---|---|---|
| `assistant` | Default shipping Q&A + lookups + prefill | Full capability-gated tool set |
| `automation` | Conversational booking prep + confirm-gated submit | `propose_booking_submit` UI card → browser `bookingApi.submitBooking` |
| `sql` | Schema + read-only SQL | `describe_schema`, `run_sql_readonly` (requires `SQL` capability + `SQL_SERVICE_URL`) |
| `docs` | Tutorials and portal how-tos | RAG over `knowledge/**` via `search_portal_guide` (Phase 2 corpus) |

Conversations are **immutable** to one `mode` after create. Sending a different `mode`
with an existing `conversation_id` yields `BAD_REQUEST` (`conversation_id mode mismatch`).
UI mode selection never grants privileges; the service intersects mode allowlists with
capability gates independently.

---

## POST /v1/chat

`Content-Type: application/json` → `text/event-stream` (SSE).

### Request body

| Field | Type | Notes |
|---|---|---|
| `conversation_id` | `string \| null` | Null on first turn; service returns one in `meta` |
| `message` | `string \| null` | User text on a user turn; max 4000 chars |
| `tool_results` | `ToolResult[] \| null` | Resume turn; never send both a non-empty `message` and `tool_results` |
| `client_context` | `ClientContext` | Route, locale, capabilities for gating |
| `tools` | `string[] \| null` | Optional allowlist of tool names; null = all capability-eligible tools |
| `mode` | `string` | `assistant` \| `automation` \| `sql` \| `docs` (default `assistant`) |

```json
{
  "conversation_id": null,
  "message": "Show my open bookings",
  "tool_results": null,
  "client_context": {
    "route": "/app/booking",
    "locale": "en",
    "tenant_code": "ACME",
    "capabilities": ["BKG", "SI"]
  },
  "tools": null,
  "mode": "assistant"
}
```

#### ClientContext

| Field | Type |
|---|---|
| `route` | `string` |
| `locale` | `string` (`en` \| `zh` \| `ms` \| `es`) |
| `tenant_code` | `string \| null` |
| `capabilities` | `string[]` |

#### ToolResult (resume)

| Field | Type |
|---|---|
| `call_id` | `string` (matches prior `tool_call.call_id`) |
| `ok` | `boolean` |
| `content` | `object \| null` |
| `error` | `string \| null` |

```json
{
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": null,
  "tool_results": [
    {
      "call_id": "toolu_01ABC",
      "ok": true,
      "content": { "items": [] },
      "error": null
    }
  ],
  "client_context": {
    "route": "/app/booking",
    "locale": "en",
    "tenant_code": "ACME",
    "capabilities": ["BKG"]
  },
  "tools": null
}
```

The browser sends **only the new turn**. The service holds append-only history in Redis.

### SSE events

Each event: `event: <name>` + `data: <json>`.

#### `meta` (first event of every stream)

```json
{
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
  "request_id": "req_01HX"
}
```

#### `token`

```json
{
  "delta": "Here are your "
}
```

#### `citation`

Emitted when the model text contains `[[cite:/app/route|Title]]`.

```json
{
  "route": "/app/booking/abc",
  "title": "BKG-1001",
  "marker": "[[cite:/app/booking/abc|BKG-1001]]"
}
```

#### `tool_call`

Browser must execute the named tool via existing feature APIs.

```json
{
  "call_id": "toolu_01ABC",
  "name": "list_bookings",
  "arguments": { "status": "open" }
}
```

#### `ui_action`

Not a data tool. Browser performs a UI side-effect (`prefill_booking`, `navigate`).

```json
{
  "call_id": "toolu_01DEF",
  "kind": "ui_action",
  "name": "navigate",
  "arguments": { "route": "/app/booking/new" }
}
```

#### `error`

```json
{
  "code": "RATE_LIMITED",
  "message": "Too many requests",
  "retryable": true
}
```

#### `done` (always last)

```json
{
  "awaiting_tools": false,
  "pending_call_ids": []
}
```

When tools are pending:

```json
{
  "awaiting_tools": true,
  "pending_call_ids": ["toolu_01ABC", "toolu_01DEF"]
}
```

### Error codes

| Code | When | retryable |
|---|---|---|
| `UNAUTHORIZED` | Missing/invalid auth | false |
| `RATE_LIMITED` | Per-minute or daily cap | true |
| `LLM_UNAVAILABLE` | Anthropic / upstream failure | true |
| `TOOL_LIMIT` | Exceeded `MAX_TOOL_ROUNDS` | false |
| `BAD_REQUEST` | Invalid body, unknown `call_id`, bad args shape | false |
| `INTERNAL` | Unexpected server error | false |

On error the stream still ends with `done` (`awaiting_tools: false`).

---

## GET /v1/conversations/{id}

Returns stored conversation summary (not full Anthropic blocks).

```json
{
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
  "turn_count": 4,
  "pending_tool_calls": [],
  "updated_at": "2026-10-20T07:00:00Z"
}
```

404 if missing or expired.

---

## POST /v1/feedback

Body:

```json
{
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
  "rating": "up",
  "comment": "Helpful"
}
```

Response: `204 No Content`. Stored in a Redis list (`feedback`).

---

## GET /healthz

```json
{ "ok": true }
```

## GET /readyz

Pings Redis. `200` `{ "ok": true }` or `503` `{ "ok": false, "reason": "redis" }`.

---

## Tool catalog

Tools run **in the browser**. Capability gate uses portal `usePermission().can(code)` —
**stricter than** the route guard `assertCapability` (which also admits `isTenantAdmin`).
Tools with capability `none` are always eligible when listed.

| name | args (JSON Schema summary) | capability |
|---|---|---|
| `search_schedules` | `{ origin?, destination?, etd_from?, etd_to? }` | none |
| `track_shipment` | `{ search_type, search_value }` | none |
| `get_rates` | `{ origin?, destination?, container_type? }` | none |
| `list_bookings` | `{ status?, page?, page_size? }` | BKG |
| `get_booking` | `{ booking_id }` | BKG |
| `list_shipping_instructions` | `{ status?, page? }` | SI |
| `list_bills_of_lading` | `{ status?, page? }` | BL |
| `list_vgm` | `{ status?, page? }` | VGM |
| `list_cro` | `{ status?, page? }` | CRO |
| `list_delivery_orders` | `{ status?, page? }` | DO |
| `list_arrival_notices` | `{ status?, page? }` | ARN |
| `get_customer_statement` | `{ from_date?, to_date? }` | PAY |
| `estimate_carbon` | `{ origin, destination, containers }` | none |
| `get_dashboard_summary` | `{}` | none |
| `get_hotline` | `{}` | none |
| `search_portal_guide` | `{ query, module? }` | none (runs **server-side** in ai-service) |
| `describe_schema` | `{ entity? }` | SQL (server-side; logical schema from `knowledge/sql/schema.md`) |
| `run_sql_readonly` | `{ sql, limit?, explanation? }` | SQL (server-side; validated then proxied to `SQL_SERVICE_URL`) |

`run_sql_readonly` rejects multi-statement and mutating SQL. When `SQL_SERVICE_URL` is empty,
returns `{ ok: false, code: "SQL_SERVICE_UNAVAILABLE" }` without fabricating rows.
On success the loop also emits a `show_sql_result` UI action so the portal can render a table card
(the model cannot invent that card).

### UI actions (`kind=ui_action`, not `tool_call`)

| name | args | capability |
|---|---|---|
| `prefill_booking` | `{ schedule_id? \| quote_id? \| master_details? }` | BKG |
| `propose_booking_submit` | `{ summary, schedule_id? \| origin/delivery?, … }` | BKG (automation mode) — card only; portal submits after explicit confirm |
| `show_sql_result` | `{ sql, columns, rows, row_count?, truncated?, explanation? }` | emitted by service after successful `run_sql_readonly` (not model-callable) |
| `navigate` | `{ route }` — allowlist `/app/*` only | none |

For UI actions the service emits `ui_action`, then returns a synthetic tool result
`{ "ok": true, "shown_to_user": true }` to Claude in the same turn and continues
(or ends with `awaiting_tools` only for browser data tools). Prefer: emit `ui_action`,
include synthetic success for the model, continue streaming.

**Submit boundary:** Default assistant mode never submits. Automation mode may submit only after
the user confirms `AutomationConfirmCard` → browser `bookingApi.submitBooking`.

---

## Environment variables

### Frontend (portal)

| Key | Notes |
|---|---|
| `VITE_ASSISTANT_ENABLED` | Kill switch (`"true"` / `"false"` string) |
| `VITE_AI_ASSISTANT_USE_MSW_STUB` | When `"true"`, MSW stubs `/api/assistant/*`; when `"false"`, passthrough to Vite proxy / real service |

### Proxy (Node / Vite / hosting)

| Key | Notes |
|---|---|
| `ECOM_AI_SERVICE_URL` / `AI_ASSISTANT_BASE_URL` | Dev proxy / rewrite target; **not** `VITE_*` |

### Backend (this service)

| Key | Default (local) | Notes |
|---|---|---|
| `ENV` | `development` | `production` forbids `AUTH_MODE=trusted-dev` |
| `AUTH_MODE` | `trusted-dev` | or `backend-introspect` |
| `REDIS_URL` | `redis://localhost:6379/0` | |
| `ANTHROPIC_API_KEY` | — | Never in frontend |
| `LLM_CHAT_MODEL` | `claude-sonnet-5-5` | |
| `LLM_ROUTER_MODEL` | `claude-haiku-5-5` | Guard classifier |
| `LLM_EFFORT` / `LLM_CHAT_EFFORT` | `low` | Sonnet 5.5 chat effort |
| `LLM_GUARD_MODEL` | `claude-haiku-5-5` | Alias of router model for the guard |
| `LLM_ENABLE_FALLBACK` | `true` | Claude API server-side fallbacks |
| `LLM_ENABLE_COMPACTION` | `true` | Server-side context compaction |
| `BACKEND_BASE_URL` | — | Introspect base for `/api/auth/me` |
| `SQL_SERVICE_URL` | empty | Optional controlled SQL service; `POST {url}/run-sql` |
| `SQL_SERVICE_TOKEN` | empty | Optional Bearer for SQL service when portal auth is not forwarded |
| `SQL_QUERY_TIMEOUT_SECONDS` | `30` | SQL service HTTP timeout |
| `RATE_LIMIT_PER_MIN` | `30` | |
| `DAILY_MSG_CAP` | `200` | |
| `MAX_MESSAGE_LENGTH` | `4000` | |
| `MAX_TOOL_ROUNDS` | `5` | |
| `TOOL_RESULT_MAX_BYTES` | `8000` | Truncate tool result JSON |
| `MAX_USER_TURNS_PER_CONVERSATION` | `40` | Hard cap; **never** trim Anthropic history |

Conversation history is **append-only** (Claude Sonnet 5.5 thinking / prompt-cache).
Long chats use server-side compaction, then the turn cap asks the user to start a new chat.

---

## Capability gating note

Browser tool execution must call `usePermission().can(code)` before invoking a gated tool.
That helper is **stricter** than `assertCapability` in the router (which also allows
`isTenantAdmin`). Do not use the route guard for the tool gate.

---

## Open decisions (backend team)

1. Real-mode token format and whether `GET /api/auth/me` accepts the portal Bearer as-is.
2. Production hosting of `ai-service` and whether the edge rewrite streams SSE unbuffered.
3. Conversation retention beyond Redis 24 h TTL — legal / compliance sign-off.
4. Pilot carrier and kill-switch ownership (`VITE_ASSISTANT_ENABLED`).
5. Data-protection approval for forwarding tool results to the Claude API.
6. Production SQL service URL, tenant isolation, and who holds the `SQL` capability.
7. Whether automation confirm-gated submit remains browser-only (current) or moves server-side.
