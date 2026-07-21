import type * as React from 'react';

import { KvCard, KvCardContent } from '@/components/shared/KvCard';
import { KvSkeleton } from '@/components/shared/skeleton/KvSkeleton';
import { KV_TABLE_VIEWPORT_HEIGHT } from '@/components/shared/table/KvTable';
import { cn } from '@/lib/utils';

export type KvSkeletonBlockProps = {
  className?: string;
  children?: React.ReactNode;
};

/**
 * Layout group only — no card border. Children are pulse bones (shadcn style).
 */
export function KvSkeletonBlock({ className, children }: KvSkeletonBlockProps) {
  return (
    <div className={cn('space-y-kv-group', className)} aria-hidden>
      {children}
    </div>
  );
}

/**
 * آینهٔ کارت «نیم‌سال فعال» در TermStatusCards:
 * عنوان + کپشن | سلکت سمت چپ.
 */
export function KvSkeletonTermSelectCard({ className }: { className?: string }) {
  return (
    <KvCard className={className}>
      <KvCardContent
        padding="md"
        className="flex min-h-[82px] items-center justify-between gap-kv-group"
      >
        <div className="flex min-w-0 items-center gap-kv-pair">
          <KvSkeleton className="size-9 shrink-0 rounded-kv-control" />
          <div className="min-w-0 space-y-kv-field">
            <KvSkeleton className="h-4 w-20 rounded-kv-control" />
            <KvSkeleton className="h-3 w-40 max-w-full rounded-kv-control" />
          </div>
        </div>
        <KvSkeleton className="h-9 w-full max-w-44 shrink-0 rounded-kv-control" />
      </KvCardContent>
    </KvCard>
  );
}

/**
 * آینهٔ StatusGateCard — عنوان/کپشن + بج + سوییچ.
 */
export function KvSkeletonGateCard({ className }: { className?: string }) {
  return (
    <KvCard className={className}>
      <KvCardContent
        padding="md"
        className="flex min-h-[82px] items-center justify-between gap-kv-group"
      >
        <div className="flex min-w-0 items-center gap-kv-pair">
          <KvSkeleton className="size-9 shrink-0 rounded-kv-control" />
          <div className="min-w-0 space-y-kv-field">
            <KvSkeleton className="h-4 w-24 rounded-kv-control" />
            <KvSkeleton className="h-3 w-36 max-w-full rounded-kv-control" />
          </div>
        </div>
        <KvSkeleton className="h-7 w-12 shrink-0 rounded-full" />
      </KvCardContent>
    </KvCard>
  );
}

/** Filter / form panel: stacked bones without outer border. */
export function KvSkeletonFormPanel({ className }: { className?: string }) {
  return (
    <KvSkeletonBlock className={className}>
      <KvSkeleton className="h-4 w-28 rounded-kv-control" />
      <KvSkeleton className="h-11 w-full rounded-kv-control" />
      <KvSkeleton className="h-11 w-full rounded-kv-control" />
      <KvSkeleton className="h-3 w-20 rounded-kv-control" />
      <KvSkeleton className="h-24 w-full rounded-kv-panel" />
    </KvSkeletonBlock>
  );
}

/**
 * آینهٔ SettingsMetricCard — آیکن + عنوان | فیلد متریک + فوتر دکمه.
 */
export function KvSkeletonMetricCard({ className }: { className?: string }) {
  return (
    <KvCard className={className}>
      <KvCardContent padding="md" className="space-y-kv-group">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <KvSkeleton className="size-9 shrink-0 rounded-kv-control" />
            <div className="min-w-0 space-y-kv-field">
              <KvSkeleton className="h-4 w-40 max-w-full rounded-kv-control" />
              <KvSkeleton className="h-3 w-48 max-w-full rounded-kv-control" />
            </div>
          </div>
          <KvSkeleton className="h-11 w-28 shrink-0 rounded-kv-control" />
        </div>
        <div className="flex flex-col border-t border-kv-border-muted pt-kv-group sm:flex-row sm:justify-end">
          <KvSkeleton className="h-9 w-full rounded-kv-control sm:w-28" />
        </div>
      </KvCardContent>
    </KvCard>
  );
}

/**
 * هدر کارت فرم — آیکن برند + عنوان/کپشن (مثل TermFormCard / AdminUserCreation).
 */
export function KvSkeletonCardHeader({
  className,
  titleClassName = 'w-44',
  captionClassName = 'w-64',
}: {
  className?: string;
  titleClassName?: string;
  captionClassName?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-kv-pair border-b border-kv-border pb-kv-inline',
        className
      )}
    >
      <KvSkeleton className="size-9 shrink-0 rounded-kv-control" />
      <div className="min-w-0 space-y-kv-micro">
        <KvSkeleton className={cn('h-4 rounded-kv-control', titleClassName)} />
        <KvSkeleton
          className={cn('h-3 max-w-full rounded-kv-control', captionClassName)}
        />
      </div>
    </div>
  );
}

/** Mobile list row as a solid pulse bar. */
export function KvSkeletonListRow({ className }: { className?: string }) {
  return <KvSkeleton className={cn('h-16 w-full rounded-kv-panel', className)} />;
}

export type KvSkeletonTablePanelProps = {
  className?: string;
  rows?: number;
  withHeader?: boolean;
  heightClassName?: string;
  headerCols?: string[];
  label?: string;
};

/** Table-shaped cold placeholder — pulse bones only (no outer card). */
export function KvSkeletonTablePanel({
  className,
  rows = 6,
  withHeader = true,
  heightClassName = KV_TABLE_VIEWPORT_HEIGHT,
  headerCols = ['w-24', 'w-20', 'w-16'],
  label = 'در حال بارگذاری جدول',
}: KvSkeletonTablePanelProps) {
  return (
    <div
      className={cn(
        'flex w-full flex-col justify-start gap-3 p-kv-pair',
        heightClassName,
        className
      )}
      role="status"
      aria-busy="true"
      aria-label={label}
    >
      {withHeader ? (
        <div className="flex items-center gap-3 border-b border-kv-border-muted pb-3">
          {headerCols.map((colWidth, index) => (
            <KvSkeleton
              key={index}
              className={cn(
                'h-4 rounded-kv-control',
                colWidth,
                index === headerCols.length - 1 && 'ms-auto'
              )}
            />
          ))}
        </div>
      ) : null}
      {Array.from({ length: rows }, (_, i) => (
        <KvSkeleton key={i} className="h-10 w-full rounded-kv-panel" />
      ))}
    </div>
  );
}
