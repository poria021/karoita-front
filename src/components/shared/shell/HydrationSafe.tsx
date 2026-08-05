'use client';

import { useEffect, useState, type ReactNode } from 'react';

import { DashboardAccessPlaceholder } from '@/components/shared/shell/DashboardAccessPlaceholder';
import { useUserStore } from '@/store/useUserStore';

export type HydrationSafeProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

/**
 * Gates chrome until Zustand persist has rehydrated (skipHydration: true).
 * Persist API is client-only — never touch it during SSR render.
 * Fallback is a plain canvas (not skeleton bones) — rule 80 / 84.
 */
export function HydrationSafe({
  children,
  fallback,
}: HydrationSafeProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const persistApi = useUserStore.persist;

    if (!persistApi?.rehydrate) {
      setReady(true);
      return;
    }

    void Promise.resolve(persistApi.rehydrate()).finally(() => {
      if (!cancelled) setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (ready) return <>{children}</>;

  return <>{fallback ?? <DashboardAccessPlaceholder fullViewport />}</>;
}
