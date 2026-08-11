import { KvRouteStatus } from '@/components/shared/KvRouteStatus';
import { AppRouteStatusActions } from '@/components/shared/route-status/AppRouteStatusActions';

/** In-shell 404 for `notFound()` under `/(app)` (keeps Header/Sidebar).
 * Unmatched `/karvita/*` URLs reach this via `karvita/[...notFound]/page.tsx`.
 */
export default function AppNotFound() {
  return (
    <KvRouteStatus
      kind="notFound"
      layout="inset"
      title="صفحه مورد نظر یافت نشد"
      description="این مسیر در سامانه وجود ندارد یا امکان دسترسی به آن فراهم نیست."
      hint="از منو یا میز کار مسیر صحیح را انتخاب نمایید."
      actions={<AppRouteStatusActions />}
    />
  );
}
