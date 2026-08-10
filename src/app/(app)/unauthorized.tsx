import Link from 'next/link';

import { KvButton } from '@/components/shared/KvButton';
import { KvRouteStatus } from '@/components/shared/KvRouteStatus';
import { KvRouteStatusNearestLink } from '@/components/shared/route-status/KvRouteStatusNearestLink';
import { RouteService } from '@/services/route.service';

/** In-shell 401 when `unauthorized()` is called under `/(app)`. */
export default function AppUnauthorized() {
  return (
    <KvRouteStatus
      kind="unauthorized"
      layout="inset"
      title="احراز هویت لازم است"
      description="نشست کاربری معتبر نیست یا منقضی شده است. لطفاً مجدداً وارد شوید."
      hint="پس از ورود، به مسیر درخواستی هدایت می‌شوید."
      actions={
        <>
          <KvButton asChild color="cta">
            <Link href={RouteService.auth.login()} prefetch={false}>
              ورود به سامانه
            </Link>
          </KvButton>
          <KvRouteStatusNearestLink color="neutral" appearance="text" />
        </>
      }
    />
  );
}
