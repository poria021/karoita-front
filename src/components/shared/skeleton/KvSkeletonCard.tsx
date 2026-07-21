import type * as React from 'react';

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

/** One solid pulse surface sized like a status card. */
export function KvSkeletonStatusCard({ className }: { className?: string }) {
  return (
    <KvSkeleton
      className={cn('h-[82px] w-full rounded-xl', className)}
    />
  );
}

/** Gate card as a single animated block (no border chrome). */
export function KvSkeletonGateCard({ className }: { className?: string }) {
  return (
    <KvSkeleton
      className={cn('h-[82px] w-full rounded-xl', className)}
    />
  );
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

/** Mobile list row as a solid pulse bar. */
export function KvSkeletonListRow({ className }: { className?: string }) {
  return <KvSkeleton className={cn('h-16 w-full rounded-xl', className)} />;
}
