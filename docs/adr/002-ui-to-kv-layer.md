# ADR-002: ui atoms + shared product composition

## Status
Accepted (amended)

## Context
Shadcn lives in `src/components/ui/`. Pure pass-through `KvX` wrappers added indirection without product value. Features still must not fork admin table, field chrome, shell, or cold skeletons.

## Decision
Layer law:

```
features / app  →  shared (product) + ui (plain atoms)
```

1. `src/features/**` and `src/app/**` MAY import plain `@/components/ui/*` atoms (Button, Badge, Spinner, Checkbox, Tooltip, Toaster, …).
2. They MUST use `src/components/shared/` for product composition: shell, `*Field` / FieldFrame, KvTable stack, EmptyState, ConfirmationDialog, product skeletons.
3. Forbidden bypass: `@/components/ui/table`, `@/components/ui/skeleton` from features/app.
4. Do not create new pass-through `KvX` re-exports; put brand classes on `ui/*` when thinning wrappers.
5. Missing **product** patterns: extend shared — do not hand-roll overlays/tables/tabs in a feature.
6. Enforcement: ESLint `no-restricted-imports` (table + skeleton) + `pnpm lint:ds` (`scripts/check-no-ui-imports.mjs`).

## Consequences
- Less indirection for atoms; product stacks stay single-sourced in shared.
- Shadcn upgrades for atoms are direct; table/skeleton still go through shared APIs.

## See also
- `docs/design-system.md`
- `.cursor/rules/75-shared-ds-reuse.mdc`
- `.cursor/rules/95-senior-frontend-bar.mdc`
