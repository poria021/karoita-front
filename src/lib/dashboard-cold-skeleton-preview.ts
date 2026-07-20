/**
 * Optional artificial delay on dashboard *cold* loads so page skeletons are
 * visible in QA. Does not run on cache hit / SPA revisit / tab-local busy.
 *
 * Ship default: `0`. Raise temporarily for skeleton QA only.
 */
export const DASHBOARD_COLD_SKELETON_DELAY_MS = 3000;

export async function delayDashboardColdSkeletonPreview(
  isColdMiss: boolean
): Promise<void> {
  if (!isColdMiss || DASHBOARD_COLD_SKELETON_DELAY_MS <= 0) return;
  await new Promise((resolve) => {
    setTimeout(resolve, DASHBOARD_COLD_SKELETON_DELAY_MS);
  });
}
