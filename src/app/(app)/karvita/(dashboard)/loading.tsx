import { DashboardAccessPlaceholder } from '@/components/shared/shell/DashboardAccessPlaceholder';

/**
 * Gap between SPA navigations while the next module chunk mounts.
 * Plain canvas only — never fake tabs/toolbar bones (rules 80/84).
 */
export default function KarvitaDashboardLoading() {
  return <DashboardAccessPlaceholder />;
}
