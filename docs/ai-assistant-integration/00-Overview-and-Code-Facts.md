# AI Chatbot Integration — Overview and Code Facts

Shared context for the nine step plans in this folder. Each step is sized for one developer.
Steps 2 and 3 run in parallel once Step 1 is signed off. Step 3 is built against the MSW stub
that Step 4 delivers, so sequence the stub early inside Step 4 rather than at its end.

**Architecture.** A Python FastAPI service at `apps/ai-service/` owns the Claude conversation
and holds history in Redis. The portal mounts an assistant module at
`apps/ecom-portal/src/features/assistant/`. **Tools execute in the browser**: in mock mode MSW
serves `/api/*` inside the browser, and Schedules and the Dashboard have no HTTP endpoint at
all (`schedulesApi.searchSchedules` and `dashboardApi.getSummary` call fixture bridges
directly). Booking by chat **prefills the existing wizard** via a `ui_action`; it never submits.

## Step dependencies

| Step | Name | Depends on | Estimate | Owner |
|---|---|---|---|---|
| 1 | Contracts and environment | — | 2–3 days | Tech lead |
| 2 | AI service skeleton (backend) | 1 | 4–5 days | Python developer |
| 3 | Assistant UI and streaming (frontend) | 1 | 4–5 days | React developer |
| 4 | Same-origin routing | 2, 3 | 2 days | React developer + DevOps |
| 5 | Browser-executed tools | 4 | 6–8 days | Both |
| 6 | Booking prefill, navigation and citations | 5 | 3–4 days | React developer |
| 7 | Auth hardening and real mode | 4 | 3–4 days | Python developer + backend team |
| 8 | Server-side tools and direct submit (later) | 7 + backend deliverables | 2–3 weeks | Both + backend team |
| 9 | Testing, rollout and deployment | 2–7 (runs alongside) | ongoing; 3 days to harden | QA + DevOps |

## Verified code facts

Every row below was checked against the repo on 2026-10-20.

| What | Where |
|---|---|
| Auth token | `localStorage.ecom_auth_token`, attached as `Authorization: Bearer` by the request interceptor at `libs/platform/src/api-client.ts:29`. A 401 on a non-auth-probe URL dispatches the `window` event `ecom:unauthorized`, handled at `apps/ecom-portal/src/main.tsx:68` |
| Who-am-I endpoint | `GET /api/auth/me` (`src/features/auth/api/auth.api.ts`) |
| Permission check | `usePermission().can(code)` at `libs/auth/src/usePermission.ts:7-14` — true for `role === 'ADMIN'`, `isSessionAdmin`, `isImpersonating`, else membership in `user.capabilities`. The route guard `assertCapability` at `src/app/router.tsx:87-99` **also** admits `isTenantAdmin`, so the two differ (see Step 5) |
| Capability codes in use | `ARN`, `BKG`, `BL`, `CRO`, `DO`, `PAY`, `SI`, `VGM` (`src/app/router.tsx`) |
| Existing AI proxy pattern to copy | `apps/ecom-portal/vite-ai-n8n-proxy.ts` (registered at `vite.config.ts:426`), `src/mocks/ai-assist.handlers.ts` (stub vs `fetch(bypass(request))`), spread into `src/mocks/handlers.ts:44` ahead of `fixtureApiHandlers` at line 64, plus the three `/api/ai/*` rewrites in `/vercel.json` |
| Booking prefill pattern to copy | `useSchedulesController.ts:150-169` — `store.resetWizard(); store.updateMasterDetails(buildMasterDetailsFromSchedule(s)); navigate({to:"/app/booking/new"})`. Mappers in `src/features/booking/utils/map-schedule-to-master-details.ts` and `map-quote-to-master-details.ts`. Store `src/features/booking/stores/booking.store.ts` exposes `resetWizard`, `updateMasterDetails`, `updateParties`, `updateCargo` |
| Read APIs for tools | `schedulesApi.searchSchedules` (fixture bridge, 300 ms delay, **no HTTP**); `trackingApi.getTrackingDetails` (`GET /api/tracking/search`, `null` on 404); `bookingApi` (`/api/booking/list`, `/api/booking/:id`); `si.api.ts`, `bl.api.ts`, `vgm.api.ts`, `cro.api.ts`, `customer-statement.api.ts`, `carbon.api.ts`, `rates.api.ts`, `hotline.api.ts`; `dashboardApi.getSummary` (fixture, no HTTP) |
| Booking list refresh | Grids hold client-side row data; refresh with `invalidateQueries({queryKey: bookingKeys.list()})` (`src/features/booking/api/booking.keys.ts`) |
| Where the launcher goes | `src/components/layout/AuthenticatedLayoutHeader.tsx` — `contactUsDrawerOpen` state at line 84, drawer mounted at line 572 |
| Languages | i18next `en`, `zh`, `ms`, `es` (`src/i18n/config.ts`); namespaces are the files under `src/locales/<lng>/`, loaded automatically |
| Env validation | `libs/platform/src/env.ts` validates exactly three keys today (`VITE_API_URL`, `VITE_API_MODE`, `VITE_APP_TITLE`) with a zod schema and a silent fallback. Assistant keys go in that schema, not into ad-hoc `import.meta.env` reads. Step 3 compares `env.VITE_ASSISTANT_ENABLED === 'true'`, so keep both flags typed as **strings** in the schema — a `z.coerce.boolean()` would make that comparison always false |
| Unauthorized listener | `wireUnauthorizedListener` at `src/main.tsx:67-79` ignores the event payload entirely — it calls `logout()` and navigates with a hardcoded `SESSION_EXPIRED_SEARCH_REASON`. A plain `new Event('ecom:unauthorized')` is therefore sufficient; no `detail` is needed |
| shared-ui resolution | `@solverminds/shared-ui` → `libs/shared/ui/src/index.ts` (`tsconfig.base.json:26`), **not** the stale top-level `libs/shared-ui/` folder. `AppTextarea` and `AppDrawer` live there; the portal imports from this package in ~177 places |
| Reusable AI pieces | `useAiDictation` is exported from `src/features/ai-assist/index.ts` (voice input for the composer); `use-ai-text-assist`, `use-grammar-improve` and `use-tone-rewrite` sit beside it |
| Feature layout | `apps/ecom-portal/ECOM-PORTAL-FEATURE-BLUEPRINT.md` governs the folder shape: `types/`, `api/` (`*.api.ts`, `*.keys.ts`, `*.queries.ts`), `store/`, `hooks/` (kebab-case files), `components/`. Query keys follow `booking.keys.ts` |

## Path mapping

The browser always calls the same-origin prefix `/api/assistant/`; the service mounts its
routers at `/v1/`. The dev proxy and the production rewrite both **strip the `/api/assistant`
prefix**: `/api/assistant/v1/chat` → `${AI_ASSISTANT_BASE_URL}/v1/chat`. Step 4 owns this.

## Model notes (`LLM_CHAT_MODEL=claude-sonnet-5-5`, `LLM_ROUTER_MODEL=claude-haiku-5-5`)

Constraints on both pinned models that will otherwise cost a day of debugging:

- **`thinking: {"type": "disabled"}` returns 400 on Claude Sonnet 5.5.** To run a turn without
  thinking, send `{"type": "between_tools"}` — accepted only at effort `high` or below, takes
  no other field, and forbids per-message effort changes. Otherwise omit `thinking` (adaptive).
- **`budget_tokens` returns 400** on both models. Depth is controlled by
  `output_config.effort` only. Sonnet 5.5 defaults to `high` with recalibrated levels — start
  at `medium` for tool-use turns and `low` for routing. Haiku 5.5 defaults to `medium`.
- **Forced tool use returns 400.** `tool_choice` `any` and `{type:"tool"}` are rejected. Use
  the default `auto`, put `strict: true` + `additionalProperties: false` on every tool in the
  catalog, and steer tool selection from the system prompt.
- **Thinking blocks are bound to the model and the conversation.** Pass them back unchanged and
  keep the stored history **append-only** — rewriting an earlier turn invalidates them. This is
  why the service owns history and the browser sends only the new leg.
- Check `stop_reason` before reading content: `refusal` carries a `stop_details.category`;
  `max_tokens` with a `tool_use` block present means the tools must **not** be run.
- Parse tool inputs with `json.loads`; never string-match the serialized input.

## Conventions

All portal work follows `.cursor/rules/agenct.md`: shared-ui wrappers only (`AppButton`,
`AppDrawer`, `useToast`), no inline `style={{}}` and no hex literals — token-backed style
injectors with `theme.useToken()` / `tokenMix`, `custom-scroll` on every scrolling surface,
`size="large"` inputs, Lucide icons through `AppIcon` and `icon-map.ts`, RHF + Zod for forms,
no `memo`/`useCallback`/`useMemo`, and the `// Modified by Sekar Nagarajan (YYYY-MM-DD HH:mm)`
header on every touched file. Server state is React Query, client state Zustand, view state URL
params. Ship behind a flag (repo rule 13).

The streaming turn is deliberately **not** React Query — it is a `fetch` + `ReadableStream`
reduced into the Zustand store. The two non-streaming endpoints (`GET /v1/conversations/{id}`
and `POST /v1/feedback`) *are* React Query, through `assistant.keys.ts` / `assistant.queries.ts`.
Axios is not used at all in this feature: `apiClient` buffers the whole response, which is why
the Bearer header and the 401 dispatch are hand-written (Steps 3 and 7).

## Open decisions to close during Step 1

1. Real-mode token format, and whether `GET /api/auth/me` accepts it (Step 7 blocks on this).
2. Where the AI service is hosted, and whether the production rewrite streams SSE unbuffered.
3. Conversation retention beyond the 24 h Redis TTL — none planned; confirm with legal.
4. Which pilot carrier goes first, and who owns the kill switch.
5. Data-protection approval for sending tool results to the Claude API.

_Step files: `01-…` through `09-…` in this folder._

## Cursor playbook mapping (Steps 0–13)

| Playbook | This folder |
|---|---|
| 0 Setup (Cursor rule + branch) | — (repo rules / git) |
| 1 Contract | `01-Step-1-…` → `apps/ai-service/CONTRACT.md` |
| 2–4 AI service scaffold / stream / Redis | `02-Step-2-…` |
| 5–6 FE types + chat UI | `03-Step-3-…` |
| 7 Same-origin proxy / MSW | `04-Step-4-…` |
| 8–9 Browser tools (BE + FE) | `05-Step-5-…` |
| 10 Booking prefill / navigate | `06-Step-6-…` |
| 11 Auth hardening | `07-Step-7-…` |
| 12–13 Tests / deploy | `09-Step-9-…` |
| Later: direct submit | `08-Step-8-…` |
