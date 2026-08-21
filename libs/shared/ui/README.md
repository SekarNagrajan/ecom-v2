# @solverminds/shared-ui

Internal component and utility library used by `apps/crm-portal`. **Not published to npm** — consumed via TypeScript path mapping inside the workspace, built per-feature into sub-path entry points to keep the initial bundle small.

> For workspace setup, see the [root README](../../../README.md). For app-level architecture, see [`apps/crm-portal/README.md`](../../../apps/crm-portal/README.md).

---

## Run Storybook

```bash
pnpm shared-ui          # nx storybook shared-ui — opens Storybook for live component browsing
```

Each component family ships with stories. Storybook is the fastest way to learn the API surface.

---

## Sub-path entry points

Heavy dependencies (Tiptap, FullCalendar, AG Grid, ECharts) are intentionally **not** re-exported from the package root. Import from the matching sub-path so consumers only pay for what they use.

| Sub-path                                           | What's inside                                                                                      |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `@solverminds/shared-ui`                           | Core UI: `AppButton`, `AppModal`, `AppDrawer`, `AppTabs`, `Form*` fields, `useToast`, `useConfirm` |
| `@solverminds/shared-ui/providers`                 | `AppConfigProvider`, `mergeAppConfig`, default config                                              |
| `@solverminds/shared-ui/hooks`                     | Reusable hooks (date format, theme, etc.)                                                          |
| `@solverminds/shared-ui/utils`                     | Shared utilities                                                                                   |
| `@solverminds/shared-ui/schemas`                   | Reusable Zod schemas                                                                               |
| `@solverminds/shared-ui/data-view`                 | `DataView` orchestrator + shared types                                                             |
| `@solverminds/shared-ui/data-view/list-view`       | AG Grid list view + `initAgGridLicense`                                                            |
| `@solverminds/shared-ui/data-view/kanban-view`     | Kanban view                                                                                        |
| `@solverminds/shared-ui/data-view/card-view`       | Card grid view                                                                                     |
| `@solverminds/shared-ui/data-view/utils`           | DataView filter/sort/search adapters                                                               |
| `@solverminds/shared-ui/data-view/ag-grid-license` | AG Grid Enterprise license bootstrap                                                               |
| `@solverminds/shared-ui/chart`                     | `AppChart` (Apache ECharts host), `useChartTokens`, theme helpers                                  |
| `@solverminds/shared-ui/email`                     | `AppEmailCenter` and email types/utils                                                             |
| `@solverminds/shared-ui/calendar`                  | `AppCalendar` (FullCalendar host)                                                                  |
| `@solverminds/shared-ui/editor`                    | `RichTextEditor` (Tiptap host) + editor types                                                      |
| `@solverminds/shared-ui/form-editor`               | `FormRichTextEditor` (Tiptap host bound to RHF)                                                    |

The full export map lives in [`package.json`](./package.json).

---

## Source layout

```
libs/shared/ui/src/
├── base/                 # Theme primitives, design tokens, base components
├── components/
│   ├── chart/            # AppChart (ECharts) + theme helpers
│   ├── common/           # Cross-cutting primitives (icons, layout helpers)
│   ├── data-view/        # DataView + List/Kanban/Card views (see ./components/data-view/README.md)
│   ├── email/            # AppEmailCenter
│   ├── form-fields/      # FormInput, FormSelect, FormDatePicker, FormPhoneInput, …
│   ├── formatted-date/   # <FormattedDate />
│   ├── formatted-number/ # <FormattedNumber />
│   └── ui/               # AppButton, AppModal, AppDrawer, AppTabs, RichTextEditor, calendar, …
├── hooks/                # useDateFormat, useToast, useConfirm, theme hooks, …
├── providers/            # AppConfigProvider, mergeAppConfig
├── schemas/              # Reusable Zod schemas
├── stores/               # Cross-feature shared stores (rare — feature stores live in crm-portal)
├── styles.css            # Tailwind base + global styles
├── types/                # Shared TypeScript types
├── utils/                # Shared utilities
└── index.ts              # Lightweight exports — heavy deps stay behind sub-paths
```

---

## shared-ui specific rules

Workspace rules apply (see [`AGENTS.md`](../../../AGENTS.md)). On top of those:

- **Sub-path discipline.** Adding a component that pulls in a heavy transitive dep (Tiptap, FullCalendar, AG Grid, ECharts, anything > ~30 kB) → add a new sub-path export. Don't re-export it from the root `index.ts`.
- **Form fields wrap RHF.** Every `Form*` field accepts a `control` prop and passes through unobtrusively. No AntD `Form` here.
- **AG Grid identity exception.** Inside `data-view`, prop identity for `columnDefs` / `defaultColDef` matters. Existing host components stabilize them carefully — read those before adding more imperative-library wrappers.

---

## When to add code here vs. in a feature

Add to `shared-ui` when **all** of the following are true:

- The component / hook / util has no business logic specific to a single feature.
- It's plausibly reusable by at least two features (or a future feature).
- It's a presentational concern, a layout primitive, or a cross-cutting utility.

Keep it inside `apps/crm-portal/src/features/<feature>/` when:

- It encodes business rules tied to a single domain (e.g. lead-stage colors, opportunity stage transitions).
- It depends on a feature-specific API or store.
- It's an entry route, controller hook, or feature-specific drawer/form composition.

For app-level shared components that pull in feature data (e.g. record cards, hover previews) but aren't generic enough for `shared-ui`, the right home is `apps/crm-portal/src/components/shared/`.

---

## Build & consumption

`shared-ui` is private (`"private": true` is implied — it isn't published). Consumers reach it via:

- Workspace TypeScript path mapping at dev time (`@solverminds/source` condition in the export map → resolves directly to `src/`)
- The build output in `dist/` for production (per the standard `import` / `types` conditions)

`pnpm nx build shared-ui` produces the `dist/` artifacts. Nx automatically rebuilds it as a dependency of `crm-portal` when needed.

`shared-ui` is **not** part of `nx release` — `nx.json` scopes releases to `crm-portal` only.
