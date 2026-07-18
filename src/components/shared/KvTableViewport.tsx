'use client';

import * as React from 'react';

import { KvSpinner } from '@/components/shared/KvSpinner';
import { KvTypography } from '@/components/shared/KvTypography';
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
};

const DEFAULT_HEIGHT = 'h-[min(28rem,55dvh)]';

/**
 * Fixed-height scroll host for admin tables.
 * Place {@link KvTable} with `scrollable={false}` inside so thead sticky works
 * against this vertical scroller. Features must not hand-roll overflow shells.
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
      className={cn(
        'max-w-full overflow-auto overscroll-contain',
        heightClassName,
        className
      )}
      aria-busy={isBusy || isLoadingMore || undefined}
    >
      {children}

      <div
        ref={sentinelRef}
        data-slot="kv-table-end-sentinel"
        className="h-px w-full shrink-0"
        aria-hidden="true"
      />

      {isLoadingMore ? (
        <div
          className="flex items-center justify-center gap-kv-pair py-kv-group"
          role="status"
          aria-live="polite"
        >
          <KvSpinner className="size-4 text-kv-brand" />
          <KvTypography variant="caption" tone="muted" weight="bold">
            در حال بارگذاری موارد بیشتر…
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
  );
}
