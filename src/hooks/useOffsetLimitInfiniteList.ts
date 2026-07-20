'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

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
};

type ListState<T> = {
  items: T[];
  total: number;
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  loadMoreError: string | null;
};

function initialListState<T>(): ListState<T> {
  return {
    items: [],
    total: 0,
    hasMore: false,
    isLoading: true,
    isLoadingMore: false,
    error: null,
    loadMoreError: null,
  };
}

/**
 * لیست بی‌نهایت ادمین روی قرارداد offset/limit.
 * جستجو یک‌بار در هوک صفحه debounce شود؛ این هوک فقط صفحه‌ها را جمع می‌کند.
 */
export function useOffsetLimitInfiniteList<T>({
  resetKey,
  fetchPage,
  pageSize = DEFAULT_PAGE_LIMIT,
}: UseOffsetLimitInfiniteListOptions<T>) {
  const [list, setList] = useState<ListState<T>>(initialListState);
  const [activeKey, setActiveKey] = useState(resetKey);

  if (resetKey !== activeKey) {
    setActiveKey(resetKey);
    setList(initialListState());
  }

  const requestIdRef = useRef(0);
  const inFlightRef = useRef(false);

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    inFlightRef.current = true;

    void (async () => {
      try {
        const page = await fetchPage({ offset: 0, limit: pageSize });
        if (requestId !== requestIdRef.current) return;
        setList({
          items: page.items,
          total: page.total,
          hasMore: page.hasMore,
          isLoading: false,
          isLoadingMore: false,
          error: null,
          loadMoreError: null,
        });
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        setList({
          ...initialListState(),
          isLoading: false,
          error:
            err instanceof Error ? err.message : 'بارگذاری فهرست ناموفق بود.',
        });
      } finally {
        if (requestId === requestIdRef.current) {
          inFlightRef.current = false;
        }
      }
    })();

    return () => {
      requestIdRef.current += 1;
      inFlightRef.current = false;
    };
  }, [resetKey, pageSize, fetchPage]);

  const loadMore = useCallback(async () => {
    if (
      inFlightRef.current ||
      list.isLoading ||
      list.isLoadingMore ||
      !list.hasMore
    ) {
      return;
    }

    const requestId = ++requestIdRef.current;
    inFlightRef.current = true;
    const offset = list.items.length;

    setList((prev) => ({
      ...prev,
      isLoadingMore: true,
      loadMoreError: null,
    }));

    try {
      const page = await fetchPage({ offset, limit: pageSize });
      if (requestId !== requestIdRef.current) return;
      setList((prev) => ({
        ...prev,
        items: [...prev.items, ...page.items],
        total: page.total,
        hasMore: page.hasMore,
        isLoadingMore: false,
      }));
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setList((prev) => ({
        ...prev,
        isLoadingMore: false,
        loadMoreError:
          err instanceof Error
            ? err.message
            : 'بارگذاری موارد بیشتر ناموفق بود.',
      }));
    } finally {
      if (requestId === requestIdRef.current) {
        inFlightRef.current = false;
      }
    }
  }, [
    fetchPage,
    list.hasMore,
    list.isLoading,
    list.isLoadingMore,
    list.items.length,
    pageSize,
  ]);

  const reload = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    inFlightRef.current = true;
    // Keep previous rows during soft refresh (rule 80); first paint still uses empty+busy.
    setList((prev) => ({
      ...prev,
      isLoading: true,
      isLoadingMore: false,
      error: null,
      loadMoreError: null,
    }));

    try {
      const page = await fetchPage({ offset: 0, limit: pageSize });
      if (requestId !== requestIdRef.current) return;
      setList({
        items: page.items,
        total: page.total,
        hasMore: page.hasMore,
        isLoading: false,
        isLoadingMore: false,
        error: null,
        loadMoreError: null,
      });
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setList((prev) => ({
        ...prev,
        isLoading: false,
        isLoadingMore: false,
        error:
          err instanceof Error ? err.message : 'بارگذاری فهرست ناموفق بود.',
      }));
    } finally {
      if (requestId === requestIdRef.current) {
        inFlightRef.current = false;
      }
    }
  }, [fetchPage, pageSize]);

  return {
    items: list.items,
    total: list.total,
    hasMore: list.hasMore,
    isLoading: list.isLoading,
    isLoadingMore: list.isLoadingMore,
    error: list.error,
    loadMoreError: list.loadMoreError,
    loadMore,
    reload,
    clearLoadMoreError: () =>
      setList((prev) => ({ ...prev, loadMoreError: null })),
    pageSize,
  };
}
