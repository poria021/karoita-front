'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  dashboardListCacheKey,
  useDashboardModuleCache,
} from '@/store/useDashboardModuleCache';
import { delayDashboardColdSkeletonPreview } from '@/lib/dashboard-cold-skeleton-preview';
import { computeDashboardListIsCold } from '@/lib/dashboard-list-cold';
import {
  canLoadMoreOffsetLimitList,
  initialOffsetLimitListState,
  mapOffsetLimitListError,
  mergeOffsetLimitPageItems,
  offsetLimitListStateFromCache,
  toOffsetLimitListCachePayload,
  type OffsetLimitListCachePayload,
  type OffsetLimitListState,
} from '@/hooks/offsetLimitInfiniteList.helpers';
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
  /** When set, list pages are cached in memory for SPA revisits (rule 83). */
  cacheNamespace?: string;
};

/**
 * لیست بی‌نهایت ادمین روی قرارداد offset/limit.
 * جستجو یک‌بار در هوک صفحه debounce شود؛ این هوک فقط صفحه‌ها را جمع می‌کند.
 */
export function useOffsetLimitInfiniteList<T>({
  resetKey,
  fetchPage,
  pageSize = DEFAULT_PAGE_LIMIT,
  cacheNamespace,
}: UseOffsetLimitInfiniteListOptions<T>) {
  const cacheKey = cacheNamespace
    ? dashboardListCacheKey(cacheNamespace, resetKey)
    : null;

  const readCache = useDashboardModuleCache((s) => s.getData);
  const writeCache = useDashboardModuleCache((s) => s.setData);

  /** After first ready paint in this mount, never show page-level cold skeleton (tab switches stay local-busy). */
  const hasEverReadyRef = useRef(false);

  const [activeKey, setActiveKey] = useState(resetKey);
  const [list, setList] = useState<OffsetLimitListState<T>>(() => {
    if (!cacheKey) return initialOffsetLimitListState();
    const cached = readCache<OffsetLimitListCachePayload<T>>(cacheKey);
    if (cached) {
      hasEverReadyRef.current = true;
      return offsetLimitListStateFromCache(cached);
    }
    return initialOffsetLimitListState();
  });

  if (resetKey !== activeKey) {
    setActiveKey(resetKey);
    const nextKey = cacheNamespace
      ? dashboardListCacheKey(cacheNamespace, resetKey)
      : null;
    const cached = nextKey
      ? readCache<OffsetLimitListCachePayload<T>>(nextKey)
      : undefined;
    if (cached) {
      hasEverReadyRef.current = true;
      setList(offsetLimitListStateFromCache(cached));
    } else {
      setList(initialOffsetLimitListState());
    }
  }

  const requestIdRef = useRef(0);
  const inFlightRef = useRef(false);

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    inFlightRef.current = true;
    const key = cacheNamespace
      ? dashboardListCacheKey(cacheNamespace, resetKey)
      : null;
    const hadCacheEntry =
      key != null &&
      readCache<OffsetLimitListCachePayload<T>>(key) !== undefined;
    const isModuleColdMiss =
      !hadCacheEntry && !hasEverReadyRef.current;

    setList((prev) => ({
      ...prev,
      // Soft refresh when cache/rows exist; tab changes stay local-busy (isCold gated by hasEverReady).
      isLoading: !(hadCacheEntry || prev.items.length > 0),
      isLoadingMore: false,
      error: null,
      loadMoreError: null,
    }));

    void (async () => {
      try {
        await delayDashboardColdSkeletonPreview(isModuleColdMiss);
        if (requestId !== requestIdRef.current) return;
        const page = await fetchPage({ offset: 0, limit: pageSize });
        if (requestId !== requestIdRef.current) return;
        hasEverReadyRef.current = true;
        const next: OffsetLimitListState<T> = {
          items: page.items,
          total: page.total,
          hasMore: page.hasMore,
          isLoading: false,
          isLoadingMore: false,
          error: null,
          loadMoreError: null,
        };
        setList(next);
        if (key) {
          writeCache(key, toOffsetLimitListCachePayload(next));
        }
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        setList((prev) => ({
          ...initialOffsetLimitListState(),
          items: prev.items,
          total: prev.total,
          hasMore: prev.hasMore,
          isLoading: false,
          error: mapOffsetLimitListError(
            err,
            'بارگذاری فهرست ناموفق بود.'
          ),
        }));
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
  }, [resetKey, pageSize, fetchPage, cacheNamespace, writeCache, readCache]);

  const loadMore = useCallback(async () => {
    if (
      !canLoadMoreOffsetLimitList({
        inFlight: inFlightRef.current,
        isLoading: list.isLoading,
        isLoadingMore: list.isLoadingMore,
        hasMore: list.hasMore,
      })
    ) {
      return;
    }

    const requestId = ++requestIdRef.current;
    inFlightRef.current = true;
    const offset = list.items.length;
    const key = cacheNamespace
      ? dashboardListCacheKey(cacheNamespace, resetKey)
      : null;

    setList((prev) => ({
      ...prev,
      isLoadingMore: true,
      loadMoreError: null,
    }));

    try {
      const page = await fetchPage({ offset, limit: pageSize });
      if (requestId !== requestIdRef.current) return;
      const items = mergeOffsetLimitPageItems(list.items, page);
      setList((prev) => ({
        ...prev,
        items,
        total: page.total,
        hasMore: page.hasMore,
        isLoadingMore: false,
      }));
      if (key) {
        writeCache(
          key,
          toOffsetLimitListCachePayload({
            items,
            total: page.total,
            hasMore: page.hasMore,
          })
        );
      }
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setList((prev) => ({
        ...prev,
        isLoadingMore: false,
        loadMoreError: mapOffsetLimitListError(
          err,
          'بارگذاری موارد بیشتر ناموفق بود.'
        ),
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
    list.items,
    pageSize,
    cacheNamespace,
    resetKey,
    writeCache,
  ]);

  const reload = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    inFlightRef.current = true;
    const key = cacheNamespace
      ? dashboardListCacheKey(cacheNamespace, resetKey)
      : null;
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
      hasEverReadyRef.current = true;
      const next: OffsetLimitListState<T> = {
        items: page.items,
        total: page.total,
        hasMore: page.hasMore,
        isLoading: false,
        isLoadingMore: false,
        error: null,
        loadMoreError: null,
      };
      setList(next);
      if (key) {
        writeCache(key, toOffsetLimitListCachePayload(next));
      }
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setList((prev) => ({
        ...prev,
        isLoading: false,
        isLoadingMore: false,
        error: mapOffsetLimitListError(
          err,
          'بارگذاری فهرست ناموفق بود.'
        ),
      }));
    } finally {
      if (requestId === requestIdRef.current) {
        inFlightRef.current = false;
      }
    }
  }, [fetchPage, pageSize, cacheNamespace, resetKey, writeCache]);

  // Page skeleton: only before this mount has ever been ready (not on tab/search resetKey).
  const cacheHit =
    cacheKey != null &&
    readCache<OffsetLimitListCachePayload<T>>(cacheKey) !== undefined;
  const isCold = computeDashboardListIsCold({
    isLoading: list.isLoading,
    itemCount: list.items.length,
    hasError: Boolean(list.error),
    cacheHit,
    hasEverReady: hasEverReadyRef.current,
  });

  return {
    items: list.items,
    total: list.total,
    hasMore: list.hasMore,
    isLoading: list.isLoading,
    isLoadingMore: list.isLoadingMore,
    isCold,
    error: list.error,
    loadMoreError: list.loadMoreError,
    loadMore,
    reload,
    clearLoadMoreError: () =>
      setList((prev) => ({ ...prev, loadMoreError: null })),
    pageSize,
  };
}
