# AI Chatbot Integration — Step 2 of 9

# Step 2: AI service skeleton (backend)
**Goal.** A runnable FastAPI service that streams Claude answers over SSE and keeps conversation state. No tools yet.

**Files (all new, under `apps/ai-service/`)**
```
pyproject.toml            # python 3.12, fastapi, uvicorn, anthropic, pydantic-settings, redis, sse-starlette, httpx, pytest, respx
.env.example  Dockerfile  README.md  CONTRACT.md
app/main.py               # FastAPI app, routers, lifespan (redis pool, anthropic client)
app/config.py             # Settings(BaseSettings) — all env vars typed
app/api/chat.py           # POST /v1/chat → EventSourceResponse
app/api/conversations.py  # GET /v1/conversations/{id}
app/api/feedback.py       # POST /v1/feedback
app/api/health.py         # /healthz, /readyz (pings redis)
app/auth/context.py       # resolve_user(request) → UserContext (trusted-dev only in this step)
app/llm/client.py         # thin wrapper over anthropic.AsyncAnthropic().messages.stream
app/llm/prompts.py        # system prompt: portal assistant, answer only about ecom portal, cite screens, never invent data
app/llm/loop.py           # run_turn(state) → async iterator of events
app/store/conversations.py# Redis: conv:{id} → JSON (messages, pending_tool_calls), TTL 24h, keep last 20 turns
app/models/events.py      # Pydantic models for every SSE event (matches CONTRACT.md)
app/models/chat.py        # ChatRequest, ClientContext, ToolResult
tests/test_chat_stream.py tests/test_conversations.py
```

**Tasks**
1. **`config.py`.** At startup, fail if `ENV=production` and `AUTH_MODE=trusted-dev`.
2. **`chat.py` flow:**
   1. Validate `ChatRequest`.
   2. `user = resolve_user()`.
   3. Load or create the conversation.
   4. Append the user message.
   5. Emit `meta`.
   6. Stream `client.messages.stream(model=LLM_CHAT_MODEL, system=..., messages=history)`, emitting each text delta as `token`.
   7. Save the assistant message.
   8. Emit `done {awaiting_tools:false}`.
3. **Errors.** Map Anthropic 429/5xx to `error {code: LLM_UNAVAILABLE, retryable: true}`. Validation errors go to `BAD_REQUEST`. Always close with `done`.
4. **System prompt.** Include:
   - the user's role, capabilities and portal language (answer in `client_context.lang`);
   - the current route;
   - the rule: "if you don't know, say so and point to the screen".
5. **Rate limit.** Redis `INCR rl:{user_id}:{minute}` with a 60 s expiry. Over `RATE_LIMIT_PER_MIN` returns `error RATE_LIMITED`.
6. **Logging.** Structured JSON with `request_id`, `conversation_id`, `user_id`, latency and token counts. Never log the bearer token.
7. **Docker.** A Dockerfile (python:3.12-slim, non-root, `uvicorn app.main:app --host 0.0.0.0 --port 8000`), plus `compose.yaml` with redis.

**Acceptance criteria**
- `curl -N -X POST localhost:8000/v1/chat -d '{"message":"hello","client_context":{...},"tools":[]}'` streams `meta`, then `token`s, then `done`.
- A second call with the same `conversation_id` remembers context.
- `uv run pytest` passes with Claude mocked (respx / a fake client).

_See 00-Overview-and-Code-Facts.md for the shared code facts and step dependencies._
