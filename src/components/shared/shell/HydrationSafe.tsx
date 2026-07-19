'use client';

import { useEffect, useState, type ReactNode } from 'react';

import { useUserStore } from '@/store/useUserStore';

export type HydrationSafeProps = {
  children: ReactNode;
  /** Optional placeholder while rehydrating — prefer plain surface, not skeletons. */
  fallback?: ReactNode;
};

/**
 * Delays children until persisted user state rehydrates (avoids auth flash).
 * Uses a plain canvas placeholder — no skeleton UI (product preference for now).
 */
export default function HydrationSafe({
  children,
  fallback,
}: HydrationSafeProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void Promise.resolve(useUserStore.persist.rehydrate()).finally(() => {
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
