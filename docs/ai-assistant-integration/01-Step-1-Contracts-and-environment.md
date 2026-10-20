# AI Chatbot Integration — Step 1 of 9

# Step 1: Contracts and environment (shared foundation)
**Goal.** Freeze the contract between portal and AI service so both sides can build in parallel against it.

**Tasks**
1. Write `apps/ai-service/CONTRACT.md`, the single source of truth for the request, response and event shapes.
2. **Request: `POST /api/assistant/v1/chat`.** Headers `Authorization: Bearer <token>` and `Accept: text/event-stream`. Body:
   ```jsonc
   {
     "conversation_id": "uuid | null",          // null starts a new conversation
     "message": "string | null",                // user text (null on a tool-results leg)
     "tool_results": [{ "call_id": "string", "ok": true, "data": {}, "error": null }],
     "client_context": {
       "route": "/app/booking", "lang": "en", "tenant_id": "TENANT_01",
       "selected": { "type": "booking|si|bl|container", "id": "string" } ,
       "user": { "id": "...", "role": "CUSTOMER", "capabilities": ["BKG","SI"] } // trusted only in dev mode
     },
     "tools": ["track_shipment", "search_schedules"]  // tools this browser can run for this user
   }
   ```
3. **Response: SSE events.** One JSON object per `data:` line, with the `event:` name set:

   | Event | Payload |
   |---|---|
   | `meta` | `{conversation_id, message_id}`, always first |
   | `token` | `{text}` |
   | `citation` | `{title, route, module}` |
   | `tool_call` | `{call_id, name, args}` |
   | `ui_action` | `{action_id, kind: "navigate" \| "prefill_booking", payload}` |
   | `error` | `{code, message, retryable}`; codes `UNAUTHORIZED`, `RATE_LIMITED`, `LLM_UNAVAILABLE`, `TOOL_LIMIT`, `BAD_REQUEST`, `INTERNAL` |
   | `done` | `{awaiting_tools: boolean}`, always last |

4. **Other endpoints:** `GET /v1/conversations/{id}` → `{messages: [{id, role, text, cards[]}]}`; `POST /v1/feedback {message_id, rating, comment?}` → 204; `GET /healthz`, `GET /readyz`.
5. **Tool catalog.** Name, args schema (JSON Schema), capability, and a one-line description for each tool. This list is mirrored in `app/tools/catalog.py` and `features/assistant/tools/registry.ts`.
6. **Environment variables:**

   | Side | Variables |
   |---|---|
   | Frontend | `VITE_ASSISTANT_ENABLED` (default `false`), `VITE_AI_ASSISTANT_USE_MSW_STUB` |
   | Node proxy (dev) | `AI_ASSISTANT_BASE_URL` (default `http://localhost:8000`) |
   | Backend | `ANTHROPIC_API_KEY`, `LLM_CHAT_MODEL=claude-sonnet-5-5`, `LLM_ROUTER_MODEL=claude-haiku-5-5`, `AUTH_MODE=trusted-dev\|backend-introspect`, `BACKEND_BASE_URL`, `REDIS_URL`, `ENV`, `RATE_LIMIT_PER_MIN=30`, `MAX_TOOL_ROUNDS=5`, `TOOL_RESULT_MAX_BYTES=8000` |

7. Add the frontend variables to `apps/ecom-portal/.env.example` and create `apps/ai-service/.env.example`.
8. Get decisions from the backend team (record the answers in `CONTRACT.md`):
   - the real-mode token format;
   - whether `/api/auth/me` works with it;
   - the façade base URL per environment;
   - where the AI service will be hosted;
   - data-protection approval for the Claude API.

**Acceptance criteria**
- `CONTRACT.md` has been reviewed by both developers.
- The event and tool lists are frozen for Steps 2–6.

_See 00-Overview-and-Code-Facts.md for the shared code facts and step dependencies._
