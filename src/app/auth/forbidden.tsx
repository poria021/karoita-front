import Link from 'next/link';

import { KvButton } from '@/components/shared/KvButton';
import { KvRouteStatus } from '@/components/shared/KvRouteStatus';
import { KvRouteStatusNearestLink } from '@/components/shared/route-status/KvRouteStatusNearestLink';
import { RouteService } from '@/services/route.service';

export default function AuthForbidden() {
  return (
    <KvRouteStatus
      kind="forbidden"
      title="عدم دسترسی"
      description="این مسیر احراز هویت برای نقش کاربری شما در دسترس نیست."
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
