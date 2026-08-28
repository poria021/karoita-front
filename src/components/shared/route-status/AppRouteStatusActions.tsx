'use client';

import Link from 'next/link';

import { KvButton } from '@/components/shared/KvButton';
import { RouteService } from '@/services/route.service';

type AppRouteStatusActionsProps = {
  /** When set, renders «تلاش مجدد» before میز کار (error boundaries). */
  onReset?: () => void;
};

/**
 * Dashboard status CTAs: retry (errors) + میز کار.
 */
export function AppRouteStatusActions({ onReset }: AppRouteStatusActionsProps) {
  return (
    <>
      {onReset ? (
        <KvButton type="button" color="cta" onClick={onReset}>
          تلاش مجدد
        </KvButton>
      ) : null}
      <KvButton asChild appearance={onReset ? 'secondary' : 'solid'} color="cta">
        <Link href={RouteService.karvita.entry()} prefetch={false}>
          رفتن به میز کار
        </Link>
      </KvButton>
    </>
  );
}
