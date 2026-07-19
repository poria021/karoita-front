# Karvita Design System — consumption guide

Short engineering contract for product UI. Not a brand redesign brief.

## Layer law (do not collapse)

```
features / app  →  Kv* / App* / FaIcon / shell  →  components/ui (Shadcn)
```

| Layer | Path | Who imports |
|-------|------|-------------|
| Product chrome | `src/components/shared/` | `src/features/**`, `src/app/**` |
| Shadcn base | `src/components/ui/` | **Only** `shared` (and other `ui` internals) |
| Domain UI | `src/features/[domain]/` | Compose shared + domain fields/hooks |

**Forbidden in `features` and `app`:** `import … from '@/components/ui/…'`.  
ESLint enforces this (`no-restricted-imports`). If a pattern is missing, **extend shared** — do not fork a one-off modal/table/tabs in the feature.

## Prefer these primitives

- **Actions:** `KvButton` (not raw `Button` / `<button>`)
- **Fields:** `KvTextField`, `KvPasswordField`, `KvMobileNumberField`, `KvSelect` / `KvSelectField`, `KvCheckbox`, `KvForm`
- **Surfaces:** `KvCard`, `KvDialog`, `KvConfirmationDialog`, `KvTable`, `AppTabs`
- **Feedback:** `KvAlert`, `KvEmptyState`, `KvSpinner`, `KvToaster`
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
- Skeleton loaders (current product preference: control spinner / keep previous UI)
- Persian digits in form state / API payloads (display-only via `toPersianDigits`; store English)

## When shared is incomplete

1. Add or extend a `Kv*` / `App*` in `src/components/shared/` with a backward-compatible API.
2. Keep Shadcn details inside `ui` + the shared wrapper.
3. Re-export product API from shared only.

## For the next developer

Product UI imports only from `src/components/shared/` (`Kv*` / `App*` / `FaIcon` / `shell` / `fields` / `table`). `src/components/ui/` is internal to shared wrappers — do not import it from features or app. Colors and chrome use semantic `kv-*` tokens. If a pattern is missing, extend shared with a backward-compatible API; do not ship a one-off modal/table/tabs in a feature.

## Related

- Color tokens: `.cursor/rules/70-color-hsl-tokens.mdc`
- Shared reuse: `.cursor/rules/75-shared-ds-reuse.mdc`
- Brand volume: `.cursor/rules/90-brand-visual-system.mdc`
- UX density: `.cursor/rules/80-product-design-ux.mdc`
