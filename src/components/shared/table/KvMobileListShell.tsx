'use client';

import type { ReactNode } from 'react';

import { KvAlert } from '@/components/shared/KvAlert';
import { KvButton } from '@/components/shared/KvButton';
import { KvEmptyState } from '@/components/shared/KvEmptyState';
import { KvBusySurface } from '@/components/shared/table/KvBusySurface';
import { KV_TABLE_VIEWPORT_HEIGHT } from '@/components/shared/table/kvTableViewportHeight';
import { cn } from '@/lib/utils';

export type KvMobileListShellProps = {
  isLoading: boolean;
  isEmpty: boolean;
  /** When true during soft refresh, keep children instead of cold busy. */
  hasItems?: boolean;
  emptyTitle: string;
  emptyDescription?: string;
  emptyActions?: ReactNode;
  loadMoreError?: string | null;
  onRetryLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  loadMoreLabel?: string;
  matchTableViewport?: boolean;
  className?: string;
  children: ReactNode;
};

/**
 * Shared chrome for dashboard mobile card/accordion lists:
 * cold busy (spinner), empty, load-more footer — domain rows stay in children.
 */
export function KvMobileListShell({
  isLoading,
  isEmpty,
  hasItems,
  emptyTitle,
  emptyDescription,
  emptyActions,
  loadMoreError = null,
  onRetryLoadMore,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  loadMoreLabel = 'بارگذاری موارد بیشتر',
  matchTableViewport = false,
  className,
  children,
}: KvMobileListShellProps) {
  const showColdBusy = isLoading && !(hasItems ?? !isEmpty);

  if (showColdBusy) {
    return (
      <KvBusySurface
        className={cn(
          matchTableViewport ? KV_TABLE_VIEWPORT_HEIGHT : 'min-h-48',
          'rounded-kv-card',
          className
        )}
        label="در حال بارگذاری فهرست"
      />
    );
  }

  if (isEmpty && !isLoading) {
    return (
      <div
        className={cn(
          'flex w-full flex-col',
          matchTableViewport
            ? KV_TABLE_VIEWPORT_HEIGHT
            : 'min-h-48 rounded-kv-card border border-dashed border-kv-border bg-kv-surface-subtle',
          className
        )}
      >
        <KvEmptyState
          title={emptyTitle}
          description={emptyDescription}
          actions={emptyActions}
        />
      </div>
    );
  }

  return (
    <div className={cn('space-y-kv-group', className)}>
      {loadMoreError ? (
        <KvAlert
          variant="error"
          title="بارگذاری ادامه فهرست ناموفق بود"
          description={loadMoreError}
          actions={
            onRetryLoadMore ? (
              <KvButton
                type="button"
                appearance="secondary"
                size="sm"
                onClick={onRetryLoadMore}
              >
                تلاش مجدد
              </KvButton>
            ) : undefined
          }
        />
      ) : null}

      {children}

      {hasMore && onLoadMore ? (
        <KvButton
          type="button"
          appearance="secondary"
          size="sm"
          fullWidth
          loading={isLoadingMore}
          onClick={onLoadMore}
        >
          {loadMoreLabel}
        </KvButton>
      ) : null}
    </div>
  );
}
