'use client';

import { useEffect, type ReactNode } from 'react';

import { KvBrandLinearLoader } from '@/components/shared/shell/KvBrandLinearLoader';
import { getRuntimeAuthBoot } from '@/store/sessionBoot';
import { useUIStore } from '@/store/useUIStore';
import { useUserStore } from '@/store/useUserStore';

export type HydrationSafeProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

/**
 * Gates chrome until Zustand persist has rehydrated (skipHydration: true).
 * Persist API is client-only — never touch it during SSR render.
 *
 * After login the user is already in memory, so we must not wait on persist
 * or we flash an empty canvas before the dashboard paints.
 */
export function HydrationSafe({
  children,
  fallback,
}: HydrationSafeProps) {
  const hasHydrated = useUserStore((state) => state.hasHydrated);
  const activeUser = useUserStore((state) => state.activeUser);

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

  const sessionReady =
    getRuntimeAuthBoot() === 'authenticated' || activeUser != null;

  if (hasHydrated || sessionReady) return <>{children}</>;

  return (
    <>
      {fallback ?? (
        <KvBrandLinearLoader fullViewport label="لطفا منتظر بمانید…" />
      )}
    </>
  );
}
