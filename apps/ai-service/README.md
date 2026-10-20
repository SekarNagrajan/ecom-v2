<!-- Modified by Sekar Nagarajan (2026-10-20 12:52) -->
# AI Assistant Service

Python FastAPI service that owns the Claude conversation for the e-com portal assistant.
Tools execute **in the browser**; this service streams SSE and never connects to the e-com
database. Normative wire contract: [`CONTRACT.md`](./CONTRACT.md).

## Requirements

- Python 3.12+
- [uv](https://docs.astral.sh/uv/)
- Redis 7 (local or via Compose)
- `ANTHROPIC_API_KEY` for real model calls (tests stub the LLM)

## Run locally

```bash
cd apps/ai-service
cp .env.example .env
# edit .env — set ANTHROPIC_API_KEY for live chat

# Redis
docker compose up -d redis
# or: redis-server

uv sync
uv run uvicorn app.main:app --reload --port 8000
```

Health:

```bash
curl -s http://localhost:8000/healthz
curl -s http://localhost:8000/readyz
```

Chat (trusted-dev auth):

```bash
curl -N -X POST http://localhost:8000/v1/chat \
  -H 'Content-Type: application/json' \
  -d '{"conversation_id":null,"message":"Hello","tool_results":null,"client_context":{"route":"/app","locale":"en","capabilities":["BKG"]},"tools":null}'
```

Full stack (service + Redis):

```bash
cp .env.example .env
docker compose up --build
```

## Tests

```bash
uv sync
uv run pytest
```

## Evals

```bash
uv run python evals/run.py
# or against a running server:
AI_SERVICE_URL=http://localhost:8000 uv run python evals/run.py
```

## Auth modes

| Mode | Behavior |
|---|---|
| `trusted-dev` | Dev user from settings; rejects if `ENV=production` |
| `backend-introspect` | `GET {BACKEND_BASE_URL}/api/auth/me` with Bearer; Redis cache 60s |

## Portal integration

Browser calls same-origin `/api/assistant/*`. Dev proxy / production rewrite strips that
prefix and forwards to this service (`/v1/...`). See portal `vite-assistant-proxy` and
`CONTRACT.md` env table.

## Deploy (with DevOps)

1. **Build image:** `docker build -t ecom-ai-service .` from this directory; push to your registry.
2. **Run next to the e-com backend** with:
   - `ENV=production`
   - `AUTH_MODE=backend-introspect`
   - `BACKEND_BASE_URL` (façade that serves `GET /api/auth/me`)
   - `REDIS_URL`
   - `ANTHROPIC_API_KEY` from the secret manager
   - Health check: `GET /readyz`
3. **Ingress (nginx example):** stream SSE unbuffered:
   ```nginx
   location /api/assistant/ {
     proxy_pass http://ai-service:8000/;
     proxy_buffering off;
     proxy_read_timeout 120s;
   }
   ```
4. **Vercel demo:** replace `AI_SERVICE_HOST` in root `vercel.json` rewrite with the real host.
5. **Rollout:** set `VITE_ASSISTANT_ENABLED=true` on staging first, then pilot tenants.
6. **Watch:** time to first token, tool error rate, token cost, thumbs-down feedback (`POST /v1/feedback`).

## Knowledge base and RAG

Retrieval behind the `search_portal_guide` tool is **hybrid**: BM25
(`app/knowledge/index.py`) fused with a persistent ChromaDB vector index
(`app/knowledge/vector.py`, local ONNX MiniLM embeddings — no external API)
via reciprocal rank fusion (`app/knowledge/retriever.py`). If the vector
store is missing the service degrades to BM25 only.

Pipeline (rerun after any knowledge or mock change):

```bash
# 1. Ingest the E-com v2 portal mock layer → knowledge/<module>/mock-data.md
uv run python -I scripts/ingest_ecom_mocks.py \
  --src ../ecom-portal/src/mocks

# 2. Build ("train") the vector index → var/vector-db
uv run python scripts/build_vector_index.py
```

Config: `RAG_VECTOR_ENABLED` (default true), `VECTOR_DB_PATH`
(default `var/vector-db`). `var/` is git-ignored; build the index per
environment (the Docker image can run the build script at release time).

## Model providers (including free tiers)

`LLM_PROVIDER` selects the backend. `anthropic` is the intended production
path; `openai` uses the OpenAI SDK and — via `OPENAI_BASE_URL` — **any
OpenAI-compatible endpoint**, so free tiers need no code change.

```bash
# Anthropic (production target)
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...

# OpenAI
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-...

# Groq (free tier, OpenAI-compatible, supports tool calling)
LLM_PROVIDER=openai
OPENAI_API_KEY=gsk_...
OPENAI_BASE_URL=https://api.groq.com/openai/v1
OPENAI_CHAT_MODEL=<a tool-calling model from Groq's current list>

# OpenRouter (free `:free` models; tool support varies per model)
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-or-...
OPENAI_BASE_URL=https://openrouter.ai/api/v1

# Ollama / LM Studio (fully local, no key, no quota)
LLM_PROVIDER=openai
OPENAI_API_KEY=ollama
OPENAI_BASE_URL=http://localhost:11434/v1
OPENAI_CHAT_MODEL=<a local model with tool support>
```

### Fully local setup (Ollama)

```bash
# Linux / macOS
./scripts/setup_local_llm.sh              # installs Ollama, pulls a model
./scripts/setup_local_llm.sh qwen2.5:7b   # or pick your own model

# Windows (PowerShell)
.\scripts\setup_local_llm.ps1
.\scripts\setup_local_llm.ps1 qwen2.5:7b

# paste the printed .env block (or use the repo .env.example defaults), then:
uv run python scripts/check_local_llm.py
```

`check_local_llm.py` exits 0 when the model both streams and calls tools,
and 2 when it streams but ignores tools — in that case only Documents mode
is reliable, so move to a larger model. Non-OpenAI endpoints automatically
drop `stream_options` / `max_completion_tokens` (which local servers
reject) and send `max_tokens` instead; `tests/test_local_provider.py`
covers that path against a fake Ollama server.

**Sizing:** a ~3B model keeps replies responsive on CPU-only hosts; 7B+
gives noticeably better tool calling but needs ~5 GB free RAM and is slow
without a GPU.

**Tool calling is the hard requirement.** Assistant and Automation modes
drive browser tools (`search_schedules`, `prefill_booking`, …) through the
model's function-calling API. A model without it degrades to chat-only;
Documents mode (pure RAG over `knowledge/`) still works with any model.
Verify the chosen model supports tools and streaming before relying on it,
and check the provider's own rate-limit page — free quotas change often.

**Privacy:** some free tiers log or train on prompts. Portal tool results
can contain customer data, so review the provider's data policy before
pointing a non-local provider at real tenants.
