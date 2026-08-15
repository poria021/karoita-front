/**
 * TanStack Query staleTime defaults (ms).
 * Lists stay fresher; module snapshots / CMS tolerate longer reuse for SPA revisit.
 */
export const QUERY_STALE_MS = {
  /** Admin offset/limit lists + org typeahead */
  list: 30_000,
  /** Module snapshot panels (capacities, syllabus, enrollment) */
  module: 60_000,
  /** Landing CMS admin bundle (rarely changes mid-session) */
  cms: 60_000,
} as const;
