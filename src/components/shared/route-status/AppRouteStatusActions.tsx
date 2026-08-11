'use client';

import Link from 'next/link';

import { KvButton } from '@/components/shared/KvButton';
import { KvRouteStatusNearestLink } from '@/components/shared/route-status/KvRouteStatusNearestLink';
import { RouteService } from '@/services/route.service';

type AppRouteStatusActionsProps = {
  /** When set, renders «تلاش مجدد» before nearest/desk (error boundaries). */
  onReset?: () => void;
};

/**
 * Dashboard shell status CTAs: nearest (primary) + میز کار (secondary).
 */
export function AppRouteStatusActions({ onReset }: AppRouteStatusActionsProps) {
  return (
    <>
      {onReset ? (
        <KvButton type="button" color="cta" onClick={onReset}>
          تلاش مجدد
        </KvButton>
      ) : null}
      <KvRouteStatusNearestLink />
      <KvButton asChild appearance="secondary">
        <Link href={RouteService.karvita.entry()} prefetch={false}>
          بازگشت به میز کار
        </Link>
      </KvButton>
    </>
  );
}
