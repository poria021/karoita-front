# Architecture folders (target tree)

Karvita frontend folder maturity — keep new work aligned with this layout.

## App (thin routes only)

```
src/app/
  (marketing)/          # public landing + CMS pages
  (app)/[domain]/       # domain dashboards — page.tsx delegates to features
  auth/                 # login, admin-gate, OTP shells
```

- `page.tsx` = routing, metadata, light guards, feature delegate.
- No tables, forms, Facade calls, or domain state inside `app/**`.

## Features (FSD by domain)

```
src/features/
  karvita/[module]/     # dashboard modules
  shared/               # cross-domain: auth, profile, marketing
```

Per module (when needed):

```
components/  hooks/  schemas/  lib/
```

- Zod form schemas live under `schemas/` when forms exist — do not invent empty `schemas/` folders.
- No `features/[A] → features/[B]` imports.
- Stub domains are **forbidden** — see `docs/planned-domains.md`.

## Services (Facade + domain folder)

```
src/services/
  {domain}.service.ts     # public Facade (stable import path)
  {domain}/               # mock/real helpers for that domain only
  mock/                   # ONLY true cross-domain mock helpers (e.g. mock-authz)
  route.service.ts
  planned-routes.ts
  api-client.ts
```

Examples:

- `auth.service.ts` + `auth/` (`auth-mock-users`, `mock-auth.store`, …)
- `org-structure.service.ts` + `org-structure/` (`org-structure-seed`, stores, …)
- `onboarding-approvals.service.ts` + `onboarding-approvals/`
- `admin-user-creation.service.ts` + `admin-user-creation/`
- `organization-options.service.ts` + `organization-options/`

## Shared UI

```
src/components/
  ui/                     # flat shadcn atoms (Button, Badge, Spinner, …)
  shared/
    shell/                # Header, Sidebar, guards, providers
    fields/               # *Field, FieldFrame, filters
    table/                # KvTable stack, KvBusySurface / KvTableBusy
    KvButton, AppTabs, …  # product composition at shared root
```

### Skeleton ban

- **Deleted / forbidden:** `src/components/shared/skeleton/**`, `src/components/ui/skeleton`
- Product loading = chrome-first + spinner / `aria-busy` on data regions only
- ESLint restricts `@/components/ui/skeleton` and `@/components/shared/skeleton`

## Types

```
src/types/*.ts            # flat shared DTOs — no nested domain trees
```

## Utils

```
src/utils/
  RoleStrategyMap.ts      # thin re-export (compat)
  role-strategy/          # types, strategies, helpers
  …
```

## Docs index

| Doc | Purpose |
|-----|---------|
| `README.md` | Clone, scripts, env |
| `CONTRIBUTING.md` | Day-one reading order and PR checks |
| `docs/data-flow.md` | Facade, `apiClient` (ky), TanStack Query, Nest wiring status |
| `docs/decisions.md` | Why this architecture |
| `docs/contributing.md` | Feature checklist, forbidden imports, tests, UI |
| `docs/architecture-folders.md` | This file — target tree |
| `docs/planned-domains.md` | Future domains (ad-engine, reporting, forms-wizard) |
