# Solverminds E-Commerce Portal Workspace (E-Com v2)

Nx monorepo for the Solverminds E-Commerce Shipping Portal — a multi-tenant, modern React 19 + Ant Design 6 portal migrating legacy Struts 1.3 / JSP services into a modern static SPA architecture.

Production code lives in two core projects:

- [`apps/ecom-portal`](apps/ecom-portal) — the customer & vendor facing E-Com portal application (Vite-built SPA)
- [`libs/shared/ui`](libs/shared/ui) — the reusable component library, published internally as `@solverminds/shared-ui`

---

## Stack

React 19 · TypeScript 5.9 · Ant Design 6 · TanStack Router (file-based) · TanStack React Query 5 (with persisted client) · Zustand 5 · React Hook Form + Zod · AG Grid 35 Enterprise · Tiptap 3 · Luxon 3 · Vite 7 · Vitest · Playwright · Storybook 10.

---

## Getting Set Up

### Prerequisites

- Node version pinned in [`.nvmrc`](.nvmrc): `24.12.0`
- Package manager: **pnpm** `>=10.30.2`

### Quick Start

```bash
git clone https://github.com/SekarNagrajan/ecom-v2.git
cd ecom-v2
nvm use            # switches to Node 24.12.0
pnpm install       # installs dependencies
pnpm dev           # starts E-Com portal at http://localhost:4200
```

---

## Project Map

```
ecom-v2/
├── apps/
│   └── ecom-portal/                 # Vite SPA — main E-Commerce portal app
├── libs/
│   └── shared/ui/                  # @solverminds/shared-ui — components, form fields, DataView
├── .cursor/
│   └── rules/agenct.md             # Enterprise design rules & JSP migration standards
├── WHICH-DOCS-TO-ATTACH.md         # AI Coding Assistant documentation cheat sheet
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

### Documentation Map — Pick the Doc that Matches Your Goal

| You want to... | Read |
| :--- | :--- |
| **Get the workspace running on your machine** | This `README.md` |
| **Attach the right docs in chat with AI coding assistants** | [`WHICH-DOCS-TO-ATTACH.md`](WHICH-DOCS-TO-ATTACH.md) |
| **Understand `ecom-portal` architecture (state, routing, auth, API, forms)** | [`apps/ecom-portal/README.md`](apps/ecom-portal/README.md) |
| **Add a new feature (folder layout, query keys, controller hooks)** | [`apps/ecom-portal/ECOM-PORTAL-FEATURE-BLUEPRINT.md`](apps/ecom-portal/ECOM-PORTAL-FEATURE-BLUEPRINT.md) |
| **Wire a feature's API (mock + real, types, query options)** | [`apps/ecom-portal/feature-api-guide.md`](apps/ecom-portal/feature-api-guide.md) |
| **Use `shared-ui` components / sub-path imports** | [`libs/shared/ui/README.md`](libs/shared/ui/README.md) |
| **Build list/grid views with AG-Grid (`DataView`)** | [`libs/shared/ui/src/components/data-view/README.md`](libs/shared/ui/src/components/data-view/README.md) |
| **Enterprise UI rules, Spin overlays, Labels & AG Grid Actions position** | [`.cursor/rules/agenct.md`](.cursor/rules/agenct.md) |
| **Cut a release & version bump** | [`apps/ecom-portal/RELEASE.md`](apps/ecom-portal/RELEASE.md) |
| **Get test URLs, env keys, and FE-specific gotchas** | [`HANDOVER.md`](HANDOVER.md) |

---

## Coding Ground Rules

Full rules in [`.cursor/rules/agenct.md`](.cursor/rules/agenct.md). Top mandatory rules:

1. **Loading Architecture:** Per-section independent `<Spin spinning={loading}>` overlay architecture matching CRM UI `DashboardSectionQuery` pattern (keeping page headers and card layout structures mounted).
2. **Forms:** React Hook Form + Zod + `shared-ui` `Form*` fields only. Required fields display red asterisk `<Text type="danger"> *</Text>` directly AFTER field label text (`Field Name *`).
3. **AG-Grid / DataView Tables:** The **Actions column MUST be positioned as the FIRST column on the far left**. Action buttons use domain-specific colored icons wrapped in descriptive `<Tooltip>` wrappers.
4. **UI Consistency:** Always use `shared-ui` wrappers — `AppButton`, `AppModal`, `AppDrawer`, `AppTabs`, `useConfirm`, `useToast`.
5. **Styling:** Use `theme.useToken()` design tokens for all colors, spacing, and border radius.
