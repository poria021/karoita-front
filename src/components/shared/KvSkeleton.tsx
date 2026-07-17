import * as React from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export type KvSkeletonProps = React.ComponentProps<typeof Skeleton>;

/** Karvita loading placeholder. */
export function KvSkeleton({ className, ...props }: KvSkeletonProps) {
  return (
    <Skeleton
      data-slot="kv-skeleton"
      className={cn('rounded-md bg-slate-100', className)}
      {...props}
    />
  );
}
