---
description: Rules for migrating the E-Com portal from Struts/JSP to React. Applies to all work in the new React workspace.
globs:
  - "apps/ecom-portal/**"
  - "libs/**"
alwaysApply: true
---

# E-Com JSP → React Migration Rules

You are migrating the legacy **Struts 1.3 / JSP** E-Commerce shipping portal
(`e-comOnlineWeb_New`) to a **React** app on the same platform as the CRM portal.
The legacy codebase is a **read-only reference for behaviour**, never a spec to reinvent.

## Stack (do not deviate)

- React 19 + TypeScript (strict) · Ant Design 6 · TanStack Router + Query 5
- Zustand · React Hook Form + Zod · Nx + pnpm + Vite
- Vitest + RTL · Playwright · MSW · Storybook
- Shared library: `@solverminds/shared-ui` (AppButton, AppModal, AppDrawer, `Form*` fields, DataView, hooks)

## Golden rules (every module)

1. **Strangler-fig, one module per branch/PR.** Never migrate two modules together; never a big-bang rewrite.
2. **Reuse the backend.** Expose existing EJB logic behind a REST endpoint and consume it. NEVER reimplement business logic in React. JSP scriptlet logic moves to the REST layer, not the component.
3. **Parity before improvement.** Match the JSP exactly (fields, actions, permissions, messages, edge cases). Propose enhancements separately.
4. **Follow the feature blueprint.** Thin route files; logic in controller hooks; no barrels; direct imports.
5. **`shared-ui` + AntD only.** No raw AntD where a wrapper exists. No hardcoded color / spacing / font / radius — use `theme.useToken()` tokens.
6. **Forms = RHF + Zod.** One schema drives UI + submit. Port every Commons Validator and per-locale jQuery rule into the Zod schema. No duplicated client/server validation.
7. **Types from OpenAPI.** Generate FE types from the backend spec (`openapi-typescript`). No hand-written API types. No `any` — use `unknown`.
8. **State model is fixed.** Server state = React Query, client/UI = Zustand, view/filter state = URL search params. No other global stores.
9. **RBAC on routes AND backend.** Gate `/admin/*` and protected routes via `beforeLoad` capability checks; the backend re-enforces every endpoint. Client gate is UX only.
10. **No secrets in the client bundle.** Config via typed (Zod-validated) env + backend. Never `VITE_*` DB creds or keys.
11. **Ship behind a feature flag / route switch.** Keep the legacy JSP live until the module is proven; rollback = flip the switch (no redeploy).
12. **Mirror the pinned reference module** (first migrated slice, e.g. Schedules) for structure every time.

## Per-module process (run all 12 steps, in order)

1. **Module analysis** — inventory JSP page(s), Struts Action(s), form bean, AJAX servlet(s), `.do` routes + forwards, `MenuAccess` module code, roles, `GlobalConfig` flags. Output: one-page module brief.
2. **JSP & backend dependency analysis** — trace Action → `EJBLookUp` → EJB methods + VO/DTO shapes; note external calls (schedules, tracking, payment, carbon, mail) and cache reads; flag JSP-embedded logic to relocate.
3. **UI/UX analysis** — screenshot every state (empty/loading/populated/error/edit); list fields, columns, buttons, modals, tabs; map each legacy widget to its AntD equivalent; record conditional UI (role, shipment type E/I, field-config) and wizard step order.
4. **API & business-logic identification** — add REST endpoints on the facade (standard envelope) for each EJB method; document in OpenAPI; classify query vs mutation; regenerate FE types.
5. **React component design** — scaffold the feature slice: thin route entries + `api/` (`.api.ts` · `.keys.ts` · `.queries.ts`) + `hooks/` + `types/` + `utils/` + `components/{list,details,upsert}`.
6. **State & forms** — React Query for server data, Zustand for UI, URL for filters; RHF + Zod forms; wizards via `Steps` + per-step schema, draft in query cache.
7. **API integration** — call REST via the shared api client and the feature's `.queries.ts`/`.keys.ts`; invalidate list/detail/summary after mutations; develop on MSW mocks then switch to real.
8. **Validation & error handling** — Zod parity with legacy rules; surface server errors via `extractApiError` (inline + toast); route error boundary; Skeleton for loading/empty.
9. **Functional parity** — parity checklist from step 1; run both apps side by side; diff inputs → outputs incl. generated PDFs/Excel; confirm role gating + flags match `MenuAccess`.
10. **Testing & comparison** — Vitest + RTL (hook + components), MSW integration, Playwright for the critical flow; compare against legacy with same data; behavioural differences are defects, not "new design".
11. **Code review & quality** — lint + typecheck + format clean (zero warnings); Conventional Commits; one module per PR; reviewer verifies blueprint, shared-ui usage, no hardcoded styles, no `any`, no leftover legacy calls, bundle within budget.
12. **Deploy & rollback** — ship behind a flag; staging → smoke → prod; monitor; rollback = route switch back to JSP; decommission legacy only after a stable soak.

## Definition of done

- REST endpoints + OpenAPI types for the module
- Feature slice per blueprint; shared-ui + AntD, no hardcoded styles
- RHF + Zod validation parity with legacy rules
- Error / empty / loading states + RBAC gating
- Signed-off functional-parity checklist
- Unit + e2e green in CI, coverage floor met
- PR approved; lint/typecheck clean; bundle within budget
- Deployed behind a flag; rollback to JSP verified

## Recommended module order

Schedules → Tracking → Rates/Tariff → Booking → SI → BL/VGM → Payments → Statements → Admin/Config.

## When unsure

Stop and ask. If the request conflicts with the generated types, the API contract, or these rules, surface the mismatch — do NOT create workarounds, shims, or hand-written type stubs to paper over it.
