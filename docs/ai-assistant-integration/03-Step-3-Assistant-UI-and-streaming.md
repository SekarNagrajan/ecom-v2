# AI Chatbot Integration — Step 3 of 9

# Step 3: Assistant UI and streaming (frontend)
**Goal.** A chat drawer in the portal that streams answers. It is built and tested against a local MSW stub, without the real service.

**Files (new, under `apps/ecom-portal/src/features/assistant/`, following `ECOM-PORTAL-FEATURE-BLUEPRINT.md`)**
```
types/assistant.types.ts          # AssistantEvent union (mirror CONTRACT.md), ChatMessage, Card types
api/sse-parser.ts                 # parse ReadableStream<Uint8Array> → AsyncIterable<AssistantEvent> (handles split chunks, multi-line data)
api/assistant.api.ts              # streamChat(body, signal) — fetch('/api/assistant/v1/chat') with Bearer from localStorage; getConversation(id); sendFeedback()
api/assistant.keys.ts             # assistantKeys = { all:['assistant'], conversation:(id)=>[...,'conversation',id] }
api/assistant.queries.ts          # useConversationQuery(id), useFeedbackMutation()
store/assistant.store.ts          # Zustand: open, conversationId, messages[], streaming, setOpen, reset (NOT persisted)
hooks/use-assistant-context.ts    # builds client_context: useRouterState().location.pathname, useAuthStore user, tenant store, i18n.language
hooks/use-assistant-controller.ts # send(text), stop(), retry(); reduces events into store; AbortController
components/AssistantLauncher.tsx  # header icon button + tooltip, toggles store.open
components/AssistantDrawer.tsx    # AppDrawer (@solverminds/shared-ui), header (title, New chat, close), MessageList, Composer
components/MessageList.tsx        # bubbles, streaming cursor, aria-live="polite", auto-scroll, per-section <Spin> while history loads
components/Composer.tsx           # AppTextarea, Enter=send / Shift+Enter=newline, Stop button while streaming, voice via useAiDictation (features/ai-assist)
components/cards/CitationChips.tsx# TanStack <Link to={route}>
components/EmptyState.tsx         # suggested prompts per current module ("Track a container", "How do I create an SI?")
index.ts
```
Locale files `src/locales/{en,zh,ms,es}/assistant.json` hold the title, placeholder, suggestions, errors and buttons.

**Tasks**
1. **SSE parser.** Accumulate text and split on `\n\n`. For each block, read the `event:` and `data:` lines and `JSON.parse` the data. Ignore unknown events. Unit-test it with chunks split at arbitrary byte positions.
2. **`streamChat`.** If the response is not OK and `res.status === 401`, call `window.dispatchEvent(new Event('ecom:unauthorized'))`, reusing the existing logout flow in `main.tsx`. If the response is JSON (not streaming), handle it as a single answer; this is the fallback when a proxy buffers.
3. **Controller reducer:**

   | Event | Effect |
   |---|---|
   | `meta` | Set `conversationId` and create the assistant message |
   | `token` | Append text |
   | `citation` | Push a chip |
   | `error` | Mark the message failed and show a Retry row (toast for `RATE_LIMITED`) |
   | `done` | Set `streaming=false` |

   `tool_call` and `ui_action` are ignored until Step 5.
4. **Mount.** In `AuthenticatedLayoutHeader.tsx`, add `<AssistantLauncher />` next to the Contact Us trigger. Mount `<AssistantDrawer />` once, near line 572. Show both only when `env.VITE_ASSISTANT_ENABLED === 'true'`.
5. **Theme.** Use only AntD primitives and `theme.useToken()`. Keep the drawer header mounted while loading, per the repo's loading rule.
6. **Accessibility.** Focus trap (AppDrawer), `Esc` closes, buttons operable by keyboard.

**Acceptance criteria**
- With the Step 4 stub on, the drawer opens and a streamed reply renders token by token.
- Stop aborts the reply; Retry works.
- Switching language changes the UI strings.
- Vitest covers `sse-parser` and the reducer.
- `pnpm typecheck` passes.

_See 00-Overview-and-Code-Facts.md for the shared code facts and step dependencies._
