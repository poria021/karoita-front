'use client';

import { useEffect, useState, type ReactNode } from 'react';

import { useUserStore } from '@/store/useUserStore';

export type HydrationSafeProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

/**
 * Gates chrome until Zustand persist has rehydrated (skipHydration: true).
 * Persist API is client-only — never touch it during SSR render.
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

  return (
    <>
      {fallback ?? (
        <div
          className="min-h-dvh w-full bg-kv-canvas"
          aria-busy="true"
          aria-live="polite"
        />
      )}
    </>
  );
}
