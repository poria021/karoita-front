# Planned feature domains

These domains are **not** shipped yet. Do **not** add empty `src/features/[domain]/` README stubs.

When a domain is ready to build, add all of the following in the same change:

1. `src/features/[domain]/` — feature slice (components, hooks, schemas as needed)
2. `src/app/(app)/[domain]/` — thin route pages that delegate to the feature
3. `RouteService` (+ `LIVE_STATIC_NAV_PATHS` / sidebar live filter when nav links ship)
4. `FEATURE_DOMAINS` in `eslint.config.mjs` — keep in sync with real feature folders

## Future domains

| Domain | Intent |
|--------|--------|
| `ad-engine` | Publications / ads management (see PlannedRoutes manage-ads) |
| `reporting` | Standard and comparative reports |
| `forms-wizard` | Multi-step form wizard infrastructure |

See also `docs/architecture-folders.md` for the target folder tree.
