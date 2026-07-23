# ADR-007: Admin lists vs typeahead data-fetch

## Status
Accepted (revised — TanStack Query)

## Context
Admin tables need offset/limit infinite scroll with debounce + race guards. Profile organization selects need dependent typeahead pages with cache. Forking either pattern per feature caused duplicated paging and divergent error/loading UX. A custom `useEffect` list machine plus an SWR exception split the mental model; the team standardized on TanStack Query for server-state lists.

## Decision
1. **Server-state client:** `@tanstack/react-query` via root `QueryClientProvider` (`src/components/shared/shell/Providers.tsx` + `src/lib/query-client.ts`).
2. **Admin tables (org-structure, onboarding approvals, …):**
   - Facade returns `OffsetLimitPage<T>`.
   - UI uses `useOffsetLimitInfiniteList` (`src/hooks/useOffsetLimitInfiniteList.ts`) built on `useInfiniteQuery`.
   - Debounce search once in the page hook — not inside the list primitive.
   - Dashboard cold / ready / refreshing UX (rule 83) stays mapped in that hook; chrome (tab/query) may still use `useDashboardModuleCache`.
3. **Dependent typeahead (org option selects):**
   - `useOrganizationOptions` uses `useInfiniteQuery` + `OrganizationOptionsService`.
   - Do **not** introduce a second list library (SWR / parallel infinite machines).
4. **New list surfaces:** default to `useOffsetLimitInfiniteList` unless the UX is dependent typeahead with cache keyed by parent fields (then `useOrganizationOptions` or the same Query patterns).

## Consequences
- One infinite-scroll contract for admin tables; one QueryClient for SPA revisit cache of list pages.
- SWR is not used for Karvita lists/typeahead.
- Real mode must remain server-paged — UI never full-scans Nest data.

## See also
- `.cursor/rules/40-service-layer-facade.mdc` (LIST / QUERY DATA-PATH)
- `.cursor/rules/83-dashboard-spa-loading.mdc`
- `src/hooks/useOffsetLimitInfiniteList.ts`
- `src/hooks/useOrganizationOptions.ts`
- `src/services/organization-options.service.ts`
