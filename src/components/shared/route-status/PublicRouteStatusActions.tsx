'use client';

import Link from 'next/link';

import { KvButton } from '@/components/shared/KvButton';
import { RouteService } from '@/services/route.service';

type PublicRouteStatusActionsProps = {
  /** When set, renders «تلاش مجدد» before صفحه فرود (error boundaries). */
  onReset?: () => void;
};

/**
 * Public-surface status CTAs: retry (errors) + صفحه فرود.
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
      <KvButton asChild appearance={onReset ? 'secondary' : 'solid'} color="cta">
        <Link href={RouteService.marketing.home()} prefetch={false}>
          بازگشت به صفحه فرود
        </Link>
      </KvButton>
    </>
  );
}
