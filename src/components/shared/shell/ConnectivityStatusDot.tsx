'use client';

import { cn } from '@/lib/utils';

export type ConnectivityStatusDotProps = {
  online: boolean;
  /** Slightly larger for the sidebar avatar. */
  size?: 'sm' | 'md';
  className?: string;
};

/**
 * Circular online/offline lamp for account avatars (header + sidebar).
 */
export function ConnectivityStatusDot({
  online,
  size = 'sm',
  className,
}: ConnectivityStatusDotProps) {
  return (
    <span
      className={cn(
        'absolute end-0 top-0 rounded-full ring-2 ring-kv-surface',
        size === 'sm' ? 'size-2.5' : 'size-3',
        online ? 'bg-kv-success' : 'bg-kv-danger',
        className
      )}
      title={online ? 'اتصال اینترنت برقرار است' : 'اتصال اینترنت قطع است'}
      aria-label={online ? 'آنلاین' : 'آفلاین'}
      role="status"
    />
  );
}
