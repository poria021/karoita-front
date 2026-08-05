'use client';

import { cn } from '@/lib/utils';
import { useNetworkStore } from '@/store/useNetworkStore';

export type ConnectivityStatusDotProps = {
  className?: string;
};

/**
 * Online/offline lamp on account avatars.
 * Reads the global network store (booted by NetworkStatusWatcher).
 */
export function ConnectivityStatusDot({ className }: ConnectivityStatusDotProps) {
  const isOnline = useNetworkStore((state) => state.isOnline);

  return (
    <span
      data-network={isOnline ? 'online' : 'offline'}
      className={cn(
        'pointer-events-none absolute -bottom-0.5 -start-0.5 z-10 size-3 rounded-full',
        'border-2 border-kv-surface shadow-kv-soft transition-colors duration-300',
        className
      )}
      style={{
        backgroundColor: isOnline ? 'var(--kv-success)' : 'var(--kv-danger)',
      }}
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
