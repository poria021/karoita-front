import Link from 'next/link';

import { KvButton } from '@/components/shared/KvButton';
import { KvRouteStatus } from '@/components/shared/KvRouteStatus';
import { RouteService } from '@/services/route.service';

export default function RootNotFound() {
  return (
    <KvRouteStatus
      kind="notFound"
      title="صفحه مورد نظر یافت نشد"
      description="نشانی واردشده در سامانه تعریف نشده یا منتقل گردیده است."
      hint="لطفاً نشانی را بررسی نمایید یا از صفحه اصلی ادامه دهید."
      actions={
        <>
          <KvButton asChild color="cta">
            <Link href={RouteService.marketing.home()} prefetch={false}>
              صفحه اصلی
            </Link>
          </KvButton>
          <KvButton asChild appearance="secondary">
            <Link href={RouteService.auth.login()} prefetch={false}>
              ورود به سامانه
            </Link>
          </KvButton>
        </>
      }
    />
  );
}
