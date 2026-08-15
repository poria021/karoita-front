'use client';

import { QueryClient } from '@tanstack/react-query';

import { QUERY_STALE_MS } from '@/lib/query-stale';

/** Browser QueryClient defaults for Karvita server-state (lists + module snapshots). */
export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: QUERY_STALE_MS.list,
        gcTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });
}
