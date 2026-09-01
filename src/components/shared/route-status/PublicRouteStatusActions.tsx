'use client';

import Link from 'next/link';

import { KvButton } from '@/components/shared/KvButton';
import { RouteService } from '@/services/route.service';

type PublicRouteStatusActionsProps = {
  /** اگر باشد «تلاش مجدد» قبل از صفحهٔ فرود می‌آید (error boundary). */
  onReset?: () => void;
};

export function PublicRouteStatusActions({
  onReset,
}: PublicRouteStatusActionsProps) {
  return (
    <>
      {onReset ? (
        <KvButton type="button" color="cta" onClick={onReset}>
          تلاش مجدد
        </KvButton>
      ) : null}
      <KvButton asChild appearance={onReset ? 'secondary' : 'solid'} color="cta">
        <Link href={RouteService.marketing.home()} prefetch={false}>
          بازگشت به صفحه فرود
        </Link>
      </KvButton>
    </>
  );
}
