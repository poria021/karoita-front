import Link from 'next/link';

import { KvButton } from '@/components/shared/KvButton';
import { KvRouteStatus } from '@/components/shared/KvRouteStatus';
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
          <KvButton asChild color="neutral" appearance="text">
            <Link href={RouteService.marketing.home()} prefetch={false}>
              صفحه اصلی
            </Link>
          </KvButton>
        </>
      }
    />
  );
}
