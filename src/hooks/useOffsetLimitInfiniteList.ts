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
  /** Reset + reload when this key changes (tab, query, …). */
  resetKey: string;
  fetchPage: FetchOffsetLimitPage<T>;
  pageSize?: number;
};

/**
 * Domain-agnostic infinite list: offset/limit pages with append + in-flight guard.
 */
export function useOffsetLimitInfiniteList<T>({
  resetKey,
  fetchPage,
  pageSize = DEFAULT_PAGE_LIMIT,
}: UseOffsetLimitInfiniteListOptions<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);

  const inFlightRef = useRef(false);
  const fetchPageRef = useRef(fetchPage);
  fetchPageRef.current = fetchPage;

  const loadInitial = useCallback(async () => {
    inFlightRef.current = true;
    setIsLoading(true);
    setIsLoadingMore(false);
    setError(null);
    setLoadMoreError(null);
    setItems([]);
    setTotal(0);
    setHasMore(false);

    try {
      const page = await fetchPageRef.current({ offset: 0, limit: pageSize });
      setItems(page.items);
      setTotal(page.total);
      setHasMore(page.hasMore);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'بارگذاری فهرست ناموفق بود.'
      );
      setItems([]);
      setTotal(0);
      setHasMore(false);
    } finally {
      setIsLoading(false);
      inFlightRef.current = false;
    }
  }, [pageSize]);

  useEffect(() => {
    void loadInitial();
  }, [resetKey, loadInitial]);

  const loadMore = useCallback(async () => {
    if (inFlightRef.current || isLoading || isLoadingMore || !hasMore) return;

    inFlightRef.current = true;
    setIsLoadingMore(true);
    setLoadMoreError(null);

    const offset = items.length;

    try {
      const page = await fetchPageRef.current({ offset, limit: pageSize });
      setItems((prev) => [...prev, ...page.items]);
      setTotal(page.total);
      setHasMore(page.hasMore);
    } catch (err) {
      setLoadMoreError(
        err instanceof Error
          ? err.message
          : 'بارگذاری موارد بیشتر ناموفق بود.'
      );
    } finally {
      setIsLoadingMore(false);
      inFlightRef.current = false;
    }
  }, [hasMore, isLoading, isLoadingMore, items.length, pageSize]);

  return {
    items,
    total,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    loadMoreError,
    loadMore,
    reload: loadInitial,
    clearLoadMoreError: () => setLoadMoreError(null),
    pageSize,
  };
}
