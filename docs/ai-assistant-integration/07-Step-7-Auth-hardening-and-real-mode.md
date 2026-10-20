# AI Chatbot Integration — Step 7 of 9

# Step 7: Auth hardening and real mode
**Goal.** Every request is authenticated, the service trusts nothing the browser claims, and expiry behaves like the rest of the portal.

**Files**
```
apps/ecom-portal/src/features/assistant/api/assistant.api.ts   # modified
apps/ai-service/app/auth/context.py                            # modified: backend-introspect
apps/ai-service/app/auth/introspect.py                         # new: GET /api/auth/me client
apps/ai-service/app/auth/ratelimit.py                          # new
apps/ai-service/app/main.py                                    # dependency wiring
```

**Tasks**
1. **Client.** Read `localStorage.ecom_auth_token` and set `Authorization: Bearer` by hand on the
   streaming fetch — the axios interceptor at `api-client.ts:29` does not cover `fetch`. On 401
   or on `error {code: UNAUTHORIZED}`, dispatch the same event the interceptor dispatches:
   ```ts
   window.dispatchEvent(new CustomEvent("ecom:unauthorized", { detail: { reason: "session-expired" } }));
   ```
   so `main.tsx:68` handles it exactly as it does for every other module. Close the drawer and
   clear `pending_tool_calls`.
2. **`AUTH_MODE=backend-introspect`.** `resolve_user` calls `GET {BACKEND_BASE_URL}/api/auth/me`
   with the caller's bearer, caching a positive result for 60 s keyed by a hash of the token —
   never by the token itself. Anything else is `error UNAUTHORIZED`, emitted before any Anthropic
   call is made.
3. **Retire `trusted-dev`.** `client_context.user` is ignored entirely in this mode: role,
   capabilities and tenant come from the introspection response. The startup guard from Step 2
   (fail if `ENV=production` and `AUTH_MODE=trusted-dev`) stays; add a loud warning log on every
   request served in trusted-dev.
4. **Conversation ownership.** Bind `conv:{id}` to the verified user id and tenant. A different
   user presenting a known `conversation_id` gets a **fresh** conversation, never the other
   user's history. Same for a tenant mismatch.
5. **Capabilities are authoritative server-side.** The `tools` array and
   `client_context.user.capabilities` become prompting hints only. Any tool the service offers
   the model is filtered by the introspected capability set, so a tampered client array widens
   nothing. Write this down now, before Step 8 moves tools server-side.
6. **Rate limiting.** Keep the Redis bucket from Step 2 but key it on the verified user id, and
   add a per-tenant daily cap plus a global concurrency limit. Over limit → `error RATE_LIMITED`
   with a retry hint. Tool-results legs count toward the turn budget, not the minute budget.
7. **Privacy.** Log request ids, token counts and latency only. No message bodies, no tool
   results, no bearer tokens. Body logging sits behind `ASSISTANT_DEBUG_LOG`, off in every
   deployed environment. Transcripts expire with the 24 h TTL and are not persisted elsewhere.
8. **Abuse.** Cap input length, reject non-UTF-8, strip control characters, and bound
   `tool_results` payload size server-side as well as client-side.
9. **When the backend issues JWTs** (per the approved re-platform plan: stateless JWT access +
   rotating refresh cookie), add local signature verification against the published JWKS —
   check `exp`, `iss`, `aud` and the tenant claim — and drop the `/api/auth/me` round trip.
   Coordinate claim names with that team rather than inventing them.

**Acceptance criteria**
- An expired token mid-conversation produces the standard session-expired login flow, not a
  console error.
- A forged or absent token is refused with `UNAUTHORIZED` **before** any model call — verify from
  the service logs that no Anthropic request was issued.
- A tampered `client_context.user.capabilities` grants nothing; a test proves it.
- Two users cannot share a `conversation_id`; a test proves it.
- Rate limiting trips at the configured threshold and recovers.
- A log scrape over a full session contains no message text, no e-mail address and no token.

_See 00-Overview-and-Code-Facts.md for the shared code facts and step dependencies._
