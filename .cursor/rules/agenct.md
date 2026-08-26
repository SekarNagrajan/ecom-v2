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
5. **UI Components & shared-ui only.** ALWAYS use `shared-ui` wrappers — `AppButton`, `AppModal`, `AppDrawer`, `AppTabs`, `useConfirm`, `useToast` — never raw AntD equivalents like `message` or `Modal`. **No inline `style={{}}` props and no hardcoded colors, spacing, font sizes, or radii** — use token-backed CSS classes via `GlobalThemeStyles` / feature-specific `<style>` injectors (see `AppIconStyles`, `global-theme-styles.tsx`). Use `theme.useToken()` only inside those style injectors or Ant Design component `styles`/`classNames` APIs — never hex/rgba literals like `#1677ff` or `rgba(255,255,255,0.18)`. For alpha tints use `tokenMix(token.colorPrimary, 12)` from [`token-mix.ts`](apps/ecom-portal/src/features/theme/utils/token-mix.ts) or built-in tokens like `token.colorPrimaryBg`. Use `useAntdBreakpoint` for responsive design.
6. **Forms = RHF + Zod.** One schema drives UI + submit. Port every Commons Validator and per-locale jQuery rule into the Zod schema. Form action buttons must stay consistent (e.g. `Cancel + Save` in create mode).
7. **Types from OpenAPI.** Generate FE types from the backend spec (`openapi-typescript`). No hand-written API types. No `any` — use `unknown`.
8. **State model is fixed.** Server state = React Query, client/UI = Zustand, view/filter state = URL search params. No other global stores.
9. **RBAC on routes AND backend.** Gate `/admin/*` and protected routes via `beforeLoad` capability checks; the backend re-enforces every endpoint. Client gate is UX only.
10. **No secrets in the client bundle.** Config via typed (Zod-validated) env + backend. Never `VITE_*` DB creds or keys.
11. **React Compiler & Optimization.** NO `memo`, `useCallback`, or `useMemo` by default. Do NOT use `useEffect` to synchronously derive or normalize state.
12. **Change Attribution.** When modifying or creating files, add a single-line comment at the top: `// Modified by [Sekar Nagarajan] (YYYY-MM-DD HH:mm)`.
13. **Ship behind a feature flag / route switch.** Keep the legacy JSP live until the module is proven; rollback = flip the switch (no redeploy).
14. **Mirror the pinned reference module** (first migrated slice, e.g. Schedules) for structure every time. **Dashboard** (`/app/dashboard`) MUST follow enhancedDashboard.jsp parity: KPI filter cards (`totCou` / `bkConfirmed` / `siPending` / `payPending` / lifecycle) + Ongoing Transactions table with client-side filter/search; analytics sections (volume/lanes/planning/intelligence) are additive and mock-backed until REST exists — never replace core KPI/ongoing with marketing-only Rocket widgets.

## UI consistency patterns (all modules must follow)

1. **Custom scrollable UI (project-wide).** Every scrollable surface in the portal MUST use the `custom-scroll` CSS class — never leave the browser default scrollbar. Applies to **all** modules and layouts: page content, forms, wizard steps, drawers, modals, sidebars, table/list wrappers, overflow action toolbars, and any `overflow: auto|scroll` container.
   - **Class:** add `custom-scroll` on the scrolling element (with `overflow-y: auto` / `overflow-x: auto` / `overflow: auto` as needed). Prefer the global styles in [`global-theme-styles.tsx`](apps/ecom-portal/src/components/shared/global-theme-styles.tsx) — do **not** re-copy thumb/track CSS per feature unless a module needs a documented exception.
   - **Look:** thin 6px scrollbar, transparent track, muted thumb (`token.colorTextQuaternary`), slightly stronger on hover (`token.colorTextTertiary`); Firefox via `scrollbar-width: thin` + `scrollbar-color`.
   - **Actions rows:** when toolbar / list / card action groups overflow (especially mobile/tablet), wrap them in a `custom-scroll` container with horizontal overflow rather than clipping or wrapping awkwardly.
   - **New work checklist:** if you add scroll, you add `custom-scroll`. Reviewers treat missing `custom-scroll` on a scrolling region as a defect.
2. **Input field sizing.** All Ant Design `Input`, `Select`, `AutoComplete` form fields must use `size="large"` to maintain visual consistency with the Registration module. Do NOT set a fixed `height` on inputs.
3. **Input background color.** Form inputs use the Ant Design default white background (`#fff`). Do NOT apply `token.colorBgLayout` or any grey tint to input fields. TextArea follows the same rule.
4. **Autofill reset.** Include `-webkit-box-shadow: 0 0 0 1000px #ffffff inset !important;` and `transition: background-color 50000s ease-in-out 0s !important;` in the `input:-webkit-autofill` CSS rules for every form module (including Login, Contact Us, and Registration) to eliminate default browser autofill blue/yellow backgrounds and keep input fields pristine white.
5. **Labels & Mandatory Fields.** Use CSS class `form-field-label` (defined in `GlobalThemeStyles`) for all form labels — scales with theme tokens automatically. Required/Mandatory fields MUST display the red asterisk `<Text type="danger"> *</Text>` directly AFTER the field label text (e.g. `Field Name *`), never before the label.
6. **Card layout.** Form pages use `<Card>` with token-backed classes or Ant Design Card defaults — do NOT hardcode `borderRadius`, `boxShadow`, or hex border colors inline.
7. **Error text.** Validation errors rendered as `<Text type="danger" className="form-field-error">`.
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
   - **Top-bar Expand Sidebar control is landing-only.** The header hamburger / Expand sidebar icon MUST appear only in `PublicLayoutHeader` (landing / public pages). `AuthenticatedLayoutHeader` (guest or logged-in `/app/*` modules) MUST NOT show Expand/Collapse sidebar on web/monitor — keep the icon rail; mobile/tablet may still show a drawer open control when `useMobileNav` is true.
   - **Guest `/app/*` header Home escape.** When browsing Schedules/Tracking/Rates without login, `AuthenticatedLayoutHeader` MUST expose a **Home** action (and clickable brand) that navigates to `/` so users can leave without signing in. Guest header actions (Home, Contact Us, Register, Login) MUST use token-backed hover states (`.app-header-action` / `.app-header-action--primary`) with Ant Design `<Tooltip>` titles.
10. **Sidebar Menu Grouping & 10-Item Overflow Limit.**
    - Only **Schedules** (Schedules, Tracking) and **Rates** (Rates, Tariff) are grouped into sub-menus. All other modules are top-level items.
    - The sidebar renders **10 primary modules** directly in the list with distinct, meaningful Lucide icons via `NavIcons` (`bookOpen` for Booking, `clipboardList` for SI, `shieldCheck` for VGM, `fileCheck` for Bill of Lading, `packageCheck` for Delivery Order, `bell` for Arrival Notice, `barcode` for CRO, etc.) from [`apps/ecom-portal/src/components/icons/icon-map.ts`](apps/ecom-portal/src/components/icons/icon-map.ts).
    - All remaining modules (Payment History, Customer Statement, Carbon Calculator) MUST be placed inside an overflow item labelled **More** with a 3-dots icon (`Icons.ellipsis`).
    - **Contact Us** after login is header-only (`AuthenticatedLayoutHeader` drawer / menu) — do **not** duplicate it in `AuthenticatedSidebar`. Public (pre-login) sidebar may still list Contact Us.
11. **Sidebar Custom Scrollbar.** The sidebar `<Sider>` container across all layout components (`PublicLayout`, `AuthenticatedSidebar`) MUST apply the `custom-scroll` class with `overflowY: auto` (see UI pattern #1 — project-wide custom scroll). Do not invent a second scrollbar look for sidebars.
12. **AG-Grid & Table Actions Column Position & Icon Styling.** In all AG-Grid (`DataView`) and Ant Design `<Table>` instances across all modules, the **Actions column MUST be positioned as the FIRST column on the far left**. Action buttons must use `AppIcon` with `gridAction` **plus a semantic `tone`** — wrap each action in a descriptive `<Tooltip>` (or `ListActionButton`). Never import `@ant-design/icons` in ecom-portal; use Lucide via `Icons` / `NavIcons` registry.
    - **Default (no tone):** black/`token.colorText`, primary + light primary background on hover (Actions column only).
    - **Per-action `tone` (required for distinct actions):** set `tone` on `AppIcon` (or `ListActionButton`) so **each** standard action has its **own unique** token color — `view` → primary, `print` → geekblue, `edit` → warning, `create` → success, `delete` → error, `approve` → lime, `reject` → volcano, `navigate` → blue, `track` → cyan, `history` → purple, `download` → orange, `muted` → secondary text. Hover uses a matching tint via `tokenMix` / `*Bg`. Do not reuse the same palette class across different tones. See [`app-icon.tsx`](apps/ecom-portal/src/components/icons/app-icon.tsx) + [`app-icon-styles.tsx`](apps/ecom-portal/src/components/icons/app-icon-styles.tsx).
13. **Icon System (Lucide).** All ecom-portal icons use `lucide-react` through the shared `AppIcon` wrapper. Default icon color is the user-selected theme primary (`token.colorPrimary`) everywhere **except**: (1) sidebar nav icons (`variant="nav"`) — black/`token.colorText` default, primary when selected/hovered; (2) **public-layout auth-required / locked modules** (`variant="navLocked"`) — muted `token.colorTextQuaternary` with no primary hover (JSP Category `P` parity); (3) AG-Grid/DataView / list **Actions** — `gridAction` + `tone` as in #12; (4) icons on solid primary backgrounds — white via `.ant-btn-primary .app-icon`, `.primary-surface`, or parent `app-icon-inherit` wrapper. Add new icons to `icon-map.ts` only. Do **not** put action `tone` on decorative / form-prefix / nav icons.
14. **Module Screen Titles (Title Case).** All module page headers MUST use **Title Case** (e.g. `Booking`, `Shipping Instruction`, `New Booking`) — never ALL CAPS (e.g. `E-BOOKING`, `SHIPPING INSTRUCTIONS`). Import display names from [`apps/ecom-portal/src/constants/module-titles.ts`](apps/ecom-portal/src/constants/module-titles.ts) and render via the shared [`ModuleScreenHeader`](apps/ecom-portal/src/components/shared/module-screen-header.tsx) component. Wizard step labels use `WIZARD_STEP_TITLES` from the same file. Dynamic suffixes use `formatModuleScreenTitle(base, detail)`.
15. **Global Typography from Theme Preferences.** Font family and base font size from Appearance settings MUST propagate app-wide through root `AppConfigProvider` (`buildAntdTheme`) plus `TenantThemeProvider` font injection (`dynamic-font-override` + `GlobalThemeStyles`). Module headers, Ant Design components, AG Grid, forms, and drawers inherit the selected font. Do NOT hardcode `fontSize` on module screen titles — use `token.fontSizeHeading4`, `token.fontSizeSM`, etc. via CSS classes, not inline styles.
16. **Token-Only Styling Pattern.** Register reusable layout/visual classes in [`global-theme-styles.tsx`](apps/ecom-portal/src/components/shared/global-theme-styles.tsx) (loaded in `TenantThemeProvider`). Examples: `form-field-label`, `form-field-error`, `form-step-footer`, `booking-template-modal__*`. Feature-specific overrides follow the `AppIconStyles` pattern: a co-located component injects a scoped `<style>` block whose values come from `theme.useToken()`. Never use `#hex`, `rgb()`, or `rgba()` literals in components — derive all colors from Ant Design tokens or `tokenMix()`.
17. **Light / Dark Theme (CRM parity).** The portal MUST support Light and Dark themes with **Light as the default** (`themeMode: 'light'` in `DEFAULT_APP_CONFIG`).
    - **Single root theme.** Ant Design tokens come from one root [`AppConfigProvider`](libs/shared/ui/src/providers/app-config-provider.tsx) via `buildAntdTheme` (`LIGHT_PALETTE` / `DARK_PALETTE` + `darkAlgorithm`). [`TenantThemeProvider`](apps/ecom-portal/src/components/providers/TenantThemeProvider.tsx) is a **thin shell** (GlobalThemeStyles, AppIconStyles, fonts only) — do **not** nest a second ConfigProvider that hardcodes light surfaces or ignores `themeMode`.
    - **Topbar toggle.** Mount [`HeaderThemeToggle`](apps/ecom-portal/src/components/layout/header-theme-toggle.tsx) on `PublicLayoutHeader` and `AuthenticatedLayoutHeader` (guest + logged-in). Drive from `effectiveThemeMode`; persist via Zustand `ecom-user-theme-config`. Mode lives on the header (CRM pattern) — Appearance panel keeps density/font/primary only unless an admin Theme Editor is added later.
    - **`html.dark`.** Stay in sync with `AppConfigProvider` classList; use tokens / `--ecom-*` / `--ant-*` rather than large `.dark` color dumps. Nested ConfigProvider only for surgical one-offs, never for global light/dark.
    - **Special surfaces.** Prefer DataView/`useAgGridTheme` and shared-ui `useChartTokens` for grids/charts. Legacy `ag-theme-alpine` must follow `html.dark` token bridges in `GlobalThemeStyles` until migrated.
18. **Responsive Layout (mobile / tablet / web / monitor).** All feature modules MUST be responsive across four viewport tiers using Ant Design breakpoints via [`useResponsiveLayout`](apps/ecom-portal/src/hooks/use-responsive-layout.ts):
    - **mobile** `< 768px` — drawer navigation, stacked headers, full-width columns, horizontal scroll for tables/wizard steps.
    - **tablet** `768–991px` — compact header, 2-column grids, scrollable wide content.
    - **web** `992–1599px` — sidebar rail (80px collapsed), standard multi-column layouts.
    - **monitor** `≥ 1600px` — max-width content shell (`feature-page-shell`, 1600px centered).
      Use `Col` spans from [`RESPONSIVE_COL`](apps/ecom-portal/src/constants/responsive-grid.ts). Wrap feature routes in [`FeaturePageShell`](apps/ecom-portal/src/components/shared/feature-page-shell.tsx). AG-Grid / Table containers MUST use class `responsive-table-wrap`. Wizard steps MUST use `wizard-steps-scroll`. Test every module at 375px, 768px, 1024px, and 1600px widths.
19. **Action Tooltips & camelCase (new and existing changes).** When adding **or** modifying UI/actions in any module:
    - **Ant Design Tooltip on actions.** Wrap every actionable control that is icon-only or whose purpose is not obvious from visible text in Ant Design `<Tooltip title="…">` — including AG-Grid/DataView Actions-column buttons, toolbar icon buttons, header quick actions, row/card action icons, and similar. Use a short, descriptive Title Case title (e.g. `View Details`, `Print Delivery Order`, `Reset Filters`). Prefer `antd` `Tooltip`; do not invent custom tooltip widgets. Apply this on new work and whenever existing action controls are touched.
    - **camelCase identifiers.** TypeScript/React identifiers MUST use **camelCase** (e.g. `handleSubmit`, `isSubmitting`, `userName`, `onLoginRequired`). React components, types, and interfaces use **PascalCase** (e.g. `PublicLoginPanel`, `LoginForm`). Do not introduce `snake_case` or `ALL_CAPS` for variables/functions (constants that are true compile-time enums/config keys may remain `UPPER_SNAKE` only when matching an existing pattern).
20. **Loading spinners (centered, spinner-only).** Whenever a module shows a loading / waiting state with Ant Design `<Spin>` (route load, wizard step fetch, drawer/details fetch, section overlay — not AG-Grid/DataView’s built-in `loading` prop):
    - **Spinner only.** Render the spinner alone — do **not** pass `tip`, `description`, or any adjacent “Loading…” / “Please wait…” text beside or under the spinner. Accessibility: put a short label on the wrapper via `aria-label` / `role="status"` (e.g. `aria-label="Loading"`), not visible copy.
    - **Centered.** Place the spinner in a flex container that centers it both horizontally and vertically within the loading region (token-backed class such as `.si-loading-center` / shared `.module-loading-center`: `display: flex; align-items: center; justify-content: center; width: 100%;` with a sensible `min-height` from tokens). Full-page loads may use a taller fill variant.
    - **Size.** Prefer `size="medium"` for page / wizard / drawer body loads. Do not invent custom spinner colors — use Ant Design defaults (theme primary).
    - **Reuse.** Prefer a small co-located helper (e.g. Shipping Instruction [`SiLoadingCenter`](apps/ecom-portal/src/features/shipping-instruction/components/si-loading-center.tsx)) or a shared module equivalent — do not scatter one-off uncentered `Spin` markup. When adding the same pattern to a new module, mirror this helper + token CSS class in that feature’s module styles injector.
    - **Exceptions.** List/grid intrinsic loading (ListView/`loading={true}`) stays as-is. Button `loading` on submit actions is unchanged. Error / empty states still use `Result` or copy — this rule is for **in-progress loading only**.
21. **Documentation Attachment Cheat Sheet.** When working with AI coding assistants (Antigravity, Cursor, Claude), developers and AI agents MUST follow the documentation attachment strategy outlined in [`WHICH-DOCS-TO-ATTACH.md`](../../WHICH-DOCS-TO-ATTACH.md) and the root `README.md` documentation map. Always attach `agenct.md` + 1 to 3 relevant `.md` files for your specific task to avoid context pollution.

## Per-module process (run all 12 steps, in order)

1. **Module analysis** — inventory JSP page(s), Struts Action(s), form bean, AJAX servlet(s), `.do` routes + forwards, `MenuAccess` module code, roles, `GlobalConfig` flags. Output: one-page module brief.
2. **JSP & backend dependency analysis** — trace Action → `EJBLookUp` → EJB methods + VO/DTO shapes; note external calls (schedules, tracking, payment, carbon, mail) and cache reads; flag JSP-embedded logic to relocate.
3. **UI/UX analysis** — screenshot every state (empty/loading/populated/error/edit); list fields, columns, buttons, modals, tabs; map each legacy widget to its AntD equivalent; record conditional UI (role, shipment type E/I, field-config) and wizard step order.
4. **API & business-logic identification** — add REST endpoints on the facade (standard envelope) for each EJB method; document in OpenAPI; classify query vs mutation; regenerate FE types.
5. **React component design** — scaffold the feature slice: thin route entries + `api/` (`.api.ts` · `.keys.ts` · `.queries.ts`) + `hooks/` + `types/` + `utils/` + `components/{list,details,upsert}`.
6. **State & forms** — React Query for server data, Zustand for UI, URL for filters; RHF + Zod forms; wizards via `Steps` + per-step schema, draft in query cache.
7. **API integration** — call REST via the shared api client and the feature's `.queries.ts`/`.keys.ts`; invalidate list/detail/summary after mutations; develop on MSW mocks then switch to real.
8. **Validation & error handling** — Zod parity with legacy rules; surface server errors via `extractApiError` (inline + toast); route error boundary; per-section independent centered spinner-only `<Spin>` overlay (UI pattern #20 — no tip/description text) matching CRM UI `DashboardSectionQuery` pattern (keeping page headers and card layout structures mounted and interactive) instead of Skeletons.
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
