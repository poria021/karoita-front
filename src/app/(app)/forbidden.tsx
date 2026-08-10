import Link from 'next/link';

import { KvButton } from '@/components/shared/KvButton';
import { KvRouteStatus } from '@/components/shared/KvRouteStatus';
import { KvRouteStatusNearestLink } from '@/components/shared/route-status/KvRouteStatusNearestLink';
import { RouteService } from '@/services/route.service';

/** In-shell 403 when `forbidden()` is called under `/(app)`. */
export default function AppForbidden() {
  return (
    <KvRouteStatus
      kind="forbidden"
      layout="inset"
      title="عدم دسترسی"
      description="مجوز لازم برای مشاهده این بخش برای حساب کاربری شما تعریف نشده است."
      hint="در صورت نیاز به دسترسی، با مدیر سامانه هماهنگ نمایید."
      actions={
        <>
          <KvRouteStatusNearestLink />
          <KvButton asChild color="neutral" appearance="text">
            <Link href={RouteService.karvita.entry()} prefetch={false}>
              بازگشت به میز کار
            </Link>
          </KvButton>
        </>
      }
    />
  );
}
