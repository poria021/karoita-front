import Link from 'next/link';

import { KvButton } from '@/components/shared/KvButton';
import { KvRouteStatus } from '@/components/shared/KvRouteStatus';
import { KvRouteStatusNearestLink } from '@/components/shared/route-status/KvRouteStatusNearestLink';
import { RouteService } from '@/services/route.service';

export default function RootForbidden() {
  return (
    <KvRouteStatus
      kind="forbidden"
      title="عدم دسترسی"
      description="مجوز لازم برای مشاهده این بخش برای حساب کاربری شما تعریف نشده است."
      hint="در صورت نیاز به دسترسی، با مدیر سامانه هماهنگ نمایید."
      actions={
        <>
          <KvRouteStatusNearestLink />
          <KvButton asChild appearance="secondary">
            <Link href={RouteService.karvita.entry()} prefetch={false}>
              بازگشت به میز کار
            </Link>
          </KvButton>
        </>
      }
    />
  );
}
