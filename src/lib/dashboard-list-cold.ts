/**
 * Page-level cold skeleton gate for dashboard infinite lists (rule 83).
 *
 * Cold only before the module mount has ever painted ready data.
 * Tab / search / filter resetKey changes must stay local-busy (!isCold)
 * even when the next key has no cache and items are temporarily empty.
 */
export type DashboardListColdInput = {
  isLoading: boolean;
  itemCount: number;
  hasError: boolean;
  cacheHit: boolean;
  hasEverReady: boolean;
};

export function computeDashboardListIsCold({
  isLoading,
  itemCount,
  hasError,
  cacheHit,
  hasEverReady,
}: DashboardListColdInput): boolean {
  return (
    isLoading &&
    itemCount === 0 &&
    !hasError &&
    !cacheHit &&
    !hasEverReady
  );
}
