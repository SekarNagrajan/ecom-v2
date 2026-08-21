# Which Docs to Attach in Chat
## A Cheat Sheet for Working with AI Coding Assistants
`@solverminds/ecom-portal` · E-Com v2 Architecture  
*Attach by what you changed — not every edit*  
*August 2026 · Internal Engineering Document*

---

## Contents
1. [The Core Idea](#the-core-idea)
2. [Always Useful (Most Changes)](#1-always-useful-most-changes)
3. [Pick by Type of Change](#2-pick-by-type-of-change)
4. [Minimal Sets (Copy for Chat)](#3-minimal-sets-copy-for-chat)
5. [Usually Do Not Attach](#4-usually-do-not-attach)
6. [Best Practice in Chat](#5-best-practice-in-chat)
7. [The One-Line Rule](#6-the-one-line-rule)

---

## The Core Idea

Which `.md` files you attach in chat depends on **what you changed, not on every edit**. Attaching the whole repo buries the signal; attaching the right **one to three docs** gives the AI assistant exactly the context it needs.

> **FOR A QUICK FIX:** `.cursor/rules/agenct.md` + a short description of the bug is often enough. Reach for more docs only when the change touches structure, API, or a specialized subsystem.

---

## 1. Always Useful (Most Changes)

| Attach | Path | Why |
| :--- | :--- | :--- |
| **Coding & Design Rules** | `.cursor/rules/agenct.md` | Loading Spin overlays, 50:50 grid ratios, mandatory form field asterisks (`Label *`), AG-Grid Actions column positioning & colors, sidebar navigation rules. |
| **App Architecture** | `apps/ecom-portal/README.md` | Routing, features layout, auth, tenant switcher, layout headers, state stores. |

---

## 2. Pick by Type of Change

| You changed… | Attach these MD files |
| :--- | :--- |
| **New feature or big refactor in `features/<name>/`** | `apps/ecom-portal/ECOM-PORTAL-FEATURE-BLUEPRINT.md` + `apps/ecom-portal/README.md` + `.cursor/rules/agenct.md` |
| **API / mock / queries / MSW handlers / types** | `apps/ecom-portal/feature-api-guide.md` + `.cursor/rules/agenct.md` |
| **List / AG Grid (`DataView`) view** | `libs/shared/ui/src/components/data-view/README.md` + `.cursor/rules/agenct.md` |
| **Shared UI component in `libs/shared/ui`** | `libs/shared/ui/README.md` + `.cursor/rules/agenct.md` |
| **Schedules & Tracking Logistics Modules** | `apps/ecom-portal/src/features/schedules/README.md` / `src/features/tracking/README.md` + `.cursor/rules/agenct.md` |
| **Rich text editor / email components** | `libs/shared/ui/src/components/ui/rich-text-editor/README.md` + `.cursor/rules/agenct.md` |
| **Env / test URLs / deploy context** | `HANDOVER.md` |
| **Workspace setup / scripts / monorepo** | Root `README.md` |
| **Release / version / changelog** | `apps/ecom-portal/RELEASE.md` |

---

## 3. Minimal Sets (Copy for Chat)

### Small UI bug in one feature
```text
@.cursor/rules/agenct.md
+ describe: feature folder + what broke
```

### New screen in existing feature (e.g. Schedules, Tracking, User Creation)
```text
@.cursor/rules/agenct.md
@apps/ecom-portal/ECOM-PORTAL-FEATURE-BLUEPRINT.md
@apps/ecom-portal/README.md
```

### New API endpoint + React Query / MSW Mock
```text
@.cursor/rules/agenct.md
@apps/ecom-portal/feature-api-guide.md
```

### New feature folder from scratch
```text
@.cursor/rules/agenct.md
@apps/ecom-portal/ECOM-PORTAL-FEATURE-BLUEPRINT.md
@apps/ecom-portal/feature-api-guide.md
@apps/ecom-portal/README.md
```

### DataView / AG Grid list
```text
@.cursor/rules/agenct.md
@libs/shared/ui/src/components/data-view/README.md
```

---

## 4. Usually Do Not Attach

| Skip | Reason |
| :--- | :--- |
| `node_modules/**/*.md` | External third-party library docs. |
| `CHANGELOG.md` | Only needed for release review. |
| Local scratch / temp notes | Internal agent scratchpads, not project specification. |
| Every feature’s docs/ | Only attach the specific feature folder you are actively editing. |

---

## 5. Best Practice in Chat

1. `@` the folder or files you edited (e.g. `@apps/ecom-portal/src/features/tracking/`) — better than only MD files.
2. `@` **1–3 MD files** from the tables above — not the whole repository.
3. Clearly state your intent: *fix bug / add field / new list / migrate table to AG-Grid / release / etc.*

**Example message:**
> *I changed the tracking container table to AG Grid. Please review.*  
> `@.cursor/rules/agenct.md`  
> `@libs/shared/ui/src/components/data-view/README.md`  
> `@apps/ecom-portal/src/features/tracking/components/TrackingContainersTable.tsx`

---

## 6. The One-Line Rule

| If the change is… | Start with… then add |
| :--- | :--- |
| **Any code change** | Always start with `.cursor/rules/agenct.md` |
| **Structure / new feature** | Add `ECOM-PORTAL-FEATURE-BLUEPRINT.md` |
| **API / mock** | Add `feature-api-guide.md` |
| **Lists / grids** | Add the `data-view/README.md` |
| **Release** | Add `RELEASE.md` |
| **Env / test server** | Add `HANDOVER.md` |

> **WHEN UNSURE:** The root `README.md` already has this map in its **“Documentation map”** table. Use that as your checklist whenever you’re not sure which doc applies.
