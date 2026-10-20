<!-- Created by Sekar Nagarajan (2026-10-21 13:00) -->
# Assistant UI action inventory

Every interactive element of the assistant, verified against the code on
**2026-10-21**. Characterization tests live in
`apps/ecom-portal/src/features/assistant/__tests__/ui-actions.regression.test.tsx`
and must stay green after every refactor phase.

Paths are relative to `apps/ecom-portal/src/features/assistant/`.

| # | Action | Where (verified) | Behaviour / guard | Test |
|---|---|---|---|---|
| A1 | `navigate` → NavigateCard | `actions/navigate.action.ts:4` · `components/cards/NavigateCard.tsx:16,34-35` | Route must pass `isWhitelistedAppRoute`; invalid → card renders `null`; click → `closeDrawer()` then `navigate({to})` | ✅ 4 tests |
| A2 | `prefill_booking` → BookingPrefillCard | `actions/prefill-booking.action.ts:18` · `components/cards/BookingPrefillCard.tsx:47,51,54,63` | `confirm.warning` when a draft exists (`wizardHasDraftData`, line 47); `not_allowed` → `toast.warning`; failure → `toast.error`; success → `closeDrawer` + `/app/booking/new` | ✅ 3 tests |
| A3 | `propose_booking_submit` → AutomationConfirmCard | `actions/submit-booking.action.ts:61` · `components/cards/AutomationConfirmCard.tsx:33-72` | **Never submits without `confirm.warning` (line 34)**; `booking_not_allowed` → warning; other failure → error with reason; success → toast + `closeDrawer` + `/app/booking` | ✅ 3 tests |
| A4 | `show_sql_result` → SqlResultCard | `components/cards/SqlResultCard.tsx` · emitted by the service in `app/llm/loop.py` | Renders columns/rows/truncation from the event only | ⚠️ not covered |
| A5 | unknown ui_action | `actions/ui-action.handler.ts:40-41` · `components/cards/ActionCard.tsx:30-38` | Renders name + `unsupportedAction`, **no footer, no buttons** | ✅ 2 tests |
| A6 | Tool-result "Open screen" | `cards/RecordStatusCard.tsx` · `ToolResultCard.tsx` · `TrackingResultCard.tsx` · `ScheduleResultCard.tsx:95` | Navigates to the module screen | ⚠️ partial |
| A7 | Schedule "Book" | `components/cards/ScheduleResultCard.tsx:68,80-81` | Only when `s.bookingAllowed && can("BKG")`; prefill → `closeDrawer()` → `/app/booking/new` | ⚠️ gate only |
| A8 | Citation chips | `components/cards/CitationChips.tsx` · `utils/citation-routes.ts` | Navigate via `citationOpenPath`; non-whitelisted routes render nothing | ✅ 3 tests |
| A9 | Copy / Helpful / Not helpful / Regenerate | `components/MessageActions.tsx:27,37` · `MessageBubble.tsx:150` | Copy full text + toast; feedback mutation with toggle; regenerate only on the last completed assistant message | ⚠️ not covered |
| A10 | Retry / Stop | `components/MessageBubble.tsx` · `components/Composer.tsx` | Retry resends last user text; Stop aborts and marks "stopped" | ⚠️ not covered |
| A11 | Composer | `components/Composer.tsx:67` | Enter sends, Shift+Enter newline, disabled when empty/streaming, page-context toggle | ⚠️ not covered |
| A12 | Window | `components/AssistantWindow.tsx` · `AssistantLauncher.tsx` | Open/close, Escape closes, focus composer on open and return on close, expand/shrink, new chat, mode Select | ⚠️ not covered |
| A13 | History | `components/AssistantHistory.tsx:52,66,76,187,231` | Search, resume, pin/unpin, rename (Enter commits, Escape cancels), delete (confirm), clear all (confirm) | ✅ store-level in `store/assistant-history.test.ts` |
| A14 | Welcome suggestions | `components/AssistantWelcome.tsx` · `hooks/use-assistant-suggestions.ts` | Click sends the suggestion | ⚠️ not covered |
| A15 | Scroll-to-bottom | `components/MessageList.tsx:22,31,60` | Appears when scrolled up; follows the stream only when near the bottom | ⚠️ not covered |
| A16 | Browser tool execution | `hooks/use-tool-runner.ts` · `tools/registry.ts:448` · `tools/redact.ts` | Capability gate via `usePermission().can()`; redaction applied; results resumed to the service | ✅ 2 tests + `tools/registry.test.ts` |

## Not in the original table — found during verification

| # | Element | Where | Note |
|---|---|---|---|
| **A17** | `AssistantStatusChip` | `components/AssistantStatusChip.tsx` | Status pill used by result cards. Not interactive today, but it is the component a status-label change (Phase 3) will touch. |

## Known defect — recorded, NOT fixed

**AutomationConfirmCard has no persisted "submitted" state.**
`components/AutomationConfirmCard.tsx:20` holds `submitting` in local React state
and clears it in `finally` (line 66-68). `AssistantCard`
(`types/assistant.types.ts`) has no `state` field, so nothing survives a
re-render or a history resume. After a successful submit the button is
enabled again, inviting a second submit.

Characterized by *"KNOWN DEFECT: a re-rendered card is confirmable again"*.
Phase 4B is the approved fix; when it lands, that test flips to
`disabled === true`.

## End-to-end coverage

Playwright is configured (`apps/ecom-portal/playwright.config.ts`, `testDir: ./e2e`)
and runs the portal with `VITE_ASSISTANT_ENABLED=true`,
`VITE_AI_ASSISTANT_USE_MSW_STUB=true`, `VITE_API_MODE=mock`.
`e2e/assistant.spec.ts` already covers opening the panel, a streamed stub
reply, and a tool lookup.

**Blocker for A3 and A7:** the MSW stub (`src/mocks/assistant.handlers.ts:78-82`)
emits only one `ui_action` — `prefill_booking`. It never emits
`propose_booking_submit` (A3) or a schedule result (A7), so those cards cannot
be reached end to end without adding stub scenarios. That is a change to shared
mock behaviour, so it is **not** being made unilaterally — see the question at
the end of the Phase 0B report.

### Manual test script (until the stub covers A3/A7)

Run `pnpm --filter @solverminds/ecom-portal dev` with the env above, sign in, open the assistant.

1. **A3** — switch to *E-Commerce Automation*, ask to book a sailing until a
   confirm card appears. Click the action: a confirm dialog **must** appear;
   cancel → nothing submits. Confirm → toast with reference, panel closes,
   lands on `/app/booking`. Reopen from history → **the card is still
   confirmable (the known defect)**.
2. **A7** — ask for sailings; on a card with `bookingAllowed`, click *Book*:
   panel closes, `/app/booking/new` opens prefilled. Repeat as a user without
   `BKG` → the Book button must not render.
