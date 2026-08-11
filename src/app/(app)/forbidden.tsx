import { KvRouteStatus } from '@/components/shared/KvRouteStatus';
import { AppRouteStatusActions } from '@/components/shared/route-status/AppRouteStatusActions';

/** In-shell 403 when `forbidden()` is called under `/(app)`. */
export default function AppForbidden() {
  return (
    <KvRouteStatus
      kind="forbidden"
      layout="inset"
      title="عدم دسترسی"
      description="مجوز لازم برای مشاهده این بخش برای حساب کاربری شما تعریف نشده است."
      hint="در صورت نیاز به دسترسی، با مدیر سامانه هماهنگ نمایید."
      actions={<AppRouteStatusActions />}
    />
  );
}
