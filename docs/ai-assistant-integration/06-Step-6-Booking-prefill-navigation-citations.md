# AI Chatbot Integration — Step 6 of 9

# Step 6: Booking prefill, navigation and citations
**Goal.** The assistant can carry the user into the booking wizard with fields already filled, and every record it mentions becomes a clickable citation. It never submits anything.

**Files**
```
apps/ecom-portal/src/features/assistant/
  actions/ui-action.handler.ts      # dispatches a CONFIRMED ui_action by kind
  actions/prefill-booking.action.ts
  actions/navigate.action.ts
  components/cards/ActionCard.tsx    # beside cards/CitationChips.tsx from Step 3
  utils/citation-routes.ts
  hooks/use-assistant-controller.ts  # modified: Confirm/Cancel wiring
apps/ai-service/app/llm/loop.py     # modified: emit ui_action
```
`CitationChips.tsx` already exists from Step 3 — this step only gives it a route map, it does
not replace it.

**Tasks**
1. **`ui_action` dispatch.** The service emits `{action_id, kind, payload}`; the store holds it
   against the message. Only two kinds exist in v1: `navigate` and `prefill_booking`. An unknown
   `kind` is ignored and logged — never dispatched optimistically.
2. **Confirmation first.** A `ui_action` does **not** execute on arrival. It renders an
   `ActionCard` summarising what will happen — for `prefill_booking`: vessel, voyage,
   POL, POD, ETD and the fields to be filled — with Confirm and Cancel. Only Confirm mutates
   state or navigates. This is the line between "the assistant helped" and "the assistant did
   something I did not ask for", and it is the most important UX decision in the feature.
3. **`prefill-booking.action.ts`** mirrors `useSchedulesController.ts:157-168` exactly:
   ```ts
   const store = useBookingStore.getState();
   store.resetWizard();
   store.updateMasterDetails(buildMasterDetailsFromSchedule(schedule));
   // only when the conversation actually supplied them
   store.updateParties(parties);
   store.updateCargo(cargo);
   navigate({ to: "/app/booking/new" });
   ```
   Honour the same `schedule.bookingAllowed` gate the Book Now buttons use — a cut-off or sailed
   voyage refuses with the existing `bookingNotAllowedToast` wording rather than a new message.
   Quote-sourced prefills go through `map-quote-to-master-details.ts`.
4. **Drawer behaviour on navigate.** Close the drawer, keep the conversation in the store, and
   put the launcher in an "active conversation" state so the user can reopen mid-wizard without
   losing context.
5. **`navigate.action.ts`.** A whitelisted intent → route map (tracking, booking list, SI, BL,
   VGM, CRO, DO, arrival notice, rates, payment history, carbon, dashboard), capability-gated
   with `can()` exactly as in Step 5. Unknown targets are refused.
6. **Citations.** `citation-routes.ts` validates the contract's `{title, route, module}`
   against a route whitelist before `CitationChips.tsx` renders the TanStack `<Link>`. Only
   whitelisted routes render, and only records that came back from a tool **in this
   conversation** are eligible — a model-invented id must stay plain text, never a link.
7. **Cache invalidation.** After navigating away from the wizard or completing a booking,
   `invalidateQueries({queryKey: bookingKeys.list()})` so the grid reflects reality.
8. **Guardrail test.** Assert that no path under `features/assistant/` calls a booking submit
   mutation. A grep-based test is acceptable and cheap.

**Acceptance criteria**
- "Book the MSC sailing on the 12th from Singapore to Rotterdam" shows the confirmation card;
  Confirm lands on `/app/booking/new` step 1 with master details populated and **nothing
  submitted**; Cancel leaves the user in the chat with the conversation intact.
- A cut-off sailing refuses with the existing wording.
- Citation chips navigate to the right record; an invented id renders as plain text.
- Reopening the drawer after navigation restores the conversation.
- The submit-guardrail test passes.

_See 00-Overview-and-Code-Facts.md for the shared code facts and step dependencies._
