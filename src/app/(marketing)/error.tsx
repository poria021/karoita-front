'use client';

import { useEffect } from 'react';
import Link from 'next/link';

import { KvButton } from '@/components/shared/KvButton';
import { KvRouteStatus } from '@/components/shared/KvRouteStatus';
import { KvRouteStatusNearestLink } from '@/components/shared/route-status/KvRouteStatusNearestLink';
import { RouteService } from '@/services/route.service';

interface MarketingErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function MarketingError({ error, reset }: MarketingErrorProps) {
  useEffect(() => {
    console.error('Marketing route error:', error);
  }, [error]);

  return (
    <KvRouteStatus
      kind="error"
      title="خطا در بارگذاری صفحه"
      description="بارگذاری این صفحه با اختلال مواجه شده است."
      hint="لطفاً مجدداً تلاش کنید یا به بخش مرتبط بازگردید."
      actions={
        <>
          <KvButton type="button" color="cta" onClick={reset}>
            تلاش مجدد
          </KvButton>
          <KvRouteStatusNearestLink appearance="secondary" />
          <KvButton asChild color="neutral" appearance="text">
            <Link href={RouteService.auth.login()} prefetch={false}>
              ورود
            </Link>
          </KvButton>
        </>
      }
    />
  );
}
