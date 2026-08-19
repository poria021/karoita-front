'use client';

import { useEffect, type ReactNode } from 'react';

import { DashboardAccessPlaceholder } from '@/components/shared/shell/DashboardAccessPlaceholder';
import { useUIStore } from '@/store/useUIStore';
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
  const hasHydrated = useUserStore((state) => state.hasHydrated);

  useEffect(() => {
    const rehydrateAll = async () => {
      const tasks: Array<Promise<unknown> | unknown> = [];
      if (useUserStore.persist?.rehydrate) {
        tasks.push(useUserStore.persist.rehydrate());
      }
      if (useUIStore.persist?.rehydrate) {
        tasks.push(useUIStore.persist.rehydrate());
      }
      if (tasks.length === 0) return;
      await Promise.all(tasks.map((task) => Promise.resolve(task)));
    };

    void rehydrateAll();
  }, []);

  if (hasHydrated) return <>{children}</>;

  return <>{fallback ?? <DashboardAccessPlaceholder fullViewport />}</>;
}