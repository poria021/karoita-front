import Link from 'next/link';

import { KvButton } from '@/components/shared/KvButton';
import { KvRouteStatus } from '@/components/shared/KvRouteStatus';
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
