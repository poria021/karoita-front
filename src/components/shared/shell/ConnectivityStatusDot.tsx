'use client';

import { cn } from '@/lib/utils';

export type ConnectivityStatusDotProps = {
  online: boolean;
  className?: string;
};

/**
 * Circular online/offline lamp — same scale as notification unread bullet,
 * anchored bottom-start (physical bottom-right in RTL) on account avatars.
 */
export function ConnectivityStatusDot({
  online,
  className,
}: ConnectivityStatusDotProps) {
  return (
    <span
      className={cn(
        'absolute start-0 bottom-0 size-2 rounded-full ring-1 ring-kv-surface',
        online ? 'bg-kv-success' : 'bg-kv-danger',
        className
      )}
      title={online ? 'اتصال اینترنت برقرار است' : 'اتصال اینترنت قطع است'}
      aria-label={online ? 'آنلاین' : 'آفلاین'}
      role="status"
    />
  );
}
