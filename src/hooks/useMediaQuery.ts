'use client';

import { useCallback, useSyncExternalStore } from 'react';

/** نقطهٔ `lg` تیلویند — همان آستانهٔ `KvSplitWorkspace` برای جدول/لیست موبایل. */
const DESKTOP_QUERY = '(min-width: 1024px)';
/** نقطهٔ `md` تیلویند — تبلت به بالا. */
const TABLET_UP_QUERY = '(min-width: 768px)';

/**
 * خواندن یک media query از طریق useSyncExternalStore (بدون setState-in-effect).
 * `serverValue` مقدار SSR/هیدریشن است.
 */
export function useMediaQuery(query: string, serverValue = false): boolean {
  const subscribe = useCallback(
    (notify: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener('change', notify);
      return () => mq.removeEventListener('change', notify);
    },
    [query]
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverValue
  );
}

/** دسکتاپ = `lg` به بالا. پیش‌فرض SSR: دسکتاپ. */
export function useIsDesktop(): boolean {
  return useMediaQuery(DESKTOP_QUERY, true);
}

/** تبلت و بالاتر = `md` به بالا. پیش‌فرض SSR: دسکتاپ. */
export function useIsTabletUp(): boolean {
  return useMediaQuery(TABLET_UP_QUERY, true);
}
