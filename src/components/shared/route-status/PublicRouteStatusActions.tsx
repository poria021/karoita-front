'use client';

import Link from 'next/link';

import { KvButton } from '@/components/shared/KvButton';
import { KvRouteStatusNearestLink } from '@/components/shared/route-status/KvRouteStatusNearestLink';
import { RouteService } from '@/services/route.service';

type PublicRouteStatusActionsProps = {
  /** When set, renders «تلاش مجدد» before nearest/landing (error boundaries). */
  onReset?: () => void;
};

/**
 * Public surface status CTAs: nearest (primary) + صفحه فرود (secondary).
 */
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
      <KvRouteStatusNearestLink />
      <KvButton asChild appearance="secondary">
        <Link href={RouteService.marketing.home()} prefetch={false}>
          صفحه فرود
        </Link>
      </KvButton>
    </>
  );
}
