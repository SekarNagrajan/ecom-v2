# AI Assistant: End-to-End Backend Implementation (ecom-v2)

Companion to the frontend assistant plan. Normative wire contract remains
[`apps/ai-service/CONTRACT.md`](../../apps/ai-service/CONTRACT.md)
(`token.delta`, `request_id`, `arguments`, `locale`, existing tool names).

This document’s Claude API rules (append-only history, fixed tool list, mid-turn
`role: system` context, compaction, `effort: low`, parked tool results, etc.)
are implemented in `apps/ai-service/`. Prefer the running code + CONTRACT over
any alternate field names that appear in earlier drafts.

See section 0 of the authoring notes for Sonnet/Haiku 5.5 overrides vs older
step plans (no history trim, no forced `tool_choice`, whole `response.content`
appended, tools sorted and fixed per conversation).
