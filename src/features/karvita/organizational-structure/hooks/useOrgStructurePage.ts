'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useOffsetLimitInfiniteList } from '@/hooks/useOffsetLimitInfiniteList';
import { scheduleUndoableMutation } from '@/lib/undoable-mutation';
import {
  ORG_STRUCTURE_PAGE_SIZE,
  OrgStructureService,
  type OrgStructureListItem,
} from '@/services/org-structure.service';
import { useDashboardModuleCache } from '@/store/useDashboardModuleCache';
import {
  orgEntityKindFromTab,
  type OrgStructureSubTab,
} from '@/types/org-structure';

import { getOrgTabConfig } from '../constants';
import {
  ORG_STRUCTURE_CACHE_NAMESPACE,
  ORG_STRUCTURE_CHROME_ID,
  orgStructureListResetKey,
} from '../lib/orgStructureListKeys';

const SEARCH_DEBOUNCE_MS = 300;

type OrgChrome = {
  tab: OrgStructureSubTab;
  query: string;
};

export const entityKindFromTab = orgEntityKindFromTab;

export function useOrgStructurePage() {
  const getChrome = useDashboardModuleCache((s) => s.getChrome);
  const setChrome = useDashboardModuleCache((s) => s.setChrome);
  const cachedChrome = getChrome<OrgChrome>(ORG_STRUCTURE_CHROME_ID);

  const [tab, setTab] = useState<OrgStructureSubTab>(
    () => cachedChrome?.tab ?? 'provinces'
  );
  const [query, setQuery] = useState(() => cachedChrome?.query ?? '');
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const tabConfig = useMemo(() => getOrgTabConfig(tab), [tab]);
  const listQuery = query.trim() === '' ? '' : debouncedQuery;
  const resetKey = orgStructureListResetKey(tab, listQuery);

  useEffect(() => {
    setChrome<OrgChrome>(ORG_STRUCTURE_CHROME_ID, { tab, query });
  }, [tab, query, setChrome]);

  const fetchPage = useCallback(
    async ({ offset, limit }: { offset: number; limit: number }) =>
      OrgStructureService.listPage({
        tab,
        query: listQuery,
        offset,
        limit,
      }),
    [tab, listQuery]
  );

  const list = useOffsetLimitInfiniteList<OrgStructureListItem>({
    resetKey,
    fetchPage,
    pageSize: ORG_STRUCTURE_PAGE_SIZE,
    cacheNamespace: ORG_STRUCTURE_CACHE_NAMESPACE,
  });

  const changeTab = useCallback((next: OrgStructureSubTab) => {
    setTab(next);
    setQuery('');
  }, []);

  const openCreate = useCallback(() => {
    setEditId(null);
    setEditorOpen(true);
  }, []);

  const openEdit = useCallback((row: OrgStructureListItem) => {
    setEditId(row.id);
    setEditorOpen(true);
  }, []);

  const closeEditor = useCallback(() => {
    setEditorOpen(false);
    setEditId(null);
  }, []);

  const reload = list.reload;

  const requestDelete = useCallback(
    (row: OrgStructureListItem) => {
      if (row.deleteBlocked) return;

      scheduleUndoableMutation({
        tone: 'error',
        message: `«${row.name}» تا چند ثانیه دیگر از ساختار سازمانی حذف می‌شود…`,
        undoLabel: 'لغو',
        commit: () => OrgStructureService.deleteEntity(row.kind, row.id),
        onCommitted: async () => {
          toast.success(`«${row.name}» از ساختار سازمانی حذف شد.`);
          await reload();
        },
        onError: (error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : 'حذف از ساختار سازمانی ناموفق بود.'
          );
        },
      });
    },
    [reload]
  );

  const handleLoadMore = useCallback(() => {
    void list.loadMore();
  }, [list]);

  const handleRetryLoadMore = useCallback(() => {
    list.clearLoadMoreError();
    void list.loadMore();
  }, [list]);

  const handleReload = useCallback(() => {
    void list.reload();
  }, [list]);

  return {
    tab,
    changeTab,
    tabConfig,
    query,
    setQuery,
    items: list.items,
    total: list.total,
    hasMore: list.hasMore,
    isLoading: list.isLoading,
    isLoadingMore: list.isLoadingMore,
    error: list.error,
    loadMoreError: list.loadMoreError,
    loadMore: handleLoadMore,
    reload: handleReload,
    retryLoadMore: handleRetryLoadMore,
    clearLoadMoreError: list.clearLoadMoreError,
    editorOpen,
    editId,
    openCreate,
    openEdit,
    closeEditor,
    requestDelete,
    entityKind: entityKindFromTab(tab),
  };
}

export type UseOrgStructurePageReturn = ReturnType<typeof useOrgStructurePage>;
