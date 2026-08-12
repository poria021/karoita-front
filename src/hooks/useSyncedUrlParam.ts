'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import {
  hrefWithSearchParam,
  pickAllowedSearchParam,
} from '@/lib/dashboard-url-state';

type UseSyncedUrlParamOptions<T extends string> = {
  name: string;
  allowed: readonly T[];
  defaultValue: T;
  /**
   * When the URL has no valid value (first paint / sidebar entry), prefer this
   * — typically the in-memory module chrome cache — before `defaultValue`.
   */
  preferWhenMissing?: T;
};

/**
 * Keep a single allowlisted query param (e.g. `tab` / `kind`) in sync with the URL.
 * Uses `router.replace` (no history spam). Does not touch search text or paging.
 */
export function useSyncedUrlParam<T extends string>({
  name,
  allowed,
  defaultValue,
  preferWhenMissing,
}: UseSyncedUrlParamOptions<T>): readonly [T, (next: T) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
    if (searchParams.get(name) === value) return;
    router.replace(hrefWithSearchParam(pathname, searchParams, name, value), {
      scroll: false,
    });
  }, [name, pathname, router, searchParams, value]);

  const setValue = useCallback(
    (next: T) => {
      if (!(allowed as readonly string[]).includes(next)) return;
      if (searchParams.get(name) === next) return;
      router.replace(hrefWithSearchParam(pathname, searchParams, name, next), {
        scroll: false,
      });
    },
    [allowed, name, pathname, router, searchParams]
  );

  return [value, setValue] as const;
}
