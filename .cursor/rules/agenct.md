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
5. **UI Components & shared-ui only.** ALWAYS use `shared-ui` wrappers — `AppButton`, `AppModal`, `AppDrawer`, `AppTabs`, `useConfirm`, `useToast` — never raw AntD equivalents like `message` or `Modal`. No hardcoded color/spacing/font/radius — use `theme.useToken()`. Use `useAntdBreakpoint` for responsive design.
6. **Forms = RHF + Zod.** One schema drives UI + submit. Port every Commons Validator and per-locale jQuery rule into the Zod schema. Form action buttons must stay consistent (e.g. `Cancel + Save` in create mode).
7. **Types from OpenAPI.** Generate FE types from the backend spec (`openapi-typescript`). No hand-written API types. No `any` — use `unknown`.
8. **State model is fixed.** Server state = React Query, client/UI = Zustand, view/filter state = URL search params. No other global stores.
9. **RBAC on routes AND backend.** Gate `/admin/*` and protected routes via `beforeLoad` capability checks; the backend re-enforces every endpoint. Client gate is UX only.
10. **No secrets in the client bundle.** Config via typed (Zod-validated) env + backend. Never `VITE_*` DB creds or keys.
11. **React Compiler & Optimization.** NO `memo`, `useCallback`, or `useMemo` by default. Do NOT use `useEffect` to synchronously derive or normalize state.
12. **Change Attribution.** When modifying or creating files, add a single-line comment at the top: `// Modified by [Sekar Nagarajan] (YYYY-MM-DD HH:mm)`.
13. **Ship behind a feature flag / route switch.** Keep the legacy JSP live until the module is proven; rollback = flip the switch (no redeploy).
14. **Mirror the pinned reference module** (first migrated slice, e.g. Schedules) for structure every time.

## UI consistency patterns (all modules must follow)

1. **Scrollbar styling.** Every scrollable form or content area must use the `custom-scroll` CSS class with the standardised thin scrollbar (6px, `#d9d9d9` thumb, transparent track, `#bfbfbf` hover). Inject the class via an inline `<style>` block in the route component (see Registration and Contact Us modules for reference).
2. **Input field sizing.** All Ant Design `Input`, `Select`, `AutoComplete` form fields must use `size="large"` to maintain visual consistency with the Registration module. Do NOT set a fixed `height` on inputs.
3. **Input background color.** Form inputs use the Ant Design default white background (`#fff`). Do NOT apply `token.colorBgLayout` or any grey tint to input fields. TextArea follows the same rule.
4. **Autofill reset.** Include `-webkit-box-shadow: 0 0 0 1000px #ffffff inset !important;` and `transition: background-color 50000s ease-in-out 0s !important;` in the `input:-webkit-autofill` CSS rules for every form module (including Login, Contact Us, and Registration) to eliminate default browser autofill blue/yellow backgrounds and keep input fields pristine white.
5. **Labels & Mandatory Fields.** Use `fontWeight: 600`, `fontSize: 13`, `color: token.colorTextSecondary`, `marginBottom: 6` for all form labels. Required/Mandatory fields MUST display the red asterisk `<Text type="danger"> *</Text>` directly AFTER the field label text (e.g. `Field Name *`), never before the label.
6. **Card layout.** Form pages use `<Card>` with `borderRadius: 16`, `boxShadow: '0 8px 24px rgba(0,0,0,0.05)'`, `border: 'none'` as the form container.
7. **Error text.** Validation errors rendered as `<Text type="danger" style={{ fontSize: 12, marginTop: 2 }}>`.
8. **Sidebar Menu Nomenclature & Parity.** Sidebar labels across `PublicLayout` and `AuthenticatedSidebar` MUST match the official text keys defined in `ApplicationResource_en.properties` (`# Ecom Menu` section):
   - **Dashboard**: `Dashboard` (`ecom.dashboard`)
   - **Schedules**: `Schedules` (`ecom.schedules`)
   - **Tracking**: `Tracking` (`ecom.tracking`)
   - **Booking**: `Booking` / `Booking Request` (`ecom.booking`)
   - **Shipping Instruction**: `Shipping Instruction` (`ecom.shippingins`)
   - **VGM**: `VGM` / `VGM Declaration` (`ecom.vgm`)
   - **Bill of Lading**: `Bill of Lading` (`ecom.billoflading`)
   - **Delivery Order**: `Delivery Order` (`ecom.deliveryorder`)
   - **Container Release**: `Container Release Order` (`ecom.containerrelease`)
   - **Arrival Notice**: `Arrival Notice` (`ecom.arrival`)
   - **Tariff & Rates**: `Tariff` (`ecom.tariff`) / `Rates` (`ecom.rates`)
   - **Payment History**: `Payment History` (`ecom.paymenthistory`)
   - **Carbon Calculator**: `Carbon Calculator` (`ecom.carboncalculator`)
   - **Contact Us**: `Contact Us` (`layout.contactus`)
9. **Floating Overlay Sidebar.** Expanding/collapsing the sidebar in layout components (`PublicLayout`, `AuthenticatedLayout`) MUST use overlay positioning with fixed content margin (`marginLeft: 80`) so that expanding the menu overlays smoothly on top with a rich shadow without causing the main page hero elements or layouts to reflow/shift.
10. **Sidebar Menu Grouping & 10-Item Overflow Limit.**
    - Only **Schedules** (Schedules, Tracking) and **Rates** (Rates, Tariff) are grouped into sub-menus. All other modules are top-level items.
    - The sidebar renders **10 primary modules** directly in the list with distinct, meaningful icons (`BookOutlined` for Booking, `AuditOutlined` for SI, `SafetyCertificateOutlined` for VGM, `FileProtectOutlined` for Bill of Lading, `DeliveredProcedureOutlined` for Delivery Order, `NotificationOutlined` for Arrival Notice, `BarcodeOutlined` for CRO, etc.).
    - All remaining modules (Payment History, Customer Statement, Carbon Calculator, Contact Us) MUST be placed inside an overflow item labelled **More** with an 3-dots icon (`EllipsisOutlined`).
11. **Sidebar Custom Scrollbar.** The sidebar `<Sider>` container across all layout components (`PublicLayout`, `AuthenticatedSidebar`) MUST apply the `custom-scroll` class with `overflowY: 'auto'` (standardized thin 6px scrollbar, `#d9d9d9` thumb, `#bfbfbf` hover, transparent track) to guarantee clean, smooth scrollability without browser default scrollbar drift.
12. **AG-Grid & Table Actions Column Position & Icon Styling.** In all AG-Grid (`DataView`) and Ant Design `<Table>` instances across all modules, the **Actions column MUST be positioned as the FIRST column on the far left**. Action buttons must render domain-specific colored icons wrapped in descriptive `<Tooltip>` components (e.g. Primary Blue `#1677ff` for View/Details, Success Green `#52c41a` for BL/Approve, Warning Amber `#faad14` for SI, Purple `#722ed1` for Live Map/Tracking) for optimal UX.
13. **Documentation Attachment Cheat Sheet.** When working with AI coding assistants (Antigravity, Cursor, Claude), developers and AI agents MUST follow the documentation attachment strategy outlined in [`WHICH-DOCS-TO-ATTACH.md`](../../WHICH-DOCS-TO-ATTACH.md) and the root `README.md` documentation map. Always attach `agenct.md` + 1 to 3 relevant `.md` files for your specific task to avoid context pollution.

## Per-module process (run all 12 steps, in order)

1. **Module analysis** — inventory JSP page(s), Struts Action(s), form bean, AJAX servlet(s), `.do` routes + forwards, `MenuAccess` module code, roles, `GlobalConfig` flags. Output: one-page module brief.
2. **JSP & backend dependency analysis** — trace Action → `EJBLookUp` → EJB methods + VO/DTO shapes; note external calls (schedules, tracking, payment, carbon, mail) and cache reads; flag JSP-embedded logic to relocate.
3. **UI/UX analysis** — screenshot every state (empty/loading/populated/error/edit); list fields, columns, buttons, modals, tabs; map each legacy widget to its AntD equivalent; record conditional UI (role, shipment type E/I, field-config) and wizard step order.
4. **API & business-logic identification** — add REST endpoints on the facade (standard envelope) for each EJB method; document in OpenAPI; classify query vs mutation; regenerate FE types.
5. **React component design** — scaffold the feature slice: thin route entries + `api/` (`.api.ts` · `.keys.ts` · `.queries.ts`) + `hooks/` + `types/` + `utils/` + `components/{list,details,upsert}`.
6. **State & forms** — React Query for server data, Zustand for UI, URL for filters; RHF + Zod forms; wizards via `Steps` + per-step schema, draft in query cache.
7. **API integration** — call REST via the shared api client and the feature's `.queries.ts`/`.keys.ts`; invalidate list/detail/summary after mutations; develop on MSW mocks then switch to real.
8. **Validation & error handling** — Zod parity with legacy rules; surface server errors via `extractApiError` (inline + toast); route error boundary; per-section independent `<Spin spinning={loading}>` overlay architecture matching CRM UI `DashboardSectionQuery` pattern (keeping page headers and card layout structures mounted and interactive) instead of Skeletons.
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


## When unsure

Stop and ask. Refer to [`WHICH-DOCS-TO-ATTACH.md`](../../WHICH-DOCS-TO-ATTACH.md) for the documentation checklist. If the request conflicts with the generated types, the API contract, or these rules, surface the mismatch — do NOT create workarounds, shims, or hand-written type stubs to paper over it.
