import { KvRouteStatus } from '@/components/shared/KvRouteStatus';
import { PublicRouteStatusActions } from '@/components/shared/route-status/PublicRouteStatusActions';

/** Shared 404 copy for public surfaces (root + marketing). */
export function PublicNotFoundStatus() {
  return (
    <KvRouteStatus
      kind="notFound"
      title="صفحه مورد نظر یافت نشد"
      description="نشانی واردشده در سامانه تعریف نشده یا منتقل گردیده است."
      hint="می‌توانید به صفحه فرود بازگردید."
      actions={<PublicRouteStatusActions />}
    />
  );
}
