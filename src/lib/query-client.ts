'use client';

import { QueryClient } from '@tanstack/react-query';

import { QUERY_STALE_MS } from '@/lib/query-stale';
import { isNonRetryableApiError } from '@/services/api-error';

/** پیش‌فرض `QueryClient` مرورگر برای state سرور (لیست + اسنپ‌شات ماژول). */
export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: QUERY_STALE_MS.list,
        gcTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
        // یک تلاش مجدد فقط برای خطای گذرا (شبکه / ۵xx)؛ ۴۰۳ و ۴۰۴ تکرار نمی‌شوند.
        retry: (failureCount, error) =>
          failureCount < 1 && !isNonRetryableApiError(error),
      },
    },
  });
}
