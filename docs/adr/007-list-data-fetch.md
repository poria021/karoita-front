# ADR-007: Admin lists vs typeahead data-fetch

## Status
Accepted

## Context
Admin tables need offset/limit infinite scroll with debounce + race guards. Profile organization selects need dependent typeahead pages with SWR cache. Forking either pattern per feature caused duplicated paging and divergent error/loading UX.

## Decision
1. **Admin tables (org-structure, onboarding approvals, …):**
   - Facade returns `OffsetLimitPage<T>`.
   - UI uses `useOffsetLimitInfiniteList` (`src/hooks/useOffsetLimitInfiniteList.ts`).
   - Debounce search once in the page hook — not inside the list primitive.
2. **Dependent typeahead (org option selects only):**
   - May use `useSWRInfinite` + a dedicated options Facade/service.
   - Documented exception in rule 40 — do **not** use SWR as a second admin-table stack.
3. **New list surfaces:** default to `useOffsetLimitInfiniteList` unless the UX is dependent typeahead with cache keyed by parent fields.

## Consequences
- One infinite-scroll state machine for admin tables.
- SWR stays scoped to organization option selects (`OrganizationOptionsService` in `src/services/` + `useOrganizationOptions`).
- Real mode must remain server-paged — UI never full-scans Nest data.

## See also
- `.cursor/rules/40-service-layer-facade.mdc` (LIST / QUERY DATA-PATH)
- `src/hooks/useOffsetLimitInfiniteList.ts`
- `src/services/organization-options.service.ts`
- `src/features/shared/profile/hooks/useOrganizationOptions.ts`
