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
 * کروم را تا آماده شدن استور کلاینت نگه می‌دارد.
 * پروفایل فقط حافظه است؛ کروم UI (جمع‌شدن سایدبار) از localStorage می‌آید.
 * بعد از ورود کاربر در حافظه است — منتظر persist کروم نمان تا بوم خالی قبل از داشبورد چشمک نزند.
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
