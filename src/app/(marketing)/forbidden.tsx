import Link from 'next/link';

import { KvButton } from '@/components/shared/KvButton';
import { KvRouteStatus } from '@/components/shared/KvRouteStatus';
import { RouteService } from '@/services/route.service';

export default function MarketingForbidden() {
  return (
    <KvRouteStatus
      kind="forbidden"
      title="عدم دسترسی"
      description="مجوز مشاهده این بخش برای شما تعریف نشده است."
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
