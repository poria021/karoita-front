'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { useOffsetLimitInfiniteList } from '@/hooks/useOffsetLimitInfiniteList';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import {
  AdminUserCreationService,
} from '@/services/admin-user-creation.service';
import type { UpdateStaffAdminInput } from '@/types/admin-user-creation';
import { DEFAULT_PAGE_LIMIT } from '@/utils/offset-limit-page';

const STAFF_ADMINS_CACHE_NAMESPACE = 'staff-admins';

export function useStaffAdminsList() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const list = useOffsetLimitInfiniteList({
    resetKey: 'all',
    cacheNamespace: STAFF_ADMINS_CACHE_NAMESPACE,
    pageSize: DEFAULT_PAGE_LIMIT,
    fetchPage: ({ offset, limit }) =>
      AdminUserCreationService.listStaffAdmins({ offset, limit }),
  });
  const patchItems = list.patchItems;

  const detailQuery = useQuery({
    queryKey: [STAFF_ADMINS_CACHE_NAMESPACE, 'detail', selectedId],
    queryFn: () => AdminUserCreationService.getStaffAdmin(selectedId as string),
    enabled: Boolean(selectedId),
    staleTime: QUERY_STALE_MS.list,
  });

  const selectedFromList =
    list.items.find((item) => item.id === selectedId) ?? null;

  const select = useCallback((id: string) => {
    setSaveError(null);
    setSelectedId((current) => (current === id ? null : id));
  }, []);

  const save = useCallback(
    async (id: string, input: UpdateStaffAdminInput) => {
      setSaving(true);
      setSaveError(null);
      try {
        const updated = await AdminUserCreationService.updateStaffAdmin(
          id,
          input
        );
        patchItems((items) =>
          items.map((item) => (item.id === updated.id ? updated : item))
        );
        queryClient.setQueryData(
          [STAFF_ADMINS_CACHE_NAMESPACE, 'detail', updated.id],
          updated
        );
        toast.success('حساب ادمین به‌روز شد.');
        return updated;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'به‌روزرسانی حساب ادمین ناموفق بود.';
        setSaveError(message);
        toast.error(message);
        throw error;
      } finally {
        setSaving(false);
      }
    },
    [patchItems, queryClient]
  );

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
    saving,
    saveError,
    save,
  };
}
