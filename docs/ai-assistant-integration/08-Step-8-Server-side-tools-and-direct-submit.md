# AI Chatbot Integration — Step 8 of 9

# Step 8: Server-side tools and direct submit (later)
**Goal.** Move tool execution to the service once real REST endpoints exist, and allow confirmed write actions.

**Depends on.** Step 7 **and** backend deliverables — the Spring Boot modules for Booking, SI, VGM and BL, plus resolution of open decisions D1–D8 in the re-platform plan.

**Files**
```
apps/ai-service/app/tools/server/*.py       # one module per ported tool
apps/ai-service/app/tools/catalog.py        # per-tool execution_side flag
apps/ai-service/app/audit/writer.py         # new
apps/ecom-portal/src/features/assistant/tools/registry.ts   # tools become fallbacks
```

**Tasks**
1. **Port read tools one module at a time**, behind a per-tool `execution_side:
   "browser" | "server"` flag in the catalog so each can fall back without a redeploy. Schedules
   and the Dashboard stay browser-side until they have real endpoints — today they have none
   (`schedulesApi.searchSchedules` and `dashboardApi.getSummary` are fixture bridges).
2. **Authorisation.** Server-side tools derive capabilities from the verified identity only
   (Step 7). The client `tools` array becomes diagnostic.
3. **Write tools** — `submit_booking`, `submit_si`, `submit_vgm` — each requiring, without
   exception:
   - an explicit confirmation step in the UI carrying the **full** payload, reusing the
     `ActionCard` from Step 6;
   - an idempotency key per confirmed action, so a replayed confirmation does not double-submit;
   - a dry-run validation call before the real one;
   - an audit record of actor, tenant, tool, arguments, result and request id.
4. **Rollback story.** Every write tool documents how the user undoes it, and the assistant
   states that in the confirmation. A tool with no undo path does not ship.
5. **Prefill stays.** `prefill_booking` is not replaced by `submit_booking` — it remains the
   default path, and direct submit is opt-in per tenant.
6. **Cost control.** Prompt caching on the stable system prefix (keep it byte-stable — any
   change invalidates the whole prefix), effort tuned per route (`low` for routing turns,
   `medium` for tool-use turns on Sonnet 5.5), a per-tenant monthly budget with alerting, and
   `claude-haiku-5-5` for classification-shaped turns. Measure cost per completed task, not per
   request.

**Acceptance criteria**
- A read tool behaves identically browser-side and server-side; flipping `execution_side`
  changes nothing a user can see.
- No write tool executes without a recorded confirmation.
- Replaying a confirmation does not double-submit.
- The audit log reconstructs every write action end to end.
- `cache_read_input_tokens` is non-zero on the second turn of every conversation.

_See 00-Overview-and-Code-Facts.md for the shared code facts and step dependencies._
