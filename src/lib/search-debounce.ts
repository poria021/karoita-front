/**
 * Shared search debounce for admin lists / typeahead.
 * Debounce once in the page/hook layer — never inside KvSearchField.
 */
export const SEARCH_DEBOUNCE_MS = 300;

/**
 * Empty/clear search hits the list immediately; non-empty waits for debounce.
 */
export function resolveListSearchQuery(
  rawQuery: string,
  debouncedQuery: string
): string {
  return rawQuery.trim() === '' ? '' : debouncedQuery;
}
