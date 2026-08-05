/**
 * Optional artificial delay on the first data-region fetch of a module mount
 * so local table/card busy states are easier to see in QA.
 * Does not run on cache hit / SPA revisit / tab-local soft refresh.
 *
 * Ship default: `0`. Raise temporarily for data-skeleton QA only.
 * Never use this to justify a full-page `*PageSkeleton` (rule 84).
 */
export const DASHBOARD_COLD_SKELETON_DELAY_MS = 0;

export async function delayDashboardColdSkeletonPreview(
  isFirstDataMiss: boolean
): Promise<void> {
  if (!isFirstDataMiss || DASHBOARD_COLD_SKELETON_DELAY_MS <= 0) return;
  await new Promise((resolve) => {
    setTimeout(resolve, DASHBOARD_COLD_SKELETON_DELAY_MS);
  });
}
