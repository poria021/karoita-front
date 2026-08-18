'use client';

import {
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  flattenOffsetLimitPages,
  mapOffsetLimitListError,
  mergeOffsetLimitPageItems,
  offsetLimitListQueryKey,
  replaceOffsetLimitListItems,
  type OffsetLimitInfiniteData,
} from '@/hooks/offsetLimitInfiniteList.helpers';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import {
  DEFAULT_PAGE_LIMIT,
  type OffsetLimitPage,
} from '@/utils/offset-limit-page';

export type FetchOffsetLimitPage<T> = (args: {
  offset: number;
  limit: number;
}) => Promise<OffsetLimitPage<T>>;

export type UseOffsetLimitInfiniteListOptions<T> = {
  resetKey: string;
  fetchPage: FetchOffsetLimitPage<T>;
  pageSize?: number;
  cacheNamespace?: string;
};

export { offsetLimitListQueryKey };

/**
 * لیست بی‌نهایت ادمین روی قرارداد offset/limit — TanStack `useInfiniteQuery`.
 */
export function useOffsetLimitInfiniteList<T>({
  resetKey,
  fetchPage,
  pageSize = DEFAULT_PAGE_LIMIT,
  cacheNamespace,
}: UseOffsetLimitInfiniteListOptions<T>) {
  const queryClient = useQueryClient();
  const queryKey = offsetLimitListQueryKey(cacheNamespace, resetKey, pageSize);

  const fetchPageRef = useRef(fetchPage);

  useEffect(() => {
    fetchPageRef.current = fetchPage;
  }, [fetchPage]);

  const [loadMoreErrorDismissed, setLoadMoreErrorDismissed] = useState(false);

  const cached = queryClient.getQueryData<{
    pages: OffsetLimitPage<T>[];
    pageParams: number[];
  }>(queryKey);

  const {
    data,
    error,
    isPending,
    isFetching,
    isFetchingNextPage,
    isFetchNextPageError,
    isSuccess,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey,
    initialPageParam: 0,
    staleTime: QUERY_STALE_MS.list,
    queryFn: async ({ pageParam }) => {
      return fetchPageRef.current({ offset: pageParam, limit: pageSize });
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined;
      return allPages.reduce((sum, page) => sum + page.items.length, 0);
    },
  });

  const items =
    data?.pages.reduce<T[]>(
      (acc, page) => mergeOffsetLimitPageItems(acc, page),
      []
    ) ?? [];
  const lastPage = data?.pages.at(-1);
  const total = lastPage?.total ?? 0;

  const hasEverReady = Boolean(cached?.pages?.length) || isSuccess;

  const isLoading =
    data == null &&
    (isPending || (isFetching && !isFetchingNextPage)) &&
    !isFetchNextPageError;

  const listError =
    error && !isFetchNextPageError
      ? mapOffsetLimitListError(error, 'بارگذاری فهرست ناموفق بود.')
      : null;
  const loadMoreError =
    isFetchNextPageError && !loadMoreErrorDismissed
      ? mapOffsetLimitListError(error, 'بارگذاری موارد بیشتر ناموفق بود.')
      : null;

  const loadMore = async () => {
    if (!hasNextPage || isFetchingNextPage || isLoading) return;
    setLoadMoreErrorDismissed(false);
    await fetchNextPage();
  };

  const reload = async () => {
    setLoadMoreErrorDismissed(false);
    await refetch();
  };

  const patchItems = useCallback(
    (
      updater: (prev: T[]) => T[],
      totalUpdater?: (prevTotal: number, nextItems: T[]) => number
    ) => {
      queryClient.setQueryData<OffsetLimitInfiniteData<T>>(queryKey, (old) => {
        const prevItems = flattenOffsetLimitPages(old);
        const prevTotal = old?.pages.at(-1)?.total ?? prevItems.length;
        const nextItems = updater(prevItems);
        const nextTotal =
          totalUpdater?.(prevTotal, nextItems) ?? prevTotal;
        return replaceOffsetLimitListItems(old, nextItems, nextTotal);
      });
    },
    [queryClient, queryKey]
  );

  return {
    items,
    total,
    hasMore: Boolean(hasNextPage),
    isLoading,
    isLoadingMore: isFetchingNextPage,
    error: listError,
    loadMoreError,
    loadMore,
    reload,
    patchItems,
    clearLoadMoreError: () => setLoadMoreErrorDismissed(true),
    pageSize,
    hasEverReady,
  };
}