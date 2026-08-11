import { KvRouteStatus } from '@/components/shared/KvRouteStatus';
import { PublicRouteStatusActions } from '@/components/shared/route-status/PublicRouteStatusActions';

export default function MarketingForbidden() {
  return (
    <KvRouteStatus
      kind="forbidden"
      title="عدم دسترسی"
      description="مجوز مشاهده این بخش برای شما تعریف نشده است."
      actions={<PublicRouteStatusActions />}
    />
  );
}
