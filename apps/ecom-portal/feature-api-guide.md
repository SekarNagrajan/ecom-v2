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
