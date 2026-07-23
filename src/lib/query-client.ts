'use client';

import { QueryClient } from '@tanstack/react-query';

/** Browser QueryClient defaults for Karvita server-state (lists + typeahead). */
export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 0,
        gcTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });
}
