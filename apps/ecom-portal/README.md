# `@solverminds/ecom-portal`

The customer and vendor-facing E-Commerce shipping web portal for Solverminds, built with React 19, Ant Design 6, TanStack Router, TanStack Query, and Zustand.

---

## Feature Architecture Map

Each business module lives inside `src/features/<feature-name>/`:

```
src/features/
├── dashboard/               # Volume analytics, active lanes, planning, ongoing shipments AG-Grid
├── schedules/               # Point-to-point vessel schedules, routing details, carbon metrics
├── tracking/                # Container traceability, event log drawer, interactive map
├── user-modules/            # e-Booking, SI, VGM declarations, Quotations
├── vendor-approvals/        # Workflow approval queue, approval/decline triggers
├── admin/                   # System admin control panel, field configs, banner manager
├── theme/                   # Global theme preferences (Font size, Color scheme, Density)
└── registration/            # User onboarding & carrier registration wizard
```

---

## Documentation Checklist for Developers & AI Assistants

When submitting requests or pair-programming with AI Coding Assistants (Antigravity, Cursor, Claude):

- Consult [`WHICH-DOCS-TO-ATTACH.md`](../../WHICH-DOCS-TO-ATTACH.md) for cheat sheet instructions on which `.md` files to attach in chat.
- Always include `.cursor/rules/agenct.md` for UI and loading standards.
- Feature scaffolding: Refer to [`ECOM-PORTAL-FEATURE-BLUEPRINT.md`](ECOM-PORTAL-FEATURE-BLUEPRINT.md).
- API wiring: Refer to [`feature-api-guide.md`](feature-api-guide.md).
