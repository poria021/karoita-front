'use client';

import * as React from 'react';

import { KvTypography } from '@/components/shared/KvTypography';
import { Spinner } from '@/components/ui/spinner';
import { KV_TABLE_VIEWPORT_HEIGHT } from '@/components/shared/table/kvTableViewportHeight';
import { cn } from '@/lib/utils';

export type KvTableViewportProps = {
  children: React.ReactNode;
  className?: string;
  heightClassName?: string;
  resetKey?: string | number;
  onEndReached?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  /**
   * Soft refresh / in-viewport busy. For first-load empty body,
   * callers keep the header and use `KvTableBusy` / rows / `KvTableEmpty`
   * in the body via `getAdminTableBodyPhase`.
   */
  isBusy?: boolean;
  endMessage?: string;
  showEndMessage?: boolean;
  loadingMoreLabel?: string;
};

/**
 * هاست اسکرول با ارتفاع ثابت.
 * اسکرولر بیرونی `ltr` (اسکرولبار راست فیزیکی)؛ محتوا `rtl`.
 */
export function KvTableViewport({
  children,
  className,
  heightClassName = KV_TABLE_VIEWPORT_HEIGHT,
  resetKey,
  onEndReached,
  hasMore = false,
  isLoadingMore = false,
  isBusy = false,
  endMessage = 'همه موارد بارگذاری شد',
  showEndMessage = false,
  loadingMoreLabel = 'در حال بارگذاری ۱۰ مورد بعدی…',
}: KvTableViewportProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const sentinelRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    if (resetKey === undefined) return;
    const root = rootRef.current;
    if (root) root.scrollTop = 0;
  }, [resetKey]);

  React.useEffect(() => {
    if (!onEndReached || !hasMore || isLoadingMore || isBusy) return;
    const root = rootRef.current;
    const sentinel = sentinelRef.current;
    if (!root || !sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onEndReached();
        }
      },
      { root, rootMargin: '96px', threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [onEndReached, hasMore, isLoadingMore, isBusy, resetKey]);

  return (
    <div
      ref={rootRef}
      data-slot="kv-table-viewport"
      dir="ltr"
      className={cn(
        'max-w-full overflow-auto overscroll-contain',
        heightClassName,
        className
      )}
      aria-busy={isBusy || isLoadingMore || undefined}
    >
      <div dir="rtl" className="min-h-full">
        {children}

        <div
          ref={sentinelRef}
          data-slot="kv-table-end-sentinel"
          className="h-px w-full shrink-0"
          aria-hidden="true"
        />

        {isLoadingMore ? (
          <div
            className="sticky bottom-0 z-10 flex items-center justify-center gap-kv-pair border-t border-kv-border bg-kv-surface/95 px-kv-group py-kv-stack backdrop-blur-sm"
            role="status"
            aria-live="polite"
          >
            <Spinner className="size-5 text-kv-brand" />
            <KvTypography variant="caption" tone="muted" weight="bold">
              {loadingMoreLabel}
            </KvTypography>
          </div>
        ) : null}

        {!hasMore && showEndMessage && !isBusy && !isLoadingMore ? (
          <div className="py-kv-group text-center">
            <KvTypography variant="caption" tone="muted" weight="bold">
              {endMessage}
            </KvTypography>
          </div>
        ) : null}
      </div>
    </div>
  );
}
