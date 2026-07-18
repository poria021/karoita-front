# ADR-002: ui → Kv / App product layer

## Status
Accepted

## Context
Shadcn lives in `src/components/ui/`. If features import it directly, product chrome forks (modals, tables, tabs) and brand tokens drift. Rule 75 requires shared reuse.

## Decision
Layer law (do not collapse):

```
features / app  →  Kv* / App* / FaIcon / shell  →  ui (Shadcn)
```

1. `src/features/**` and `src/app/**` MUST NOT import `@/components/ui/*`.
2. Product API is `src/components/shared/` (`KvButton`, `KvDialog`, `AppTabs`, …).
3. Missing patterns: extend shared with a backward-compatible API — do not hand-roll overlays in a feature.
4. Enforcement: ESLint `no-restricted-imports` + `pnpm lint:ds` (`scripts/check-no-ui-imports.mjs`).

## Consequences
- One visual system; Shadcn upgrades stay behind shared wrappers.
- Features compose domain UI only; generic chrome stays shared.

## See also
- `docs/design-system.md`
- `.cursor/rules/75-shared-ds-reuse.mdc`
