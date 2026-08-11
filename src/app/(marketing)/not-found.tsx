import { KvRouteStatus } from '@/components/shared/KvRouteStatus';
import { PublicRouteStatusActions } from '@/components/shared/route-status/PublicRouteStatusActions';

export default function MarketingNotFound() {
  return (
    <KvRouteStatus
      kind="notFound"
      title="صفحه مورد نظر یافت نشد"
      description="نشانی واردشده تعریف نشده یا منتقل گردیده است."
      hint="می‌توانید به بخش مرتبط یا صفحه فرود بازگردید."
      actions={<PublicRouteStatusActions />}
    />
  );
}
