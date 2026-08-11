import { KvRouteStatus } from '@/components/shared/KvRouteStatus';
import { PublicRouteStatusActions } from '@/components/shared/route-status/PublicRouteStatusActions';

export default function RootForbidden() {
  return (
    <KvRouteStatus
      kind="forbidden"
      title="عدم دسترسی"
      description="مجوز لازم برای مشاهده این بخش برای حساب کاربری شما تعریف نشده است."
      hint="در صورت نیاز به دسترسی، با مدیر سامانه هماهنگ نمایید."
      actions={<PublicRouteStatusActions />}
    />
  );
}
