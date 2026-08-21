# E-Com Portal Feature Blueprint

This document defines the standard folder layout, architectural rules, and implementation patterns for all feature modules in `apps/ecom-portal/src/features/<feature-name>/`.

---

## 1. Feature Folder Structure

```
src/features/<feature-name>/
├── api/
│   ├── <feature>.api.ts          # API functions (MSW mock + REST facade client)
│   ├── <feature>.keys.ts         # TanStack Query key factory functions
│   └── <feature>.queries.ts      # Query & mutation hook definitions
├── components/                   # Feature-specific UI components
│   ├── <Feature>List.tsx         # Primary list / AG-Grid DataView surface
│   ├── <Feature>Details.tsx      # Detail drawer or view
│   └── <Feature>UpsertModal.tsx  # Create / Edit modal or drawer
├── hooks/
│   └── use-<feature>-controller.ts # State & orchestration controller hook
├── types/
│   └── <feature>.types.ts        # TypeScript DTO & UI interfaces
└── <feature>-route.tsx           # Thin TanStack Router route component
```

---

## 2. Mandatory Architectural Rules

1. **Thin Route Files:** Route files only perform URL parameter reading and render the top-level feature view component.
2. **AG-Grid Actions First Column:** All tabular lists using `DataView` from `@solverminds/shared-ui/data-view` MUST place the **Actions column as the FIRST column on the far left** (`pinned: 'left'`).
3. **Mandatory Field Asterisk:** Required fields MUST append `<Text type="danger"> *</Text>` directly AFTER the label name (e.g. `Label *`).
4. **CRM-Parity Loading Overlays:** Use per-section independent `<Spin spinning={loading}>` overlays instead of page skeletons to keep content layout mounted during refresh.
5. **No Direct AntD Modal/Message:** Use `AppModal`, `AppDrawer`, `useToast`, `useConfirm` from `@solverminds/shared-ui`.
