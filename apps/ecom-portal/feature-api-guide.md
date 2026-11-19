# E-Com Portal Feature API Guide

This guide covers wiring API clients, MSW mock handlers, OpenAPI generation, and TanStack React Query hooks in `apps/ecom-portal`.

---

## 1. Dual API Strategy (Mock vs Real)

Every feature module exports an API client in `src/features/<feature>/api/<feature>.api.ts`.

- **Mock Mode (`VITE_API_MODE=mock`)**: Requests are intercepted by MSW (Mock Service Worker) handlers in `src/mocks/`.
- **Real Mode (`VITE_API_MODE=real`)**: Requests call the backend REST façade endpoint exposed from EJB services.

---

## 2. Query Key Factory Pattern

All TanStack Query keys must be generated using typed factory functions in `<feature>.keys.ts`:

```ts
export const scheduleKeys = {
  all: ['schedules'] as const,
  lists: () => [...scheduleKeys.all, 'list'] as const,
  list: (filters: ScheduleFilters) => [...scheduleKeys.lists(), filters] as const,
  details: () => [...scheduleKeys.all, 'detail'] as const,
  detail: (id: string) => [...scheduleKeys.details(), id] as const,
};
```

---

## 3. Section Query Overlays

Wrap independent UI cards and AG-Grid sections with `<Spin spinning={isLoading}>` so that user filter changes re-query in the background without unmounting section layouts.

---

## 4. Fixture-Backed Mock Data (extracted from SQL Server)

Besides the hand-written handlers, mock mode can serve **real, anonymised records** sampled from
ECOMDB / MASTERDB / REPORTDB / LRPV1.

| Piece | Path | Role |
| :--- | :--- | :--- |
| Extractor | `mock-data/` (`npm run dump`, or `npm run extract` for multi-DB) | Read-only SQL sampling (top 50 rows of every table, children follow parents) + deterministic anonymisation → `src/mocks/fixtures/*.json` (committed) |
| Store | `src/mocks/fixture-api/db.ts` | Loads every fixture into an in-memory table (`db.bookings`, `db.siCargo`, …); stateful per session; `POST /api/_mock/reset` restores it |
| REST contract | `src/mocks/fixture-api/handlers/*` | `/api/bookings`, `/api/shipping-instructions`, `/api/bills-of-lading`, `/api/vgm`, `/api/schedules/*`, `/api/masters/*`, `/api/dashboard`, `/api/payments`, portal content |
| Bridges | `src/mocks/fixture-api/bridges/*` | Pure mappers from fixture rows to the DTOs the screens already use (`BookingListDTO`, `SIListDTO`, `BLListDTO`, `PortOption`, …) |
| Client | `src/api/client.ts` | Typed `fixtureApi` client for the contract above (same bearer token as `apiClient`) |

Rules:

- The fixture handlers are registered **last** in `src/mocks/browser.ts`; a hand-written handler on the same path always wins. Login / session routes stay in `auth.handlers.ts`.
- Module handlers derive their data from the fixtures through pure mappers in `src/mocks/fixture-api/bridges/<module>.bridge.ts` (unit-tested with inline sample rows); code → name resolution goes through `bridges/masters.bridge.ts`. Every module is fixture-driven except carbon (no data source anywhere). Where the databases lack a table (CRO, surcharge amounts, quotations, charge amounts on SI/BL) the value is derived from related fixtures and marked `// TODO(fixtures): …` in the bridge.
- Rows from `db` are case-insensitive on property access (`row.agencyRefNo` ≡ `row.AgencyRefNo`). Spreading a row into an object literal loses the index signature for TypeScript: annotate such callbacks `(r): Row => ({ ...r, extra })`.
- Field names inside fixture rows are the EJB column names (`ebookno`, `originPortId`, `eSINo`, …). Rename in a bridge, never across components.
- Verify in the browser: `/api/_mock/status` (row counts) and `/api/auth/demo-users` (anonymised logins in the sample).

See `mock-data/README.md` for extraction, anonymisation and date shifting.
