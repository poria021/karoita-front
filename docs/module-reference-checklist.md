# Reference module checklist

One-page guide for adding or reviewing a Karvita feature. Keep layers separate.

## Layout

| Concern | Where |
|---------|--------|
| Routes (App Router) | `src/app/(app)/[domain]/(dashboard)/…` |
| Domain UI + hooks + schemas | `src/features/[domain]/…` |
| Cross-domain UI (auth, profile) | `src/features/shared/…` |
| HTTP / mock / Nest | `src/services/[name].service.ts` (Facade) |
| Shared chrome | `src/components/shared/` (shell, fields, KvTable, EmptyState, …) |
| Shadcn atoms | `src/components/ui/` — features may import plain atoms; not `ui/table` / `ui/skeleton` |
| Types / DTOs | `src/types/` |
| Role menus / permissions | `RoleStrategyMap` |
| Paths | `RouteService` only — no hardcoded `/karvita/…` |

## Checklist

- [ ] **Route:** page under correct domain group; navigation via `RouteService`
- [ ] **Facade:** all reads/writes through `*Service` — no `fetch` in the feature
- [ ] **Mock/real:** same return types; real paths throw `REAL_MODE_NOT_IMPLEMENTED` or call Nest — never accept mock OTP/secrets
- [ ] **Authz:** UI may hide actions; sensitive Facade methods re-check permission in mock (`mock-authz`) and will call Nest in real — do not trust Zustand role alone
- [ ] **UI:** shared for product composition; plain `@/components/ui/*` atoms OK; no `ui/table` / `ui/skeleton` (see `docs/design-system.md`)
- [ ] **Forms:** RHF + Zod; numeric fields normalize with `persianToEnglishDigits` before validate/submit
- [ ] **Roles:** menus/widths/permissions from `RoleStrategyMap` — no `if (role === …)` for chrome
- [ ] **RTL / a11y:** logical spacing; labels; `FaIcon` sizes via prop
- [ ] **File size:** split TSX past ~250–300 lines; wizard steps as separate components
- [ ] **No cross-domain imports:** talk through services/store only

## Minimal shape (example)

```
src/app/(app)/karvita/(dashboard)/widgets/page.tsx   → thin RSC / client shell
src/features/karvita/widgets/
  components/WidgetsPage.tsx
  hooks/useWidgets.ts
  schemas/widget.schema.ts
src/services/widgets.service.ts                      → Facade (mock | real)
```

## Verify

```bash
pnpm lint:ds
pnpm test
npx tsc --noEmit
```

## Related ADRs

- [001 Facade + mock/real](./adr/001-facade-mock-real.md)
- [002 ui → Kv](./adr/002-ui-to-kv-layer.md)
- [003 RoleStrategy](./adr/003-role-strategy-map.md)
- [004 Client ≠ authz](./adr/004-auth-client-not-authorization.md)
