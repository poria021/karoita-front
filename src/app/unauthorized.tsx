import Link from 'next/link';

import { KvButton } from '@/components/shared/KvButton';
import { KvRouteStatus } from '@/components/shared/KvRouteStatus';
import { RouteService } from '@/services/route.service';

export default function RootUnauthorized() {
  return (
    <KvRouteStatus
      kind="unauthorized"
      title="احراز هویت لازم است"
      description="برای ادامه، ورود به حساب کاربری الزامی است."
      hint="پس از ورود، به مسیر درخواستی هدایت می‌شوید."
      actions={
        <>
          <KvButton asChild color="cta">
            <Link href={RouteService.auth.login()} prefetch={false}>
              ورود به سامانه
            </Link>
          </KvButton>
          <KvButton asChild appearance="secondary">
            <Link href={RouteService.marketing.home()} prefetch={false}>
              صفحه فرود
            </Link>
          </KvButton>
        </>
      }
    />
  );
}
