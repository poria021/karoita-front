import Link from 'next/link';

import { KvButton } from '@/components/shared/KvButton';
import { KvRouteStatus } from '@/components/shared/KvRouteStatus';
import { KvRouteStatusNearestLink } from '@/components/shared/route-status/KvRouteStatusNearestLink';
import { RouteService } from '@/services/route.service';

export default function AuthNotFound() {
  return (
    <KvRouteStatus
      kind="notFound"
      title="صفحه مورد نظر یافت نشد"
      description="این مسیر احراز هویت در سامانه تعریف نشده است."
      hint="برای ادامه از صفحه ورود استفاده نمایید."
      actions={
        <>
          <KvButton asChild color="cta">
            <Link href={RouteService.auth.login()} prefetch={false}>
              صفحه ورود
            </Link>
          </KvButton>
          <KvRouteStatusNearestLink color="neutral" appearance="text" />
        </>
      }
    />
  );
}
