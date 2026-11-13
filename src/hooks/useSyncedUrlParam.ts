'use client';

import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';

import {
  hrefWithSearchParam,
  pickAllowedSearchParam,
} from '@/lib/dashboard-url-state';
import {
  getShallowLocationSearch,
  getShallowLocationSearchServerSnapshot,
  replaceShallowHref,
  subscribeShallowLocation,
} from '@/lib/shallow-location';

type UseSyncedUrlParamOptions<T extends string> = {
  name: string;
  allowed: readonly T[];
  defaultValue: T;
  /** Fallback value to prefer when the URL is missing or invalid. */
  preferWhenMissing?: T;
};

/**
 * پارامتر مجاز را در نوار آدرس آینه می‌کند بدون ناوبری Next.
 * `router.replace` برای `?tab=` / `?kind=` سند را از نو بار می‌گذارد و لودر برند را نشان می‌دهد.
 */
export function useSyncedUrlParam<T extends string>({
  name,
  allowed,
  defaultValue,
  preferWhenMissing,
}: UseSyncedUrlParamOptions<T>): readonly [T, (next: T) => void] {
  const pathname = usePathname();
  const search = useSyncExternalStore(
    subscribeShallowLocation,
    getShallowLocationSearch,
    getShallowLocationSearchServerSnapshot
  );

  const searchParams = useMemo(
    () => new URLSearchParams(search.startsWith('?') ? search.slice(1) : search),
    [search]
  );

  const fallback = useMemo(() => {
    if (
      preferWhenMissing != null &&
      (allowed as readonly string[]).includes(preferWhenMissing)
    ) {
      return preferWhenMissing;
    }
    return defaultValue;
  }, [allowed, defaultValue, preferWhenMissing]);

  const raw = searchParams.get(name);
  const value = pickAllowedSearchParam(raw, allowed, fallback);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname !== pathname) {
      return;
    }
    // هنگام hydrate/ناوبری، snapshot ممکن است از URL واقعی عقب باشد.
    // اگر نوار آدرس همین حالا مقدار مجاز دارد، با fallback (مثلاً tab انتشار)
    // روی ?tab=received بازنویسی نکن.
    if (typeof window !== 'undefined') {
      const liveRaw = new URLSearchParams(window.location.search).get(name);
      if (
        liveRaw != null &&
        (allowed as readonly string[]).includes(liveRaw) &&
        liveRaw !== value
      ) {
        return;
      }
    }
    if (searchParams.get(name) === value) return;
    replaceShallowHref(hrefWithSearchParam(pathname, searchParams, name, value));
  }, [allowed, name, pathname, searchParams, value]);

  const setValue = useCallback(
    (next: T) => {
      if (!(allowed as readonly string[]).includes(next)) return;
      if (searchParams.get(name) === next) return;
      if (typeof window !== 'undefined' && window.location.pathname !== pathname) {
        return;
      }
      replaceShallowHref(hrefWithSearchParam(pathname, searchParams, name, next));
    },
    [allowed, name, pathname, searchParams]
  );

  return [value, setValue] as const;
}
