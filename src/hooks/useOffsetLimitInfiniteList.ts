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
import { delayDashboardColdSkeletonPreview } from '@/lib/dashboard-cold-skeleton-preview';
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
  /** When set, included in the TanStack queryKey for SPA list cache (rule 83). */
  cacheNamespace?: string;
};

export { offsetLimitListQueryKey };

/**
 * لیست بی‌نهایت ادمین روی قرارداد offset/limit — TanStack `useInfiniteQuery`.
 * جستجو یک‌بار در هوک صفحه debounce شود؛ این هوک فقط صفحه‌ها را جمع می‌کند.
 * صفحه همیشه کروم را نگه می‌دارد؛ busy فقط از `isLoading` روی ناحیهٔ داده (rule 84).
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
  fetchPageRef.current = fetchPage;

  /** After first ready paint in this mount, skip QA cold-delay on later keys. */
  const hasEverReadyRef = useRef(false);
  const [loadMoreErrorDismissed, setLoadMoreErrorDismissed] = useState(false);

  const cached = queryClient.getQueryData<{
    pages: OffsetLimitPage<T>[];
    pageParams: number[];
  }>(queryKey);
  if (cached?.pages?.length && !hasEverReadyRef.current) {
    hasEverReadyRef.current = true;
  }

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
    queryFn: async ({ pageParam }) => {
      const hadCache = queryClient.getQueryData(queryKey) != null;
      const isFirstDataMiss = !hadCache && !hasEverReadyRef.current;
      await delayDashboardColdSkeletonPreview(isFirstDataMiss);
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

  useEffect(() => {
    if (isSuccess) {
      hasEverReadyRef.current = true;
    }
  }, [isSuccess]);

  useEffect(() => {
    if (isFetchNextPageError) {
      setLoadMoreErrorDismissed(false);
    }
  }, [isFetchNextPageError, error]);

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

  const loadMore = useCallback(async () => {
    if (!hasNextPage || isFetchingNextPage || isLoading) return;
    setLoadMoreErrorDismissed(false);
    await fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, isLoading, fetchNextPage]);

  const reload = useCallback(async () => {
    setLoadMoreErrorDismissed(false);
    await refetch();
  }, [refetch]);

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
  };
}
