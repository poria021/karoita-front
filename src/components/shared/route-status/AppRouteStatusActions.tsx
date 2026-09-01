'use client';

import Link from 'next/link';

import { KvButton } from '@/components/shared/KvButton';
import { RouteService } from '@/services/route.service';

type AppRouteStatusActionsProps = {
  /** اگر باشد «تلاش مجدد» قبل از میز کار می‌آید (error boundary). */
  onReset?: () => void;
};

export function AppRouteStatusActions({ onReset }: AppRouteStatusActionsProps) {
  return (
    <>
      {onReset ? (
        <KvButton type="button" color="cta" onClick={onReset}>
          تلاش مجدد
        </KvButton>
      ) : null}
      <KvButton asChild appearance={onReset ? 'secondary' : 'solid'} color="cta">
        <Link href={RouteService.karvita.dashboard()} prefetch={false}>
          رفتن به میز کار
        </Link>
      </KvButton>
    </>
  );
}
