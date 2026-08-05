'use client';

import { cn } from '@/lib/utils';
import { useNetworkStore } from '@/store/useNetworkStore';

export type ConnectivityStatusDotProps = {
  className?: string;
};

/**
 * Online/offline lamp on account avatars — reference: Alpine `isOnline` emerald/rose pill.
 */
export function ConnectivityStatusDot({ className }: ConnectivityStatusDotProps) {
  const isOnline = useNetworkStore((state) => state.isOnline);

  return (
    <span
      className={cn(
        'absolute -bottom-0.5 -start-0.5 size-3 rounded-full border-2 border-kv-surface shadow-kv-soft transition-colors duration-300',
        isOnline ? 'bg-kv-success' : 'bg-kv-danger',
        className
      )}
      title={
        isOnline
          ? 'اتصال برقرار است (آنلاین)'
          : 'ارتباط قطع شده (آفلاین)'
      }
      aria-label={isOnline ? 'آنلاین' : 'آفلاین'}
      role="status"
    />
  );
}
