# DataView

A reusable list/kanban/card orchestrator built on AG Grid (Enterprise) + Ant Design, with theme integration and shared filter/sort/search state.

> Used across `crm-portal` for leads, opportunities, accounts, contacts, activities, products, quotes, and more. Patterns below are battle-tested across all of them — follow them for any new entity list.

---

## Views

### List view (AG Grid)

- Column management: width, visibility, order, pinning
- Filtering: text, number, date, set; floating filters
- Sorting: single + multi-column
- Row selection: single, multiple, checkbox
- Row grouping with aggregations
- Pagination: client-side or server-side row model (SSRM)
- Virtual scrolling for large datasets
- Cell editing (inline + popup)
- Export: Excel, CSV, PDF
- Context menu, save/load grid state

### Kanban view

- Drag & drop between lanes
- Swimlanes, lane limits, collapsing
- Card features: priority, tags, assignee avatars, due dates
- Lane-level filtering and search

### Card view

- Responsive grid with breakpoints
- Touch optimization (swipe, pull-to-refresh)
- Skeleton loading, multi-select

---

## Sub-path imports

```ts
import { DataView } from '@solverminds/shared-ui/data-view';
import {
  ListView,
  initAgGridLicense,
} from '@solverminds/shared-ui/data-view/list-view';
import { KanbanView } from '@solverminds/shared-ui/data-view/kanban-view';
import { CardView } from '@solverminds/shared-ui/data-view/card-view';
```

Initialize the AG Grid Enterprise license once at app bootstrap:

```ts
import { initAgGridLicense } from '@solverminds/shared-ui/data-view/list-view';

initAgGridLicense(import.meta.env.VITE_AG_GRID_LICENSE_KEY);
```

---

## Critical usage rules

These rules emerged from real performance and correctness bugs hit during feature development. Follow them or you will reproduce those bugs.

### Rule 1 — Drawer / modal state must live outside the DataView component boundary

AG Grid renders one React cell-renderer instance per visible row × column. When the parent component re-renders, **every** cell renderer re-runs synchronously. With 20 rows × 4 React cell renderers, that's ~80 components re-rendering at once — easily 500–2000 ms of click-handler jank.

**Wrong** — drawer state in the same component as `DataView`:

```tsx
export function EntityList() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { dataViewProps } = useEntityListController();
  // drawerOpen change → this component re-renders → DataView re-renders
  // → every AG Grid cell re-renders. Drawer feels sluggish to open.
  return (
    <>
      <DataView {...dataViewProps} />
      <EntityUpsertDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
}
```

**Wrong** — drawer state inside the controller hook:

```ts
export function useEntityListController() {
  const [drawerOpen, setDrawerOpen] = useState(false); // every flip re-runs the entire controller
  // …
}
```

**Correct** — DataView wrapped in its own component, drawer state lives in the parent:

```tsx
function EntityDataView({ onAddEntity }: { onAddEntity: () => void }) {
  const { dataViewProps } = useEntityListController(onAddEntity);
  return <DataView {...dataViewProps} />;
}

export function EntityList() {
  const { token } = theme.useToken();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div style={{ padding: token.paddingSM, height: '100%' }}>
      <div style={{ flex: 1, minHeight: 0 }}>
        <EntityDataView onAddEntity={() => setDrawerOpen(true)} />
      </div>
      <EntityUpsertDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
```

When `drawerOpen` flips:

1. `EntityList` re-renders.
2. React Compiler sees the `onAddEntity` callback identity is stable (because `setDrawerOpen` is a stable React state setter).
3. `EntityDataView` props are unchanged → it skips re-rendering entirely.
4. AG Grid cells stay untouched. The drawer opens instantly.

### Rule 2 — Use `convertDataViewContextToApiFilter` in `onFetchData`

`FetchDataParams` exposes raw DataView state (`contextFilters`, `contextSorts`, `contextSearchText`, `contextSearchField`). Use it directly — don't reverse-engineer the AG Grid `filterModel`.

```ts
import { convertDataViewContextToApiFilter } from '@/utils/data-view-api-utils';

onFetchData: async (params) => {
  const pageSize = Math.max((params.endRow ?? 20) - (params.startRow ?? 0), 1);
  const page = params.startRow ? Math.floor(params.startRow / pageSize) : 0;

  const { filter, sort } = convertDataViewContextToApiFilter(
    params.contextFilters ?? [],
    params.contextSorts ?? [],
    {
      fieldMap: ENTITY_FIELD_MAP,
      searchText: params.contextSearchText,
      searchField: params.contextSearchField,
      transformFilter: entitySpecificTransformer, // optional
    }
  );

  const result = await queryClient.fetchQuery(
    entityQueryOptions({ page, size: pageSize, sort, filters: filter })
  );

  return { data: result.data.content, totalCount: result.data.totalElements };
};
```

### Rule 3 — Use `transformFilter` for entity-specific shaping

Some entities need filter shapes the generic adapter doesn't know about (e.g. `stageCode` filter expanded into a `stageCodes: string[]` array). Implement a `transformFilter` and return `null` to fall through to default handling:

```ts
function entityStageTransformer(
  apiField: string,
  filter: FilterValue
): Record<string, unknown> | null {
  if (apiField !== 'stageCode') return null;
  return { stageCodes: normalizedValues(filter) };
}
```

### Rule 4 — Use `toDayBoundary` for date normalization

```ts
import { toDayBoundary } from '@/utils/data-view-api-utils';

toDayBoundary('2026-03-15', 'start'); // '2026-03-15 00:00:00'
toDayBoundary('2026-03-15', 'end'); // '2026-03-15 23:59:59'
```

The generic adapter already applies day boundaries to date filters automatically — only call this directly when you're building a custom filter shape outside the adapter.

### Rule 5 — No `useMemo` / `useCallback` in feature view-options hooks

React Compiler is on. Hooks like `use-{entity}-view-options.ts` and `use-{entity}-mutations.ts` should return plain objects directly. Manual memoization here actively hurts the Compiler.

### Rule 6 — AG Grid prop identity exception

AG Grid internally compares object/function prop identity for `columnDefs`, `defaultColDef`, and a few related props. If those identities flip on every parent render, AG Grid rebuilds floating filters and you can hit focus-loss bugs while the user is typing. Inside the `ListView` host, identities for these specific props are stabilized with targeted `useMemo` / `useCallback`. **Do not** mirror props into state to "fix" identity — that's a regression of an old bug and reintroduces the focus-loss issue.

---

## Architecture (for maintainers)

```
LeadsList (feature component)
  ├── useLeadsUrlState()                    deserialize URL search → filters/sorts/search
  ├── useLeadsKanbanQueries()               per-lane infinite queries (kanban only)
  ├── useQuery()                            card view paginated query
  ├── useListViewOptions()                  AG Grid config — plain objects, no useMemo
  ├── useKanbanViewOptions()                kanban config — plain objects
  └── useCardViewOptions()                  card config — plain objects
        │
        ▼
DataView (orchestrator from shared-ui)
  ├── DataViewProvider                      Zustand store + onFiltersChange / onSortsChange / onSearchChange callbacks
  │     ├── viewMode, filters, sorts, searchText, searchField
  │     └── queryVersion (incremented on filter/sort/search changes)
  └── DataViewContent
        ├── DataViewHeader                  view switcher + filter bar + search
        │     └── FilterBar → FilterChips / SortChips
        ├── ListView (AG Grid SSRM)
        │     └── ListViewGrid              serverSideDatasource + refreshKey={queryVersion}
        ├── KanbanView
        └── CardView
```

The shared store is keyed by `dataViewId`. Multiple DataViews on the same page each get their own store slice.

---

## Performance notes

- AG Grid SSRM is the default for any list backed by a paginated server endpoint. Don't fall back to client-side row model for production data.
- The `queryVersion` counter is bumped on filter/sort/search changes; `ListViewGrid` listens to it via `refreshKey` and calls `api.refreshServerSide()` exactly once per change.
- `keepPreviousData` is enabled on card-view paginated queries to avoid flicker when filters change. Don't use it on detail screens.
