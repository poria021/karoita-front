'use client';

import * as React from 'react';

import { KvSpinner } from '@/components/shared/KvSpinner';
import { KvTypography } from '@/components/shared/KvTypography';
import { KV_TABLE_VIEWPORT_HEIGHT } from '@/components/shared/table/kvTableViewportHeight';
import { cn } from '@/lib/utils';

export type KvTableViewportProps = {
  children: React.ReactNode;
  className?: string;
  /**
   * Fixed viewport height (Tailwind). Default fills a typical admin panel
   * without growing the page indefinitely.
   */
  heightClassName?: string;
  /** Called when the end sentinel enters the scroll viewport. */
  onEndReached?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  /** First-page / container busy state. */
  isBusy?: boolean;
  /** Quiet end-of-list copy when `hasMore` is false and there is content. */
  endMessage?: string;
  /** Show end message only when true (caller usually passes items.length > 0). */
  showEndMessage?: boolean;
  /** Copy while the next page is in flight. */
  loadingMoreLabel?: string;
};

const DEFAULT_HEIGHT = KV_TABLE_VIEWPORT_HEIGHT;

/**
 * Fixed-height scroll host for admin tables.
 * Scrollbar is forced to the physical right (ltr scroller + rtl content)
 * so RTL pages still match Iranian admin chrome expectations.
 * Place {@link KvTable} with `scrollable={false}` inside so thead sticky works.
 */
export function KvTableViewport({
  children,
  className,
  heightClassName = DEFAULT_HEIGHT,
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
  }, [onEndReached, hasMore, isLoadingMore, isBusy]);

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
      {/* Inner RTL restores Persian layout while outer ltr keeps scrollbar on the right. */}
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
            <KvSpinner className="size-5 text-kv-brand" />
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
