'use client';

import { useQuery } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import { useOffsetLimitInfiniteList } from '@/hooks/useOffsetLimitInfiniteList';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import {
  AdminUserCreationService,
} from '@/services/admin-user-creation.service';
import { DEFAULT_PAGE_LIMIT } from '@/utils/offset-limit-page';

const STAFF_ADMINS_CACHE_NAMESPACE = 'staff-admins';

export function useStaffAdminsList() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const list = useOffsetLimitInfiniteList({
    resetKey: 'all',
    cacheNamespace: STAFF_ADMINS_CACHE_NAMESPACE,
    pageSize: DEFAULT_PAGE_LIMIT,
    fetchPage: ({ offset, limit }) =>
      AdminUserCreationService.listStaffAdmins({ offset, limit }),
  });

  const detailQuery = useQuery({
    queryKey: [STAFF_ADMINS_CACHE_NAMESPACE, 'detail', selectedId],
    queryFn: () => AdminUserCreationService.getStaffAdmin(selectedId as string),
    enabled: Boolean(selectedId),
    staleTime: QUERY_STALE_MS.list,
  });

  const selectedFromList =
    list.items.find((item) => item.id === selectedId) ?? null;

  const select = useCallback((id: string) => {
    setSelectedId((current) => (current === id ? null : id));
  }, []);

  return {
    items: list.items,
    isLoading: list.isLoading,
    isLoadingMore: list.isLoadingMore,
    hasMore: list.hasMore,
    error: list.error,
    loadMoreError: list.loadMoreError,
    loadMore: list.loadMore,
    reload: list.reload,
    clearLoadMoreError: list.clearLoadMoreError,
    selectedId,
    select,
    detail: detailQuery.data ?? selectedFromList,
    detailLoading: Boolean(selectedId) && detailQuery.isFetching,
    detailError:
      detailQuery.error instanceof Error
        ? detailQuery.error.message
        : detailQuery.error
          ? 'دریافت جزئیات ادمین ناموفق بود.'
          : null,
  };
}
