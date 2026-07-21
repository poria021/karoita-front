import type * as React from 'react';

import { KvCard, KvCardContent } from '@/components/shared/KvCard';
import { KvSkeleton } from '@/components/shared/skeleton/KvSkeleton';
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
        className="flex min-h-[82px] items-center justify-center"
      >
        <KvSkeleton className="h-11 w-full max-w-64 rounded-xl" />
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
        <div className="min-w-0 space-y-kv-field">
          <KvSkeleton className="h-4 w-24 rounded-md" />
          <KvSkeleton className="h-3 w-36 max-w-full rounded-md" />
        </div>
        <div className="flex shrink-0 items-center gap-2.5">
          <KvSkeleton className="h-6 w-12 rounded-full" />
          <KvSkeleton className="h-6 w-11 rounded-full" />
        </div>
      </KvCardContent>
    </KvCard>
  );
}

/** @deprecated Prefer KvSkeletonTermSelectCard — kept as alias for older imports. */
export function KvSkeletonStatusCard({ className }: { className?: string }) {
  return <KvSkeletonTermSelectCard className={className} />;
}

/** Filter / form panel: stacked bones without outer border. */
export function KvSkeletonFormPanel({ className }: { className?: string }) {
  return (
    <KvSkeletonBlock className={className}>
      <KvSkeleton className="h-4 w-28 rounded-md" />
      <KvSkeleton className="h-11 w-full rounded-xl" />
      <KvSkeleton className="h-11 w-full rounded-xl" />
      <KvSkeleton className="h-3 w-20 rounded-md" />
      <KvSkeleton className="h-24 w-full rounded-xl" />
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
            <KvSkeleton className="size-11 shrink-0 rounded-kv-panel" />
            <div className="min-w-0 space-y-kv-field">
              <KvSkeleton className="h-4 w-40 max-w-full rounded-md" />
              <KvSkeleton className="h-3 w-48 max-w-full rounded-md" />
            </div>
          </div>
          <KvSkeleton className="h-11 w-24 shrink-0 rounded-xl" />
        </div>
        <div className="flex flex-col border-t border-kv-border-muted pt-kv-group sm:flex-row sm:justify-end">
          <KvSkeleton className="h-9 w-full rounded-xl sm:w-28" />
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
        <KvSkeleton className={cn('h-4 rounded-md', titleClassName)} />
        <KvSkeleton
          className={cn('h-3 max-w-full rounded-md', captionClassName)}
        />
      </div>
    </div>
  );
}

/** Mobile list row as a solid pulse bar. */
export function KvSkeletonListRow({ className }: { className?: string }) {
  return <KvSkeleton className={cn('h-16 w-full rounded-xl', className)} />;
}
