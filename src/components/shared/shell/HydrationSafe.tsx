'use client';

import { useEffect, type ReactNode } from 'react';

import { KvBrandLinearLoader } from '@/components/shared/shell/KvBrandLinearLoader';
import { getRuntimeAuthBoot } from '@/store/sessionBoot';
import { useUIStore } from '@/store/useUIStore';
import {
  purgeLegacyUserStorePersistence,
  useUserStore,
} from '@/store/useUserStore';

export type HydrationSafeProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

/**
 * Gates chrome until client stores are ready.
 * User profile is memory-only; UI chrome (sidebar collapse) still rehydrates
 * from localStorage. After login the user is already in memory, so we must
 * not wait on chrome persist or we flash an empty canvas before the dashboard paints.
 */
export function HydrationSafe({
  children,
  fallback,
}: HydrationSafeProps) {
  const hasHydrated = useUserStore((state) => state.hasHydrated);
  const activeUser = useUserStore((state) => state.activeUser);

  useEffect(() => {
    const readyChrome = async () => {
      purgeLegacyUserStorePersistence();
      try {
        if (useUIStore.persist?.rehydrate) {
          await Promise.resolve(useUIStore.persist.rehydrate());
        }
      } finally {
        useUserStore.getState().setHasHydrated(true);
      }
    };

    void readyChrome();
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
