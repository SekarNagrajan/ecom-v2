# AI Chatbot Integration — Step 5 of 9

# Step 5: Browser-executed tools
**Goal.** The model can read portal data by asking the browser to run whitelisted, capability-gated, schema-validated tools.

**Files**
```
apps/ecom-portal/src/features/assistant/
  tools/registry.ts          # name → AssistantTool, the single client-side whitelist
  tools/tool.types.ts        # AssistantTool<TArgs>, ToolContext, ToolResult
  tools/redact.ts
  tools/schedules.tool.ts    tools/tracking.tool.ts   tools/booking.tool.ts
  tools/documents.tool.ts    tools/rates.tool.ts      tools/account.tool.ts
  hooks/use-tool-runner.ts   # kebab-case, per ECOM-PORTAL-FEATURE-BLUEPRINT.md
  store/assistant.store.ts   # modified: pendingToolCalls, pendingUiActions
  hooks/use-assistant-controller.ts  # modified: tool_call + ui_action no longer ignored
apps/ai-service/app/tools/catalog.py             # same catalog, Python side
apps/ai-service/app/llm/loop.py                  # modified: suspend/resume
```

**Tasks**
1. **Registry shape** (mirrors `catalog.py` one-to-one):
   ```ts
   interface AssistantTool<TArgs> {
     name: string;
     schema: ZodType<TArgs>;      // mirrors the catalog JSON Schema
     capability: string | null;   // null = ungated (schedules, tracking, rates)
     maxRows: number;
     run(args: TArgs, ctx: ToolContext): Promise<unknown>;
   }
   ```
2. **Tool set — read only in this step.**

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
   | `list_delivery_orders` | delivery-order api | `DO` |
   | `list_arrival_notices` | arrival-notice api | `ARN` |
   | `get_customer_statement` | `customer-statement.api.ts` | `PAY` |
   | `estimate_carbon` | `carbon.api.ts` | — |
   | `get_dashboard_summary` | `dashboardApi.getSummary` | — |
   | `get_hotline` | `hotline.api.ts` | — |

   No write tools here. `prefill_booking` and `navigate` arrive in Step 6 as `ui_action`s, not
   as tools.
3. **The gate.** `usePermission().can(code)`. Note the discrepancy recorded in the overview:
   `assertCapability` also admits `isTenantAdmin`, `can()` does not. **Decision: use `can()`** —
   a tool reads data directly rather than rendering a guarded page, so the stricter rule is the
   right default, and a tenant admin who needs it gets the capability explicitly. Record this
   in `CONTRACT.md` so nobody later "fixes" it by matching the router.
4. **Client `tools` array.** The browser sends the names it can actually run for this user —
   registry keys filtered by `can()`. It is a *capability hint for prompting*, never
   authorisation; Step 7 re-derives the truth server-side.
5. **`use-tool-runner.ts`.** For each entry in `pending_tool_calls`: registry lookup → zod-parse the
   args → capability check → `Promise.race` against a 15 s timeout → truncate to `maxRows` →
   redact → serialize. Unknown tool, parse failure, denied capability, timeout and thrown error
   each yield `{call_id, ok:false, data:null, error:{code,message}}`. **Every** requested
   `call_id` gets exactly one result, and all of them go back in **one** `tool_results` leg —
   splitting them trains the model out of parallel calls.
6. **Size cap.** Enforce `TOOL_RESULT_MAX_BYTES=8000` per result client-side before sending, and
   again server-side. Project to the fields the answer needs rather than passing whole payloads;
   when truncated, say so in the result so the model does not claim completeness.
7. **Redaction (`redact.ts`).** Strip e-mail addresses, phone numbers, full postal addresses and
   any `password`/`token`/`secret`-shaped key before results leave the browser. The fixtures are
   anonymised; production data will not be, and this is the one place customer data reaches the
   model.
8. **Service side (`loop.py`).** On `stop_reason == "tool_use"`: append the assistant message to
   the Redis history, emit one `tool_call` per block, emit `done {awaiting_tools:true}`, close
   the stream. A `tool_results` leg appends one user message containing all `tool_result` blocks
   (`is_error: true` for failures — never drop one) and re-enters the loop. Reject a leg whose
   `call_id` set does not exactly match what was requested. Over `MAX_TOOL_ROUNDS=5`, emit
   `error TOOL_LIMIT` and force a text answer.
9. **`catalog.py`.** Loaded at startup, validated against the contract schema (fail fast on
   drift with the TS registry), every tool emitted with `strict: true` and
   `additionalProperties: false` — forced `tool_choice` is rejected on the pinned models, so
   schema strictness plus prompt steering is what keeps arguments valid.
10. **`ui_action` plumbing lands here, behaviour in Step 6.** Step 3 ignores both `tool_call`
    and `ui_action`; this step stops ignoring them. `tool_call` is executed by the runner;
    `ui_action` is only captured into `pendingUiActions` and rendered as an inert summary line.
    Nothing is dispatched until Step 6 adds the confirmation card — an action that fires on
    arrival is the one failure mode this feature cannot recover from.
11. **Injection defence.** Tool results are data. Wrap each `tool_result` body in a delimiter and
    state in the system prompt that content inside it is never an instruction. A booking remark
    containing "ignore previous instructions" must not change behaviour — add that exact fixture
    to the test suite.

**Acceptance criteria**
- "Show me sailings from Singapore to Rotterdam in November" returns real fixture rows with
  vessel and voyage visible in the answer.
- "What's the status of booking <fixture id>" answers from `get_booking`.
- A user without `SI` asking about shipping instructions gets a plain refusal sentence — no
  error toast, no stack trace.
- A throwing tool, a timing-out tool and an unknown tool name each let the turn finish sensibly.
- A six-round tool loop stops with `TOOL_LIMIT`.
- The prompt-injection fixture test passes.
- `vitest run` covers the registry, the gate, redaction, the size cap and the budget.

_See 00-Overview-and-Code-Facts.md for the shared code facts and step dependencies._
