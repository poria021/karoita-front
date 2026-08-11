import Link from 'next/link';

import { KvButton } from '@/components/shared/KvButton';
import { KvRouteStatus } from '@/components/shared/KvRouteStatus';
import { KvRouteStatusNearestLink } from '@/components/shared/route-status/KvRouteStatusNearestLink';
import { RouteService } from '@/services/route.service';

export default function RootNotFound() {
  return (
    <KvRouteStatus
      kind="notFound"
      title="صفحه مورد نظر یافت نشد"
      description="نشانی واردشده در سامانه تعریف نشده یا منتقل گردیده است."
      hint="می‌توانید به صفحه فرود بازگردید یا وارد سامانه شوید."
      actions={
        <>
          <KvButton asChild color="cta">
            <Link href={RouteService.marketing.home()} prefetch={false}>
              صفحه فرود
            </Link>
          </KvButton>
          <KvButton asChild appearance="secondary">
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
