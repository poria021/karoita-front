import type * as React from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export type KvSkeletonProps = React.ComponentProps<typeof Skeleton> & {
  label?: string;
};

/**
 * Kv wrapper over shadcn `Skeleton` — pulse block with ground fill, no border.
 */
export function KvSkeleton({ className, label, ...props }: KvSkeletonProps) {
  return (
    <Skeleton
      role={label ? 'status' : undefined}
      aria-label={label}
      aria-busy={label ? true : undefined}
      className={cn(className)}
      {...props}
    />
  );
}
