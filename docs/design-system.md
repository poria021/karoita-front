# Karvita Design System — consumption guide

Short engineering contract for product UI. Not a brand redesign brief.

## Layer law (do not collapse)

```
features / app  →  shared (product composition) + ui atoms (plain primitives)
                      ↓
                 components/ui (themed Shadcn)
```

| Layer | Path | Who imports |
|-------|------|-------------|
| Product composition | `src/components/shared/` (shell, fields, KvTable, EmptyState, ConfirmationDialog, product skeletons, …) | `src/features/**`, `src/app/**` |
| Plain atoms | `src/components/ui/` (Button, Badge, Spinner, Checkbox, Tooltip, Toaster, …) | `shared` **and** features/app when no product API is needed |
| Domain UI | `src/features/[domain]/` | Compose shared + ui atoms + domain fields/hooks |

**Allowed in `features` and `app`:** plain `@/components/ui/*` atoms.  
**Forbidden bypass:** `@/components/ui/table` and `@/components/ui/skeleton` — use `shared/table` (KvTable stack) and `shared/skeleton` instead. ESLint + `pnpm lint:ds` enforce those two.  
**Do not** create new pass-through `KvX` files that only re-export `ui/X`. Prefer brand classes on `ui/*` itself.

If a **product** pattern is missing (dialog shell, field chrome, admin table behavior), **extend shared** — do not fork a one-off modal/table/tabs in the feature.

## Prefer these primitives

- **Actions:** `KvButton` while it owns loading/icon API (or `ui/button` once that API lives there)
- **Fields:** `KvTextField`, `KvPasswordField`, `KvMobileNumberField`, `KvSelect` / `KvSelectField`, `KvForm` + `ui/checkbox` when needed
- **Surfaces:** `KvCard`, `KvDialog`, `KvConfirmationDialog`, `KvTable`, `AppTabs`
- **Feedback:** `KvAlert`, `KvEmptyState`, `ui/spinner`, `ui/sonner` (`Toaster`)
- **Type:** `KvTypography` variants (`title`, `subtitle`, `body`, `caption`, …)
- **Icons:** `FaIcon` + `faIcons` / `iconMap` — size via `size` prop, color via `text-kv-*`

## KvButton sizes

| `size` | Role | Typical height |
|--------|------|----------------|
| `sm` | Compact text control | 36px (`h-9`) |
| `md` | Default (touch-friendly) | 44px (`h-11`) |
| `lg` | Emphasized CTA | 48px (`h-12`) |
| `icon-sm` | Dense icon-only | 36px square |
| `icon` | Default icon-only | 44px square |
| `icon-lg` | Large icon-only | 48px square |

**Icon-only density:** pass `size="sm"|"md"|"lg"` with an `icon` and no children — `resolveKvButtonSize` maps to `icon-sm` / `icon` / `icon-lg`. Explicit `icon-*` sizes pass through unchanged.

Primary product CTA: `color="cta"` + `appearance="solid"` (brand solid — do not invent a second primary hue).

## What not to write in a feature

- Hand-rolled `fixed inset-0` modals / overlays
- Parallel tab tracks that copy `AppTabs` styles
- Raw `<button>` / `<input>` / `<select>` for product controls
- Hardcoded `#hex` / `rgb()` / `hsl()` in JSX (use `kv-*` tokens)
- Physical spacing (`ml`/`mr`/`left`/`right`) — use logical `ms`/`me`/`ps`/`pe`/`start`/`end`
- Direct `ui/skeleton` or `ui/table` (use shared product stacks)
- Persian digits in form state / API payloads (display-only via `toPersianDigits`; store English)

## When shared is incomplete

1. Add or extend a product `Kv*` / `App*` in `src/components/shared/` with a backward-compatible API.
2. Put atom look/tokens on `ui/*`; keep multi-part product API in shared.
3. Do not add shared files that only re-export ui.

## For the next developer

- **Atoms** = themed shadcn in `src/components/ui/*` — features may import them directly.
- **Shared** = product composition only (shell, domain fields, admin table behavior, empty/confirm, cold skeletons).
- Colors use semantic `kv-*` tokens. Missing product patterns → extend shared; do not ship one-off chrome in a feature.

## Related

- Color tokens: `.cursor/rules/70-color-hsl-tokens.mdc`
- Shared reuse: `.cursor/rules/75-shared-ds-reuse.mdc`
- Brand volume: `.cursor/rules/90-brand-visual-system.mdc`
- UX density: `.cursor/rules/80-product-design-ux.mdc`
