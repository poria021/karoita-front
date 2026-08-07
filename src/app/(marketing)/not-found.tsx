import Link from 'next/link';

import { KvButton } from '@/components/shared/KvButton';
import { KvRouteStatus } from '@/components/shared/KvRouteStatus';
import { RouteService } from '@/services/route.service';

export default function MarketingNotFound() {
  return (
    <KvRouteStatus
      kind="notFound"
      title="صفحه مورد نظر یافت نشد"
      description="نشانی واردشده تعریف نشده یا منتقل گردیده است."
      hint="می‌توانید به صفحه اصلی بازگردید یا وارد سامانه شوید."
      actions={
        <>
          <KvButton asChild color="cta">
            <Link href={RouteService.marketing.home()} prefetch={false}>
              صفحه اصلی
            </Link>
          </KvButton>
          <KvButton asChild appearance="secondary">
            <Link href={RouteService.auth.login()} prefetch={false}>
              ورود
            </Link>
          </KvButton>
        </>
      }
    />
  );
}
