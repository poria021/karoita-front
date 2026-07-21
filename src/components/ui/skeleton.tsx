import type * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Shadcn Skeleton — Karvita tokens.
 * Use `bg-kv-border` (not missing `kv-muted`) so bones stay visible on `kv-canvas`.
 */
function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        'animate-pulse rounded-kv-control bg-kv-border',
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
