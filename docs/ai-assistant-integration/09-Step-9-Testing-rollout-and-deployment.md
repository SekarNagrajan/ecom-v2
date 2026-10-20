# AI Chatbot Integration — Step 9 of 9

# Step 9: Testing, rollout and deployment
**Goal.** Enough automated coverage and operational control to turn the feature on for one tenant and watch it.

**Depends on.** Runs alongside Steps 2–7; 3 days to harden at the end.

**Tasks**
1. **Frontend unit (vitest).** `sse-parser` chunk boundaries; registry dispatch; the `can()`
   gate; redaction; the size cap and round budget; store transitions including
   `awaiting_tools`.
2. **Frontend integration (MSW).** Scripted SSE fixtures for: a text-only turn, a single
   `tool_call` turn, a parallel two-`tool_call` turn, a denied tool, a tool timeout, a
   `TOOL_LIMIT` stop, an auth expiry, and a `ui_action` confirm/cancel pair.
3. **E2E (Playwright).** Open drawer → ask for schedules → assert rows; ask to book → Confirm →
   assert the wizard is populated and **unsubmitted**; assert chunked arrival timing to catch
   proxy buffering; run the chrome-string pass in all four languages.
4. **Backend (pytest).** The loop cases from Steps 2 and 5 with Claude mocked via respx, plus
   auth modes, conversation ownership, rate limiting and the injection fixture.
5. **Contract tests.** Assert the SSE event names and error codes against `CONTRACT.md` from
   both sides, so a rename breaks CI in the portal and the service together. Assert
   `catalog.py` and `registry.ts` agree on name, args schema and capability.
6. **CI.** Add the ai-service job (ruff + pytest + docker build). Keep the portal gate as it is
   today: `tsc --noEmit`, `vitest run`, `vite build`.
7. **Rollout.** `VITE_ASSISTANT_ENABLED` defaults false. Enable per tenant through the same
   switch mechanism the re-platform plan uses (`ecomv2_module_switch` surfaced via
   `/api/public/tenant`), so turning it off is a config change, not a redeploy — repo rule 13.
   Order: internal → one pilot carrier → general availability.
8. **Observability.** Dashboard for first-token latency (p50/p95), turn duration, tool calls per
   turn, failure rate by error code, token spend per tenant, refusal rate, and
   `cache_read_input_tokens` ratio. Alert on `LLM_UNAVAILABLE` rate and on p95 first-token
   latency. Correlate portal and service through the `request_id`.
9. **Docs.** A runbook — how to disable per tenant, how to rotate `ANTHROPIC_API_KEY`, how to
   trace a `request_id` through the proxy chain, what each error code means operationally — plus
   a one-page user note on what the assistant can and cannot do.

**Acceptance criteria**
- Full suite green in CI, including the ai-service job and the contract tests.
- The feature can be disabled for a tenant and verified off within one minute, no deploy.
- Dashboards show live data from a pilot tenant.
- The runbook is tested by someone who did not write it.

_See 00-Overview-and-Code-Facts.md for the shared code facts and step dependencies._
